# Codeyyy Challenge API

Express (+ optional MongoDB) API that serves the Codeyyy challenge bank: 10 problem statements (3 Easy, 4 Medium, 3 Hard) with story text, input/output format, constraints and sample tests.

## Run it

```bash
npm install
cp .env.example .env     # optional
npm start                # http://localhost:5000
npm test                 # 16 tests
```

- **No `MONGODB_URI`** → serves straight from `src/data/challenges.json`. Zero setup.
- **With `MONGODB_URI`** (MongoDB Atlas) → all challenges are **seeded/updated automatically on every start** (upsert by id, no duplicates). `npm run seed` does the same manually.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check (also reports which store is in use) |
| GET | `/api/challenges` | List summaries. Filters: `difficulty`, `hasStory`, `concept`, `q`, `page`, `limit`; add `full=true` for complete statements |
| GET | `/api/challenges/:id` | One full challenge. `:id` = `CYY-E01` (any case) or the number `1` |
| GET | `/api/challenges/:id?format=markdown` | Same challenge as ready-to-render Markdown (also `/:id/markdown`) |
| GET | `/api/challenges/random` | Random challenge. Optional `difficulty`, `exclude=CYY-E01,CYY-E02` |
| GET | `/api/challenges/stats` | Counts by difficulty, story count, total minutes |

Examples:

```bash
curl localhost:5000/api/challenges
curl "localhost:5000/api/challenges?difficulty=hard"
curl "localhost:5000/api/challenges?full=true"            # all 10 problem statements in one call
curl localhost:5000/api/challenges/CYY-M07
curl "localhost:5000/api/challenges/random?difficulty=Easy"
```

Full challenge shape:

```json
{
  "id": "CYY-E01", "number": 1, "title": "The Missing Treasure",
  "difficulty": "Easy", "timeMinutes": 10, "concept": "Array / math",
  "hasStory": true, "story": "A treasure chest contains ...",
  "statement": ["You are given an array ...", "Find and print the missing number."],
  "inputFormat": ["First line contains integer N.", "..."],
  "outputFormat": ["Print the missing number."],
  "constraints": ["1 ≤ N ≤ 100000", "..."],
  "samples": [{ "input": "5\n3 0 1 4 5", "output": "2" }]
}
```

Errors are always `{ "error": { "code": "...", "message": "..." } }` (400 invalid filter, 404 unknown challenge).

## Use from the React app (Axios)

```js
import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL }); // e.g. http://localhost:5000/api

export const getChallenges = (params) => api.get('/challenges', { params }).then(r => r.data);
export const getChallenge  = (id)     => api.get(`/challenges/${id}`).then(r => r.data);
```

Set `CORS_ORIGIN` on the server to your Vercel URL (comma-separate several origins).

## Hidden tests and Judge0 (important)

The `hiddenTests` field exists on every challenge but is **empty** — your source documents only contain one sample per problem. Add hidden cases to `src/data/challenges.json` (`{ "input": "...", "output": "..." }`) or directly in MongoDB (a re-seed will not overwrite hidden tests already in the database).

- No route ever returns `hiddenTests` (covered by a test).
- Your submission code calls `service.getJudgeTests(id)` on the server; it returns sample tests (`visible: true`) followed by hidden tests (`visible: false`) to send to Judge0.

## Project layout

```
src/server.js              start-up, store selection, auto-seed
src/app.js                 Express app, CORS, error handling
src/routes/challenges.js   route handlers
src/services/              filtering, validation, markdown, judge-tests helper
src/store/                 memoryStore (JSON) / mongoStore (MongoDB)
src/models/Challenge.js    Mongoose schema
src/data/challenges.json   the 10 challenges
tests/api.test.js          node:test suite
```
