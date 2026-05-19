import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { TrainingCard } from '@/components/TrainingCard';
import { trainings } from '@/data/trainings';

function renderCard(trainingId: 'basic' | 'advanced') {
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
    expect(screen.getByText(/1 dag/)).toBeInTheDocument();
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
      '#training-advanced',
    );
  });
});
