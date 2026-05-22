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
  const tModules = useTranslations('modules');
  const firstTwo = training.modules.slice(0, 2);

  return (
    <article className="border-border-subtle bg-bg-elevated flex h-full flex-col rounded-sm border p-6">
      <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
        {t(`duration.${trainingId}`)}
      </p>
      <h3 className="text-text-primary mt-3 font-mono text-2xl">
        <span className="text-accent-green">&gt;</span> {t(`${trainingId}.name`)}
      </h3>
      <p className="text-text-muted mt-3 text-sm">{t(`${trainingId}.tagline`)}</p>
      <ol className="mt-4 flex-1 space-y-2 font-mono">
        {firstTwo.map((m, i) => (
          <li key={m.id} className="flex items-baseline gap-3">
            <span className="text-text-muted text-xs tracking-[0.2em]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-text-primary text-sm">{tModules(`${m.id}.title`)}</span>
          </li>
        ))}
        <li className="flex items-baseline gap-3">
          <span className="text-text-muted text-xs tracking-[0.2em]">03</span>
          <Link
            href={`#training-${trainingId}`}
            data-testid={`view-curriculum-${trainingId}`}
            className="text-text-muted hover:text-accent-blue text-sm italic hover:underline"
          >
            {tLabels('viewFullCurriculum')} →
          </Link>
        </li>
      </ol>
      <p className="text-accent-orange mt-6 font-mono">
        €{training.priceEUR.toLocaleString('nl-NL')}{' '}
        <span className="text-text-muted text-xs">{tLabels('priceSuffix')}</span>
      </p>
      <Link
        href={`#training-${trainingId}`}
        data-testid={`view-details-${trainingId}`}
        className="text-accent-blue mt-6 inline-flex items-center gap-1 font-mono text-sm hover:underline"
      >
        → {tLabels('viewDetails')}
      </Link>
    </article>
  );
}
