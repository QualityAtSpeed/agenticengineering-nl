import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';

test('home renders hero', async ({ page }) => {
  const home = new HomePage(page, 'nl');
  await home.goto();
  await expect(home.heroHeading).toContainText(/agentic.*engineering/i);
  await expect(home.heroHeading).toContainText(/quality engineering/i);
});

test('redirects / to /nl', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/nl$/);
});

test('shows the testimonials section when the flag is enabled', async ({ page }) => {
  await page.goto('/nl');
  await expect(page.getByRole('heading', { name: /Wat deelnemers zeggen/ })).toBeVisible();
});
