const mongoose = require("mongoose");

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

  verdict: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "wrong-answer",
      "runtime-error",
      "compilation-error",
      "time-limit-exceeded"
    ],
    default: "pending"
  },

  passedTests: Number,

  totalTests: Number,

  executionTime: Number,

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

submissionSchema.index({ match: 1, user: 1, submittedAt: -1 });

export default mongoose.model("Submission", submissionSchema);