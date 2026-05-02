import { test, expect } from '@playwright/test';

test.describe('browser/dom-events', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/browser/dom-events');
    await expect(page.getByRole('heading', { name: 'Dom Events' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
