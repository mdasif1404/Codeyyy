import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },

  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  tokenHash: {
    type: String,
    required: true,
    select: false
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "expired"],
    default: "pending"
  },

  expiresAt: {
    type: Date,
    required: true
  }

}, { timestamps: true });

invitationSchema.index({ room: 1, invitedUser: 1, status: 1 });

export default mongoose.model("Invitation", invitationSchema);