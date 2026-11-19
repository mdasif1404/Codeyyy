
import mongoose from "mongoose";

import ArenaQueue from "../models/arenaQueue.js";
import Match from "../models/Match.js";
import Challenge from "../models/Challenge.js";
import User from "../models/User.js";
import { MATCH_DURATIONS } from "../Config/matchConfig.js";

const PLAYER_COUNT = 4;

const getLobbyRoom = (difficulty) => `arena-lobby-${difficulty}`;

// Get the current waiting players for one difficulty.
export const getArenaLobby = async (difficulty) => {
  const entries = await ArenaQueue.find({
    status: "waiting",
    difficulty
  })
    .sort({ joinedAt: 1 })
    .populate("user", "username")
    .lean();

  return entries.map((entry) => ({
    userId: entry.user?._id?.toString(),
    username: entry.user?.username || "Player"
  }));
};

// Broadcast the live player list to everyone viewing this difficulty.
export const broadcastArenaLobby = async (io, difficulty) => {
  const players = await getArenaLobby(difficulty);

  io.to(getLobbyRoom(difficulty)).emit("arena:lobby-updated", {
    difficulty,
    players,
    playersWaiting: players.length,
    playersNeeded: Math.max(0, PLAYER_COUNT - players.length)
  });

  return players;
};

export const joinArenaQueue = async (
  userId,
  socketId,
  difficulty,
  io
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user");
  }

  if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
    throw new Error("Invalid difficulty selected");
  }

  const activeMatch = await Match.findOne({
    status: "running",
    "participants.user": userId
  });

  if (activeMatch) {
    throw new Error("You are already participating in an active match");
  }

  let entry = await ArenaQueue.findOne({ user: userId });

  if (entry?.status === "matched") {
    const existingMatch = entry.match
      ? await Match.findById(entry.match)
      : null;

    if (existingMatch?.status === "running") {
      throw new Error("You already have an active Arena match");
    }

    await ArenaQueue.deleteOne({ _id: entry._id });
    entry = null;
  }

  if (entry) {
    entry.socketId = socketId;
    entry.difficulty = difficulty;
    entry.status = "waiting";
    entry.match = null;
    entry.joinedAt = new Date();
    await entry.save();
  } else {
    await ArenaQueue.create({
      user: userId,
      socketId,
      difficulty,
      status: "waiting"
    });
  }

  // Update everyone currently waiting at this difficulty.
  await broadcastArenaLobby(io, difficulty);

  // If four players are waiting, create their match.
  await createArenaMatch(io, difficulty);

  return ArenaQueue.findOne({ user: userId });
};

export const createArenaMatch = async (io, requestedDifficulty = null) => {
  const session = await mongoose.startSession();

  let match = null;
  let matchedEntries = [];
  let matchedDifficulty = null;

  try {
    await session.withTransaction(async () => {
      let firstPlayerQuery = ArenaQueue.findOne({
        status: "waiting",
        ...(requestedDifficulty
          ? { difficulty: requestedDifficulty }
          : {})
      })
        .sort({ joinedAt: 1 })
        .session(session);

      const firstPlayer = await firstPlayerQuery;

      if (!firstPlayer) return;

      const difficulty = firstPlayer.difficulty;

      const entries = await ArenaQueue.find({
        status: "waiting",
        difficulty
      })
        .sort({ joinedAt: 1 })
        .limit(PLAYER_COUNT)
        .session(session);

      if (entries.length < PLAYER_COUNT) return;

      const entryIds = entries.map((item) => item._id);
      const userIds = entries.map((item) => item.user);

      // Claim the four entries together.
      const claimed = await ArenaQueue.updateMany(
        {
          _id: { $in: entryIds },
          status: "waiting"
        },
        {
          $set: { status: "matched" }
        },
        { session }
      );

      if (claimed.modifiedCount !== PLAYER_COUNT) {
        throw new Error("Unable to reserve all four players");
      }

      const activeMatch = await Match.findOne({
        status: "running",
        "participants.user": { $in: userIds }
      }).session(session);

      if (activeMatch) {
        throw new Error("A selected player already has an active match");
      }

      const challenges = await Challenge.aggregate([
        {
          $match: {
            difficulty,
            isPublished: true,
            isActive: true
          }
        },
        { $sample: { size: 1 } }
      ]).session(session);

      if (!challenges.length) {
        throw new Error(
          `No active published ${difficulty} challenges are available`
        );
      }

      const users = await User.find({
        _id: { $in: userIds }
      })
        .select("username")
        .session(session);

      if (users.length !== PLAYER_COUNT) {
        throw new Error("Some selected players could not be found");
      }

      const participants = userIds.map((userId) => {
        const user = users.find(
          (item) => item._id.toString() === userId.toString()
        );

        return {
          user: user._id,
          username: user.username || "Player",
          score: 0,
          isWinner: false
        };
      });

      const duration = MATCH_DURATIONS[difficulty];

      if (!duration) {
        throw new Error(`Invalid match duration for ${difficulty}`);
      }

      const startedAt = new Date();
      const endsAt = new Date(startedAt.getTime() + duration);

      const [createdMatch] = await Match.create(
        [{
          room: null,
          matchType: "global-arena",
          challenge: challenges[0]._id,
          participants,
          status: "running",
          startedAt,
          endsAt,
          duration: duration / 1000
        }],
        { session }
      );

      await ArenaQueue.updateMany(
        { _id: { $in: entryIds } },
        { $set: { match: createdMatch._id } },
        { session }
      );

      match = createdMatch;
      matchedEntries = entries;
      matchedDifficulty = difficulty;
    });

    // Emit only after the database transaction commits.
    if (match) {
      await broadcastArenaLobby(io, matchedDifficulty);

      for (const entry of matchedEntries) {
        io.to(entry.socketId).emit("arena:match-found", {
          matchId: match._id,
          matchType: "global-arena",
          challengeId: match.challenge,
          participants: match.participants,
          startedAt: match.startedAt,
          endsAt: match.endsAt,
          duration: match.duration
        });
      }
    }
    return match;
  } finally {
    await session.endSession();
  }
};

export const leaveArenaQueue = async (userId, io) => {
  const entry = await ArenaQueue.findOne({
    user: userId,
    status: "waiting"
  });

  if (!entry) return false;

  const difficulty = entry.difficulty;

  await ArenaQueue.deleteOne({ _id: entry._id });

  await broadcastArenaLobby(io, difficulty);

  return true;
};

export const removeDisconnectedArenaPlayer = async (socketId, io) => {
  const entry = await ArenaQueue.findOne({
    socketId,
    status: "waiting"
  });

  if (!entry) return;

  const difficulty = entry.difficulty;

  await ArenaQueue.deleteOne({ _id: entry._id });

  await broadcastArenaLobby(io, difficulty);
};

export const getArenaQueueStatus = async (userId) => {
  const entry = await ArenaQueue.findOne({ user: userId });

  if (!entry) {
    return { status: "not-queued" };
  }

  if (entry.status === "matched") {
    return {
      status: "matched",
      matchId: entry.match
    };
  }

  const players = await getArenaLobby(entry.difficulty);

  return {
    status: "waiting",
    difficulty: entry.difficulty,
    players,
    playersWaiting: players.length,
    playersNeeded: Math.max(0, PLAYER_COUNT - players.length)
  };
};
