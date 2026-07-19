import '../globals.css';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { routing, type Locale } from '@/i18n/routing';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans-loaded', display: 'swap' });

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL('https://agenticengineering.nl'),
    title: t('title'),
    description: t('description'),
    // NOTE: canonical/hreflang are deliberately NOT set here. A layout-level
    // canonical is inherited by every child page that lacks its own metadata,
    // making them declare the homepage as their canonical — which is exactly the
    // "Duplicate, Google chose different canonical than user" issue. Canonical +
    // hreflang belong per page (see lib/page-metadata.ts / metadataFor). Pages
    // without explicit metadata self-canonicalize to their own URL.
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://agenticengineering.nl/${locale}`,
      locale: locale === 'nl' ? 'nl_NL' : 'en_GB',
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="focus:bg-accent-green focus:text-on-accent sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-sm focus:px-3 focus:py-1"
          >
            Skip to content
          </a>
          <NextIntlClientProvider>
            <Nav locale={typedLocale} />
            <div id="main">{children}</div>
            <Footer locale={typedLocale} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
