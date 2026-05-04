import { test, expect } from '@playwright/test';

test.describe('react/web-worker', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/react/web-worker');
    await expect(page.getByRole('heading', { name: 'Web Worker' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
