import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';

const h = vi.hoisted(() => ({
  enabled: true,
  list: [
    { id: 'a', quote: 'Quote A', name: 'Alice', role: 'Lead, Acme' },
    { id: 'b', quote: 'Quote B', name: 'Bob', role: 'Eng, Beta' },
  ] as Array<{ id: string; quote: string; name: string; role: string }>,
}));

vi.mock('@/lib/flags', () => ({ testimonialsEnabled: () => h.enabled }));
vi.mock('@/data/testimonials', () => ({
  get testimonials() {
    return h.list;
  },
}));

// Imported after the mocks are registered.
import { TestimonialsSection } from '@/components/TestimonialsSection';

function renderSection() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <TestimonialsSection />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  h.enabled = true;
  h.list = [
    { id: 'a', quote: 'Quote A', name: 'Alice', role: 'Lead, Acme' },
    { id: 'b', quote: 'Quote B', name: 'Bob', role: 'Eng, Beta' },
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

  it('renders the heading, lede, and one card per testimonial when enabled', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'What participants say' })).toBeInTheDocument();
    expect(
      screen.getByText('Feedback from engineers and teams who have taken the training.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Quote A')).toBeInTheDocument();
    expect(screen.getByText('Quote B')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});
