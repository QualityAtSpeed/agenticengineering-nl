import { test, expect } from '@playwright/test';
import { ThemeTogglePage } from './pages/theme-toggle';

test('theme: selecting Dark applies the dark class and persists across reload', async ({
  page,
}) => {
  const theme = new ThemeTogglePage(page, 'nl');
  await theme.goto();
  await theme.open();
  await theme.optionDark.click();
  await expect(theme.html).toHaveClass(/dark/);

  await page.reload();
  await expect(theme.html).toHaveClass(/dark/);
});

test('theme: selecting Light applies the light class and persists across reload', async ({
  page,
}) => {
  const theme = new ThemeTogglePage(page, 'nl');
  await theme.goto();
  await theme.open();
  await theme.optionLight.click();
  await expect(theme.html).toHaveClass(/light/);
  await expect(theme.html).not.toHaveClass(/dark/);

  await page.reload();
  await expect(theme.html).toHaveClass(/light/);
});

test('theme: System mode follows the OS preference', async ({ page }) => {
  const theme = new ThemeTogglePage(page, 'nl');
  await page.emulateMedia({ colorScheme: 'dark' });
  await theme.goto();
  await theme.open();
  await theme.optionSystem.click();
  await expect(theme.html).toHaveClass(/dark/);

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(theme.html).toHaveClass(/light/);
});

test('theme: toggle is reachable and works from the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const theme = new ThemeTogglePage(page, 'nl');
  await theme.goto();
  await page.getByTestId('mobile-menu-toggle').click();
  await theme.open();
  await theme.optionDark.click();
  await expect(theme.html).toHaveClass(/dark/);
});
