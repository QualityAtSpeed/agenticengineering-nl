import type { Metadata } from 'next';
import { describe, it, expect, vi } from 'vitest';
import type { Locale } from '@/i18n/routing';

// next-intl's server helpers need a request scope we don't have in unit tests.
// Stub them: `t(key)` echoes the key (enough to assert URL/canonical shape),
// and setRequestLocale is a no-op.
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
  setRequestLocale: () => {},
}));

type GenerateMetadata = (args: { params: Promise<{ locale: Locale }> }) => Promise<Metadata>;

describe('canonical metadata', () => {
  it('impressum declares its own self-referencing canonical, not the homepage', async () => {
    const mod = await import('@/app/[locale]/impressum/page');
    const gen = (mod as unknown as { generateMetadata?: GenerateMetadata }).generateMetadata;
    expect(gen, 'impressum should export generateMetadata').toBeTypeOf('function');
    const md = await gen!({ params: Promise.resolve({ locale: 'nl' }) });
    expect(md.alternates?.canonical).toBe('https://agenticengineering.nl/nl/impressum');
  });

  it('transactional booking pages are noindex', async () => {
    const routes = [
      {
        label: 'pilot booking page',
        load: () => import('@/app/[locale]/trainings/pilot/book/page'),
      },
      {
        label: 'pilot booking success page',
        load: () => import('@/app/[locale]/trainings/pilot/book/success/page'),
      },
      {
        label: 'discount booking page',
        load: () => import('@/app/[locale]/trainings/discount-aug-26/book/page'),
      },
      {
        label: 'discount booking success page',
        load: () => import('@/app/[locale]/trainings/discount-aug-26/book/success/page'),
      },
    ];

    for (const route of routes) {
      const mod = await route.load();
      const robots = (mod as unknown as { metadata?: { robots?: { index?: boolean } } }).metadata
        ?.robots;
      expect(robots?.index, `${route.label} should be noindex`).toBe(false);
    }
  });
});
