import { useTranslations } from 'next-intl';

// Herbruikbare diagonale "uitverkocht"-ribbon voor training-kaarten/detail.
// De ouder moet `relative overflow-hidden` zijn zodat de geroteerde ribbon
// netjes in de hoek wordt afgekapt. `className` stelt de verticale offset in
// (kaart: top-9, detailpagina: top-12).
export function SoldOutBadge({ className = 'top-9' }: { className?: string }) {
  const t = useTranslations('trainings.labels');
  return (
    <div
      className={`bg-accent-red text-on-accent absolute -right-24 w-72 rotate-45 py-1 text-center text-xs font-extrabold tracking-wider uppercase shadow-md ${className}`}
    >
      {t('soldOut')}
    </div>
  );
}
