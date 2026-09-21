import assert from 'node:assert/strict';
import {
  readLocalConnection,
  writeLocalConnection,
} from '../lib/local-connection';
let value: string | null = null;
const storage = {
  getItem: () => value,
  setItem: (_: string, next: string) => {
    value = next;
  },
  removeItem: () => {
    value = null;
  },
};
assert.equal(readLocalConnection(storage), null);
writeLocalConnection(storage, { key: 'test-manual-key', source: 'manual' });
assert.deepEqual(readLocalConnection(storage), {
  key: 'test-manual-key',
  source: 'manual',
});
writeLocalConnection(storage, { key: 'test-manual-key', source: 'server' });
assert.equal(readLocalConnection(storage)?.source, 'server');
writeLocalConnection(storage, null);
assert.equal(readLocalConnection(storage), null);
value = '{broken';
assert.equal(readLocalConnection(storage), null);
value = JSON.stringify({ key: 'bad\nkey' });
assert.equal(readLocalConnection(storage), null);
assert.equal(
  readLocalConnection({
    getItem: () => {
      throw Error('Storage blocked');
    },
  }),
  null,
);
assert.throws(() =>
  writeLocalConnection(
    {
      setItem: () => {},
      removeItem: () => {
        throw Error('Storage blocked');
      },
    },
    null,
  ),
);
console.log(
  'Local manual-key save, restore, default preference, delete and unavailable storage checks pass.',
);
