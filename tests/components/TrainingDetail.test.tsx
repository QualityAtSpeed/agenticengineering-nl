import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { TrainingDetail } from '@/components/TrainingDetail';
import { trainings } from '@/data/trainings';

function renderDetail(id: 'basic' | 'advanced') {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <TrainingDetail trainingId={id} locale="nl" />
    </NextIntlClientProvider>,
  );
}

describe('<TrainingDetail /> day-split rendering', () => {
  it('renders a day split when the training has durationDays === 2', () => {
    // Identify the current 2-day training by data, not id — the redesign
    // will move which training is 2-day, and this test should still pass.
    const twoDayId = (Object.values(trainings).find((t) => t.durationDays === 2)?.id ?? null) as
      | 'basic'
      | 'advanced'
      | null;
    expect(twoDayId, 'expected at least one training with durationDays === 2').not.toBeNull();
    renderDetail(twoDayId!);
    expect(screen.getByText(/Dag 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Dag 2/i)).toBeInTheDocument();
  });

  it('does NOT render a day split when the training has durationDays === 1', () => {
    const oneDayId = (Object.values(trainings).find((t) => t.durationDays === 1)?.id ?? null) as
      | 'basic'
      | 'advanced'
      | null;
    expect(oneDayId, 'expected at least one training with durationDays === 1').not.toBeNull();
    renderDetail(oneDayId!);
    expect(screen.queryByText(/Dag 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dag 2/i)).not.toBeInTheDocument();
  });
});
