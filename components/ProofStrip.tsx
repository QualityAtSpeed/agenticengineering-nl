import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import type { Locale } from '@/i18n/routing';

const REPO_URL = 'https://github.com/QualityAtSpeed/agenticengineering-nl';

export function ProofStrip({ locale: _locale }: { locale: Locale }) {
  const t = useTranslations('proof');
  const pills = t.raw('pills') as string[];

  return (
    <section className="border-border-subtle bg-bg-elevated border-b px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-brand text-2xl font-bold sm:text-3xl">{t('heading')}</h2>
        <p className="text-text-soft mt-3 max-w-2xl">{t('subhead')}</p>

        <ul className="mt-7 flex flex-wrap gap-2">
          {pills.map((p) => (
            <li
              key={p}
              className="border-border-subtle bg-bg-base text-text-primary inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium"
            >
              {p}
            </li>
          ))}
        </ul>

        <Button href={REPO_URL} external data-testid="proof-github-link" className="mt-9">
          {t('ctaLabel')} →
        </Button>
      </div>
    </section>
  );
}
