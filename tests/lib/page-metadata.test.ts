import { describe, it, expect } from 'vitest';
import { buildPageMetadata } from '@/lib/page-metadata';

describe('buildPageMetadata', () => {
  const md = buildPageMetadata({
    locale: 'nl',
    path: '/trainings/pilot',
    title: 'Pilot title',
    description: 'Pilot desc',
  });

  it('sets the per-page title and description', () => {
    expect(md.title).toBe('Pilot title');
    expect(md.description).toBe('Pilot desc');
  });

  it('sets a locale + path-specific canonical', () => {
    expect(md.alternates?.canonical).toBe('https://agenticengineering.nl/nl/trainings/pilot');
  });

  it('emits hreflang alternates for both locales at this path', () => {
    expect(md.alternates?.languages).toEqual({
      nl: 'https://agenticengineering.nl/nl/trainings/pilot',
      en: 'https://agenticengineering.nl/en/trainings/pilot',
    });
  });

  it('mirrors title/description/url/locale into OpenGraph', () => {
    const og = md.openGraph as Record<string, unknown>;
    expect(og.url).toBe('https://agenticengineering.nl/nl/trainings/pilot');
    expect(og.locale).toBe('nl_NL');
    expect(og.title).toBe('Pilot title');
  });

  it('maps the en locale to en_GB for OpenGraph', () => {
    const en = buildPageMetadata({ locale: 'en', path: '/about', title: 'A', description: 'B' });
    expect((en.openGraph as Record<string, unknown>).locale).toBe('en_GB');
    expect(en.alternates?.canonical).toBe('https://agenticengineering.nl/en/about');
  });
});
