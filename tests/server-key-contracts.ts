import assert from 'node:assert/strict';
import {
  localOpenRouterKey,
  resolveOpenRouterKey,
} from '../lib/server/openrouter-key';
import { GET } from '../app/api/connection/route';

const names = ['NODE_ENV', 'VERCEL', 'OPENROUTER_API_KEY'] as const;
const original = names.map((name) => process.env[name]);
try {
  Object.assign(process.env, {
    NODE_ENV: 'development',
    OPENROUTER_API_KEY: 'test-server-only-key',
  });
  delete process.env.VERCEL;
  assert.equal(localOpenRouterKey(), 'test-server-only-key');
  assert.equal(resolveOpenRouterKey(undefined), 'test-server-only-key');
  assert.equal(resolveOpenRouterKey('', 'manual'), undefined);
  assert.equal(resolveOpenRouterKey(' visitor-key ', 'manual'), 'visitor-key');
  const response = await GET();
  const metadata = await response.text();
  assert.equal(JSON.parse(metadata).configured, true);
  assert.ok(!metadata.includes('test-server-only-key'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  Object.assign(process.env, { NODE_ENV: 'production' });
  assert.equal(localOpenRouterKey(), undefined);
  assert.equal(resolveOpenRouterKey(undefined), undefined);
  assert.equal(JSON.parse(await (await GET()).text()).configured, false);
  assert.equal(resolveOpenRouterKey('visitor-key'), 'visitor-key');
  Object.assign(process.env, { NODE_ENV: 'development', VERCEL: '1' });
  assert.equal(localOpenRouterKey(), undefined);
} finally {
  names.forEach((name, i) => {
    if (original[i] === undefined) delete process.env[name];
    else Object.assign(process.env, { [name]: original[i] });
  });
}
console.log(
  'Server key remains local-only; manual override and secret-free connection metadata pass.',
);
