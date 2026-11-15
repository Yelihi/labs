import { expect, test, vi } from 'vitest';
import { ProgressWorker } from '../src/projectss/worker-cancel/worker/ProgressWorker';

const config = { totalIterations: 0, chunkIterations: 2, progressEveryChunks: 1 };

test('stops at maxResults even in the middle of a chunk', async () => {
  const worker = new ProgressWorker();
  worker.setItems(Array(8).fill('match'));
  worker.setLatest(1);
  const reply = vi.fn();
  await worker.runFilterJob({
    requestId: 1,
    query: 'match',
    yieldNext: async () => {},
    reply,
    config: { ...config, maxResults: 3 },
  });
  expect(reply).toHaveBeenLastCalledWith(
    'result',
    1,
    new Uint32Array([0, 1, 2]),
    expect.any(Array),
  );
});

test.each(['cancel', 'supersede'] as const)(
  'does not publish a result after %s during the final yield',
  async (action) => {
    const worker = new ProgressWorker();
    worker.setItems(['match']);
    worker.setLatest(1);
    const reply = vi.fn();
    await worker.runFilterJob({
      requestId: 1,
      query: 'match',
      reply,
      config,
      yieldNext: async () => (action === 'cancel' ? worker.markCanceled(1) : worker.setLatest(2)),
    });
    expect(reply.mock.calls.some(([event]) => event === 'result')).toBe(false);
    if (action === 'cancel') expect(reply).toHaveBeenLastCalledWith('canceled', 1);
  },
);
