'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { pickForTurn, REASONS } = require('../src/proxy/router/model_router');

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'model_router_cases.json');
const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

test('model_router fixture parity with Rust', async (t) => {
  assert.equal(fixture.schema_version, 1, 'fixture schema_version drifted');
  assert.ok(Array.isArray(fixture.cases) && fixture.cases.length > 0, 'no cases loaded');

  for (const c of fixture.cases) {
    await t.test(c.name, () => {
      const actual = pickForTurn(c.input);
      assert.deepEqual(actual, c.expected, `parity break in ${c.name}`);
    });
  }
});

test('REASONS export covers every reason emitted by the fixture', () => {
  const exported = new Set(Object.values(REASONS));
  for (const c of fixture.cases) {
    assert.ok(
      exported.has(c.expected.reason),
      `fixture reason "${c.expected.reason}" missing from REASONS export`,
    );
  }
});
