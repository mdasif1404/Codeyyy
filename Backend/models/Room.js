import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({

  roomCode: {
    type: String,
    required: true,
    unique: true
  },

  roomName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

   // Hashed password for private room access
  passwordHash: {
    type: String,
    select: false,
    default: null
  },

  roomType: {
    type: String,
    enum: ["permanent", "temporary"],
    default: "permanent",
    required: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  maxPlayers: {
    type: Number,
    default: 4,
    min: 2,
    max: 100
  },

  // Room availability
  roomStatus: {
    type: String,
    enum: ["active", "archived"],
    default: "active"
  },

  // Room settings
  settings: {
    language: {
      type: String,
      default: "javascript"
    },

    isRanked: {
      type: Boolean,
      default: true
    },

    allowBots: {
      type: Boolean,
      default: false
    }
  },

  // Selected by room creator
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true
  },

  // Randomly assigned by backend when match starts
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    default: null
  },

  currentMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    default: null
  },

  // Match lifecycle
  matchStatus: {
    type: String,
    enum: ["waiting", "active", "completed"],
    default: "waiting"
  },

  startedAt: {
    type: Date,
    default: null
  },

  endedAt: {
    type: Date,
    default: null
  },

  totalMatches: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

roomSchema.index({ owner: 1, roomStatus: 1 });

export default mongoose.model("Room", roomSchema);
