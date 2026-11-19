
import mongoose from "mongoose";

import { MATCH_DURATIONS } from "../Config/matchConfig.js";
import Room from "../models/Room.js";
import RoomMember from "../models/RoomMember.js";
import Challenge from "../models/Challenge.js";
import Match from "../models/Match.js";

export const createRoomMatch = async (roomId) => {
  const session = await mongoose.startSession();

  let createdMatch = null;

  try {
    await session.withTransaction(async () => {

      // 1. Find the room
      const room = await Room.findById(roomId).session(session);

      if (!room) {
        throw new Error("Room not found");
      }

      if (room.roomStatus !== "active") {
        throw new Error("This room is archived");
      }

      if (!["permanent", "temporary"].includes(room.roomType)) {
        throw new Error("Invalid room type");
      }

      // 2. Handle repeated start requests
      if (room.matchStatus === "active" && room.currentMatch) {
        const existingMatch = await Match.findById(
          room.currentMatch
        ).session(session);

        if (!existingMatch) {
          throw new Error("Current match record not found");
        }

        if (existingMatch.status !== "running") {
          throw new Error("The previous match is no longer active");
        }

        createdMatch = existingMatch;
        return;
      }

      // 3. Determine whether this is a new room
      // or a permanent room starting another match.

      let expectedMatchStatus = "waiting";
      let expectedChallenge = null;
      let expectedCurrentMatch = null;

      if (room.matchStatus === "completed") {

        if (room.roomType !== "permanent") {
          throw new Error(
            "Temporary rooms cannot start another match"
          );
        }

        if (!room.currentMatch) {
          throw new Error("Previous match reference is missing");
        }

        const previousMatch = await Match.findById(
          room.currentMatch
        ).session(session);

        if (!previousMatch || previousMatch.status !== "completed") {
          throw new Error(
            "Previous match has not been completed"
          );
        }

        expectedMatchStatus = "completed";
        expectedChallenge = room.challenge;
        expectedCurrentMatch = room.currentMatch;

      } else if (room.matchStatus !== "waiting") {
        throw new Error("Room is not available to start a match");
      }

      // 4. Retrieve active room members
      const members = await RoomMember.find({
        room: room._id,
        status: "active"
      })
        .populate("user", "username")
        .session(session);

      if (members.length < 2) {
        throw new Error("At least two active players are required");
      }

      const participants = members.map((member) => {
        if (!member.user) {
          throw new Error("A room member has an invalid user reference");
        }

        return {
          user: member.user._id,
          username: member.user.username || "Player",
          score: 0,
          isWinner: false
        };
      });

      // 5. Select a random eligible challenge
      const challenges = await Challenge.aggregate([
        {
          $match: {
            difficulty: room.difficulty,
            isPublished: true,
            isActive: true
          }
        },
        {
          $sample: {
            size: 1
          }
        }
      ]).session(session);

      if (challenges.length === 0) {
        throw new Error(
          `No active published ${room.difficulty} challenges available`
        );
      }

      const selectedChallenge = challenges[0];

      // 6. Create the Match document
      const startedAt = new Date();

      const duration = MATCH_DURATIONS[room.difficulty];

      if (!duration) {
        throw new Error("Invalid match duration for room difficulty");
      }

      const endsAt = new Date(startedAt.getTime() + duration);

      const matchType =
        room.roomType === "permanent"
          ? "permanent-room"
          : "temporary-room";
          
      const [match] = await Match.create(
        [{
          room: room._id,
          challenge: selectedChallenge._id,
          matchType,
          participants,
          status: "running",
          startedAt,
          endsAt,
          duration: duration / 1000
        }],
        { session }
      );

      // 7. Atomically update the Room
      const updatedRoom = await Room.findOneAndUpdate(
        {
          _id: room._id,
          roomStatus: "active",
          matchStatus: expectedMatchStatus,
          challenge: expectedChallenge,
          currentMatch: expectedCurrentMatch
        },
        {
          $set: {
            challenge: selectedChallenge._id,
            currentMatch: match._id,
            matchStatus: "active",
            startedAt: match.startedAt,
            endedAt: null
          },
          $inc: {
            totalMatches: 1
          }
        },
        {
          new: true,
          session,
          runValidators: true
        }
      );

      if (!updatedRoom) {
        throw new Error(
          "Room state changed. Another request may have started the match."
        );
      }

      createdMatch = match;
    });

    return createdMatch;

  } finally {
    await session.endSession();
  }
};
