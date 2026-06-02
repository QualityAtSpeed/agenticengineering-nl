import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { trainings, type TrainingId } from '@/data/trainings';

const numerals: Record<TrainingId, string> = { basic: '01', advanced: '02' };

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="text-brand mt-0.5 shrink-0"
  >
    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M8 4v4l3 2"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const PeopleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="text-brand mt-0.5 shrink-0"
  >
    <circle cx="6" cy="6" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M2 14c.6-2.4 2-3.5 4-3.5s3.4 1.1 4 3.5"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M11 8h4M13 6v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="text-brand mt-0.5 shrink-0"
  >
    <path
      d="M8 1l2.5 4.5L15 6.5l-3.5 3.5L12.5 15 8 12.5 3.5 15l1-5L1 6.5l4.5-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
    <path
      d="M1 7h12M8 2l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const metaItems: Record<TrainingId, { icon: 'clock' | 'people' | 'star'; key: string }[]> = {
  basic: [
    { icon: 'clock', key: 'metaDuration' },
    { icon: 'people', key: 'metaAudience' },
    { icon: 'star', key: 'metaOutcome' },
  ],
  advanced: [
    { icon: 'clock', key: 'metaDuration' },
    { icon: 'people', key: 'metaAudience' },
    { icon: 'star', key: 'metaOutcome' },
  ],
};

function MetaIcon({ which }: { which: 'clock' | 'people' | 'star' }) {
  if (which === 'clock') return <ClockIcon />;
  if (which === 'people') return <PeopleIcon />;
  return <StarIcon />;
}

export function TrainingCard({ trainingId, locale }: { trainingId: TrainingId; locale: string }) {
  const training = trainings[trainingId];
  const t = useTranslations('trainings');
  const tLabels = useTranslations('trainings.labels');
  const tCard = useTranslations('trainings.cardMeta');

  return (
    <article className="border-border-subtle bg-bg-tint grid items-start gap-7 rounded-lg border px-5 py-7 sm:px-7 lg:grid-cols-[80px_1.5fr_1fr_200px]">
      <div className="text-brand text-4xl leading-none font-extrabold tracking-tight tabular-nums">
        {numerals[trainingId]}
      </div>

      <div>
        <h3 className="text-text-primary text-xl font-bold">{t(`${trainingId}.name`)}</h3>
        <p className="text-text-soft mt-2 text-[0.9375rem]">{t(`${trainingId}.tagline`)}</p>
        <Button
          variant="secondary"
          size="sm"
          href={`/${locale}/trainings/${trainingId}`}
          data-testid={`view-curriculum-${trainingId}`}
          className="mt-3"
        >
          {tLabels('viewDetails')}
          <ArrowIcon />
        </Button>
      </div>

      <ul className="text-text-muted m-0 list-none space-y-1.5 p-0 text-sm">
        {metaItems[trainingId].map((m) => (
          <li key={m.key} className="flex items-start gap-2">
            <MetaIcon which={m.icon} />
            <span>{tCard(`${trainingId}.${m.key}`)}</span>
          </li>
        ))}
      </ul>

      <div>
        <p className="text-text-primary text-xl font-bold tabular-nums">
          €{training.priceEUR.toLocaleString('nl-NL')}
        </p>
        <p className="text-text-muted text-xs">{tLabels('priceSuffix')}</p>
        <Button
          size="sm"
          fullWidth
          href={`/${locale}/contact`}
          data-testid={`book-${trainingId}`}
          className="mt-3"
        >
          {tLabels('bookCta')}
        </Button>
      </div>
    </article>
  );
}
