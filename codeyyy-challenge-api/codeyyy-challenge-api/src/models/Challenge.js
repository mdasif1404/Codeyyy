const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema(
  { input: { type: String, required: true }, output: { type: String, required: true } },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true }, // e.g. CYY-E01
    number: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, index: true },
    timeMinutes: { type: Number, required: true },
    concept: { type: String, required: true },
    hasStory: { type: Boolean, default: false },
    story: { type: String, default: null },
    statement: { type: [String], required: true },
    inputFormat: { type: [String], required: true },
    outputFormat: { type: [String], required: true },
    constraints: { type: [String], required: true },
    samples: { type: [sampleSchema], required: true },
    // Server-side only. `select: false` means it is never loaded unless explicitly requested.
    hiddenTests: { type: [sampleSchema], default: [], select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Challenge || mongoose.model('Challenge', challengeSchema);
