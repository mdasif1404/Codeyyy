
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({

  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  language: {
    type: String,
    required: true
  },

  sourceCode: {
    type: String,
    required: true
  },

  // Submission evaluation lifecycle
  executionStatus: {
    type: String,
    enum: ["queued", "running", "completed", "failed"],
    default: "queued"
  },

  // Final verdict
  verdict: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "wrong-answer",
      "runtime-error",
      "compilation-error",
      "time-limit-exceeded",
      "memory-limit-exceeded",
      "internal-error"
    ],
    default: "pending"
  },

  passedTests: {
    type: Number,
    default: 0
  },

  totalTests: {
    type: Number,
    default: 0
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

  executionTime: {
    type: Number,
    default: 0
  },

  executionMemory: {
    type: Number,
    default: 0
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

submissionSchema.index({
  match: 1,
  user: 1,
  submittedAt: -1
});

export default mongoose.model("Submission", submissionSchema);
