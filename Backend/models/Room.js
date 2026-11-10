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

  status: {
    type: String,
    enum: ["active", "archived"],
    default: "active"
  },

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

  totalMatches: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("Room", roomSchema);