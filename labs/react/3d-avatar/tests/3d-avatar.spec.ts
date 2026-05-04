import { test, expect } from '@playwright/test';

test.describe('react/3d-avatar', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/react/3d-avatar');
    await expect(page.getByRole('heading', { name: '3d Avatar' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
