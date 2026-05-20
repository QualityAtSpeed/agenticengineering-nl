import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE = 'https://agenticengineering.nl';
const PATHS = ['', '/about', '/articles', '/contact', '/impressum'] as const;

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
