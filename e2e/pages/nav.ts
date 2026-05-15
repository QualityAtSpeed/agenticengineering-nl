import { type Page } from '@playwright/test';
import { type Locale } from './home-page';

const LANG_LINK_LABEL: Record<Locale, string> = { nl: 'NL', en: 'EN' };

export class Nav {
  constructor(readonly page: Page) {}

  async switchLocale(target: Locale) {
    await this.page.getByRole('link', { name: LANG_LINK_LABEL[target], exact: true }).click();
  }
}
