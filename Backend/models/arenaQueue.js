
import mongoose from "mongoose";

const arenaQueueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    socketId: {
      type: String,
      required: true
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true
    },

    status: {
      type: String,
      enum: ["waiting", "matched"],
      default: "waiting"
    },

    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null
    },

    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

arenaQueueSchema.index({ status: 1, difficulty: 1, joinedAt: 1 });

export default mongoose.model("ArenaQueue", arenaQueueSchema);
