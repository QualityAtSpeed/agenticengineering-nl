'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import type { Locale } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function MobileMenu({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t('closeMenu') : t('openMenu')}
        onClick={() => setOpen((v) => !v)}
        data-testid="mobile-menu-toggle"
        className="text-text-soft hover:text-brand inline-flex h-8 w-8 items-center justify-center sm:hidden"
      >
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          data-testid="mobile-menu-panel"
          className="border-border-subtle bg-bg-base/95 absolute inset-x-0 top-full border-b backdrop-blur sm:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-sm font-medium">
            <Link
              href={`/${locale}/articles`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-articles"
              className="text-text-soft hover:text-brand"
            >
              {t('articles')}
            </Link>
            <Link
              href={`/${locale}/trainings`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-trainings"
              className="text-text-soft hover:text-brand"
            >
              {t('trainings')}
            </Link>
            <Link
              href={`/${locale}/about`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-about"
              className="text-text-soft hover:text-brand"
            >
              {t('about')}
            </Link>
            <Link
              href={`/${locale}/faq`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-faq"
              className="text-text-soft hover:text-brand"
            >
              {t('faq')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-contact"
              className="text-text-soft hover:text-brand"
            >
              {t('contact')}
            </Link>
            <div className="border-border-subtle flex items-center justify-between gap-2 border-t pt-3">
              <LangSwitcher currentLocale={locale} />
              <div className="flex items-center gap-2">
                <span className="text-text-muted">{tTheme('label')}</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
