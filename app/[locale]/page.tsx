import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  return (
    <main>
      <Hero
        kicker={t('kicker')}
        title={t('title')}
        subtitle={t('subtitle')}
        primaryCta={{ label: t('ctaPrimary'), href: `/${locale}/contact` }}
        secondaryCta={{ label: t('ctaSecondary'), href: '#trainings' }}
      />
    </main>
  );
}
