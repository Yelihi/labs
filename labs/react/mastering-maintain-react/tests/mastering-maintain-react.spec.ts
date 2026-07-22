import { test, expect } from '@playwright/test';

test.describe('react/mastering-maintain-react', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/react/mastering-maintain-react');
    await expect(page.getByRole('heading', { name: 'Mastering Maintain React' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
