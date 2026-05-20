import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '/nl',
  '/en',
  '/nl/about',
  '/en/about',
  '/nl/articles',
  '/en/articles',
  '/nl/contact',
  '/nl/impressum',
];

for (const path of pages) {
  test(`a11y: ${path} has zero AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
