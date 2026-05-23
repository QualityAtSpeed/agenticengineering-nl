import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';
import { TeachingTeam } from '@/components/TeachingTeam';

function renderTeam(locale: 'nl' | 'en', ids: ('pascal' | 'inico')[] = ['pascal', 'inico']) {
  const messages = locale === 'nl' ? nl : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TeachingTeam ids={ids} />
    </NextIntlClientProvider>,
  );
}

describe('<TeachingTeam />', () => {
  it('renders the EN heading "Taught by"', () => {
    renderTeam('en');
    expect(screen.getByRole('heading', { name: /Taught by/i })).toBeInTheDocument();
  });

  it('renders the NL heading "Gegeven door"', () => {
    renderTeam('nl');
    expect(screen.getByRole('heading', { name: /Gegeven door/i })).toBeInTheDocument();
  });

  it('renders both instructor names when ids=["pascal","inico"]', () => {
    renderTeam('en', ['pascal', 'inico']);
    expect(screen.getByText('Pascal Dufour')).toBeInTheDocument();
    expect(screen.getByText('Inico Veringa')).toBeInTheDocument();
  });

  it('renders only the requested instructor when ids=["pascal"]', () => {
    renderTeam('en', ['pascal']);
    expect(screen.getByText('Pascal Dufour')).toBeInTheDocument();
    expect(screen.queryByText('Inico Veringa')).not.toBeInTheDocument();
  });
});
