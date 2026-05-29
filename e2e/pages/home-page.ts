import { type Page, type Locator } from '@playwright/test';

export type Locale = 'nl' | 'en';

const VIEW_FULL_CURRICULUM: Record<Locale, string> = {
  nl: 'Bekijk Programma',
  en: 'View Programme',
};

export class HomePage {
  readonly heroHeading: Locator;
  readonly viewFullCurriculumLabel: Locator;

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.viewFullCurriculumLabel = page.getByText(VIEW_FULL_CURRICULUM[locale]);
  }

  async goto() {
    await this.page.goto(`/${this.locale}`);
  }

  /**
   * The curriculum label the OTHER locale would render. Use to assert no
   * untranslated bleed of the opposite language onto this page.
   */
  otherLocaleLabel(): string {
    return VIEW_FULL_CURRICULUM[this.locale === 'nl' ? 'en' : 'nl'];
  }
}
