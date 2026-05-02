import { test, expect } from '@playwright/test';

test.describe('react/server-comp', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/react/server-comp');
    await expect(page.getByRole('heading', { name: 'Server Comp' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
