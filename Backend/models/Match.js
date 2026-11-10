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

  completedAt: Date,

  duration: Number

}, { timestamps: true });

matchSchema.index({ room: 1, completedAt: -1 });
matchSchema.index({ "participants.user": 1, completedAt: -1 });

export default mongoose.model("Match", matchSchema);