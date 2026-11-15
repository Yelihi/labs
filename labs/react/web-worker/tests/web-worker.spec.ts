import { test, expect } from '@playwright/test';

test.describe('react/web-worker', () => {
  test.setTimeout(120_000);

  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/react/web-worker');
    await expect(page.getByRole('heading', { name: 'Web Worker' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });

  test('initializes the real worker, caps results and paginates filtered items', async ({
    page,
  }) => {
    await page.goto('/labs/react/web-worker');
    await expect(page.getByText('Ready: true / Items: 2,000,000')).toBeVisible({ timeout: 30_000 });
    await page.getByPlaceholder('Type to start jobs quickly...').fill('item-1');
    await expect(page.getByText(/Status: Done id=1/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/Result count: 10,000/)).toBeVisible();
    const items = page.getByRole('listitem');
    await expect(items).toHaveCount(50);
    await expect(items.first()).toHaveText('item-1-react-worker-cancel-strategy');
    expect(await items.allTextContents()).toEqual(
      expect.arrayContaining(['item-10-react-worker-cancel-strategy']),
    );
    expect((await items.allTextContents()).every((item) => item.startsWith('item-1'))).toBe(true);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Page 2 / 200')).toBeVisible();
    await expect(items.first()).toHaveText('item-139-react-worker-cancel-strategy');
    await page.getByPlaceholder('Type to start jobs quickly...').fill('item-2');
    await expect(page.getByText(/Status: Done id=2/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText('Page 1 / 200')).toBeVisible();
    await expect(items.first()).toHaveText('item-2-react-worker-cancel-strategy');
    await expect(page.getByRole('button', { name: 'Prev', exact: true })).toBeDisabled();
  });

  test('cancels an active job and completes a subsequent search', async ({ page }) => {
    await page.goto('/labs/react/web-worker');
    await expect(page.getByText('Ready: true / Items: 2,000,000')).toBeVisible({ timeout: 30_000 });
    await page.getByPlaceholder('Type to start jobs quickly...').fill('no-matching-item');
    await expect(page.getByText(/Status: progress/)).toBeVisible({ timeout: 60_000 });
    await page.getByRole('button', { name: 'Cancel latest' }).click();
    await expect(page.getByText(/Status: Canceled id=1/)).toBeVisible();
    await expect(page.getByText(/Result count: 0/)).toBeVisible();
    await page.getByPlaceholder('Type to start jobs quickly...').fill('item-');
    await expect(page.getByText(/Status: Done id=2/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/Result count: 10,000/)).toBeVisible();
  });

  test('supersedes an active search and renders an empty result', async ({ page }) => {
    await page.goto('/labs/react/web-worker');
    await expect(page.getByText('Ready: true / Items: 2,000,000')).toBeVisible({ timeout: 30_000 });
    const input = page.getByPlaceholder('Type to start jobs quickly...');
    await input.fill('no-matching-item');
    await expect(page.getByText(/Status: progress/)).toBeVisible({ timeout: 60_000 });
    await input.fill('item-');
    await expect(page.getByText(/Status: Done id=2/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/Result count: 10,000/)).toBeVisible();
    await input.fill('no-matching-item');
    await expect(page.getByText(/Status: Done id=3/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/Result count: 0/)).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  });
});
