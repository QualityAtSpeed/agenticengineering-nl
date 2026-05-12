import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { LangSwitcher } from '@/components/LangSwitcher';

vi.mock('next/navigation', () => ({
  usePathname: () => '/nl/about',
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('<LangSwitcher />', () => {
  it('renders both locale links preserving pathname suffix', () => {
    render(
      <NextIntlClientProvider
        locale="nl"
        messages={{ nav: { switchToEn: 'EN', switchToNl: 'NL' } }}
      >
        <LangSwitcher currentLocale="nl" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('link', { name: /EN/ })).toHaveAttribute('href', '/en/about');
    expect(screen.getByRole('link', { name: /NL/ })).toHaveAttribute('href', '/nl/about');
  });
});
