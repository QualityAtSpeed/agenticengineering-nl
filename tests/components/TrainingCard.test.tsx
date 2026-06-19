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

  it('pilot primary CTA links to the booking page, not the contact form', () => {
    renderCard('pilot');
    const cta = screen.getByTestId('book-pilot');
    expect(cta).toHaveAttribute('href', expect.stringContaining('/trainings/pilot/book'));
    expect(cta).not.toHaveAttribute('href', expect.stringContaining('/contact'));
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

  it('pilot secondary contact link goes to plain contact (no pilot preselect)', () => {
    renderCard('pilot');
    const link = screen.getByTestId('book-pilot-contact');
    expect(link).toHaveAttribute('href', '/nl/contact');
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

describe('<TrainingCard /> — najaar-2026 early-bird', () => {
  const BEFORE = new Date('2026-07-15T12:00:00+02:00');
  const AFTER = new Date('2026-08-15T12:00:00+02:00');

  function renderNajaar(now: Date) {
    return render(
      <NextIntlClientProvider locale="nl" messages={nl}>
        <TrainingCard trainingId="najaar-2026" locale="nl" now={now} />
      </NextIntlClientProvider>,
    );
  }

  it('primary CTA links to its own booking page, not the contact form', () => {
    renderNajaar(BEFORE);
    const cta = screen.getByTestId('book-najaar-2026');
    expect(cta).toHaveAttribute('href', expect.stringContaining('/trainings/najaar-2026/book'));
    expect(cta).not.toHaveAttribute('href', expect.stringContaining('/contact'));
  });

  it('CTA is labeled as booking ("Boek training")', () => {
    renderNajaar(BEFORE);
    expect(screen.getByTestId('book-najaar-2026')).toHaveTextContent('Boek training');
  });

  it('before the deadline shows the early-bird price with the base price struck through', () => {
    renderNajaar(BEFORE);
    expect(screen.getByText(/€\s*1\.399/)).toBeInTheDocument();
    expect(screen.getByText(/€\s*979,30/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });

  it('after the deadline shows the full price and no discount', () => {
    renderNajaar(AFTER);
    expect(screen.getByText(/€\s*1\.399/)).toBeInTheDocument();
    expect(screen.queryByText(/€\s*979,30/)).not.toBeInTheDocument();
    expect(screen.queryByText(/30%/)).not.toBeInTheDocument();
  });
});
