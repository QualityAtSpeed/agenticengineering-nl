import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';

const h = vi.hoisted(() => ({
  enabled: true,
  list: [
    { id: 'a', quoteNL: 'Quote A NL', quoteEN: 'Quote A EN', name: 'Alice', role: 'Lead, Acme' },
    { id: 'b', quoteNL: 'Quote B NL', quoteEN: 'Quote B EN', name: 'Bob', role: 'Eng, Beta' },
  ] as Array<{ id: string; quoteNL: string; quoteEN: string; name: string; role: string }>,
}));

vi.mock('@/lib/flags', () => ({ testimonialsEnabled: () => h.enabled }));
vi.mock('@/data/testimonials', () => ({
  get testimonials() {
    return h.list;
  },
}));

// Imported after the mocks are registered.
import { TestimonialsSection } from '@/components/TestimonialsSection';

function renderSection(locale: 'en' | 'nl' = 'en') {
  const messages = locale === 'nl' ? nl : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TestimonialsSection />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  h.enabled = true;
  h.list = [
    { id: 'a', quoteNL: 'Quote A NL', quoteEN: 'Quote A EN', name: 'Alice', role: 'Lead, Acme' },
    { id: 'b', quoteNL: 'Quote B NL', quoteEN: 'Quote B EN', name: 'Bob', role: 'Eng, Beta' },
  ];
});

describe('<TestimonialsSection />', () => {
  it('renders nothing when the flag is disabled', () => {
    h.enabled = false;
    const { container } = renderSection();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there are no testimonials', () => {
    h.list = [];
    const { container } = renderSection();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the heading, lede, and one card per testimonial when enabled (EN)', () => {
    renderSection('en');
    expect(screen.getByRole('heading', { name: 'What participants say' })).toBeInTheDocument();
    expect(
      screen.getByText('Feedback from engineers and teams who have taken the training.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Quote A EN')).toBeInTheDocument();
    expect(screen.getByText('Quote B EN')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('renders Dutch heading, lede, and NL quotes when locale is nl', () => {
    renderSection('nl');
    expect(screen.getByRole('heading', { name: 'Wat deelnemers zeggen' })).toBeInTheDocument();
    expect(
      screen.getByText('Reacties van engineers en teams die de training hebben gevolgd.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Quote A NL')).toBeInTheDocument();
    expect(screen.getByText('Quote B NL')).toBeInTheDocument();
    expect(screen.queryByText('Quote A EN')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});
