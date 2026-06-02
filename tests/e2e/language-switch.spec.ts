import { test, expect } from '@playwright/test';
import { Nav } from './pages/nav';

test('switching locale on /about preserves path', async ({ page }) => {
  await page.goto('/nl/about');
  await new Nav(page).switchLocale('en');
  await expect(page).toHaveURL(/\/en\/about$/);
});
