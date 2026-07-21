import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { streamJsonObjectArray } from './stream-json-array.mjs';

test('streams nested objects and escaped string delimiters', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aleph-private-parser-'));
  const path = join(directory, 'fixture.json');
  const fixture = [
    { id: 1, text: 'braces { [ ] } and an escaped quote: "', nested: [{ ok: true }] },
    { id: 2, text: 'unicode: λ 🜏', nested: { array: [1, 2, 3] } },
  ];
  await writeFile(path, ` \n${JSON.stringify(fixture)}\n `);
  const values = [];
  for await (const value of streamJsonObjectArray(path, { highWaterMark: 7 })) values.push(value);
  assert.deepEqual(values, fixture);
  await rm(directory, { recursive: true });
});

test('rejects a non-array export shape', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aleph-private-parser-'));
  const path = join(directory, 'fixture.json');
  await writeFile(path, '{"not":"an array"}');
  await assert.rejects(async () => {
    for await (const _value of streamJsonObjectArray(path)) {
      // The generator should fail before yielding.
    }
  }, /top-level JSON array/u);
  await rm(directory, { recursive: true });
});
