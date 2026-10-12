import { test, expect } from '@playwright/test';

// The page column is as wide as a nos.nl article column (834px): it does not grow on wider screens.
const COLUMN = 834;

for (const path of ['/nl', '/nl/trainings', '/nl/articles', '/nl/about']) {
  test(`${path}: page column stays ${COLUMN}px on a wide screen`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(path);

    const boxes = await page
      .locator('.max-w-a4')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
    expect(boxes.length).toBeGreaterThan(0);
    expect(new Set(boxes)).toEqual(new Set([COLUMN]));

    const wider = await page.evaluate((limit) => {
      const found: string[] = [];
      for (const el of document.querySelectorAll('nav *, main *, footer *')) {
        const max = getComputedStyle(el).maxWidth;
        if (max.endsWith('px') && parseFloat(max) > limit)
          found.push(`${el.tagName.toLowerCase()} ${max}`);
      }
      return found;
    }, COLUMN);
    expect(wider).toEqual([]);
  });
}
