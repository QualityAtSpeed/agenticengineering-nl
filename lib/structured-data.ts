import { trainings, type TrainingId } from '@/data/trainings';

const SITE = 'https://agenticengineering.nl';

type BuildArgs = {
  locale: string;
  // Resolver for a training's display name in the active locale (e.g. next-intl `t`).
  trainingName: (id: TrainingId) => string;
};

// Builds the schema.org JSON-LD graph for the homepage: the Organization plus
// one Course per training. Trainings with a fixed `schedule` also get a
// schema.org CourseInstance, so search engines and AI assistants can see a
// concrete, bookable date instead of a static page. Pure + testable.
export function buildHomeJsonLd({ locale, trainingName }: BuildArgs) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'agenticengineering.nl',
        url: SITE,
        description:
          'Hands-on training in agentic engineering with Claude Code: building, testing and shipping features with AI agents.',
        sameAs: [
          'https://github.com/QualityAtSpeed',
          'https://linkedin.com/company/quality-speed-nl',
        ],
      },
      ...Object.values(trainings).map((tr) => {
        const course: Record<string, unknown> = {
          '@type': 'Course',
          name: `${trainingName(tr.id)} - agentic engineering`,
          url: `${SITE}/${locale}/trainings/${tr.id}`,
          provider: { '@type': 'Organization', name: 'agenticengineering.nl', url: SITE },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: tr.priceEUR,
            url: `${SITE}/${locale}/trainings/${tr.id}`,
          },
        };
        if (tr.schedule) {
          course.hasCourseInstance = {
            '@type': 'CourseInstance',
            courseMode: tr.schedule.courseMode,
            startDate: tr.schedule.startDate,
            endDate: tr.schedule.endDate,
            courseWorkload: `P${tr.durationDays}D`,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              price: tr.priceEUR,
              url: `${SITE}/${locale}/trainings/${tr.id}`,
            },
          };
        }
        return course;
      }),
    ],
  };
}
