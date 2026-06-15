import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { trainings } from '@/data/trainings';

describe('sitemap', () => {
  const urls = sitemap().map((e) => e.url);

  it('lists the trainings overview in both locales', () => {
    expect(urls).toContain('https://agenticengineering.nl/nl/trainings');
    expect(urls).toContain('https://agenticengineering.nl/en/trainings');
  });

  it('lists every training detail page in both locales', () => {
    for (const id of Object.keys(trainings)) {
      expect(urls, `nl /trainings/${id}`).toContain(
        `https://agenticengineering.nl/nl/trainings/${id}`,
      );
      expect(urls, `en /trainings/${id}`).toContain(
        `https://agenticengineering.nl/en/trainings/${id}`,
      );
    }
  });

  it('keeps hreflang alternates on every entry', () => {
    for (const entry of sitemap()) {
      expect(entry.alternates?.languages).toBeDefined();
    }
  });
});
