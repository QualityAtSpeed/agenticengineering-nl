import { describe, it, expect } from 'vitest';
import { buildHomeJsonLd } from '@/lib/structured-data';
import { trainings } from '@/data/trainings';

const name = (id: string) => `${id} title`;

describe('buildHomeJsonLd', () => {
  const graph = buildHomeJsonLd({ locale: 'nl', trainingName: name })['@graph'] as Array<
    Record<string, unknown>
  >;

  it('includes the Organization node with canonical url', () => {
    const org = graph.find((n) => n['@type'] === 'Organization');
    expect(org?.url).toBe('https://agenticengineering.nl');
  });

  it('emits one Course per training, each linking to its detail page in the locale', () => {
    const courses = graph.filter((n) => n['@type'] === 'Course');
    expect(courses).toHaveLength(Object.keys(trainings).length);
    const pilot = courses.find((c) => (c.url as string)?.endsWith('/nl/trainings/pilot'));
    expect(pilot, 'pilot Course links to /nl/trainings/pilot').toBeTruthy();
    expect((pilot?.offers as Record<string, unknown>)?.priceCurrency).toBe('EUR');
  });

  it('gives the scheduled pilot a CourseInstance with online mode and ISO dates', () => {
    const courses = graph.filter((n) => n['@type'] === 'Course');
    const pilot = courses.find((c) => (c.url as string)?.endsWith('/trainings/pilot'));
    const instance = pilot?.hasCourseInstance as Record<string, unknown> | undefined;
    expect(instance?.courseMode).toBe('online');
    expect(instance?.startDate).toBe('2026-06-29');
    expect(instance?.endDate).toBe('2026-06-30');
  });

  it('does NOT add a CourseInstance to trainings without a fixed schedule', () => {
    const courses = graph.filter((n) => n['@type'] === 'Course');
    const basic = courses.find((c) => (c.url as string)?.endsWith('/trainings/basic'));
    const advanced = courses.find((c) => (c.url as string)?.endsWith('/trainings/advanced'));
    expect(basic?.hasCourseInstance).toBeUndefined();
    expect(advanced?.hasCourseInstance).toBeUndefined();
  });
});
