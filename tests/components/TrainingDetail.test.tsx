import { describe, it, expect, vi } from 'vitest';
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
    expect(screen.getByText(/Dag 1 —/i)).toBeInTheDocument();
    expect(screen.getByText(/Dag 2 —/i)).toBeInTheDocument();
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

  it('uses durationDays (not training id) to gate the day split', async () => {
    // Pin the invariant: gate the day-split on durationDays, not on the
    // training id literal. Inject a fixture where id and durationDays
    // disagree — `basic` is bumped to durationDays === 2 with day-tagged
    // modules. Under the current production check
    // (training.durationDays === 2) the day split must render; if the
    // production code is reverted to (training.id === 'advanced') this
    // test fails because 'basic' would no longer trigger the split.
    //
    // Uses vi.doMock + dynamic import so the file-level `trainings`
    // import in the two tests above keeps the real data and stays green.
    vi.resetModules();
    vi.doMock('@/data/trainings', async () => {
      const actual = await vi.importActual<typeof import('@/data/trainings')>('@/data/trainings');
      return {
        ...actual,
        trainings: {
          ...actual.trainings,
          basic: {
            ...actual.trainings.basic,
            durationDays: 2,
            modules: [
              { id: 'agents-in-sdlc', day: 1 },
              { id: 'context-architecture', day: 2 },
            ],
          },
        },
      };
    });

    try {
      const { TrainingDetail: MockedTrainingDetail } = await import('@/components/TrainingDetail');
      render(
        <NextIntlClientProvider locale="nl" messages={nl}>
          <MockedTrainingDetail trainingId="basic" locale="nl" />
        </NextIntlClientProvider>,
      );
      expect(screen.getByText(/Dag 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Dag 2/i)).toBeInTheDocument();
    } finally {
      vi.doUnmock('@/data/trainings');
      vi.resetModules();
    }
  });
});
