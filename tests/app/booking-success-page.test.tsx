import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import en from '@/messages/en.json';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async (ns: string) => {
    const root = en as unknown as Record<string, unknown>;
    const branch = (ns ? (root[ns] as Record<string, unknown>) : root) ?? {};
    return (key: string, values?: Record<string, string>) => {
      let cur: unknown = branch;
      for (const seg of key.split('.')) {
        if (cur && typeof cur === 'object') cur = (cur as Record<string, unknown>)[seg];
        else return key;
      }
      if (typeof cur !== 'string') return key;
      return cur.replace(/\{(\w+)\}/g, (_, k: string) => values?.[k] ?? '');
    };
  },
}));

import BasicNov26BookingSuccessPage from '@/app/[locale]/trainings/basic-nov-26/book/success/page';

describe('booking success page', () => {
  it('starts with a dark header carrying the success title as h1', async () => {
    const ui = await BasicNov26BookingSuccessPage({
      params: Promise.resolve({ locale: 'en' as const }),
    });
    render(ui);
    expect(screen.getByTestId('page-header')).toHaveClass('surface-dark');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en.booking.success.title);
    expect(screen.getByTestId('booking-success')).not.toContainElement(
      screen.getByRole('heading', { level: 1 }),
    );
  });
});
