import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trainings, type TrainingId } from '@/data/trainings';
import { DayAgenda } from '@/components/DayAgenda';

export function TrainingDetail({ trainingId, locale }: { trainingId: TrainingId; locale: string }) {
  const training = trainings[trainingId];
  const t = useTranslations('trainings');
  const tCommon = useTranslations('trainings.labels');

  const audience = t.raw(`${trainingId}.audience`) as string[];
  const prerequisites = t.raw(`${trainingId}.prerequisites`) as string[];
  const outcomes = t.raw(`${trainingId}.outcomes`) as string[];

  const modulesDay1 = training.modules.filter((m) => m.day === 1 || m.day === undefined);
  const modulesDay2 = training.modules.filter((m) => m.day === 2);

  return (
    <section
      id={`training-${trainingId}`}
      className="border-border-subtle bg-bg-elevated border-t px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
              {t(`duration.${trainingId}`)} · {tCommon('price')} €
              {training.priceEUR.toLocaleString('nl-NL')} {tCommon('priceSuffix')}
            </p>
            <h2 className="text-text-primary mt-3 font-mono text-3xl sm:text-4xl">
              <span className="text-accent-green">&gt;</span> {t(`${trainingId}.name`)}
            </h2>
            <p className="text-text-muted mt-3 max-w-md">{t(`${trainingId}.tagline`)}</p>
          </div>
          <div className="border-border-subtle bg-bg-base overflow-hidden rounded-sm border font-mono text-sm">
            <div className="border-border-subtle bg-bg-elevated flex items-center gap-2 border-b px-3 py-2">
              <span className="bg-accent-red inline-block h-3 w-3 rounded-full" />
              <span className="bg-accent-orange inline-block h-3 w-3 rounded-full" />
              <span className="bg-accent-green inline-block h-3 w-3 rounded-full" />
              <span className="text-text-muted ml-2 text-xs">~/agentic-training</span>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-text-muted">
                <span className="text-accent-green">$</span> claude --train {trainingId}
              </p>
              <p className="text-text-primary">
                ▸ Setting up agentic workflow for{' '}
                <span className="text-accent-blue">{t(`${trainingId}.name`)}</span>
              </p>
              <p className="text-text-muted">▸ {training.modules.length} modules loaded</p>
              <p className="text-text-muted">
                ▸ {training.durationDays} {training.durationDays === 1 ? 'day' : 'days'}, hands-on
              </p>
              <p className="text-accent-green">
                ✓ ready <span className="text-text-primary animate-pulse">_</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <DetailList title={tCommon('audience')} items={audience} />
          <DetailList title={tCommon('prerequisites')} items={prerequisites} />
          <DetailList title={tCommon('outcomes')} items={outcomes} />
        </div>

        <div data-testid={`agenda-${trainingId}`} className="mt-14 space-y-3">
          {training.durationDays === 2 ? (
            <>
              <DayAgenda label={tCommon('day1')} modules={modulesDay1} />
              <DayAgenda label={tCommon('day2')} modules={modulesDay2} />
            </>
          ) : (
            <DayAgenda modules={training.modules} />
          )}
        </div>

        <div className="mt-12">
          <Link
            href={`/${locale}/contact?training=${trainingId}`}
            data-testid={`book-training-${trainingId}`}
            className="bg-accent-green text-bg-base inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
          >
            {tCommon('bookCta')}
          </Link>
        </div>
      </div>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{title}</h4>
      <ul className="text-text-primary mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-accent-green">›</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
