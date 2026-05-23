import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';
import { trainings } from '@/data/trainings';

const moduleIds = Array.from(
  new Set(Object.values(trainings).flatMap((t) => t.modules.map((m) => m.id))),
);

const enModules = en.modules as Record<string, { short?: string }>;
const nlModules = nl.modules as Record<string, { short?: string }>;

describe('module short keys', () => {
  it('finds at least one module to sweep (sanity)', () => {
    expect(moduleIds.length).toBeGreaterThan(0);
  });

  it.each(moduleIds)('en.modules[%s].short exists and is non-empty', (id) => {
    const short = enModules[id]?.short;
    expect(typeof short).toBe('string');
    expect((short ?? '').trim().length).toBeGreaterThan(0);
  });

  it.each(moduleIds)('nl.modules[%s].short exists and is non-empty', (id) => {
    const short = nlModules[id]?.short;
    expect(typeof short).toBe('string');
    expect((short ?? '').trim().length).toBeGreaterThan(0);
  });
});
