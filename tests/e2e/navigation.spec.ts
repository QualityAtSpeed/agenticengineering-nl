import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';
import type { Locale } from './pages/home-page';

const locales: Locale[] = ['nl', 'en'];

for (const locale of locales) {
  test(`${locale} hero primary CTA navigates to trainings (no 404)`, async ({ page }) => {
    const home = new HomePage(page, locale);
    await home.goto();

    // Guard against regression: the link must point at the plural route.
    await expect(home.heroPrimaryCta).toHaveAttribute('href', `/${locale}/trainings`);

    await home.heroPrimaryCta.click();

    await expect(page).toHaveURL(new RegExp(`/${locale}/trainings$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test(`${locale} hero has no secondary (book) CTA anymore`, async ({ page }) => {
    const home = new HomePage(page, locale);
    await home.goto();

    // The old "Boek training" header CTA is gone; trainings is the only hero CTA.
    await expect(home.heroPrimaryCta).toBeVisible();
    await expect(home.heroSecondaryCta).toHaveCount(0);
  });
}
