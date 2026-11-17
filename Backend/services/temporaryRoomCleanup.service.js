
import mongoose from "mongoose";

import Room from "../models/Room.js";
import Match from "../models/Match.js";
import Submission from "../models/Submission.js";
import RoomMember from "../models/RoomMember.js";

// Delete temporary rooms after their results period expires
export const cleanupExpiredTemporaryRooms = async () => {
  const now = new Date();

  // Find completed matches whose results period has expired
  const expiredMatches = await Match.find({
    status: "completed",
    resultsExpireAt: { $lte: now }
  }).select("_id room");

  let cleanedCount = 0;

  for (const match of expiredMatches) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {

        // Verify that this is still the correct temporary room
        const room = await Room.findOne({
          _id: match.room,
          roomType: "temporary",
          currentMatch: match._id,
          roomStatus: "active"
        }).session(session);

        // Never delete records if the room does not match
        if (!room) return;

        // Recheck match status and expiry inside transaction
        const currentMatch = await Match.findOne({
          _id: match._id,
          room: room._id,
          status: "completed",
          resultsExpireAt: { $lte: now }
        }).session(session);

        if (!currentMatch) return;

        // Delete all submissions belonging to this match
        await Submission.deleteMany(
          { match: currentMatch._id },
          { session }
        );

        // Delete the match
        await Match.deleteOne(
          { _id: currentMatch._id },
          { session }
        );

        // Delete all room memberships
        await RoomMember.deleteMany(
          { room: room._id },
          { session }
        );

        // Finally, delete the temporary room
        await Room.deleteOne(
          {
            _id: room._id,
            roomType: "temporary",
            currentMatch: currentMatch._id
          },
          { session }
        );

        cleanedCount++;
      });

    } catch (error) {
      console.error(
        `Temporary room cleanup failed for match ${match._id}:`,
        error
      );

    } finally {
      await session.endSession();
    }
  }

  if (cleanedCount > 0) {
    console.log(
      `Temporary room cleanup completed: ${cleanedCount} room(s) deleted`
    );
  }

  return cleanedCount;
};
