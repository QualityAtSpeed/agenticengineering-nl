import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import { TrainingId } from '@/data/trainings';
import TrainingDetailPage from '@/app/[locale]/trainings/[trainingId]/page';

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

async function renderPage(trainingId: TrainingId) {
  const ui = await TrainingDetailPage({
    params: Promise.resolve({ locale: 'en' as const, trainingId }),
  });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>,
  );
}
describe('<TrainingDetailPage />', () => {
  it('renders the training detail page', async () => {
    await renderPage('basic');
    expect(screen.getByRole('heading', { name: /Basic/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Programme/ })).toBeInTheDocument();
    expect(screen.getByTestId('book-training-basic')).toBeInTheDocument();
  });

  it('pilot detail CTA links to the booking page', async () => {
    await renderPage('pilot');
    const cta = screen.getByTestId('book-training-pilot');
    expect(cta).toHaveAttribute('href', expect.stringContaining('/trainings/pilot/book'));
  });
});
