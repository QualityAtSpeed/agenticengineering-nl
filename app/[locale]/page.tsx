import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { LangSwitcher } from '@/components/LangSwitcher';
import type { Locale } from '@/i18n/routing';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  return (
    <main>
      <header className="flex items-center justify-end px-6 py-4">
        <LangSwitcher currentLocale={locale} />
      </header>
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
