import mongoose from "mongoose";

const roomMemberSchema = new mongoose.Schema({

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: {
    type: String,
    enum: ["owner", "member"],
    default: "member"
  },

  status: {
    type: String,
    enum: ["active", "left", "removed"],
    default: "active"
  },

  joinedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// One membership record per user per room
roomMemberSchema.index(
  { room: 1, user: 1 },
  { unique: true }
);

roomMemberSchema.index({ user: 1, status: 1 });

export default mongoose.model("RoomMember", roomMemberSchema);