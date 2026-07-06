import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { TrainingCard } from '@/components/TrainingCard';
import { ProofStrip } from '@/components/ProofStrip';
import { InstructorCard } from '@/components/InstructorCard';
import { JsonLd } from '@/components/JsonLd';
import { instructors } from '@/data/instructors';
import { buildHomeJsonLd } from '@/lib/structured-data';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import type { Locale } from '@/i18n/routing';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHero = await getTranslations('hero');
  const tTrainings = await getTranslations('trainings');
  const tHome = await getTranslations('home');
  const tWhy = await getTranslations('why');
  const whyParagraphs = tWhy.raw('paragraphs') as string[];

  return (
    <main>
      <JsonLd data={buildHomeJsonLd({ locale, trainingName: (id) => tTrainings(`${id}.name`) })} />
      <Hero
        kicker={tHero('kicker')}
        title={tHero('title')}
        subtitle={tHero('subtitle')}
        primaryCta={{ label: tHero('cta'), href: `/${locale}/trainings` }}
      />

      <section className="border-border-subtle border-b px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-brand text-2xl font-bold sm:text-3xl">{tWhy('title')}</h2>
          <p className="text-text-primary mt-3 text-xl font-semibold sm:text-2xl">
            {tWhy('tagline')}
          </p>
          <div className="text-text-soft mt-6 space-y-5 text-base leading-relaxed">
            {whyParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="border-brand bg-bg-tint mt-8 rounded-md border-l-4 px-5 py-4">
            <p className="text-text-primary text-base leading-relaxed">{tWhy('qe')}</p>
          </div>
        </div>
      </section>

      <section id="trainings" className="border-border-subtle border-b px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-brand text-2xl font-bold sm:text-3xl">
              {tTrainings('sectionTitle')}
            </h2>
            <p className="text-text-soft mt-2 text-base">{tHome('trainingsLede')}</p>
          </div>
          <div>
            <TrainingCard trainingId="discount-aug-26" locale={locale} />
            <TrainingCard trainingId="advanced" locale={locale} />
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <ProofStrip locale={locale} />

      <section className="border-border-subtle border-b px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-brand text-2xl font-bold sm:text-3xl">
              {tHome('instructorsTitle')}
            </h2>
            <p className="text-text-soft mt-2 text-base">{tHome('instructorsLede')}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {instructors.map((i) => (
              <InstructorCard key={i.id} id={i.id} />
            ))}
          </div>
          <Link
            href={`/${locale}/about`}
            className="text-brand hover:text-brand-deep mt-6 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            {tHome('instructorsLink')} →
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a4d7a] to-[#0b6fb0] px-6 py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1.4px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-white">
          <h2 className="max-w-[24ch] text-2xl font-bold sm:text-3xl">{tHome('finalCta.title')}</h2>
          <p className="mt-3 max-w-[56ch] text-white/90">{tHome('finalCta.body')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#0a4d7a] transition-colors hover:bg-[#eef3f8]"
            >
              {tHome('finalCta.cta')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
