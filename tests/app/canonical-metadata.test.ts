import type { Metadata } from 'next';
import { describe, it, expect, vi } from 'vitest';
import type { Locale } from '@/i18n/routing';
import type { TrainingId } from '@/data/trainings';

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
      {
        label: 'basic-nov-26 booking page',
        load: () => import('@/app/[locale]/trainings/basic-nov-26/book/page'),
      },
      {
        label: 'basic-nov-26 booking success page',
        load: () => import('@/app/[locale]/trainings/basic-nov-26/book/success/page'),
      },
    ];

    for (const route of routes) {
      const mod = await route.load();
      const robots = (mod as unknown as { metadata?: { robots?: { index?: boolean } } }).metadata
        ?.robots;
      expect(robots?.index, `${route.label} should be noindex`).toBe(false);
    }
  });

  it('training detail pages are noindex once the training has ended', async () => {
    // 30 October 2026: after the pilot and discount-aug-26 cohorts, before basic-nov-26.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));
    try {
      const { generateMetadata } = await import('@/app/[locale]/trainings/[trainingId]/page');
      const metadataFor = (trainingId: TrainingId) =>
        generateMetadata({ params: Promise.resolve({ locale: 'nl' as Locale, trainingId }) });

      for (const id of ['pilot', 'discount-aug-26'] as const) {
        const md = await metadataFor(id);
        expect((md.robots as { index?: boolean } | undefined)?.index, `${id} noindex`).toBe(false);
        expect(md.alternates?.canonical).toBe(`https://agenticengineering.nl/nl/trainings/${id}`);
      }
      for (const id of ['basic-nov-26', 'basic', 'advanced'] as const) {
        expect((await metadataFor(id)).robots, `${id} stays indexable`).toBeUndefined();
      }
    } finally {
      vi.useRealTimers();
    }
  });
});
