import { test, expect } from '@playwright/test';

test.describe('typescript/domain-develop-with-functional-programing', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/typescript/domain-develop-with-functional-programing');
    await expect(page.getByRole('heading', { name: 'Domain Develop With Functional Programing' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
