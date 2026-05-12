import { test, expect } from '@playwright/test';

test('contact form shows validation errors on empty submit', async ({ page }) => {
  await page.goto('/nl/contact');
  await page.getByRole('button', { name: /Verzenden/ }).click();
  await expect(page.getByText('// Verplicht veld').first()).toBeVisible();
});

test('contact form submits when API is mocked to 200', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
  );
  await page.goto('/nl/contact');
  await page.fill('input[name="name"]', 'Pascal');
  await page.fill('input[name="email"]', 'pascal@example.com');
  await page.fill('textarea[name="message"]', 'Wij willen graag de basic training boeken.');
  await page.getByRole('button', { name: /Verzenden/ }).click();
  await expect(page.getByText('// Verzonden')).toBeVisible();
});
