import { readFile, writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Run after Nitro so these guards precede its filesystem and server routes.
const configPath = '.vercel/output/config.json';
const config = JSON.parse(await readFile(configPath, 'utf8'));
assert.equal(config.version, 3);
const src = '^/(?:qa(?:/.*)?|architecture(?:\\.html)?(?:/.*)?)$';
const blocked = new RegExp(src);
for (const path of ['/qa', '/qa/', '/qa/jev-first', '/architecture', '/architecture.html']) {
  assert.ok(blocked.test(path));
}
for (const path of ['/', '/api/generate', '/api/compose', '/api/connection', '/favicon.svg']) {
  assert.ok(!blocked.test(path));
}
// Header-only routes must continue to filesystem resolution. Otherwise an
// edge cache can retain an empty response for an immutable CSS/JS URL.
for (const route of config.routes ?? []) {
  if (route.src && route.headers && !route.dest && !route.status && !route.handle) route.continue = true;
}
config.routes = [
  { src, status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
  ...(config.routes ?? []).filter(route => route.src !== src),
];
await rm('.vercel/output/static/architecture.html', { force: true });
await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('Production-only 404 guards installed; architecture asset excluded.');
