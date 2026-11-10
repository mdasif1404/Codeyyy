import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  avatar: {
    type: String,
    default: ""
  },

  bio: {
    type: String,
    maxlength: 200,
    default: ""
  },

  stats: {
    totalMatches: { 
        type: Number, 
        default: 0 
    },
    wins: { 
        type: Number, 
        default: 0 
    },
    losses: { 
        type: Number, 
        default: 0 
    },
    totalPoints: { 
        type: Number, 
        default: 0 
    },
    rating: { 
        type: Number, 
        default: 1000 
    }
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);