import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import { trainings } from '@/data/trainings';
import TrainingsPage from '@/app/[locale]/trainings/page';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async (ns: string) => {
    const root = en as unknown as Record<string, unknown>;
    const branch = (ns ? (root[ns] as Record<string, unknown>) : root) ?? {};
    return (key: string) => {
      const segments = key.split('.');
      let cur: unknown = branch;
      for (const seg of segments) {
        if (cur && typeof cur === 'object') cur = (cur as Record<string, unknown>)[seg];
        else return key;
      }
      return typeof cur === 'string' ? cur : key;
    };
  },
}));

async function renderPage() {
  const ui = await TrainingsPage({ params: Promise.resolve({ locale: 'en' as const }) });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('<TrainingsPage />', () => {
  it('renders the training overview page without the pilot cohort', async () => {
    await renderPage();
    expect(
      screen.queryByRole('heading', { name: 'Pilot - Basic Training (June 29th & 30th 2026)' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Basic Training (21 & 22 September 2026)' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Advanced' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Trainings/ })).toBeInTheDocument();

    expect(screen.getAllByText(/2 days/).length).toBeGreaterThan(0);
    expect(screen.getByText(/1 day/)).toBeInTheDocument();

    expect(screen.getByText(/€\s*1\.399/)).toBeInTheDocument();
    const expectedPriceAdvanced = trainings.advanced.priceEUR
      .toLocaleString('nl-NL')
      .replace('.,', '.'); //999
    expect(screen.getByText(new RegExp(`€\\s*${expectedPriceAdvanced}\\b`))).toBeInTheDocument();
  });
});
