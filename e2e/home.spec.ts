import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';

test('home renders hero + both training sections in NL', async ({ page }) => {
  const home = new HomePage(page, 'nl');
  await home.goto();
  await expect(home.heroHeading).toContainText(/agentic engineering/i);
  await expect(home.trainingBasicSection).toBeVisible();
  await expect(home.trainingAdvancedSection).toBeVisible();
});

test('redirects / to /nl', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/nl$/);
});
