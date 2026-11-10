const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Remove anything that must never reach a browser.
function toPublic(challenge) {
  const { hiddenTests, _id, __v, ...rest } = challenge;
  return rest;
}

function toSummary(c) {
  return {
    id: c.id,
    number: c.number,
    title: c.title,
    difficulty: c.difficulty,
    timeMinutes: c.timeMinutes,
    concept: c.concept,
    hasStory: c.hasStory,
  };
}

function parseDifficulty(value) {
  if (value === undefined || value === '') return null;
  const match = DIFFICULTIES.find((d) => d.toLowerCase() === String(value).toLowerCase());
  if (!match) throw new ApiError(400, 'INVALID_DIFFICULTY', `difficulty must be one of: ${DIFFICULTIES.join(', ')}`);
  return match;
}

function parseBool(name, value) {
  if (value === undefined || value === '') return null;
  const v = String(value).toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  throw new ApiError(400, 'INVALID_QUERY', `${name} must be true or false`);
}

function parseIntParam(name, value, def, min, max) {
  if (value === undefined || value === '') return def;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ApiError(400, 'INVALID_QUERY', `${name} must be an integer between ${min} and ${max}`);
  }
  return n;
}

function searchText(c) {
  return [c.title, c.concept, c.story || '', ...c.statement].join(' ').toLowerCase();
}

function createService(store) {
  return {
    storeName: store.name,

    async list(query = {}) {
      const difficulty = parseDifficulty(query.difficulty);
      const hasStory = parseBool('hasStory', query.hasStory);
      const page = parseIntParam('page', query.page, 1, 1, 10000);
      const limit = parseIntParam('limit', query.limit, 50, 1, 100);
      const concept = query.concept ? String(query.concept).toLowerCase() : null;
      const q = query.q ? String(query.q).toLowerCase() : null;
      const full = String(query.full).toLowerCase() === 'true';

      let items = await store.findAll();
      if (difficulty) items = items.filter((c) => c.difficulty === difficulty);
      if (hasStory !== null) items = items.filter((c) => c.hasStory === hasStory);
      if (concept) items = items.filter((c) => c.concept.toLowerCase().includes(concept));
      if (q) items = items.filter((c) => searchText(c).includes(q));

      const total = items.length;
      const start = (page - 1) * limit;
      const pageItems = items.slice(start, start + limit).map((c) => (full ? toPublic(c) : toSummary(c)));
      return { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)), count: pageItems.length, data: pageItems };
    },

    async get(key) {
      const c = await store.findByIdOrNumber(key);
      if (!c) throw new ApiError(404, 'CHALLENGE_NOT_FOUND', `No challenge found for "${key}"`);
      return toPublic(c);
    },

    async random(query = {}) {
      const difficulty = parseDifficulty(query.difficulty);
      const exclude = query.exclude ? String(query.exclude).split(',').map((s) => s.trim().toUpperCase()) : [];
      let items = await store.findAll();
      if (difficulty) items = items.filter((c) => c.difficulty === difficulty);
      items = items.filter((c) => !exclude.includes(c.id.toUpperCase()));
      if (!items.length) throw new ApiError(404, 'CHALLENGE_NOT_FOUND', 'No challenge matches those filters');
      return toPublic(items[Math.floor(Math.random() * items.length)]);
    },

    async stats() {
      const items = await store.findAll();
      const byDifficulty = Object.fromEntries(DIFFICULTIES.map((d) => [d, items.filter((c) => c.difficulty === d).length]));
      const totalMinutes = items.reduce((s, c) => s + c.timeMinutes, 0);
      return { total: items.length, byDifficulty, withStory: items.filter((c) => c.hasStory).length, totalMinutes };
    },

    async markdown(key) {
      return toMarkdown(await this.get(key));
    },

    // SERVER-SIDE ONLY. Use this from the judge/submission code (Judge0). Never return it from a route.
    async getJudgeTests(id) {
      const c = await store.findByIdOrNumber(id);
      if (!c) throw new ApiError(404, 'CHALLENGE_NOT_FOUND', `No challenge found for "${id}"`);
      const hidden = (await store.findHiddenTests(c.id)) || [];
      return [
        ...c.samples.map((t) => ({ ...t, visible: true })),
        ...hidden.map((t) => ({ ...t, visible: false })),
      ];
    },
  };
}

function toMarkdown(c) {
  const lines = [`# ${c.number}. ${c.title}`, '', `**${c.difficulty}** · ${c.timeMinutes} minutes · ${c.id}`, ''];
  if (c.story) lines.push(`> ${c.story}`, '');
  lines.push('## Problem statement', '', ...c.statement.flatMap((p) => [p, '']));
  lines.push('## Input format', '', ...c.inputFormat.map((x) => `- ${x}`), '');
  lines.push('## Output format', '', ...c.outputFormat.map((x) => `- ${x}`), '');
  lines.push('## Constraints', '', ...c.constraints.map((x) => `- ${x}`), '');
  c.samples.forEach((s, i) => {
    lines.push(`## Sample ${i + 1}`, '', '**Input**', '```', s.input, '```', '', '**Output**', '```', s.output, '```', '');
  });
  return lines.join('\n');
}

module.exports = { createService, ApiError, toPublic, toSummary, toMarkdown, DIFFICULTIES };
