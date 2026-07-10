import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/about',
  useRouter: () => ({ replace: vi.fn() }),
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

  it('shows the language switcher inside the mobile menu', async () => {
    const ui = await Nav({ locale: 'en' });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        {ui}
      </NextIntlClientProvider>,
    );
    fireEvent.click(screen.getByTestId('mobile-menu-toggle'));
    const panel = screen.getByTestId('mobile-menu-panel');
    expect(within(panel).getByTestId('lang-switch-en')).toBeInTheDocument();
    expect(within(panel).getByTestId('lang-switch-nl')).toBeInTheDocument();
  });

  it('renders the FAQ link with the locale-prefixed href', async () => {
    const ui = await Nav({ locale: 'en' });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId('nav-faq')).toHaveAttribute('href', '/en/faq');
  });
});
