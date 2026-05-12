import nl from '../messages/nl.json';
import en from '../messages/en.json';

function flatten(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

const nlKeys = new Set(flatten(nl));
const enKeys = new Set(flatten(en));
const missingInEn = [...nlKeys].filter((k) => !enKeys.has(k));
const missingInNl = [...enKeys].filter((k) => !nlKeys.has(k));

if (missingInEn.length || missingInNl.length) {
  console.error('i18n integrity FAIL', { missingInEn, missingInNl });
  process.exit(1);
}
console.log('i18n integrity OK');
