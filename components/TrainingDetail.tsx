import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { trainings, type TrainingId, type Module } from '@/data/trainings';
import { priceFor } from '@/lib/pricing';
import { bookableTrainingEnum } from '@/lib/validation';

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="text-brand shrink-0"
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
    className="text-brand shrink-0"
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

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="text-brand shrink-0"
  >
    <path
      d="M2 8l3 3 9-9"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="text-brand shrink-0"
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

const PriceIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="text-brand shrink-0"
  >
    <rect
      x="2"
      y="4"
      width="12"
      height="9"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M5 7h6M5 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function TrainingDetail({
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
  const tCommon = useTranslations('trainings.labels');
  const tModules = useTranslations('modules');

  // Bookable = self-serve via Stripe checkout (zelfde set als het boeking-schema).
  const isBookable = (bookableTrainingEnum.options as readonly TrainingId[]).includes(trainingId);
  const isSoldOut = training.soldOut === true;
  const price = priceFor(trainingId, now);

  const audience = t.raw(`${trainingId}.audience`) as string[];
  const prerequisites = t.raw(`${trainingId}.prerequisites`) as string[];
  const outcomes = t.raw(`${trainingId}.outcomes`) as string[];

  const modulesDay1 = training.modules.filter((m) => m.day === 1 || m.day === undefined);
  const modulesDay2 = training.modules.filter((m) => m.day === 2);

  return (
    <section
      id={`training-${trainingId}`}
      className="border-border-subtle relative overflow-hidden border-b px-6 py-20"
    >
      {isSoldOut && (
        <div className="bg-accent-red text-on-accent absolute top-12 -right-24 w-72 rotate-45 py-1 text-center text-xs font-extrabold tracking-wider uppercase shadow-md">
          {tCommon('soldOut')}
        </div>
      )}
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-brand text-2xl font-bold sm:text-3xl">{t(`${trainingId}.name`)}</h2>
          <p className="text-text-soft mt-2">{t(`${trainingId}.tagline`)}</p>
        </div>

        <dl className="border-border-subtle mb-10 border-t">
          <FactRow icon={<ClockIcon />} label={tCommon('durationLabel')}>
            <span>{t(`duration.${trainingId}`)}</span>
          </FactRow>
          <FactRow icon={<PeopleIcon />} label={tCommon('audience')}>
            <ul className="list-disc space-y-0.5 pl-5">
              {audience.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </FactRow>
          <FactRow icon={<CheckIcon />} label={tCommon('prerequisites')}>
            <ul className="list-disc space-y-0.5 pl-5">
              {prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </FactRow>
          <FactRow icon={<StarIcon />} label={tCommon('outcomes')}>
            <ul className="list-disc space-y-0.5 pl-5">
              {outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </FactRow>
          <FactRow icon={<PriceIcon />} label={tCommon('price')}>
            <span className="font-semibold">
              <PriceInline
                baseEUR={training.priceEUR}
                price={price}
                suffix={tCommon('priceSuffix')}
              />
            </span>
          </FactRow>
        </dl>

        <h3 className="text-text-primary mb-3 text-lg font-bold">{tCommon('modules')}</h3>

        {training.durationDays === 2 ? (
          <>
            <DayMarker label={tCommon('day1')} />
            <CurriculumList modules={modulesDay1} tModules={tModules} startIndex={1} />
            <DayMarker label={tCommon('day2')} />
            <CurriculumList
              modules={modulesDay2}
              tModules={tModules}
              startIndex={modulesDay1.length + 1}
            />
          </>
        ) : (
          <CurriculumList modules={training.modules} tModules={tModules} startIndex={1} />
        )}

        <div className="border-border-subtle bg-bg-tint mt-10 flex flex-col gap-4 rounded-lg border px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-text-primary font-semibold">
              <PriceInline
                baseEUR={training.priceEUR}
                price={price}
                suffix={tCommon('priceSuffix')}
              />
            </p>
            {price.earlyBird && (
              <p className="text-accent-green-hover mt-1 text-sm font-semibold">
                {t(`${trainingId}.earlyBirdNote`)}
              </p>
            )}
            {isSoldOut && (
              <p className="text-text-soft mt-2 text-sm">
                {tCommon('soldOutNote')}{' '}
                <a
                  href={`/${locale}/contact?training=${trainingId}`}
                  data-testid={`book-training-${trainingId}-soldout-contact`}
                  className="text-brand font-semibold underline"
                >
                  {tCommon('soldOutContact')}
                </a>
              </p>
            )}
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {isSoldOut ? (
              <Button
                disabled
                data-testid={`book-training-${trainingId}`}
                className="pointer-events-none"
              >
                {tCommon(isBookable ? 'bookCta' : 'requestCta')}
              </Button>
            ) : (
              <Button
                href={
                  isBookable
                    ? `/${locale}/trainings/${trainingId}/book`
                    : `/${locale}/contact?training=${trainingId}`
                }
                data-testid={`book-training-${trainingId}`}
              >
                {tCommon(isBookable ? 'bookCta' : 'requestCta')}
              </Button>
            )}
            {isBookable && !isSoldOut && (
              <a
                href={`/${locale}/contact`}
                data-testid={`book-training-${trainingId}-contact`}
                className="text-text-muted text-xs underline"
              >
                {tCommon('contactLink')}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceInline({
  baseEUR,
  price,
  suffix,
}: {
  baseEUR: number;
  price: { earlyBird: boolean; netCents: number };
  suffix: string;
}) {
  if (!price.earlyBird) {
    return (
      <>
        €{baseEUR.toLocaleString('nl-NL')}{' '}
        <span className="text-text-muted text-sm font-normal">{suffix}</span>
      </>
    );
  }
  return (
    <>
      <span className="text-text-muted mr-2 font-normal line-through">
        €{baseEUR.toLocaleString('nl-NL')}
      </span>
      €
      {(price.netCents / 100).toLocaleString('nl-NL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}{' '}
      <span className="text-text-muted text-sm font-normal">{suffix}</span>
    </>
  );
}

function FactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border-subtle grid grid-cols-1 gap-1 border-b py-3.5 sm:grid-cols-[200px_1fr] sm:gap-4 sm:py-4">
      <dt className="text-brand flex items-center gap-2 text-sm font-semibold">
        {icon}
        {label}
      </dt>
      <dd className="text-text-primary m-0 text-[0.9375rem]">{children}</dd>
    </div>
  );
}

function DayMarker({ label }: { label: string }) {
  return (
    <p className="bg-brand-soft text-brand-deep mt-6 mb-3 inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-bold tracking-wider uppercase">
      {label}
    </p>
  );
}

function CurriculumList({
  modules,
  tModules,
  startIndex,
}: {
  modules: Module[];
  tModules: (key: string) => string;
  startIndex: number;
}) {
  return (
    <ol className="border-border-subtle mb-2 list-none border-t pl-0">
      {modules.map((m, i) => (
        <li
          key={m.id}
          className="border-border-subtle grid grid-cols-[44px_1fr] items-start gap-3 border-b py-5"
        >
          <span className="border-border-subtle text-brand bg-bg-base flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold tabular-nums">
            {String(startIndex + i).padStart(2, '0')}
          </span>
          <div>
            <h4 className="text-text-primary font-bold">{tModules(`${m.id}.title`)}</h4>
            <ul className="text-text-muted mt-1.5 list-disc space-y-0.5 pl-5 text-sm">
              {(
                (tModules as unknown as { raw: (k: string) => string[] }).raw(`${m.id}.bullets`) ??
                []
              ).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
