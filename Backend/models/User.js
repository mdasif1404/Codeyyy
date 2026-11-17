import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-z0-9_]+$/
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationOTP: {
    type: String,
    select: false
  },
  
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  
  otpLastSentAt: {
    type: Date,
    default: null,
    select: false
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

    // Password reset fields
  resetPasswordToken: {
    type: String,
    select: false
  },

  resetPasswordExpires: {
    type: Date,
    select: false
  },

  resetPasswordRequestedAt: {
    type: Date,
    default: null,
    select: false
  },

  isActive: {
  type: Boolean,
  default: true
  },
  
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);