import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import sitemap from '@/app/sitemap';
import { trainings, hasEnded, type TrainingId } from '@/data/trainings';

// Trainings that have ended drop out of the sitemap, so pin the clock: 30 October
// 2026 is after the pilot and discount-aug-26 cohorts, before basic-nov-26.
const NOW = new Date('2026-10-30T12:00:00Z');

describe('sitemap', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const urls = () => sitemap().map((e) => e.url);

  it('lists the trainings overview in both locales', () => {
    expect(urls()).toContain('https://agenticengineering.nl/nl/trainings');
    expect(urls()).toContain('https://agenticengineering.nl/en/trainings');
  });

  it('lists every training detail page that has not ended, in both locales', () => {
    const current = (Object.keys(trainings) as TrainingId[]).filter((id) => !hasEnded(id, NOW));
    expect(current).toEqual(expect.arrayContaining(['basic-nov-26', 'basic', 'advanced']));
    for (const id of current) {
      expect(urls(), `nl /trainings/${id}`).toContain(
        `https://agenticengineering.nl/nl/trainings/${id}`,
      );
      expect(urls(), `en /trainings/${id}`).toContain(
        `https://agenticengineering.nl/en/trainings/${id}`,
      );
    }
  });

  it('leaves out training detail pages that have ended', () => {
    for (const id of ['pilot', 'discount-aug-26']) {
      expect(urls(), `nl /trainings/${id}`).not.toContain(
        `https://agenticengineering.nl/nl/trainings/${id}`,
      );
      expect(urls(), `en /trainings/${id}`).not.toContain(
        `https://agenticengineering.nl/en/trainings/${id}`,
      );
    }
  });

  it('keeps hreflang alternates on every entry', () => {
    for (const entry of sitemap()) {
      expect(entry.alternates?.languages).toBeDefined();
    }
  });

  it('lists the FAQ page in both locales', () => {
    expect(urls()).toContain('https://agenticengineering.nl/nl/faq');
    expect(urls()).toContain('https://agenticengineering.nl/en/faq');
  });
});
