import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trainings, type TrainingId, type Module } from '@/data/trainings';

export function TrainingDetail({ trainingId, locale }: { trainingId: TrainingId; locale: string }) {
  const training = trainings[trainingId];
  const t = useTranslations('trainings');
  const tCommon = useTranslations('trainings.labels');
  const tModules = useTranslations('modules');

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

        <div className="mt-14">
          <h3 className="text-text-muted font-mono text-sm tracking-[0.2em] uppercase">
            {tCommon('modules')}
          </h3>
          {training.id === 'advanced' ? (
            <div className="mt-6 grid gap-12 lg:grid-cols-2">
              <div>
                <p className="text-accent-orange font-mono text-xs">{tCommon('day1')}</p>
                <div className="mt-4">
                  <CurriculumList modules={modulesDay1} tModules={tModules} />
                </div>
              </div>
              <div>
                <p className="text-accent-orange font-mono text-xs">{tCommon('day2')}</p>
                <div className="mt-4">
                  <CurriculumList modules={modulesDay2} tModules={tModules} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <CurriculumList modules={training.modules} tModules={tModules} />
            </div>
          )}
        </div>

        <div className="mt-12">
          <Link
            href={`/${locale}/contact?training=${trainingId}`}
            className="bg-accent-green text-bg-base inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
          >
            {tCommon('bookCta')}
          </Link>
        </div>
      </div>
    </section>
  );
}

const SKETCH_PATHS = [
  // folder
  'M3 7 L9 7 L11 9 L21 9 L21 19 L3 19 Z',
  // circle with arrow
  'M12 4 a8 8 0 1 0 0.01 0 M12 8 L16 12 L12 16',
  // brackets
  'M7 5 L4 5 L4 19 L7 19 M17 5 L20 5 L20 19 L17 19',
  // plug
  'M9 3 L9 8 M15 3 L15 8 M5 8 L19 8 L19 13 a7 7 0 0 1 -14 0 Z M12 20 L12 22',
];

function CurriculumList({
  modules,
  tModules,
}: {
  modules: Module[];
  tModules: (key: string) => string;
}) {
  return (
    <ol className="space-y-6">
      {modules.map((m, i) => (
        <li key={m.id} className="border-border-subtle flex gap-4 border-l-2 pl-5">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="text-accent-green mt-3 h-7 w-7 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={SKETCH_PATHS[i % SKETCH_PATHS.length]} />
          </svg>
          <div className="flex-1">
            <p className="text-text-muted font-mono text-xs">{String(i + 1).padStart(2, '0')}</p>
            <h4 className="text-text-primary mt-1 font-mono text-lg">
              <span className="text-accent-green">&gt;</span> {tModules(`${m.id}.title`)}
            </h4>
            <ul className="text-text-muted mt-3 space-y-1 text-sm">
              {(
                (tModules as unknown as { raw: (k: string) => string[] }).raw(`${m.id}.bullets`) ??
                []
              ).map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
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
