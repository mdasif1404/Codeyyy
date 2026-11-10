// Serves the bank straight from the JSON file. No database required.
const challenges = require('../data/challenges.json');

const clone = (x) => JSON.parse(JSON.stringify(x));

module.exports = {
  name: 'memory',
  async findAll() {
    return clone(challenges).sort((a, b) => a.number - b.number);
  },
  async findByIdOrNumber(key) {
    const k = String(key).trim().toUpperCase();
    const found = challenges.find((c) => c.id.toUpperCase() === k || String(c.number) === k);
    return found ? clone(found) : null;
  },
  async findHiddenTests(id) {
    const found = challenges.find((c) => c.id.toUpperCase() === String(id).toUpperCase());
    return found ? clone(found.hiddenTests || []) : null;
  },
};
