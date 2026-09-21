import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
await mkdir('node_modules/.cache',{recursive:true});
// Run middleware without Vinext aliases, matching Vercel's separate bundle.
await build({entryPoints:['middleware.ts'],outfile:'node_modules/.cache/middleware-runtime.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
const {default:middleware}=await import('../node_modules/.cache/middleware-runtime.mjs');
const {default:assert}=await import('node:assert/strict');
const response=middleware();
assert.equal(response.headers.get('x-middleware-next'),'1');
assert.equal(response.headers.get('Cache-Control'),'no-store');
assert.equal(response.headers.getSetCookie().length,6);
assert.ok(response.headers.getSetCookie().every(cookie=>cookie.startsWith('__vdpl=;')&&cookie.includes('Max-Age=0')));
console.log('Standalone Vercel middleware: passed');
await build({entryPoints:['tests/contracts.tsx'],outfile:'node_modules/.cache/jeverative-contracts.mjs',bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic'});
const result=spawnSync(process.execPath,['node_modules/.cache/jeverative-contracts.mjs'],{stdio:'inherit'});
process.exit(result.status??1);
