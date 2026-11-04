import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const standalone = fs.readFileSync(new URL('../standalone.html', import.meta.url), 'utf8');

test('V7.6 uses the distinct industrial authentication theme', () => {
  assert.match(html, /auth-gate-v76/);
  assert.match(html, /V7\.6 \/ INDUSTRIAL/);
  assert.match(css, /--a76-graphite:#151f26/);
  assert.match(css, /--a76-orange:#f07852/);
  assert.match(css, /auth-gate-v76 \.auth-main-v75/);
});

test('V7.6 preserves the existing authentication form hooks', () => {
  for (const id of ['authBackdrop', 'authTabLogin', 'authTabRegister', 'authHeading', 'authSubtitle', 'authFormArea', 'authClose']) {
    assert.ok(html.includes(`id="${id}"`), `Missing ${id}`);
    assert.ok(standalone.includes(`id="${id}"`), `Missing standalone ${id}`);
  }
  assert.match(html, /class="auth-form-overline"/);
  assert.match(html, /auth-local-note/);
});

test('V7.6 includes responsive and reduced-motion rules', () => {
  assert.match(css, /@media\(max-width:820px\)/);
  assert.match(css, /@media\(max-width:520px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
