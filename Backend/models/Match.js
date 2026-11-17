import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },

  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true
  },

  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    username: String,

    score: {
      type: Number,
      default: 0
    },

    rank: Number,

    isWinner: {
      type: Boolean,
      default: false
    },

    visibleTestsPassed: {
      type: Number,
      default: 0
    },

    hiddenTestsPassed: {
      type: Number,
      default: 0
    },

    baseScore: {
      type: Number,
      default: 0
    },

    solved: {
      type: Boolean,
      default: false
    },

    firstSolvedAt: {
      type: Date,
      default: null
    },

    executionTime: Number
  }],

  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  status: {
    type: String,
    enum: ["waiting", "running", "completed", "cancelled"],
    default: "waiting"
  },

  startedAt: Date,

  endsAt: {
    type: Date,
    required: true
  },

  completedAt: Date,

  resultsExpireAt: Date,

  cleanupStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: null
  },

  duration: Number

}, { timestamps: true });

matchSchema.index({ room: 1, completedAt: -1 });
matchSchema.index({ "participants.user": 1, completedAt: -1 });
matchSchema.index({ status: 1, endsAt: 1 });

export default mongoose.model("Match", matchSchema);