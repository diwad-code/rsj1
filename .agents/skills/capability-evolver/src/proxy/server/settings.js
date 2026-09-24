'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// Settings paths are resolved on every call rather than snapshotted at module
// load. Tests run in parallel by default (`node --test`); when multiple test
// files exercise the proxy server, each one starting writes
// `~/.evolver/settings.json` and the sibling webui observer would read those
// bytes back and report mode='proxy_only' instead of the expected 'idle'.
// Lazy resolution lets a test set EVOLVER_SETTINGS_DIR to a temp dir before
// calling start()/readSettings() and stay isolated from concurrent workers.
function getSettingsDir() {
  return process.env.EVOLVER_SETTINGS_DIR || path.join(os.homedir(), '.evolver');
}

function getSettingsFile() {
  return path.join(getSettingsDir(), 'settings.json');
}

function readSettings() {
  try {
    const file = getSettingsFile();
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch {}
  return {};
}

function writeSettings(data) {
  const dir = getSettingsDir();
  const file = getSettingsFile();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const current = readSettings();
  const merged = { ...current, ...data };
  fs.writeFileSync(file, JSON.stringify(merged, null, 2), { encoding: 'utf8', mode: 0o600 });
  // mode: 0o600 only applies on creation; explicitly chmod to tighten pre-existing files
  try { fs.chmodSync(file, 0o600); } catch {}
  return merged;
}

function clearSettings() {
  try {
    const file = getSettingsFile();
    if (fs.existsSync(file)) {
      const current = readSettings();
      delete current.proxy;
      fs.writeFileSync(file, JSON.stringify(current, null, 2), 'utf8');
    }
  } catch {}
}

function isStaleProxy() {
  const settings = readSettings();
  const pid = settings.proxy?.pid;
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return false;
  } catch {
    return true;
  }
}

function clearIfStale() {
  if (isStaleProxy()) {
    clearSettings();
    return true;
  }
  return false;
}

function getProxyUrl() {
  const settings = readSettings();
  return settings.proxy?.url || null;
}

function getProxyToken() {
  const settings = readSettings();
  return settings.proxy?.token || null;
}

module.exports = {
  readSettings,
  writeSettings,
  clearSettings,
  clearIfStale,
  isStaleProxy,
  getProxyUrl,
  getProxyToken,
  getSettingsDir,
  getSettingsFile,
};
