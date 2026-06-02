import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { a11yPages } from './constants';

for (const path of a11yPages) {
  test(`a11y: ${path} has zero AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
