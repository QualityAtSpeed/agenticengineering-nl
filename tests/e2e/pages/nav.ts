import { type Page, type Locator } from '@playwright/test';
import { type Locale } from './home-page';

const LANG_LINK_LABEL: Record<Locale, string> = { nl: 'NL', en: 'EN' };

/** Desktop nav links in the order they appear left-to-right. */
export const NAV_ORDER = ['articles', 'trainings', 'about', 'contact'] as const;

export class Nav {
  readonly articles: Locator;
  readonly trainings: Locator;
  readonly about: Locator;
  readonly contact: Locator;
  readonly mobileToggle: Locator;

  constructor(readonly page: Page) {
    this.articles = page.getByTestId('nav-articles');
    this.trainings = page.getByTestId('nav-trainings');
    this.about = page.getByTestId('nav-about');
    this.contact = page.getByTestId('nav-contact');
    this.mobileToggle = page.getByTestId('mobile-menu-toggle');
  }

  /** Mobile menu link locators (inside the toggle panel). */
  mobileLink(item: (typeof NAV_ORDER)[number]): Locator {
    return this.page.getByTestId(`mobile-menu-${item}`);
  }

  async switchLocale(target: Locale) {
    await this.page.getByRole('link', { name: LANG_LINK_LABEL[target], exact: true }).click();
  }
}
