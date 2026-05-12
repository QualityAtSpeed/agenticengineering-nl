import { describe, it, expect } from 'vitest';
import nl from '@/messages/nl.json';
import en from '@/messages/en.json';

function flatten(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('i18n integrity', () => {
  it('nl and en have identical key sets', () => {
    const nlKeys = new Set(flatten(nl));
    const enKeys = new Set(flatten(en));
    const missingInEn = [...nlKeys].filter((k) => !enKeys.has(k));
    const missingInNl = [...enKeys].filter((k) => !nlKeys.has(k));
    expect({ missingInEn, missingInNl }).toEqual({ missingInEn: [], missingInNl: [] });
  });
});
