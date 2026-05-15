'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';

type Props = { currentLocale: Locale };

function swapLocale(pathname: string, target: Locale): string {
  const parts = pathname.split('/');
  if (parts.length > 1 && (routing.locales as readonly string[]).includes(parts[1])) {
    parts[1] = target;
    return parts.join('/');
  }
  return `/${target}${pathname}`;
}

export function LangSwitcher({ currentLocale }: Props) {
  const pathname = usePathname() ?? `/${currentLocale}`;
  const t = useTranslations('nav');
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={swapLocale(pathname, locale)}
          aria-current={locale === currentLocale ? 'page' : undefined}
          data-testid={`lang-switch-${locale}`}
          className={
            locale === currentLocale
              ? 'text-accent-green'
              : 'text-text-muted hover:text-accent-blue'
          }
        >
          {locale === 'en' ? t('switchToEn') : t('switchToNl')}
        </Link>
      ))}
    </div>
  );
}
