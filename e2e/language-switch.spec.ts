import { test, expect } from '@playwright/test';

test('switching locale on /about preserves path', async ({ page }) => {
  await page.goto('/nl/about');
  await page.getByTestId('lang-switch-en').click();
  await expect(page).toHaveURL(/\/en\/about$/);
});
