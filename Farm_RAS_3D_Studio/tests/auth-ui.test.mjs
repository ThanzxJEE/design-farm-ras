import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('source HTML keeps the authentication gate and application entry points', () => {
  const html = read('index.html');
  assert.match(html, /id="authBackdrop"/);
  assert.match(html, /class="auth-card auth-card-v74"/);
  assert.match(html, /id="authTabLogin"/);
  assert.match(html, /id="authTabRegister"/);
  assert.match(html, /id="authFormArea"/);
  assert.match(html, /\.\/src\/styles\.css/);
  assert.match(html, /\.\/src\/app\.js/);
});

test('authentication logic preserves form IDs and password visibility controls', () => {
  const app = read('src/app.js');
  for (const token of ['function setAuthMode', 'function handleAuthSubmit', 'authEmail', 'authPassword', 'authConfirm', 'authName', 'data-toggle-password', 'deriveAuthHash']) {
    assert.ok(app.includes(token), `Missing authentication token: ${token}`);
  }
});

test('new login styles include desktop, tablet and mobile layouts', () => {
  const css = read('src/styles.css');
  assert.match(css, /\.auth-card-v74/);
  assert.match(css, /\.auth-diagram-card/);
  assert.match(css, /\.auth-password-toggle/);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*520px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test('standalone HTML embeds the redesigned login and its application script', () => {
  const html = read('standalone.html');
  assert.match(html, /class="auth-card auth-card-v74"/);
  assert.match(html, /auth-ras-diagram/);
  assert.match(html, /data-toggle-password/);
  assert.match(html, /function handleAuthSubmit/);
  assert.match(html, /function initAuth/);
});

test('V7.5 base markup remains state-aware under the V7.6 industrial theme', () => {
  const html = read('index.html');
  const css = read('src/styles.css');
  assert.match(html, /auth-gate-v75/);
  assert.match(html, /Thiết kế có<br><em>cơ sở kỹ thuật\.<\/em>/);
  assert.match(html, /auth-gate-v76/);
  assert.match(html, /auth-ras-diagram-v75/);
  assert.match(html, /auth-tech-stats/);
  assert.match(html, /id="authClose"/);
  assert.match(css, /#authBackdrop\.auth-gate-v76\s*\{/);
  assert.match(css, /--a76-orange:#f07852/);
  assert.match(css, /#authBackdrop\.auth-gate-v75\.auth-gate\s*\{display:flex!important\}/);
});
