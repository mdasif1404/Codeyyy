
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Room from "../models/Room.js";
import { RESULTS_DURATION } from "../Config/matchConfig.js";

// Complete matches whose deadlines have expired
export const completeExpiredMatches = async (io) => {
  const now = new Date();

  const expiredMatches = await Match.find({
    status: "running",
    endsAt: { $lte: now }
  }).select("_id");

  let completedCount = 0;

  for (const match of expiredMatches) {
    const session = await mongoose.startSession();
    let results = null;

    try {
      await session.withTransaction(async () => {
        // Recheck match status inside the transaction
        const currentMatch = await Match.findOne({
          _id: match._id,
          status: "running",
          endsAt: { $lte: now }
        }).session(session);

        if (!currentMatch) return;

        // Rank by base score, then first successful solve time
        const rankedPlayers = [...currentMatch.participants].sort(
          (a, b) => {
            if (b.baseScore !== a.baseScore) {
              return b.baseScore - a.baseScore;
            }

            if (a.firstSolvedAt && b.firstSolvedAt) {
              return a.firstSolvedAt - b.firstSolvedAt;
            }

            if (a.firstSolvedAt) return -1;
            if (b.firstSolvedAt) return 1;

            return 0;
          }
        );

        // Assign final ranks and placement bonuses
        rankedPlayers.forEach((player, index) => {
          player.rank = index + 1;

          let bonus = 0;

          if (index === 0) {
            bonus = 20;
          } else if (
            index === 1 &&
            currentMatch.participants.length >= 3
          ) {
            bonus = 10;
          }

          player.score = player.baseScore + bonus;
          player.isWinner = index === 0;
        });

        currentMatch.winner =
          rankedPlayers[0]?.user || null;

        const completedAt = new Date();

        currentMatch.status = "completed";
        currentMatch.completedAt = completedAt;
        currentMatch.resultsExpireAt = new Date(
          completedAt.getTime() + RESULTS_DURATION
        );
        currentMatch.cleanupStatus = "pending";

        await currentMatch.save({ session });

        results = {
          matchId: currentMatch._id,
          roomId: currentMatch.room,
          winner: currentMatch.winner,
          participants: currentMatch.participants,
          completedAt,
          resultsExpireAt: currentMatch.resultsExpireAt
        };

        // Update the associated room
        await Room.updateOne(
          {
            _id: currentMatch.room,
            currentMatch: currentMatch._id,
            roomStatus: "active"
          },
          {
            $set: {
              matchStatus: "completed",
              endedAt: completedAt
            }
          },
          { session }
        );

        completedCount++;
      });

    } catch (error) {
      console.error(
        `Match timer completion failed for ${match._id}:`,
        error
      );

    } finally {
      await session.endSession();
    }

    // Broadcast results after successful transaction
    if (results) {
      io?.to(`room:${results.roomId}`).emit(
        "match:completed",
        results
      );
    }
  }

  if (completedCount > 0) {
    console.log(
      `${completedCount} match(es) completed by timer`
    );
  }

  return completedCount;
};
