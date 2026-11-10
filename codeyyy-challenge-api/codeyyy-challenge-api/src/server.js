require('dotenv').config();
const { createApp } = require('./app');
const { createService } = require('./services/challengeService');

async function main() {
  let store;
  if (process.env.MONGODB_URI) {
    store = require('./store/mongoStore');
    await store.connect(process.env.MONGODB_URI);
    const r = await store.seed(); // automatic: loads/updates all challenges on every start
    console.log(`MongoDB connected. Challenges seeded: ${r.total} (new: ${r.upserted}, updated: ${r.modified})`);
  } else {
    store = require('./store/memoryStore');
    console.log('MONGODB_URI not set: serving challenges from src/data/challenges.json');
  }

  const app = createApp(createService(store));
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Codeyyy challenge API listening on http://localhost:${port}`));
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
