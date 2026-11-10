// Manual seeding: npm run seed   (requires MONGODB_URI)
require('dotenv').config();
const mongoose = require('mongoose');
const store = require('../src/store/mongoStore');

(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI in .env first.');
    process.exit(1);
  }
  await store.connect(process.env.MONGODB_URI);
  const r = await store.seed();
  console.log(`Seed complete: ${r.total} challenges (new: ${r.upserted}, updated: ${r.modified})`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
