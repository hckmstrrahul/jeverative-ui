import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
await mkdir('node_modules/.cache',{recursive:true});
await build({entryPoints:['tests/contracts.tsx'],outfile:'node_modules/.cache/jeverative-contracts.mjs',bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic'});
const result=spawnSync(process.execPath,['node_modules/.cache/jeverative-contracts.mjs'],{stdio:'inherit'});
process.exit(result.status??1);
