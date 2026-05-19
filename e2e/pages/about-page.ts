import { type Page, type Locator } from '@playwright/test';
import { type Locale } from './home-page';

export class AboutPage {
  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {}

  async goto() {
    await this.page.goto(`/${this.locale}/about`);
  }

  instructorByName(name: RegExp | string): Locator {
    return this.page.getByText(name);
  }
}
