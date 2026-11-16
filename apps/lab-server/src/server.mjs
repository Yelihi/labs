import { createServer } from 'node:http';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import console from 'node:console';

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

export function createLabServer({ log = console.log } = {}) {
  return createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return json(response, 405, { error: 'Use GET' });
    }
    if (url.pathname === '/health') return json(response, 200, { status: 'ok' });
    if (url.pathname !== '/api/search') return json(response, 404, { error: 'Not found' });

    const query = url.searchParams.get('q') ?? '';
    const delayMs = Number(url.searchParams.get('delayMs') ?? '500');
    const fail = url.searchParams.get('fail') ?? '0';
    if (
      query.length > 100 ||
      !Number.isInteger(delayMs) ||
      delayMs < 0 ||
      delayMs > 5000 ||
      !['0', '1'].includes(fail)
    ) {
      return json(response, 400, {
        error: 'q: max 100 characters; delayMs: integer 0–5000; fail: 0 or 1',
      });
    }

    log('search started');
    const timer = setTimeout(() => {
      if (fail === '1') return json(response, 503, { error: 'Simulated server error' });
      const list = Array.from(
        { length: 200_000 },
        (_, i) => `${query}-server-item-${i}-react-worker`,
      );
      json(response, 200, { list, delayMs });
    }, delayMs);
    response.once('close', () => {
      clearTimeout(timer);
      if (!response.writableEnded) log('search canceled');
    });
  });
}
