import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Nav } from '@/components/Nav';
import en from '@/messages/en.json';

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

describe('<Nav />', () => {
  it('renders all links with correct hrefs', async () => {
    const ui = await Nav({ locale: 'en' });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('link', { name: /Trainings/ })).toHaveAttribute(
      'href',
      '/en/trainings',
    );
  });
});
