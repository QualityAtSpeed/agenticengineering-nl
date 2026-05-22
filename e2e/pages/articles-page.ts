import { type Page, type Locator } from '@playwright/test';
import { type Locale } from './home-page';

const EMPTY_STATE: Record<Locale, string> = {
  nl: 'nog geen artikelen',
  en: 'no articles yet',
};

const READ_EXTERNAL: Record<Locale, string> = {
  nl: 'lees op externe site',
  en: 'read on external site',
};

export class ArticlesPage {
  readonly heading: Locator;
  readonly intro: Locator;
  readonly emptyState: Locator;
  readonly articleCards: Locator;
  readonly readExternalLinks: Locator;

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.intro = page.getByRole('main').locator('p').first();
    this.emptyState = page.getByText(EMPTY_STATE[locale]);
    this.articleCards = page.locator('[data-testid^="article-link-"]');
    this.readExternalLinks = page.getByText(READ_EXTERNAL[locale]);
  }

  async goto() {
    await this.page.goto(`/${this.locale}/articles`);
  }
}
