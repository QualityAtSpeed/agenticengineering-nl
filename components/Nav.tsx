import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LangSwitcher } from './LangSwitcher';
import { MobileMenu } from './MobileMenu';
import type { Locale } from '@/i18n/routing';

export async function Nav({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  return (
    <nav className="border-border-subtle bg-bg-base/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:gap-6 sm:px-6">
        <Link
          href={`/${locale}`}
          data-testid="nav-brand"
          className="text-text-primary inline-flex shrink-0 items-center gap-2 font-mono text-sm"
        >
          <Image src="/brand-icon.svg" alt="" width={20} height={20} aria-hidden />
          {t('brand')}
        </Link>
        <div className="flex shrink-0 items-center gap-3 font-mono text-sm sm:gap-6">
          <Link
            href={`/${locale}/about`}
            data-testid="nav-about"
            className="text-text-muted hover:text-accent-blue hidden sm:inline"
          >
            {t('about')}
          </Link>
          <Link
            href={`/${locale}/articles`}
            data-testid="nav-articles"
            className="text-text-muted hover:text-accent-blue hidden sm:inline"
          >
            {t('articles')}
          </Link>
          <Link
            href={`/${locale}/contact`}
            data-testid="nav-contact"
            className="text-text-muted hover:text-accent-blue hidden sm:inline"
          >
            {t('contact')}
          </Link>
          <LangSwitcher currentLocale={locale} />
          <MobileMenu locale={locale} />
        </div>
      </div>
    </nav>
  );
}
