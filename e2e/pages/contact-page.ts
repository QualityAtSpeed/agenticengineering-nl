import { type Page, type Locator, type Response } from '@playwright/test';
import { type Locale } from './home-page';

const SUBMIT_LABEL: Record<Locale, RegExp> = {
  nl: /Verzenden/,
  en: /Send/,
};
const NAME_LABEL: Record<Locale, RegExp> = {
  nl: /Naam/,
  en: /Name/,
};
const EMAIL_LABEL: Record<Locale, RegExp> = {
  nl: /E-mail/,
  en: /Email/,
};
const VALIDATION_ERROR_TEXT: Record<Locale, string> = {
  nl: 'Verplicht veld',
  en: 'Required field',
};
const SUCCESS_TEXT: Record<Locale, string> = {
  nl: 'Verzonden',
  en: 'Sent',
};

export class ContactPage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly successBanner: Locator;
  readonly firstValidationError: Locator;
  readonly nameField: Locator;
  readonly emailField: Locator;

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.nameInput = page.locator('input[name="name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.messageInput = page.locator('textarea[name="message"]');
    this.submitButton = page.getByRole('button', { name: SUBMIT_LABEL[locale] });
    this.successBanner = page.getByText(SUCCESS_TEXT[locale]);
    this.firstValidationError = page.getByText(VALIDATION_ERROR_TEXT[locale]).first();
    this.nameField = page.getByLabel(NAME_LABEL[locale]);
    this.emailField = page.getByLabel(EMAIL_LABEL[locale]);
  }

  async goto() {
    await this.page.goto(`/${this.locale}/contact`);
  }

  async fill(values: { name: string; email: string; message: string }) {
    await this.nameInput.fill(values.name);
    await this.emailInput.fill(values.email);
    await this.messageInput.fill(values.message);
  }

  async submit() {
    await this.submitButton.click();
  }

  async submitAndWaitForApi(): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse('**/api/contact'),
      this.submitButton.click(),
    ]);
    return response;
  }
}
