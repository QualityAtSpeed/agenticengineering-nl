import { describe, it, expect } from 'vitest';
import { buildHomeJsonLd, buildFaqJsonLd } from '@/lib/structured-data';
import { trainings } from '@/data/trainings';

const name = (id: string) => `${id} title`;
const description = (id: string) => `${id} description`;

describe('buildHomeJsonLd', () => {
  // 1 June 2026: before every dated cohort.
  const graphAt = (now: Date) =>
    buildHomeJsonLd({
      locale: 'nl',
      trainingName: name,
      trainingDescription: description,
      now,
    })['@graph'] as Array<Record<string, unknown>>;
  const graph = graphAt(new Date('2026-06-01T12:00:00Z'));
  const courses = graph.filter((n) => n['@type'] === 'Course');
  const courseFor = (id: string) =>
    courses.find((c) => (c.url as string)?.endsWith(`/nl/trainings/${id}`));

  it('includes the Organization node with canonical url', () => {
    const org = graph.find((n) => n['@type'] === 'Organization');
    expect(org?.url).toBe('https://agenticengineering.nl');
  });

  it('emits one Course per evergreen training (basic, advanced), never one per cohort', () => {
    const evergreen = Object.values(trainings).filter((tr) => !tr.cohortOf);
    expect(courses).toHaveLength(evergreen.length);
    expect(courses.map((c) => c.url)).toEqual([
      'https://agenticengineering.nl/nl/trainings/basic',
      'https://agenticengineering.nl/nl/trainings/advanced',
    ]);
    expect((courseFor('basic')?.offers as Record<string, unknown>)?.priceCurrency).toBe('EUR');
  });

  it('gives every Course a non-empty description from the description resolver', () => {
    for (const c of courses) {
      const id = (c.url as string).split('/').pop() as string;
      expect(c.description, `${id} Course has a description`).toBe(description(id));
    }
  });

  it('lists the bookable basic cohorts as CourseInstances on the basic Course', () => {
    // pilot, discount-aug-26 and basic-nov-26 are sold out, so only basic-jan-27 remains.
    const instances = courseFor('basic')?.hasCourseInstance as Array<Record<string, unknown>>;
    expect(instances).toHaveLength(1);
    expect(instances[0].courseMode).toStrictEqual(['online']);
    expect(instances[0].startDate).toBe('2027-01-04');
    expect(instances[0].endDate).toBe('2027-01-05');
    expect((instances[0].offers as Record<string, unknown>).url).toBe(
      'https://agenticengineering.nl/nl/trainings/basic-jan-27/book',
    );
  });

  it('drops a cohort instance once the cohort has ended', () => {
    const later = graphAt(new Date('2027-01-10T12:00:00Z'));
    const basic = later.find((n) => (n.url as string)?.endsWith('/nl/trainings/basic'));
    expect(basic).toBeDefined();
    expect(basic?.hasCourseInstance).toBeUndefined();
  });

  it('does NOT add a CourseInstance to trainings without cohorts', () => {
    expect(courseFor('advanced')).toBeDefined();
    expect(courseFor('advanced')?.hasCourseInstance).toBeUndefined();
  });
});

describe('buildFaqJsonLd', () => {
  const items = [
    { question: 'Wat is agentic engineering?', answer: 'AI-agents die code genereren.' },
    { question: 'Kan het in-company?', answer: 'Ja, beide trainingen.' },
  ];
  const jsonLd = buildFaqJsonLd(items);

  it('emits a FAQPage with one Question per item', () => {
    expect(jsonLd['@type']).toBe('FAQPage');
    const questions = jsonLd.mainEntity as Array<Record<string, unknown>>;
    expect(questions).toHaveLength(2);
    expect(questions.every((q) => q['@type'] === 'Question')).toBe(true);
  });

  it('keeps question and answer text verbatim', () => {
    const questions = jsonLd.mainEntity as Array<Record<string, unknown>>;
    expect(questions[0].name).toBe('Wat is agentic engineering?');
    expect((questions[0].acceptedAnswer as Record<string, unknown>).text).toBe(
      'AI-agents die code genereren.',
    );
  });
});
