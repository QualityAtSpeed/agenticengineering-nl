import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';
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

describe('<Footer />', () => {
  it('credits Quality at Speed with an external link to qualityatspeed.nl', async () => {
    const ui = await Footer({ locale: 'en' });
    render(ui);
    const link = screen.getByTestId('footer-qas');
    expect(link).toHaveAttribute('href', 'https://qualityatspeed.nl/en');
    expect(link).toHaveTextContent(/Quality at Speed/);
  });
});
