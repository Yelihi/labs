import { test, expect } from '@playwright/test';

test.describe('typescript/notebook', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/typescript/notebook');
    await expect(page.getByRole('heading', { name: 'Notebook' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
