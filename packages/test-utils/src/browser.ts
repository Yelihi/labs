export function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Edg')) return 'edge';
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Safari')) return 'safari';
  return 'unknown';
}
