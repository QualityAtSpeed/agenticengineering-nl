import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { TrainingCard } from '@/components/TrainingCard';

describe('<TrainingCard />', () => {
  it('renders training name, duration, and formatted price for basic', () => {
    render(
      <NextIntlClientProvider locale="nl" messages={nl}>
        <TrainingCard trainingId="basic" locale="nl" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('heading', { name: /Basic/ })).toBeInTheDocument();
    expect(screen.getByText(/1 dag/)).toBeInTheDocument();
    expect(screen.getByText(/€799/)).toBeInTheDocument();
  });

  it('links to in-page anchor', () => {
    render(
      <NextIntlClientProvider locale="nl" messages={nl}>
        <TrainingCard trainingId="advanced" locale="nl" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('link', { name: /Bekijk programma/ })).toHaveAttribute(
      'href',
      '#training-advanced',
    );
  });
});
