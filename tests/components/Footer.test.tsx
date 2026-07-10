import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';
import en from '@/messages/en.json';

vi.mock('next-intl/server', () => ({
  getTranslations: async (ns: string) => {
    const root = en as unknown as Record<string, unknown>;
    const branch = (root[ns] as Record<string, unknown>) ?? {};
    return (key: string) => (typeof branch[key] === 'string' ? (branch[key] as string) : key);
  },
}));

describe('<Footer />', () => {
  it('renders the FAQ link with the locale-prefixed href', async () => {
    const ui = await Footer({ locale: 'en' });
    render(ui);
    expect(screen.getByTestId('footer-faq')).toHaveAttribute('href', '/en/faq');
  });
});
