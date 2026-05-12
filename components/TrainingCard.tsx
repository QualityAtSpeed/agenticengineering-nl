import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trainings, type TrainingId } from '@/data/trainings';

export function TrainingCard({
  trainingId,
  locale: _locale,
}: {
  trainingId: TrainingId;
  locale: string;
}) {
  const training = trainings[trainingId];
  const t = useTranslations('trainings');
  const tLabels = useTranslations('trainings.labels');

  return (
    <article className="border-border-subtle bg-bg-elevated flex h-full flex-col rounded-sm border p-6">
      <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
        {t(`duration.${trainingId}`)}
      </p>
      <h3 className="text-text-primary mt-3 font-mono text-2xl">
        <span className="text-accent-green">&gt;</span> {t(`${trainingId}.name`)}
      </h3>
      <p className="text-text-muted mt-3 flex-1 text-sm">{t(`${trainingId}.tagline`)}</p>
      <p className="text-accent-orange mt-6 font-mono">
        €{training.priceEUR.toLocaleString('nl-NL')}{' '}
        <span className="text-text-muted text-xs">{tLabels('priceSuffix')}</span>
      </p>
      <Link
        href={`#training-${trainingId}`}
        className="text-accent-blue mt-6 inline-flex items-center gap-1 font-mono text-sm hover:underline"
      >
        → {tLabels('viewDetails')}
      </Link>
    </article>
  );
}
