import { defineConfig, devices } from '@playwright/test';

const serverCommand = process.env.LAB_TEST_SERVER_COMMAND ?? 'pnpm dev:react';
const baseURL = process.env.LAB_TEST_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: 'labs',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: serverCommand,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    ...(serverCommand === 'pnpm dev:react'
      ? [
          {
            command: 'pnpm dev:server',
            url: 'http://127.0.0.1:3001/health',
            reuseExistingServer: !process.env.CI,
            timeout: 30_000,
          },
        ]
      : []),
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'chrome',
      use: { channel: 'chrome' },
    },
    {
      name: 'edge',
      use: { channel: 'msedge' },
    },
  ],
});
