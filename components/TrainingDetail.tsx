import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trainings, type TrainingId } from '@/data/trainings';
import { CurriculumList } from './CurriculumList';

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
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
          {t(`duration.${trainingId}`)} · {tCommon('price')} €
          {training.priceEUR.toLocaleString('nl-NL')} {tCommon('priceSuffix')}
        </p>
        <h2 className="text-text-primary mt-3 font-mono text-3xl sm:text-4xl">
          <span className="text-accent-green">&gt;</span> {t(`${trainingId}.name`)}
        </h2>
        <p className="text-text-muted mt-3 max-w-2xl">{t(`${trainingId}.tagline`)}</p>

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
                  <CurriculumList modules={modulesDay1} />
                </div>
              </div>
              <div>
                <p className="text-accent-orange font-mono text-xs">{tCommon('day2')}</p>
                <div className="mt-4">
                  <CurriculumList modules={modulesDay2} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <CurriculumList modules={training.modules} />
            </div>
          )}
        </div>

        <div className="mt-12">
          <Link
            href={`/${locale}/contact?training=${trainingId}`}
            className="bg-accent-green text-bg-base inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
          >
            $ {tCommon('bookCta')}
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
