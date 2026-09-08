import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LangSwitcher } from './LangSwitcher';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import type { Locale } from '@/i18n/routing';

export async function Nav({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  return (
    <>
      <div className="from-brand-deep via-brand to-accent-green h-[3px] bg-gradient-to-r" />
      <nav className="border-border-subtle bg-bg-base/95 sticky top-0 z-10 border-b backdrop-blur">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:gap-6 sm:px-6">
          <Link
            href={`/${locale}`}
            data-testid="nav-brand"
            className="text-text-primary inline-flex shrink-0 items-center gap-2 text-base font-bold"
          >
            <Image src="/brand-icon.svg" alt="" width={28} height={28} aria-hidden />
            {t('brand')}
          </Link>
          <div className="flex shrink-0 items-center gap-5 text-sm sm:gap-7">
            <Link
              href={`/${locale}/articles`}
              data-testid="nav-articles"
              className="text-text-soft hover:text-brand hidden font-medium sm:inline"
            >
              {t('articles')}
            </Link>
            <Link
              href={`/${locale}/trainings`}
              data-testid="nav-trainings"
              className="text-text-soft hover:text-brand hidden font-medium sm:inline"
            >
              {t('trainings')}
            </Link>
            <Link
              href={`/${locale}/about`}
              data-testid="nav-about"
              className="text-text-soft hover:text-brand hidden font-medium sm:inline"
            >
              {t('about')}
            </Link>
            <Link
              href={`/${locale}/faq`}
              data-testid="nav-faq"
              className="text-text-soft hover:text-brand hidden font-medium sm:inline"
            >
              {t('faq')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              data-testid="nav-contact"
              className="text-text-soft hover:text-brand hidden font-medium sm:inline"
            >
              {t('contact')}
            </Link>
            <span className="border-border-subtle hidden items-center gap-3 border-l pl-5 sm:inline-flex">
              <LangSwitcher currentLocale={locale} />
              <ThemeToggle />
            </span>
            <MobileMenu locale={locale} />
          </div>
        </div>
      </nav>
    </>
  );
}
