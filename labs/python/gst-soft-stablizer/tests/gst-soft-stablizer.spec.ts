import { test, expect } from '@playwright/test';

test.describe('python/gst-soft-stablizer', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/python/gst-soft-stablizer');
    await expect(page.getByRole('heading', { name: 'Gst Soft Stablizer' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
