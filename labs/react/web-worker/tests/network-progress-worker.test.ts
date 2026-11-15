import { expect, test, vi } from 'vitest';
import { ProgressWorker } from '../src/projectss/worker-cancel-in-abort/worker/ProgressWorker';

test('filters case-insensitively and transfers only matching indices', async () => {
  const worker = new ProgressWorker();
  worker.setLatest(1);
  const post = vi.fn();
  await worker.runFilterJob({
    requestId: 1,
    query: 'REACT',
    list: ['react', 'python', 'React worker'],
    yieldNext: async () => {},
    post,
    chunkSize: 2,
    progressEveryChunks: 1,
  });
  expect(post).toHaveBeenLastCalledWith(
    { type: 'RESULT', requestId: 1, indices: new Uint32Array([0, 2]) },
    expect.any(Array),
  );
});

test.each(['cancel', 'supersede'] as const)(
  'drops the result after %s during the last yield',
  async (action) => {
    const worker = new ProgressWorker();
    worker.setLatest(1);
    const post = vi.fn();
    await worker.runFilterJob({
      requestId: 1,
      query: 'react',
      list: ['react'],
      yieldNext: async () => (action === 'cancel' ? worker.markCanceled(1) : worker.setLatest(2)),
      post,
      chunkSize: 2,
      progressEveryChunks: 1,
    });
    expect(post.mock.calls.some(([message]) => message.type === 'RESULT')).toBe(false);
    if (action === 'cancel')
      expect(post).toHaveBeenLastCalledWith({ type: 'CANCELED', requestId: 1 });
  },
);
