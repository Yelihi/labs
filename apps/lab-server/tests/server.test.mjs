import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { createLabServer } from '../src/server.mjs';

async function start(t, log = () => {}) {
  const server = createLabServer({ log });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  return `http://127.0.0.1:${server.address().port}`;
}

test('health, routes and methods', async (t) => {
  const base = await start(t);
  assert.deepEqual(await (await globalThis.fetch(`${base}/health`)).json(), { status: 'ok' });
  assert.equal((await globalThis.fetch(`${base}/missing`)).status, 404);
  const response = await globalThis.fetch(`${base}/api/search`, { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET');
});

test('serves the search dataset after the requested delay', async (t) => {
  const base = await start(t);
  const started = Date.now();
  const response = await globalThis.fetch(`${base}/api/search?q=react&delayMs=50`);
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.ok(Date.now() - started >= 50);
  assert.equal(result.delayMs, 50);
  assert.equal(result.list.length, 200_000);
  assert.equal(result.list[0], 'react-server-item-0-react-worker');
  assert.equal(result.list.at(-1), 'react-server-item-199999-react-worker');
});

test('rejects invalid parameters and supports an intentional server failure', async (t) => {
  const base = await start(t);
  for (const params of [
    'delayMs=-1',
    'delayMs=5001',
    'delayMs=NaN',
    'delayMs=1.5',
    'fail=yes',
    `q=${'a'.repeat(101)}`,
  ]) {
    assert.equal((await globalThis.fetch(`${base}/api/search?${params}`)).status, 400);
  }
  const response = await globalThis.fetch(`${base}/api/search?fail=1&delayMs=0`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'Simulated server error' });
});

test('stops pending work when the HTTP client aborts', { timeout: 5000 }, async (t) => {
  const started = Promise.withResolvers();
  const canceled = Promise.withResolvers();
  const base = await start(t, (message) => {
    if (message === 'search started') started.resolve();
    if (message === 'search canceled') canceled.resolve();
  });
  const controller = new globalThis.AbortController();
  const response = globalThis.fetch(`${base}/api/search?delayMs=5000`, {
    signal: controller.signal,
  });
  const rejected = assert.rejects(response, { name: 'AbortError' });
  await started.promise;
  controller.abort();
  await rejected;
  await canceled.promise;
});
