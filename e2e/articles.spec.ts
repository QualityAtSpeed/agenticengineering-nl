import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { ArticlesPage } from './pages/articles-page';
import { type Locale } from './pages/home-page';

const newsDir = path.join(process.cwd(), 'news');
const hasArticles =
  fs.existsSync(newsDir) && fs.readdirSync(newsDir).some((f) => f.endsWith('.md'));

const locales: Locale[] = ['nl', 'en'];

for (const locale of locales) {
  test(`articles: ${locale} page renders heading + intro`, async ({ page }) => {
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    await expect(articles.heading).toBeVisible();
    await expect(articles.intro).toBeVisible();
  });

  test(`articles: ${locale} shows empty state when news/ has no .md`, async ({ page }) => {
    test.skip(hasArticles, 'news/ contains articles — empty state path not exercised');
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    await expect(articles.emptyState).toBeVisible();
  });

  test(`articles: ${locale} renders cards with external links`, async ({ page }) => {
    test.skip(!hasArticles, 'no articles in news/ — card render path not exercised');
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    const firstLink = articles.articleCards.first();
    await expect(firstLink).toBeVisible();
    await expect(firstLink).toHaveAttribute('target', '_blank');
    await expect(firstLink).toHaveAttribute('rel', /noopener/);
    await expect(articles.readExternalLinks.first()).toBeVisible();
  });

  test(`articles: ${locale} card images have src and non-empty alt`, async ({ page }) => {
    test.skip(!hasArticles, 'no articles in news/ — card render path not exercised');
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    const firstImage = articles.cardImages.first();
    await expect(firstImage).toBeVisible();
    const src = await firstImage.getAttribute('src');
    expect(src).toBeTruthy();
    const alt = await firstImage.getAttribute('alt');
    expect(alt).toBeTruthy();
  });

  test(`articles: ${locale} card border changes on hover`, async ({ page }) => {
    test.skip(!hasArticles, 'no articles in news/ — card render path not exercised');
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    const card = articles.cardContainers.first();
    const baseline = await card.evaluate((el) => getComputedStyle(el).borderColor);
    await card.hover();
    await expect
      .poll(async () => card.evaluate((el) => getComputedStyle(el).borderColor))
      .not.toBe(baseline);
  });
}
