import { expect, test, vi } from 'vitest';
import { QueryableWorker } from '../src/utils/QueryableWorker';

test('preserves query arguments, listener identity, unsubscribe and termination', () => {
  const transport = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null as ((event: MessageEvent) => void) | null,
  };
  const worker = new QueryableWorker<
    { search: (id: number, query: string) => void },
    { result: (id: number, indices: Uint32Array) => void }
  >(transport as unknown as Worker);
  worker.sendQuery('search', 1, 'react');
  expect(transport.postMessage).toHaveBeenCalledWith({
    queryMethod: 'search',
    queryMethodArguments: [1, 'react'],
  });

  const listener = vi.fn();
  const remove = worker.addListener('result', listener);
  worker.addListener('result', listener);
  const indices = new Uint32Array([2, 4]);
  const event = new MessageEvent('message', {
    data: {
      queryMethodListener: 'result',
      queryMethodArguments: [1, indices],
    },
  });
  transport.onmessage?.(event);
  expect(listener).toHaveBeenCalledExactlyOnceWith(1, indices);
  remove();
  transport.onmessage?.(event);
  expect(listener).toHaveBeenCalledTimes(1);

  worker.addListener('result', listener);
  worker.terminate();
  expect(transport.terminate).toHaveBeenCalledOnce();
  transport.onmessage?.(event);
  expect(listener).toHaveBeenCalledTimes(1);
});
