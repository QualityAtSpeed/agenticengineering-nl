import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import en from '@/messages/en.json';
import { TrainingCard } from '@/components/TrainingCard';
import { trainings } from '@/data/trainings';

function renderCard(trainingId: 'basic' | 'advanced' | 'pilot') {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <TrainingCard trainingId={trainingId} locale="nl" />
    </NextIntlClientProvider>,
  );
}

describe('<TrainingCard />', () => {
  it('renders the training name and duration from i18n', () => {
    renderCard('basic');
    expect(screen.getByRole('heading', { name: /Basic/ })).toBeInTheDocument();
    expect(screen.getByText(/2 dagen/)).toBeInTheDocument();
  });

  it('renders the price from the trainings dataset, locale-formatted', () => {
    renderCard('basic');
    const expected = trainings.basic.priceEUR.toLocaleString('nl-NL');
    expect(screen.getByText(new RegExp(`€\\s*${expected}\\b`))).toBeInTheDocument();
  });

  it('links to in-page anchor for the selected training', () => {
    renderCard('advanced');
    expect(screen.getByRole('link', { name: /Bekijk programma/ })).toHaveAttribute(
      'href',
      '/nl/trainings/advanced',
    );
  });

  it('non-pilot primary CTA still links to the contact form', () => {
    renderCard('basic');
    const cta = screen.getByTestId('book-basic');
    expect(cta).toHaveAttribute('href', expect.stringContaining('/contact?training=basic'));
  });

  it('pilot CTA is labeled as booking ("Boek training")', () => {
    renderCard('pilot');
    expect(screen.getByTestId('book-pilot')).toHaveTextContent('Boek training');
  });

  it('basic CTA is labeled as request ("Vraag training aan")', () => {
    renderCard('basic');
    expect(screen.getByTestId('book-basic')).toHaveTextContent('Vraag training aan');
  });

  it('advanced CTA is labeled as request ("Vraag training aan")', () => {
    renderCard('advanced');
    expect(screen.getByTestId('book-advanced')).toHaveTextContent('Vraag training aan');
  });

  it('renders the English request label for non-pilot in the en locale', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <TrainingCard trainingId="basic" locale="en" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId('book-basic')).toHaveTextContent('Request training');
  });
});

describe('<TrainingCard /> — discount-aug-26 early-bird', () => {
  const BEFORE = new Date('2026-07-15T12:00:00+02:00');
  const AFTER = new Date('2026-08-15T12:00:00+02:00');

  function renderDiscountAug26(now: Date) {
    return render(
      <NextIntlClientProvider locale="nl" messages={nl}>
        <TrainingCard trainingId="discount-aug-26" locale="nl" now={now} />
      </NextIntlClientProvider>,
    );
  }

  it('primary CTA links to its own booking page, not the contact form', () => {
    renderDiscountAug26(BEFORE);
    const cta = screen.getByTestId('book-discount-aug-26');
    expect(cta).toHaveAttribute('href', expect.stringContaining('/trainings/discount-aug-26/book'));
    expect(cta).not.toHaveAttribute('href', expect.stringContaining('/contact'));
  });

  it('CTA is labeled as booking ("Boek training")', () => {
    renderDiscountAug26(BEFORE);
    expect(screen.getByTestId('book-discount-aug-26')).toHaveTextContent('Boek training');
  });

  it('before the deadline shows the early-bird price with the base price struck through', () => {
    renderDiscountAug26(BEFORE);
    expect(screen.getByText(/€\s*1\.399/)).toBeInTheDocument();
    expect(screen.getByText(/€\s*979,30/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });

  it('after the deadline shows the full price and no discount', () => {
    renderDiscountAug26(AFTER);
    expect(screen.getByText(/€\s*1\.399/)).toBeInTheDocument();
    expect(screen.queryByText(/€\s*979,30/)).not.toBeInTheDocument();
    expect(screen.queryByText(/30%/)).not.toBeInTheDocument();
  });
});

describe('<TrainingCard /> — sold out (pilot)', () => {
  it('shows the sold-out badge', () => {
    renderCard('pilot');
    expect(screen.getByText('Uitverkocht')).toBeInTheDocument();
  });

  it('shows the sold-out badge in the en locale', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <TrainingCard trainingId="pilot" locale="en" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });

  it('renders the booking CTA as a disabled, non-clickable button (not a link)', () => {
    renderCard('pilot');
    const cta = screen.getByTestId('book-pilot');
    expect(cta.tagName).toBe('BUTTON');
    expect(cta).toBeDisabled();
    expect(cta).not.toHaveAttribute('href');
    // pointer-events-none removes the hover state on the disabled CTA.
    expect(cta).toHaveClass('pointer-events-none');
  });

  it('hides the secondary contact link', () => {
    renderCard('pilot');
    expect(screen.queryByTestId('book-pilot-contact')).not.toBeInTheDocument();
  });

  it('shows the sold-out text only once (no duplicate label above the button)', () => {
    renderCard('pilot');
    expect(screen.getAllByText('Uitverkocht')).toHaveLength(1);
  });
});

describe('<TrainingCard /> — not sold out (regression guard)', () => {
  it('a non-sold-out training has no sold-out badge and an enabled CTA', () => {
    renderCard('basic');
    expect(screen.queryByText('Uitverkocht')).not.toBeInTheDocument();
    const cta = screen.getByTestId('book-basic');
    expect(cta).not.toBeDisabled();
  });
});
