export async function localSearchApi(params: {
  query: string;
  signal: AbortSignal;
  delayMs: number;
  fail: boolean;
}): Promise<{ list: string[]; delayMs: number }> {
  const query = new URLSearchParams({
    q: params.query,
    delayMs: String(params.delayMs),
    fail: params.fail ? '1' : '0',
  });
  const response = await fetch(`/api/search?${query}`, { signal: params.signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: unknown = await response.json();
  if (
    typeof data !== 'object' ||
    data === null ||
    !('list' in data) ||
    !Array.isArray(data.list) ||
    !data.list.every((item): item is string => typeof item === 'string') ||
    !('delayMs' in data) ||
    typeof data.delayMs !== 'number'
  )
    throw new Error('Invalid search response');
  return { list: data.list, delayMs: data.delayMs };
}
