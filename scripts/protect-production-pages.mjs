import { readFile, writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Run after Nitro so these guards precede its filesystem and server routes.
const configPath = '.vercel/output/config.json';
const config = JSON.parse(await readFile(configPath, 'utf8'));
assert.equal(config.version, 3);
const src = '^/(?:qa(?:/.*)?|architecture(?:\\.html)?(?:/.*)?)$';
const blocked = new RegExp(src);
for (const path of [
  '/qa',
  '/qa/',
  '/qa/jev-first',
  '/architecture',
  '/architecture.html',
]) {
  assert.ok(blocked.test(path));
}
for (const path of [
  '/',
  '/api/generate',
  '/api/compose',
  '/api/connection',
  '/favicon.svg',
]) {
  assert.ok(!blocked.test(path));
}
// Do not stamp an immutable cache policy onto the whole asset namespace:
// missing chunks fall through to the server and their 404s can then be cached
// for a year. Let Vercel's filesystem handler own static response caching.
config.routes = (config.routes ?? []).filter(
  (route) =>
    !(
      route.src === '/_next/static/(.*)' &&
      route.headers &&
      !route.dest &&
      !route.status
    ),
);
config.routes = [
  {
    src,
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  },
  ...(config.routes ?? []).filter((route) => route.src !== src),
];
const filesystemIndex = config.routes.findIndex(
  (route) => route.handle === 'filesystem',
);
assert.ok(
  filesystemIndex >= 0,
  'Static filesystem routing must precede missing-asset guard',
);
config.routes.splice(filesystemIndex + 1, 0, {
  src: '/_next/static/(.*)',
  status: 404,
  headers: { 'Cache-Control': 'no-store' },
});
await rm('.vercel/output/static/architecture.html', { force: true });
await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
console.log(
  'Production-only 404 guards installed; architecture asset excluded.',
);
