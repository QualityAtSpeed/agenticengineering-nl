import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { trainings, type TrainingId } from '@/data/trainings';
import { priceFor } from '@/lib/pricing';
import { bookableTrainingEnum } from '@/lib/validation';

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="text-brand mt-px shrink-0"
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
    className="text-brand mt-px shrink-0"
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
    className="text-brand mt-px shrink-0"
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

const metaItems: { icon: 'clock' | 'people' | 'star'; key: string }[] = [
  { icon: 'clock', key: 'metaDuration' },
  { icon: 'people', key: 'metaAudience' },
  { icon: 'star', key: 'metaOutcome' },
];

function MetaIcon({ which }: { which: 'clock' | 'people' | 'star' }) {
  if (which === 'clock') return <ClockIcon />;
  if (which === 'people') return <PeopleIcon />;
  return <StarIcon />;
}

export function TrainingCard({
  trainingId,
  locale,
  now,
}: {
  trainingId: TrainingId;
  locale: string;
  now?: Date;
}) {
  const training = trainings[trainingId];
  const t = useTranslations('trainings');
  const tLabels = useTranslations('trainings.labels');
  const tCard = useTranslations('trainings.cardMeta');

  const isPilot = trainingId === 'pilot';
  const isSoldOut = training.soldOut === true;
  // Bookable = self-serve via Stripe checkout (zelfde set als het boeking-schema).
  const isBookable = (bookableTrainingEnum.options as readonly TrainingId[]).includes(trainingId);
  const price = priceFor(trainingId, now);
  // Sold-out cohorts dim their content; the badge, label and CTA stay full-opacity.
  const dim = isSoldOut ? 'opacity-60' : '';

  return (
    <article
      className={
        isPilot
          ? 'bg-brand-soft ring-brand/30 relative -mx-6 my-8 grid items-start gap-7 overflow-hidden rounded-lg p-6 ring-1 lg:grid-cols-[1fr_200px]'
          : 'border-border-subtle grid items-start gap-7 border-t py-8 last:border-b lg:grid-cols-[1fr_200px]'
      }
    >
      {isSoldOut && (
        <div className="bg-accent-red text-on-accent absolute top-9 -right-24 w-72 rotate-45 py-1 text-center text-xs font-extrabold tracking-wider uppercase shadow-md">
          {tLabels('soldOut')}
        </div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1">
          {isPilot && (
            <span className="bg-brand text-on-accent mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
              {tLabels('pilotBadge')}
            </span>
          )}
          <h3 className={`text-text-primary text-xl font-bold ${dim}`}>
            {t(`${trainingId}.name`)}
          </h3>
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

        <ul
          className={`text-text-muted m-0 list-none space-y-1.5 p-0 text-sm ${isPilot ? 'lg:pt-[1.875rem]' : 'lg:pt-[0.3125rem]'}`}
        >
          {metaItems.map((m) => (
            <li key={m.key} className="flex items-center gap-2">
              <MetaIcon which={m.icon} />
              <span>{tCard(`${trainingId}.${m.key}`)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={isPilot ? 'lg:pt-[1.875rem]' : undefined}>
        {/* Sold-out dim is applied only to the large/bold price (AA needs 3:1),
            never to the small struck price / suffix / note (those need 4.5:1). */}
        {price.earlyBird ? (
          <>
            <p className="text-text-muted text-sm font-medium tabular-nums line-through">
              €{training.priceEUR.toLocaleString('nl-NL')}
            </p>
            <p className={`text-text-primary text-xl font-bold tabular-nums ${dim}`}>
              €
              {(price.netCents / 100).toLocaleString('nl-NL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </>
        ) : (
          <p className={`text-text-primary text-xl font-bold tabular-nums ${dim}`}>
            €{training.priceEUR.toLocaleString('nl-NL')}
          </p>
        )}
        <p className="text-text-muted text-xs">{tLabels('priceSuffix')}</p>
        {price.earlyBird && (
          <p className="text-accent-green-hover mt-1 text-xs font-semibold">
            {t(`${trainingId}.earlyBirdNote`)}
          </p>
        )}
        {isSoldOut ? (
          <Button
            size="sm"
            fullWidth
            disabled
            data-testid={`book-${trainingId}`}
            className="pointer-events-none mt-3"
          >
            {tLabels(isBookable ? 'bookCta' : 'requestCta')}
          </Button>
        ) : (
          <Button
            size="sm"
            fullWidth
            href={
              isBookable
                ? `/${locale}/trainings/${trainingId}/book`
                : `/${locale}/contact?training=${trainingId}`
            }
            data-testid={`book-${trainingId}`}
            className="mt-3"
          >
            {tLabels(isBookable ? 'bookCta' : 'requestCta')}
          </Button>
        )}
        {isBookable && !isSoldOut && (
          <a
            href={`/${locale}/contact`}
            data-testid={`book-${trainingId}-contact`}
            className="text-text-muted mt-2 block text-center text-xs underline"
          >
            {tLabels('contactLink')}
          </a>
        )}
      </div>
    </article>
  );
}
