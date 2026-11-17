
import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true
    },
    expectedOutput: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true
    },
    expectedOutput: {
      type: String,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true
    },

    inputFormat: {
      type: String,
      required: true
    },

    outputFormat: {
      type: String,
      required: true
    },

    constraints: {
      type: [String],
      default: []
    },

    examples: {
      type: [exampleSchema],
      default: []
    },

    testCases: {
      type: [testCaseSchema],
      default: []
    },

    starterCode: {
      c: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      javascript: { type: String, default: "" }
    },

    points: {
      type: Number,
      required: true,
      min: 0
    },

    timeLimit: {
      type: Number,
      default: 5
    },

    memoryLimit: {
      type: Number,
      default: 128000
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isPublished: {
      type: Boolean,
      default: false
    },

    category: {
      type: String,
      default: "General",
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
    {
    timestamps: true,
    validate: {
      validator: function () {
        if (this.isPublished) {
          return this.testCases && this.testCases.length > 0;
        }
        return true;
      },
      message: "A published challenge must have at least one test case."
    }
  }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;
