import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/nl',
  '/en',
  '/nl/contact',
  '/en/contact',
  '/nl/about',
  '/en/about',
  '/nl/impressum',
  '/sitemap.xml',
  '/robots.txt',
];

for (const path of routes) {
  test(`route ${path} responds 2xx or follows redirect to 2xx`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 5 });
    expect(res.status(), `${path} → ${res.status()}`).toBeLessThan(400);
  });
}

test('NL home renders hero and Dutch training card label', async ({ page }) => {
  await page.goto('/nl');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/agentic engineering/i);
  await expect(page.locator('#training-basic')).toBeVisible();
  await expect(page.locator('#training-advanced')).toBeVisible();
  await expect(page.getByText('volledige training').first()).toBeVisible();
  await expect(page.getByText('view full curriculum')).toHaveCount(0);
});

test('EN home renders hero and English training card label', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/agentic engineering/i);
  await expect(page.getByText('view full curriculum').first()).toBeVisible();
});

test('NL contact form is reachable and rendered', async ({ page }) => {
  await page.goto('/nl/contact');
  await expect(page.getByRole('button', { name: /Verzenden/ })).toBeVisible();
  await expect(page.getByLabel(/Naam/)).toBeVisible();
  await expect(page.getByLabel(/E-mail/)).toBeVisible();
});

test('NL about page lists both instructors', async ({ page }) => {
  await page.goto('/nl/about');
  await expect(page.getByText(/Pascal Dufour/)).toBeVisible();
  await expect(page.getByText(/Inico Veringa/)).toBeVisible();
});

test('html[lang] matches requested locale', async ({ page }) => {
  await page.goto('/nl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('security headers present on home', async ({ request }) => {
  const res = await request.get('/nl');
  expect(res.headers()['content-security-policy']).toBeTruthy();
  expect(res.headers()['strict-transport-security']).toBeTruthy();
  expect(res.headers()['x-content-type-options']).toBe('nosniff');
});
