import { test, expect } from '@playwright/test';

test('renders the pipeline stabilizer page', async ({ page }) => {
  await page.goto('/labs/python/gst-pipeline-adjust-stablizer');
  await expect(
    page.getByRole('heading', { name: 'GST Pipeline Adjust Stabilizer', exact: true }),
  ).toBeVisible();
});
