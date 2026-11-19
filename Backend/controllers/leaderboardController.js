
import Match from "../models/Match.js";

const getPeriodDates = (period) => {
  const now = new Date();

  // Start of the current week (Monday, UTC)
  const currentWeekStart = new Date(now);
  currentWeekStart.setUTCHours(0, 0, 0, 0);

  const day = currentWeekStart.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;

  currentWeekStart.setUTCDate(
    currentWeekStart.getUTCDate() - daysSinceMonday
  );

  if (period === "last-week") {
    const start = new Date(currentWeekStart);
    start.setUTCDate(start.getUTCDate() - 7);

    return {
      start,
      end: currentWeekStart
    };
  }

  if (period === "this-month") {
    const start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    ));

    return {
      start,
      end: now
    };
  }

  // Default: this week
  return {
    start: currentWeekStart,
    end: now
  };
};

const buildLeaderboard = async (dateFilter = null) => {
  const matchFilter = {
    status: "completed",
    completedAt: { $exists: true, $ne: null }
  };

  if (dateFilter) {
    matchFilter.completedAt = {
      $gte: dateFilter.start,
      $lt: dateFilter.end
    };
  }

  const leaderboard = await Match.aggregate([
    // Only completed matches
    {
      $match: matchFilter
    },

    // Get room information
    {
      $lookup: {
        from: "rooms",
        localField: "room",
        foreignField: "_id",
        as: "roomDetails"
      }
    },

    {
      $unwind: "$roomDetails"
    },

    // Exclude temporary rooms
    {
      $match: {
        "roomDetails.roomType": "permanent"
      }
    },

    // One document per participant
    {
      $unwind: "$participants"
    },

    // Group player statistics
    {
      $group: {
        _id: "$participants.user",

        username: {
          $last: "$participants.username"
        },

        totalPoints: {
          $sum: { $ifNull: ["$participants.score", 0] }
        },

        wins: {
          $sum: {
            $cond: [
              { $eq: ["$participants.isWinner", true] },
              1,
              0
            ]
          }
        },

        matchesPlayed: {
          $sum: 1
        }
      }
    },

    // Highest points first, then wins, then matches
    {
      $sort: {
        totalPoints: -1,
        wins: -1,
        matchesPlayed: -1,
        _id: 1
      }
    },

    // Fetch player profile information
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails"
      }
    },

    {
      $unwind: "$userDetails"
    },

    // Return only required fields
    {
      $project: {
        _id: 0,
        userId: "$_id",
        username: "$userDetails.username",
        avatar: "$userDetails.avatar",
        totalPoints: 1,
        wins: 1,
        matchesPlayed: 1
      }
    },

    // Top 100
    {
      $limit: 100
    }
  ]);

  return leaderboard.map((player, index) => ({
    rank: index + 1,
    ...player
  }));
};

// GLOBAL LEADERBOARD
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const players = await buildLeaderboard();

    return res.status(200).json({
      success: true,
      data: {
        leaderboard: players,
        totalPlayers: players.length
      }
    });

  } catch (error) {
    console.error("Global leaderboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load global leaderboard"
    });
  }
};

// WEEKLY / PERIOD LEADERBOARD
export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const period = req.query.period || "this-week";

    const allowedPeriods = [
      "this-week",
      "last-week",
      "this-month"
    ];

    if (!allowedPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leaderboard period"
      });
    }

    const dates = getPeriodDates(period);
    const players = await buildLeaderboard(dates);

    return res.status(200).json({
      success: true,
      data: {
        period,
        leaderboard: players,
        totalPlayers: players.length
      }
    });

  } catch (error) {
    console.error("Weekly leaderboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load weekly leaderboard"
    });
  }
};
