import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { TrainingDetail } from '@/components/TrainingDetail';

function renderDetail(trainingId: 'basic' | 'advanced' | 'pilot' | 'discount-aug-26', now?: Date) {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <TrainingDetail trainingId={trainingId} locale="nl" now={now} />
    </NextIntlClientProvider>,
  );
}

const BEFORE_DEADLINE = new Date('2026-07-15T12:00:00+02:00');
const AFTER_DEADLINE = new Date('2026-08-15T12:00:00+02:00');

describe('<TrainingDetail /> CTA labels', () => {
  it('pilot CTA is disabled (pilot is sold out)', () => {
    renderDetail('pilot');
    expect(screen.getByTestId('book-training-pilot')).toBeDisabled();
  });

  it('basic CTA is labeled as request ("Vraag training aan")', () => {
    renderDetail('basic');
    expect(screen.getByTestId('book-training-basic')).toHaveTextContent('Vraag training aan');
  });

  it('advanced CTA is labeled as request ("Vraag training aan")', () => {
    renderDetail('advanced');
    expect(screen.getByTestId('book-training-advanced')).toHaveTextContent('Vraag training aan');
  });

  it('discount-aug-26 CTA is labeled as booking and links to its booking page', () => {
    renderDetail('discount-aug-26', BEFORE_DEADLINE);
    const cta = screen.getByTestId('book-training-discount-aug-26');
    expect(cta).toHaveTextContent('Boek training');
    expect(cta).toHaveAttribute('href', expect.stringContaining('/trainings/discount-aug-26/book'));
  });
});

describe('<TrainingDetail /> discount-aug-26 early-bird price', () => {
  it('before the deadline shows the struck base price, the discount, and the note', () => {
    renderDetail('discount-aug-26', BEFORE_DEADLINE);
    // price is shown in two spots (fact row + bottom CTA box)
    expect(screen.getAllByText(/€\s*999/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/€\s*699,30/).length).toBeGreaterThan(0);
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });

  it('after the deadline shows the full price and no discount', () => {
    renderDetail('discount-aug-26', AFTER_DEADLINE);
    expect(screen.getAllByText(/€\s*999/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/€\s*699,30/)).not.toBeInTheDocument();
    expect(screen.queryByText(/30%/)).not.toBeInTheDocument();
  });
});

describe('<TrainingDetail /> sold out (pilot)', () => {
  it('renders the booking CTA as a disabled button (not a link)', () => {
    renderDetail('pilot');
    const cta = screen.getByTestId('book-training-pilot');
    expect(cta.tagName).toBe('BUTTON');
    expect(cta).toBeDisabled();
    expect(cta).not.toHaveAttribute('href');
    // the sold-out reason is exposed to assistive tech via aria-label.
    expect(cta).toHaveAttribute('aria-label', expect.stringContaining('Uitverkocht'));
  });

  it('keeps a contact path via the sold-out note', () => {
    renderDetail('pilot');
    expect(screen.getByTestId('book-training-pilot-soldout-contact')).toHaveAttribute(
      'href',
      expect.stringContaining('/contact'),
    );
  });
});

describe('<TrainingDetail /> not sold out (regression guard)', () => {
  it('a non-sold-out bookable training keeps an enabled booking link', () => {
    renderDetail('discount-aug-26', BEFORE_DEADLINE);
    const cta = screen.getByTestId('book-training-discount-aug-26');
    expect(cta).not.toBeDisabled();
    expect(cta).toHaveAttribute('href', expect.stringContaining('/trainings/discount-aug-26/book'));
  });
});
