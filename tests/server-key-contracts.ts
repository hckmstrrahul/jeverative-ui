import assert from 'node:assert/strict';
import {
  serverOpenRouterKey,
  resolveOpenRouterKey,
} from '../lib/server/openrouter-key';
import { GET } from '../app/api/connection/route';

const names = [
  'NODE_ENV',
  'VERCEL',
  'OPENROUTER_API_KEY',
  'VERCEL_ENV',
  'ALLOW_SHARED_OPENROUTER_KEY',
] as const;
const original = names.map((name) => process.env[name]);
try {
  Object.assign(process.env, {
    NODE_ENV: 'development',
    OPENROUTER_API_KEY: 'test-server-only-key',
  });
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  delete process.env.ALLOW_SHARED_OPENROUTER_KEY;
  assert.equal(serverOpenRouterKey(), 'test-server-only-key');
  assert.equal(resolveOpenRouterKey(undefined), 'test-server-only-key');
  assert.equal(resolveOpenRouterKey('', 'manual'), undefined);
  assert.equal(resolveOpenRouterKey(' visitor-key ', 'manual'), 'visitor-key');
  const response = await GET();
  const metadata = await response.text();
  assert.equal(JSON.parse(metadata).configured, true);
  assert.ok(!metadata.includes('test-server-only-key'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  Object.assign(process.env, { NODE_ENV: 'production' });
  assert.equal(serverOpenRouterKey(), undefined);
  assert.equal(resolveOpenRouterKey(undefined), undefined);
  assert.equal(JSON.parse(await (await GET()).text()).configured, false);
  assert.equal(resolveOpenRouterKey('visitor-key'), 'visitor-key');
  Object.assign(process.env, { NODE_ENV: 'development', VERCEL: '1' });
  assert.equal(serverOpenRouterKey(), undefined);
  Object.assign(process.env, {
    NODE_ENV: 'production',
    VERCEL_ENV: 'production',
    ALLOW_SHARED_OPENROUTER_KEY: 'true',
  });
  assert.equal(serverOpenRouterKey(), 'test-server-only-key');
  assert.equal(resolveOpenRouterKey(undefined), 'test-server-only-key');
  assert.equal(resolveOpenRouterKey('visitor-key', 'manual'), 'visitor-key');
  assert.equal(resolveOpenRouterKey('', 'manual'), undefined);
  const hostedMetadata = await (await GET()).text();
  assert.equal(JSON.parse(hostedMetadata).configured, true);
  assert.ok(!hostedMetadata.includes('test-server-only-key'));
  process.env.VERCEL_ENV = 'preview';
  assert.equal(serverOpenRouterKey(), undefined);
} finally {
  names.forEach((name, i) => {
    if (original[i] === undefined) delete process.env[name];
    else Object.assign(process.env, { [name]: original[i] });
  });
}
console.log(
  'Server key requires explicit production opt-in; manual override and secret-free connection metadata pass.',
);
