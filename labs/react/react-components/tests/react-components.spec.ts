import { test, expect } from '@playwright/test';

test.describe('react/react-components', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/react/react-components');
    await expect(page.getByRole('heading', { name: 'React Components' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
