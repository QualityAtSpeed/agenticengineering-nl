import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { TrainingCard } from '@/components/TrainingCard';
import { TrainingDetail } from '@/components/TrainingDetail';
import type { Locale } from '@/i18n/routing';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHero = await getTranslations('hero');
  const tTrainings = await getTranslations('trainings');

  return (
    <main>
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
    </main>
  );
}
