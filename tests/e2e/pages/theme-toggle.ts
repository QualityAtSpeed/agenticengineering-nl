import { type Page, type Locator } from '@playwright/test';
import { type Locale } from './home-page';

export class ThemeTogglePage {
  readonly html: Locator;
  readonly toggle: Locator;
  readonly optionLight: Locator;
  readonly optionDark: Locator;
  readonly optionSystem: Locator;

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.html = page.locator('html');
    this.toggle = page.getByTestId('theme-toggle').first();
    this.optionLight = page.getByTestId('theme-option-light').first();
    this.optionDark = page.getByTestId('theme-option-dark').first();
    this.optionSystem = page.getByTestId('theme-option-system').first();
  }

  async goto() {
    await this.page.goto(`/${this.locale}`);
  }

  async open() {
    await this.toggle.click();
  }
}
