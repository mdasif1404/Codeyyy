
import Match from "../models/Match.js";
import User from "../models/User.js";

export const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find completed matches involving this player.
    const matches = await Match.find({
      status: "completed",
      "participants.user": userId
    })
      .select("room participants winner completedAt duration")
      .populate({
        path: "room",
        select: "roomName roomCode roomType"
      })
      .sort({ completedAt: -1 })
      .lean();

    // Include permanent rooms only.
    // Temporary rooms and future Global Arena matches are excluded for now.
    const permanentMatches = matches.filter(
      match => match.room?.roomType === "permanent"
    );

    let wins = 0;
    let totalPoints = 0;

    const recentMatches = permanentMatches.slice(0, 10).map(match => {
      const player = match.participants.find(
        participant =>
          participant.user.toString() === userId.toString()
      );

      const opponents = match.participants
        .filter(
          participant =>
            participant.user.toString() !== userId.toString()
        )
        .map(participant => participant.username || "Unknown Player");

      const isWinner = player?.isWinner === true;

      if (isWinner) wins++;

      return {
        matchId: match._id,
        roomName: match.room.roomName,
        roomCode: match.room.roomCode,
        opponents,
        result: isWinner ? "Won" : "Lost",
        score: player?.score || 0,
        rank: player?.rank || null,
        completedAt: match.completedAt,
        duration: match.duration || null
      };
    });

    // Calculate totals across ALL eligible matches,
    // not just the 10 recent matches.
    for (const match of permanentMatches) {
      const player = match.participants.find(
        participant =>
          participant.user.toString() === userId.toString()
      );

      if (player) {
        totalPoints += Number(player.score || 0);
      }
    }

    const totalMatches = permanentMatches.length;
    const losses = totalMatches - wins;

    const winRate = totalMatches > 0
      ? Number(((wins / totalMatches) * 100).toFixed(2))
      : 0;

    const user = await User.findById(userId).select("stats.rating");

    return res.status(200).json({
      success: true,
      data: {
        totalMatches,
        wins,
        losses,
        winRate,
        totalPoints,
        rating: user?.stats?.rating ?? 1000,
        recentMatches
      }
    });

  } catch (error) {
    console.error("Get player stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve player statistics"
    });
  }
};
