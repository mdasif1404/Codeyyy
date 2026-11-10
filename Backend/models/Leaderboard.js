import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  scope: {
    type: String,
    enum: ["global", "room"],
    required: true
  },

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    default: null
  },

  points: {
    type: Number,
    default: 0
  },

  wins: {
    type: Number,
    default: 0
  },

  matchesPlayed: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: 1000
  }

}, { timestamps: true });

// One global leaderboard entry per user
leaderboardSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { scope: "global" }
  }
);

// One room leaderboard entry per user per room
leaderboardSchema.index(
  { user: 1, room: 1 },
  {
    unique: true,
    partialFilterExpression: { scope: "room" }
  }
);

// Efficient leaderboard retrieval
leaderboardSchema.index({
  scope: 1,
  room: 1,
  points: -1
});

export default mongoose.model("Leaderboard", leaderboardSchema);