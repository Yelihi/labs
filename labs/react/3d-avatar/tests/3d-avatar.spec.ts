import { test, expect } from '@playwright/test';

test.use({
  launchOptions: {
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  },
});

test('renders the 3D canvas without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/labs/react/3d-avatar');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect
    .poll(() =>
      canvas.evaluate((element: HTMLCanvasElement) => {
        const gl = element.getContext('webgl2');
        return (
          !!gl && !gl.isContextLost() && gl.drawingBufferWidth > 0 && gl.drawingBufferHeight > 0
        );
      }),
    )
    .toBe(true);
  expect(errors).toEqual([]);
});
