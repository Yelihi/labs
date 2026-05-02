import { test, expect } from '@playwright/test';

test.describe('css/container-query', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/css/container-query');
    await expect(page.getByRole('heading', { name: 'Container Query' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
