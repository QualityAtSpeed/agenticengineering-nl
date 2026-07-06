import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialCard } from '@/components/TestimonialCard';
import { NextIntlClientProvider, Locale } from 'next-intl';
import type { Testimonial } from '@/data/testimonials';

function renderCard(props: Omit<Testimonial, 'id'>, locale: Locale) {
  return render(
    <NextIntlClientProvider locale={locale}>
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
