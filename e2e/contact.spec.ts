import { test, expect } from '@playwright/test';
import { contact } from '@/e2e/constants';

test('contact form shows validation errors on empty submit', async ({ page }) => {
  await page.goto('/nl/contact');
  await page.getByTestId('contact-submit').click();
  await expect(page.getByText('// Verplicht veld').first()).toBeVisible();
});

test('contact form submits when API is mocked to 200', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
  );
  await page.goto('/nl/contact');
  await page.getByTestId('contact-name').fill(contact.name);
  await page.getByTestId('contact-email').fill(contact.email);
  await page.getByTestId('contact-message').fill(contact.message);
  await Promise.all([
    page.waitForResponse('**/api/contact'),
    page.getByTestId('contact-submit').click(),
  ]);
  await expect(page.getByTestId('contact-success')).toBeVisible({ timeout: 10_000 });
});
