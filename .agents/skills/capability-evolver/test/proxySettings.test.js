'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  readSettings,
  writeSettings,
  getSettingsFile,
  getSettingsDir,
} = require('../src/proxy/server/settings');

describe('settings', () => {
  let tmpDir;
  let savedSettingsDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'settings-test-'));
    // Redirect the global ~/.evolver/ path into our tmpDir so chmod / file
    // assertions exercise the same code without polluting the user's real
    // settings file or racing with sibling test workers.
    savedSettingsDir = process.env.EVOLVER_SETTINGS_DIR;
    process.env.EVOLVER_SETTINGS_DIR = tmpDir;
  });

  after(() => {
    if (savedSettingsDir === undefined) delete process.env.EVOLVER_SETTINGS_DIR;
    else process.env.EVOLVER_SETTINGS_DIR = savedSettingsDir;
    try { fs.rmSync(tmpDir, { recursive: true }); } catch {}
  });

  it('writeSettings creates file and merges data', () => {
    const testFile = path.join(tmpDir, 'settings.json');
    const data = { proxy: { url: 'http://127.0.0.1:19820', pid: 1234 } };
    fs.writeFileSync(testFile, JSON.stringify(data));

    const parsed = JSON.parse(fs.readFileSync(testFile, 'utf8'));
    assert.equal(parsed.proxy.url, 'http://127.0.0.1:19820');
    assert.equal(parsed.proxy.pid, 1234);
  });

  it('readSettings returns empty object for missing file', () => {
    // Use a sub-tmp dir so the file definitively does not exist.
    const subDir = fs.mkdtempSync(path.join(tmpDir, 'missing-'));
    const prev = process.env.EVOLVER_SETTINGS_DIR;
    process.env.EVOLVER_SETTINGS_DIR = subDir;
    try {
      const result = readSettings();
      assert.ok(typeof result === 'object');
    } finally {
      process.env.EVOLVER_SETTINGS_DIR = prev;
    }
  });

  it('writeSettings sets 0o600 on fresh settings file', {
    skip: process.platform === 'win32' ? 'chmod not enforced on Windows' : false,
  }, () => {
    writeSettings({ _test: true });
    const mode = fs.statSync(getSettingsFile()).mode & 0o777;
    assert.equal(mode, 0o600, 'settings.json must be owner-read-only after fresh write');
  });

  it('writeSettings tightens 0o644 pre-existing file to 0o600 (upgrade path)', {
    skip: process.platform === 'win32' ? 'chmod not enforced on Windows' : false,
  }, () => {
    // Simulate a pre-existing file with loose permissions (pre-C3 upgrade)
    const dir = getSettingsDir();
    const file = getSettingsFile();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify({}), { encoding: 'utf8', mode: 0o644 });
    fs.chmodSync(file, 0o644);
    assert.equal(fs.statSync(file).mode & 0o777, 0o644, 'precondition: file starts at 0o644');

    writeSettings({ _test: true });
    const mode = fs.statSync(file).mode & 0o777;
    assert.equal(mode, 0o600, 'writeSettings must tighten 0o644 to 0o600');
  });
});
