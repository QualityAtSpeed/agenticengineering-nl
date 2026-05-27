import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';
import { DayAgenda } from '@/components/DayAgenda';
import type { Module } from '@/data/trainings';

function renderAgenda(locale: 'nl' | 'en', modules: Module[], label?: string) {
  const messages = locale === 'nl' ? nl : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DayAgenda label={label} modules={modules} />
    </NextIntlClientProvider>,
  );
}

describe('<DayAgenda />', () => {
  it('renders the label when provided', () => {
    renderAgenda('en', [{ id: 'agents-in-sdlc', day: 1 }], 'Day 1 —');
    expect(screen.getByText('Day 1 —')).toBeInTheDocument();
  });

  it('does NOT render a label when prop omitted', () => {
    renderAgenda('en', [{ id: 'agents-in-sdlc', day: 1 }]);
    expect(screen.queryByText('Day 1 —')).not.toBeInTheDocument();
  });

  it('renders 3 numbered prefixes (01, 02, 03) for 3 modules', () => {
    renderAgenda('en', [
      { id: 'agents-in-sdlc', day: 1 },
      { id: 'failure-modes-ai-code', day: 1 },
      { id: 'test-first-with-agents', day: 1 },
    ]);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('resolves EN short title via modules.<id>.short', () => {
    renderAgenda('en', [{ id: 'failure-modes-ai-code', day: 1 }]);
    expect(screen.getByText(/Failure modes/)).toBeInTheDocument();
  });

  it('resolves NL short title via modules.<id>.short', () => {
    renderAgenda('nl', [{ id: 'capstone-ship-feature', day: 2 }]);
    expect(screen.getByText(/Feature opleveren/)).toBeInTheDocument();
  });
});
