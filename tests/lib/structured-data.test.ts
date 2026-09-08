import { describe, it, expect } from 'vitest';
import { buildHomeJsonLd, buildFaqJsonLd } from '@/lib/structured-data';
import { trainings } from '@/data/trainings';

const name = (id: string) => `${id} title`;
const description = (id: string) => `${id} description`;

describe('buildHomeJsonLd', () => {
  const graph = buildHomeJsonLd({
    locale: 'nl',
    trainingName: name,
    trainingDescription: description,
  })['@graph'] as Array<Record<string, unknown>>;

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

  it('gives every Course a non-empty description from the description resolver', () => {
    const courses = graph.filter((n) => n['@type'] === 'Course');
    expect(courses).toHaveLength(Object.keys(trainings).length);
    for (const c of courses) {
      const id = (c.url as string).split('/').pop() as string;
      expect(c.description, `${id} Course has a description`).toBe(description(id));
    }
  });

  it('gives the scheduled pilot a CourseInstance with online mode and ISO dates', () => {
    const courses = graph.filter((n) => n['@type'] === 'Course');
    const pilot = courses.find((c) => (c.url as string)?.endsWith('/trainings/pilot'));
    const instance = pilot?.hasCourseInstance as Record<string, unknown> | undefined;
    expect(instance?.courseMode).toStrictEqual(['online']);
    expect(instance?.startDate).toBe('2026-06-29');
    expect(instance?.endDate).toBe('2026-06-30');
  });

  it('gives the scheduled discount-aug-26 a CourseInstance with online and inPerson modes and ISO dates', () => {
    const courses = graph.filter((n) => n['@type'] === 'Course');
    const discount = courses.find((c) => (c.url as string)?.endsWith('/trainings/discount-aug-26'));
    const instance = discount?.hasCourseInstance as Record<string, unknown> | undefined;
    expect(instance?.courseMode).toStrictEqual(['online', 'inPerson']);
    expect(instance?.startDate).toBe('2026-09-21');
    expect(instance?.endDate).toBe('2026-09-22');
  });

  it('does NOT add a CourseInstance to trainings without a fixed schedule', () => {
    const courses = graph.filter((n) => n['@type'] === 'Course');
    const basic = courses.find((c) => (c.url as string)?.endsWith('/trainings/basic'));
    const advanced = courses.find((c) => (c.url as string)?.endsWith('/trainings/advanced'));
    expect(basic?.hasCourseInstance).toBeUndefined();
    expect(advanced?.hasCourseInstance).toBeUndefined();
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
