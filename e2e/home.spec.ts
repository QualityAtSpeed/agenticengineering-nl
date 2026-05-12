import { test, expect } from '@playwright/test';

test('home renders hero + both training sections in NL', async ({ page }) => {
  await page.goto('/nl');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/agentic engineering/i);
  await expect(page.locator('#training-basic')).toBeVisible();
  await expect(page.locator('#training-advanced')).toBeVisible();
});

test('redirects / to /nl', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/nl$/);
});
