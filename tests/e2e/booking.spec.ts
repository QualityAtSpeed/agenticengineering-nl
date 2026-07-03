import { test, expect } from '@playwright/test';

// pilot is sold out (booking closed), so the form flows run against the live
// bookable training. pilot's sold-out notice has its own test below.
for (const locale of ['nl', 'en'] as const) {
  test(`booking form renders and grows rows (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}/trainings/discount-aug-26/book`);
    await expect(page.getByTestId('booking-submit')).toBeVisible();
    await expect(page.getByTestId('booking-attendee-name-0')).toBeVisible();

    await page.getByTestId('booking-seats').selectOption('3');
    await expect(page.getByTestId('booking-attendee-name-2')).toBeVisible();
  });

  test(`sold-out training shows the notice, not the form (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}/trainings/pilot/book`);
    await expect(page.getByTestId('booking-submit')).toBeHidden();
    await expect(
      page.getByText(locale === 'nl' ? 'Uitverkocht' : 'Sold out', { exact: true }),
    ).toBeVisible();
  });
}

test('submitting redirects to the Stripe url (checkout stubbed)', async ({ page }) => {
  await page.route('**/api/checkout', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'https://example.com/stub-checkout' }),
    }),
  );

  await page.goto('/nl/trainings/discount-aug-26/book');
  await page.getByTestId('booking-attendee-name-0').fill('Pascal');
  await page.getByTestId('booking-attendee-email-0').fill('pascal@example.com');
  await page.getByTestId('booking-company').fill('company-name');
  await page.getByTestId('booking-street').fill('Dokter Spanjaardsweg 23');
  await page.getByTestId('booking-zipcode').fill('8025BT');
  await page.getByTestId('booking-city').fill('Zwolle');
  await Promise.all([
    page.waitForURL('https://example.com/stub-checkout'),
    page.getByTestId('booking-submit').click(),
  ]);
  await expect(page).toHaveURL('https://example.com/stub-checkout');
});
