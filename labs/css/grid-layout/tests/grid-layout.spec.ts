import { test, expect } from '@playwright/test';

test.describe('css/grid-layout', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/css/grid-layout');
    await expect(page.getByRole('heading', { name: 'Grid Layout' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
