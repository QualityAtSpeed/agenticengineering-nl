import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000/nl',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      BLOGS_ENABLED: 'true',
    },
  },
  use: { baseURL: 'http://localhost:3000', locale: 'nl-NL' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  reporter: process.env.CI ? 'github' : 'list',
});
