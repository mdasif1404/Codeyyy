const express = require('express');
const cors = require('cors');
const { createRouter } = require('./routes/challenges');
const { ApiError } = require('./services/challengeService');

function createApp(service) {
  const app = express();

  const origins = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()).filter(Boolean);
  app.use(cors({ origin: origins.includes('*') ? true : origins }));
  app.use(express.json());

  app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', service: 'codeyyy-challenge-api', store: service.storeName, time: new Date().toISOString() })
  );
  app.use('/api/challenges', createRouter(service));

  app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` } }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ApiError) return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    console.error(err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
  });

  return app;
}

module.exports = { createApp };
