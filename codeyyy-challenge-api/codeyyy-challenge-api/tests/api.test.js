const test = require('node:test');
const assert = require('node:assert/strict');
const memoryStore = require('../src/store/memoryStore');
const { createService, ApiError } = require('../src/services/challengeService');
const { createHandlers } = require('../src/routes/challenges');

const service = createService(memoryStore);
const handlers = createHandlers(service);

// minimal fake of Express's res
function fakeRes() {
  const res = { statusCode: 200, headers: {} };
  res.json = (b) => ((res.body = b), res);
  res.send = (b) => ((res.body = b), res);
  res.type = (t) => ((res.headers['content-type'] = t), res);
  return res;
}
const call = async (name, req) => {
  const res = fakeRes();
  await handlers[name]({ query: {}, params: {}, ...req }, res);
  return res;
};
const rejects = (p, status, code) =>
  assert.rejects(p, (e) => e instanceof ApiError && e.status === status && e.code === code);

test('data: 10 challenges, 3 Easy / 4 Medium / 3 Hard, unique ids and numbers', async () => {
  const all = await memoryStore.findAll();
  assert.equal(all.length, 10);
  const count = (d) => all.filter((c) => c.difficulty === d).length;
  assert.deepEqual([count('Easy'), count('Medium'), count('Hard')], [3, 4, 3]);
  assert.equal(new Set(all.map((c) => c.id)).size, 10);
  assert.deepEqual(all.map((c) => c.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('data: every challenge is complete', async () => {
  for (const c of await memoryStore.findAll()) {
    for (const f of ['statement', 'inputFormat', 'outputFormat', 'constraints', 'samples']) {
      assert.ok(Array.isArray(c[f]) && c[f].length > 0, `${c.id}.${f} missing`);
    }
    assert.ok(c.samples.every((s) => s.input && s.output), `${c.id} sample incomplete`);
    assert.equal(c.hasStory, !!c.story, `${c.id} hasStory mismatch`);
    assert.ok([10, 15, 20].includes(c.timeMinutes));
  }
});

test('data: the three story challenges are 1, 5 and 8', async () => {
  const stories = (await memoryStore.findAll()).filter((c) => c.hasStory).map((c) => c.id);
  assert.deepEqual(stories, ['CYY-E01', 'CYY-M05', 'CYY-H08']);
});

test('data: samples match the problem statements', async () => {
  const get = async (id) => (await service.get(id)).samples[0];
  assert.deepEqual(await get('CYY-E01'), { input: '5\n3 0 1 4 5', output: '2' });
  assert.deepEqual(await get('CYY-M06'), { input: '4\n1 3\n2 6\n8 10\n15 18', output: '1 6\n8 10\n15 18' });
  assert.deepEqual(await get('CYY-H10'), { input: '3 11\n1 5 6', output: '2' });
  assert.equal((await get('CYY-H08')).output, '5');
});

test('GET /challenges returns summaries, not full statements', async () => {
  const res = await call('list', {});
  assert.equal(res.body.total, 10);
  assert.equal(res.body.data.length, 10);
  assert.equal(res.body.data[0].statement, undefined);
  assert.equal(res.body.data[0].id, 'CYY-E01');
});

test('GET /challenges?full=true returns complete statements', async () => {
  const res = await call('list', { query: { full: 'true' } });
  assert.ok(res.body.data.every((c) => Array.isArray(c.statement) && c.samples.length));
});

test('filters: difficulty (case-insensitive), hasStory, concept, search', async () => {
  assert.equal((await call('list', { query: { difficulty: 'hard' } })).body.total, 3);
  assert.equal((await call('list', { query: { difficulty: 'MEDIUM' } })).body.total, 4);
  assert.equal((await call('list', { query: { hasStory: 'true' } })).body.total, 3);
  assert.equal((await call('list', { query: { hasStory: 'false' } })).body.total, 7);
  assert.equal((await call('list', { query: { concept: 'dynamic' } })).body.total, 2);
  assert.deepEqual((await call('list', { query: { q: 'island' } })).body.data.map((c) => c.id), ['CYY-M07']);
  assert.equal((await call('list', { query: { difficulty: 'Hard', hasStory: 'true' } })).body.total, 1);
});

test('pagination', async () => {
  const res = await call('list', { query: { page: '2', limit: '4' } });
  assert.equal(res.body.count, 4);
  assert.equal(res.body.pages, 3);
  assert.equal(res.body.data[0].number, 5);
  const last = await call('list', { query: { page: '3', limit: '4' } });
  assert.equal(last.body.count, 2);
});

test('invalid query params give 400', async () => {
  await rejects(service.list({ difficulty: 'Impossible' }), 400, 'INVALID_DIFFICULTY');
  await rejects(service.list({ hasStory: 'maybe' }), 400, 'INVALID_QUERY');
  await rejects(service.list({ limit: '0' }), 400, 'INVALID_QUERY');
  await rejects(service.list({ page: 'abc' }), 400, 'INVALID_QUERY');
});

test('GET /challenges/:id works by id (any case) and by number', async () => {
  assert.equal((await call('get', { params: { id: 'CYY-M07' } })).body.title, 'Count the Number of Islands');
  assert.equal((await call('get', { params: { id: 'cyy-m07' } })).body.id, 'CYY-M07');
  assert.equal((await call('get', { params: { id: '10' } })).body.id, 'CYY-H10');
});

test('unknown challenge gives 404', async () => {
  await rejects(service.get('CYY-X99'), 404, 'CHALLENGE_NOT_FOUND');
  await rejects(service.get('11'), 404, 'CHALLENGE_NOT_FOUND');
});

test('SECURITY: hidden tests never appear in any public response', async () => {
  const fake = {
    ...(await memoryStore.findByIdOrNumber('CYY-E01')),
    hiddenTests: [{ input: 'SECRET_IN', output: 'SECRET_OUT' }],
  };
  const leaky = createService({
    name: 'x',
    findAll: async () => [fake],
    findByIdOrNumber: async () => fake,
    findHiddenTests: async () => fake.hiddenTests,
  });
  const h = createHandlers(leaky);
  for (const [name, req] of [['list', { query: { full: 'true' } }], ['get', { params: { id: '1' } }], ['random', { query: {} }]]) {
    const res = fakeRes();
    await h[name]({ query: {}, params: {}, ...req }, res);
    assert.ok(!JSON.stringify(res.body).includes('SECRET'), `${name} leaked hidden tests`);
    assert.ok(!JSON.stringify(res.body).includes('hiddenTests'), `${name} exposed hiddenTests field`);
  }
  // ...but the server-side judge helper can read them
  const tests = await leaky.getJudgeTests('CYY-E01');
  assert.deepEqual(tests.map((t) => t.visible), [true, false]);
  assert.equal(tests[1].input, 'SECRET_IN');
});

test('random: respects difficulty and exclude', async () => {
  for (let i = 0; i < 25; i++) {
    const r = (await call('random', { query: { difficulty: 'Easy' } })).body;
    assert.equal(r.difficulty, 'Easy');
  }
  const only = (await call('random', { query: { difficulty: 'Easy', exclude: 'CYY-E01,CYY-E02' } })).body;
  assert.equal(only.id, 'CYY-E03');
  await rejects(service.random({ difficulty: 'Easy', exclude: 'CYY-E01,CYY-E02,CYY-E03' }), 404, 'CHALLENGE_NOT_FOUND');
});

test('stats', async () => {
  const s = (await call('stats', {})).body;
  assert.deepEqual(s, { total: 10, byDifficulty: { Easy: 3, Medium: 4, Hard: 3 }, withStory: 3, totalMinutes: 150 });
});

test('markdown output', async () => {
  const res = await call('get', { params: { id: 'CYY-E01' }, query: { format: 'markdown' } });
  assert.equal(res.headers['content-type'], 'text/markdown');
  assert.match(res.body, /^# 1\. The Missing Treasure/);
  assert.match(res.body, /> A treasure chest contains numbered coins/);
  assert.match(res.body, /## Sample 1/);
  const m2 = await call('markdown', { params: { id: '2' } });
  assert.ok(!m2.body.includes('>')); // no story block for challenge 2
});

test('responses are not mutable references into the store', async () => {
  const a = await service.get('CYY-E01');
  a.title = 'HACKED';
  assert.equal((await service.get('CYY-E01')).title, 'The Missing Treasure');
});
