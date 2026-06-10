import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { TrainingDetail } from '@/components/TrainingDetail';

function renderDetail(trainingId: 'basic' | 'advanced' | 'pilot') {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <TrainingDetail trainingId={trainingId} locale="nl" />
    </NextIntlClientProvider>,
  );
}

describe('<TrainingDetail /> CTA labels', () => {
  it('pilot CTA is labeled as booking ("Boek training")', () => {
    renderDetail('pilot');
    expect(screen.getByTestId('book-training-pilot')).toHaveTextContent('Boek training');
  });

  it('basic CTA is labeled as request ("Vraag training aan")', () => {
    renderDetail('basic');
    expect(screen.getByTestId('book-training-basic')).toHaveTextContent('Vraag training aan');
  });

  it('advanced CTA is labeled as request ("Vraag training aan")', () => {
    renderDetail('advanced');
    expect(screen.getByTestId('book-training-advanced')).toHaveTextContent('Vraag training aan');
  });
});
