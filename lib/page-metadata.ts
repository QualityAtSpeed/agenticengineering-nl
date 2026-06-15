import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const SITE = 'https://agenticengineering.nl';

const OG_LOCALE: Record<string, string> = { nl: 'nl_NL', en: 'en_GB' };

type Args = {
  locale: string;
  // Path after the locale segment, leading slash, e.g. '/about' or '/trainings/pilot'. '' = home.
  path: string;
  title: string;
  description: string;
};

// Single source for per-page SEO metadata: canonical, hreflang alternates and
// OpenGraph, all derived from one (locale, path) pair. Pages supply their own
// title/description; the URL shape stays consistent across the site.
export function buildPageMetadata({ locale, path, title, description }: Args): Metadata {
  const url = `${SITE}/${locale}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE}/${l}${path}`])),
    },
    openGraph: {
      title,
      description,
      url,
      locale: OG_LOCALE[locale] ?? locale,
      type: 'website',
    },
  };
}
