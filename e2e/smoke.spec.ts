import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';
import { ContactPage } from './pages/contact-page';
import { AboutPage } from './pages/about-page';

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

test('NL home renders hero and Dutch training card label without EN bleed', async ({ page }) => {
  const home = new HomePage(page, 'nl');
  await home.goto();
  await expect(home.heroHeading).toContainText(/agentic.*engineering/i);
  await expect(home.viewFullCurriculumLabel.first()).toBeVisible();
  await expect(page.getByText(home.otherLocaleLabel())).toHaveCount(0);
  const nlProof = page.getByTestId('proof-github-link');
  await expect(nlProof).toBeVisible();
  await expect(nlProof).toHaveAttribute(
    'href',
    'https://github.com/QualityAtSpeed/agenticengineering-nl',
  );
});

test('EN home renders hero and English training card label', async ({ page }) => {
  const home = new HomePage(page, 'en');
  await home.goto();
  await expect(home.heroHeading).toContainText(/agentic.*engineering/i);
  await expect(home.viewFullCurriculumLabel.first()).toBeVisible();
  const enProof = page.getByTestId('proof-github-link');
  await expect(enProof).toBeVisible();
  await expect(enProof).toHaveAttribute(
    'href',
    'https://github.com/QualityAtSpeed/agenticengineering-nl',
  );
});

test('NL contact form is reachable and rendered', async ({ page }) => {
  const contact = new ContactPage(page, 'nl');
  await contact.goto();
  await expect(contact.submitButton).toBeVisible();
  await expect(contact.nameField).toBeVisible();
  await expect(contact.emailField).toBeVisible();
});

test('NL about page lists both instructors', async ({ page }) => {
  const about = new AboutPage(page, 'nl');
  await about.goto();
  await expect(about.instructorByName(/Pascal Dufour/)).toBeVisible();
  await expect(about.instructorByName(/Inico Veringa/)).toBeVisible();
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
