import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Faq from '@/app/[locale]/faq/page';
import nl from '@/messages/nl.json';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async (ns: string) => {
    const branch = ((nl as unknown as Record<string, unknown>)[ns] ?? {}) as Record<
      string,
      unknown
    >;
    return Object.assign(
      (key: string) => (typeof branch[key] === 'string' ? (branch[key] as string) : key),
      { raw: (key: string) => branch[key] },
    );
  },
}));

describe('FAQ page', () => {
  async function renderPage() {
    const ui = await Faq({ params: Promise.resolve({ locale: 'nl' as const }) });
    return render(ui);
  }

  it('renders every question from the messages file', async () => {
    await renderPage();
    for (const item of nl.faq.items) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    }
  });

  it('embeds FAQPage JSON-LD with all questions', async () => {
    const { container } = await renderPage();
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.innerHTML);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(nl.faq.items.length);
  });

  it('links the CTA to the contact page in the active locale', async () => {
    await renderPage();
    expect(screen.getByTestId('faq-contact-link')).toHaveAttribute('href', '/nl/contact');
  });
});
