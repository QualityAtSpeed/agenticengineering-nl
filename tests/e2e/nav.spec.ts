import { test, expect } from '@playwright/test';
import { Nav, NAV_ORDER } from './pages/nav';

test('desktop nav shows all links left-to-right in order', async ({ page }) => {
  await page.goto('/nl');
  const nav = new Nav(page);

  for (const item of NAV_ORDER) {
    await expect(nav[item]).toBeVisible();
  }

  // Assert visual order: each link sits to the right of the previous one.
  const xs: number[] = [];
  for (const item of NAV_ORDER) {
    const box = await nav[item].boundingBox();
    expect(box, `${item} should have a bounding box`).not.toBeNull();
    xs.push(box!.x);
  }
  const sorted = [...xs].sort((a, b) => a - b);
  expect(xs).toEqual(sorted);
});

test('mobile menu toggles open and shows all links including trainings', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/nl');
  const nav = new Nav(page);

  // Desktop links are hidden on mobile; the toggle is the entry point.
  await expect(nav.mobileToggle).toBeVisible();
  await nav.mobileToggle.click();

  for (const item of NAV_ORDER) {
    await expect(nav.mobileLink(item)).toBeVisible();
  }
});

test('mobile menu contains a working language switcher', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/nl/about');
  const nav = new Nav(page);

  await expect(nav.mobileToggle).toBeVisible();
  await nav.mobileToggle.click();

  // On small screens the language switcher lives inside the hamburger panel.
  await expect(nav.mobileLangLink('en')).toBeVisible();
  await expect(nav.mobileLangLink('nl')).toBeVisible();

  // And switching works, preserving the current path.
  await nav.mobileLangLink('en').click();
  await expect(page).toHaveURL(/\/en\/about$/);
});
