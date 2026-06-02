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

const INTRO: Record<Locale, string> = {
  nl: 'die wij schreven of aanraden.',
  en: 'we wrote or recommend.',
};

export class ArticlesPage {
  readonly heading: Locator;
  readonly intro: Locator;
  readonly emptyState: Locator;
  readonly articleCards: Locator;
  readonly cardContainers: Locator;
  readonly cardImages: Locator;
  readonly readExternalLinks: Locator;
  readonly filterAll: Locator;
  readonly filterBlogs: Locator;
  readonly filterArticles: Locator;

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.intro = page.getByRole('heading', { level: 1 }).getByText(INTRO[locale]);
    this.emptyState = page.getByText(EMPTY_STATE[locale]);
    this.articleCards = page.locator('[data-testid^="article-link-"]');
    this.cardContainers = page.locator('[data-testid^="article-card-"]');
    this.cardImages = page.locator('[data-testid^="article-card-"] img');
    this.readExternalLinks = page.getByText(READ_EXTERNAL[locale]);
    this.filterAll = page.getByTestId('filter-all');
    this.filterBlogs = page.getByTestId('filter-blogs');
    this.filterArticles = page.getByTestId('filter-articles');
  }

  async goto() {
    await this.page.goto(`/${this.locale}/articles`);
  }
}
