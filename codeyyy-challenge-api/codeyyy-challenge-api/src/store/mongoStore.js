// Stores the bank in MongoDB. Seeds/updates itself from the JSON file on every start.
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const seedData = require('../data/challenges.json');

const lean = (q) => q.lean().then((r) => r);

async function connect(uri) {
  await mongoose.connect(uri);
}

// Upsert by challenge id so re-running never creates duplicates.
// hiddenTests is left alone so tests added in the database are not overwritten by a re-seed.
async function seed() {
  const ops = seedData.map(({ hiddenTests, ...doc }) => ({
    updateOne: {
      filter: { id: doc.id },
      update: { $set: doc, $setOnInsert: { hiddenTests: hiddenTests || [] } },
      upsert: true,
    },
  }));
  const res = await Challenge.bulkWrite(ops);
  return { upserted: res.upsertedCount, modified: res.modifiedCount, total: seedData.length };
}

module.exports = {
  name: 'mongodb',
  connect,
  seed,
  async findAll() {
    return lean(Challenge.find().sort({ number: 1 }).select('-_id -__v -createdAt -updatedAt'));
  },
  async findByIdOrNumber(key) {
    const k = String(key).trim();
    const query = /^\d+$/.test(k) ? { number: Number(k) } : { id: k.toUpperCase() };
    return lean(Challenge.findOne(query).select('-_id -__v -createdAt -updatedAt'));
  },
  async findHiddenTests(id) {
    const doc = await lean(Challenge.findOne({ id: String(id).toUpperCase() }).select('hiddenTests'));
    return doc ? doc.hiddenTests || [] : null;
  },
};
