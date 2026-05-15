import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SMOKE_BASE_URL;

if (!baseURL) {
  throw new Error('SMOKE_BASE_URL is required for the smoke suite');
}

export default defineConfig({
  testDir: './e2e',
  testMatch: /smoke\.spec\.ts$/,
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL, locale: 'nl-NL' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: process.env.CI ? 'github' : 'list',
});
