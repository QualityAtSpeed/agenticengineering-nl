import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { trainings } from '@/data/trainings';

const BASE = 'https://agenticengineering.nl';
// Training detail pages are conversion pages — they belong in the sitemap too.
const PATHS = [
  '',
  '/about',
  '/trainings',
  '/articles',
  '/contact',
  '/impressum',
  ...Object.keys(trainings).map((id) => `/trainings/${id}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((p) =>
    routing.locales.map((locale) => ({
      url: `${BASE}/${locale}${p}`,
      changeFrequency: 'monthly' as const,
      priority: p === '' ? 1.0 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${BASE}/${l}${p}`])),
      },
    })),
  );
}
