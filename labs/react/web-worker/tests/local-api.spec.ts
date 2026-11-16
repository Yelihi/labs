import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/labs/react/web-worker');
  await page.getByRole('button', { name: 'Network + Worker', exact: true }).click();
  await page.getByLabel('API', { exact: true }).selectOption('local');
});

test('uses the real HTTP API through Vite and recovers from a server error', async ({ page }) => {
  await page.getByLabel('응답 지연(ms)').fill('50');
  await page.getByLabel('서버 오류 재현').check();
  const failed = page.waitForResponse(
    (response) => response.url().includes('/api/search?') && response.status() === 503,
  );
  await page.getByPlaceholder('Type fast to force out-of-order + cancel...').fill('http');
  expect((await failed).status()).toBe(503);
  await expect(page.getByText(/Fetch error: Error: HTTP 503/)).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);

  const succeeded = page.waitForResponse(
    (response) => response.url().includes('/api/search?') && response.status() === 200,
  );
  await page.getByLabel('서버 오류 재현').uncheck();
  const response = await succeeded;
  const body = await response.json();
  expect(body.delayMs).toBe(50);
  expect(body.list).toHaveLength(200_000);
  await expect(page.getByText(/Status: Done id=2/)).toBeVisible();
  await expect(page.getByRole('listitem').first()).toHaveText('http-server-item-0-react-worker');
});

test('aborts the HTTP request when switching back to mock mode', async ({ page }) => {
  await page.getByLabel('응답 지연(ms)').fill('5000');
  const sent = page.waitForRequest((request) => request.url().includes('/api/search?'));
  await page.getByPlaceholder('Type fast to force out-of-order + cancel...').fill('switch');
  const request = await sent;
  const aborted = page.waitForEvent('requestfailed', (event) => event === request);
  await page.getByLabel('API', { exact: true }).selectOption('mock');
  expect((await aborted).failure()?.errorText).toContain('ERR_ABORTED');
  await expect(page.getByText(/Status: Idle/)).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.getByPlaceholder('Type fast to force out-of-order + cancel...').fill('mock-again');
  await expect(page.getByText(/Status: Done id=1/)).toBeVisible();
  await expect(page.getByRole('listitem').first()).toHaveText(
    'mock-again-server-item-0-react-worker',
  );
});
