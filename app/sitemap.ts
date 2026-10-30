import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { trainings, hasEnded, type TrainingId } from '@/data/trainings';

const BASE = 'https://agenticengineering.nl';
const PATHS = ['', '/about', '/trainings', '/articles', '/contact', '/faq', '/impressum'];

export default function sitemap(): MetadataRoute.Sitemap {
  // Training detail pages are conversion pages — they belong in the sitemap too,
  // except trainings that have ended: those stay reachable but out of search.
  const trainingPaths = (Object.keys(trainings) as TrainingId[])
    .filter((id) => !hasEnded(id))
    .map((id) => `/trainings/${id}`);

  return [...PATHS, ...trainingPaths].flatMap((p) =>
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
