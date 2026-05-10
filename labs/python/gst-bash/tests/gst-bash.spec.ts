import { test, expect } from '@playwright/test';

test.describe('python/gst-bash', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/python/gst-bash');
    await expect(page.getByRole('heading', { name: 'Gst Bash' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
