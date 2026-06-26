import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';

// Markeer een NIET-pilot training als uitverkocht om te bewijzen dat de boek-guard
// generiek is (gekoppeld aan trainingId), en niet hardcoded op de pilot-cohort.
vi.mock('@/data/trainings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/trainings')>();
  return {
    ...actual,
    trainings: {
      ...actual.trainings,
      'discount-aug-26': { ...actual.trainings['discount-aug-26'], soldOut: true },
    },
  };
});

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

import DiscountAug26BookingPage from '@/app/[locale]/trainings/discount-aug-26/book/page';

describe('booking page sold-out guard (generiek, per trainingId)', () => {
  it('guards a non-pilot training: discount-aug-26 toont de sold-out-melding en geen formulier wanneer dat cohort is uitverkocht', async () => {
    const ui = await DiscountAug26BookingPage({
      params: Promise.resolve({ locale: 'en' as const }),
    });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.getByText(en.booking.soldOutHeading)).toBeInTheDocument();
    expect(screen.getByText(en.booking.soldOutBody)).toBeInTheDocument();
    expect(screen.queryByTestId('booking-submit')).not.toBeInTheDocument();
  });
});
