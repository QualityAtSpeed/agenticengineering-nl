import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialCard } from '@/components/TestimonialCard';
import { NextIntlClientProvider, Locale } from 'next-intl';
import type { Testimonial } from '@/data/testimonials';
import nl from '@/messages/nl.json';
import en from '@/messages/en.json';

const messages = { nl, en };

function renderCard(props: Omit<Testimonial, 'id'>, locale: Locale) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages[locale as 'nl' | 'en']}>
      <TestimonialCard {...props} />
    </NextIntlClientProvider>,
  );
}

describe('<TestimonialCard />', () => {
  it('renders the NL quote inside a blockquote element', () => {
    renderCard(
      {
        quoteNL: 'Goede training',
        quoteEN: 'Great training',
        name: 'Jane Doe',
        role: 'Lead, Acme',
      },
      'nl',
    );
    const quoteNL = screen.getByText('Goede training');
    expect(quoteNL.tagName).toBe('BLOCKQUOTE');
  });

  it('renders the EN quote inside a blockquote element', () => {
    renderCard(
      {
        quoteNL: 'Goede training',
        quoteEN: 'Great training',
        name: 'Jane Doe',
        role: 'Lead, Acme',
      },
      'en',
    );
    const quoteEN = screen.getByText('Great training');
    expect(quoteEN.tagName).toBe('BLOCKQUOTE');
  });

  it('shows no translated-from label when translatedFrom is undefined', () => {
    renderCard(
      {
        quoteNL: 'Goede training',
        quoteEN: 'Great training',
        name: 'Jane Doe',
        role: 'Lead, Acme',
      },
      'nl',
    );
    expect(screen.queryByText(/vertaald/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/translated/i)).not.toBeInTheDocument();
  });

  it('shows no translated-from label when locale matches translatedFrom', () => {
    renderCard(
      {
        quoteNL: 'Goede training',
        quoteEN: 'Great training',
        name: 'Jane Doe',
        role: 'Lead, Acme',
        translatedFrom: 'nl',
      },
      'nl',
    );
    expect(screen.queryByText(/vertaald/i)).not.toBeInTheDocument();
  });

  it('shows no translated-from label when EN locale matches EN translatedFrom', () => {
    renderCard(
      {
        quoteNL: 'Goede training',
        quoteEN: 'Great training',
        name: 'Jane Doe',
        role: 'Lead, Acme',
        translatedFrom: 'en',
      },
      'en',
    );
    expect(screen.queryByText(/translated/i)).not.toBeInTheDocument();
  });

  it('shows "Translated from Dutch" when EN locale and translatedFrom is NL', () => {
    renderCard(
      {
        quoteNL: 'Goede training',
        quoteEN: 'Great training',
        name: 'Jane Doe',
        role: 'Lead, Acme',
        translatedFrom: 'nl',
      },
      'en',
    );
    expect(screen.getByText('Translated from Dutch')).toBeInTheDocument();
  });

  it('shows "Vertaald vanuit het Engels" when NL locale and translatedFrom is EN', () => {
    renderCard(
      {
        quoteNL: 'Goede training',
        quoteEN: 'Great training',
        name: 'Jane Doe',
        role: 'Lead, Acme',
        translatedFrom: 'en',
      },
      'nl',
    );
    expect(screen.getByText('Vertaald vanuit het Engels')).toBeInTheDocument();
  });

  it('renders the attribution name and role inside a cite element', () => {
    renderCard(
      {
        quoteNL: 'Goede training',
        quoteEN: 'Great training',
        name: 'Jane Doe',
        role: 'Lead, Acme',
      },
      'nl',
    );
    const span = screen.getByText(/Jane Doe/);
    const cite = span.closest('cite') as HTMLElement;
    expect(cite.tagName).toBe('CITE');
    expect(cite).toHaveTextContent('Lead, Acme');
  });
});
