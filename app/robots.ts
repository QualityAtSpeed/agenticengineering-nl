import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://agenticengineering.nl/sitemap.xml',
    host: 'https://agenticengineering.nl',
  };
}
