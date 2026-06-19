import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import BookingPage from '@/app/[locale]/trainings/pilot/book/page';
import NajaarBookingPage from '@/app/[locale]/trainings/najaar-2026/book/page';

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
  const ui = await BookingPage({ params: Promise.resolve({ locale: 'en' as const }) });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('BookingPage', () => {
  it('renders the booking title and form', async () => {
    await renderPage();
    expect(screen.getByText(en.booking.title)).toBeInTheDocument();
    expect(screen.getByTestId('booking-submit')).toBeInTheDocument();
  });

  it('najaar-2026 booking page renders the form wired to its own trainingId', async () => {
    const ui = await NajaarBookingPage({ params: Promise.resolve({ locale: 'en' as const }) });
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.getByText(en.booking.title)).toBeInTheDocument();
    expect(screen.getByTestId('booking-submit')).toBeInTheDocument();
    const hidden = container.querySelector('input[name="trainingId"]') as HTMLInputElement;
    expect(hidden).toHaveValue('najaar-2026');
  });
});
