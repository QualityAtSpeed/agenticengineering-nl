import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { TrainingCard } from '@/components/TrainingCard';
import { TrainingDetail } from '@/components/TrainingDetail';
import { ProofStrip } from '@/components/ProofStrip';
import { InstructorCard } from '@/components/InstructorCard';
import { JsonLd } from '@/components/JsonLd';
import { instructors } from '@/data/instructors';
import { trainings } from '@/data/trainings';
import type { Locale } from '@/i18n/routing';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHero = await getTranslations('hero');
  const tTrainings = await getTranslations('trainings');
  const tHome = await getTranslations('home');

  return (
    <main>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              name: 'agenticengineering.nl',
              url: 'https://agenticengineering.nl',
              sameAs: [
                'https://github.com/QualityAtSpeed',
                'https://linkedin.com/company/quality-speed-nl',
              ],
            },
            ...Object.values(trainings).map((tr) => ({
              '@type': 'Course',
              name: `${tr.id === 'basic' ? 'Basic' : 'Advanced'} — agentic engineering`,
              provider: { '@type': 'Organization', name: 'agenticengineering.nl' },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'EUR',
                price: tr.priceEUR,
              },
            })),
          ],
        }}
      />
      <Hero
        kicker={tHero('kicker')}
        title={tHero('title')}
        subtitle={tHero('subtitle')}
        primaryCta={{ label: tHero('ctaPrimary'), href: `/${locale}/contact` }}
        secondaryCta={{ label: tHero('ctaSecondary'), href: '#trainings' }}
      />

      <section id="trainings" className="border-border-subtle border-t px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-text-primary font-mono text-3xl">
            <span className="text-accent-green">&gt;</span> {tTrainings('sectionTitle')}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <TrainingCard trainingId="basic" locale={locale} />
            <TrainingCard trainingId="advanced" locale={locale} />
          </div>
        </div>
      </section>

      <TrainingDetail trainingId="basic" locale={locale} />
      <TrainingDetail trainingId="advanced" locale={locale} />

      <ProofStrip locale={locale} />

      <section className="border-border-subtle border-t px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-text-primary font-mono text-2xl">
            <span className="text-accent-green">&gt;</span> {tHome('instructorsTitle')}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {instructors.map((i) => (
              <InstructorCard key={i.id} id={i.id} />
            ))}
          </div>
          <Link
            href={`/${locale}/about`}
            className="text-accent-blue mt-6 inline-flex font-mono text-sm hover:underline"
          >
            {tHome('instructorsLink')}
          </Link>
        </div>
      </section>

      <section className="border-border-subtle bg-bg-elevated border-t px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-text-primary font-mono text-3xl">
            <span className="text-accent-green">&gt;</span> {tHome('finalCta.title')}
          </h2>
          <p className="text-text-muted mt-4">{tHome('finalCta.body')}</p>
          <Link
            href={`/${locale}/contact`}
            className="bg-accent-green text-bg-base mt-8 inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
          >
            {tHome('finalCta.cta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
