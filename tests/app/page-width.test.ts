import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('page width (A4)', () => {
  it('globals.css defines the A4 container token', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
    expect(css).toContain('--container-a4: 834px');
  });

  it('no container in app/ or components/ is wider than one A4 sheet', () => {
    const offenders = ['app', 'components']
      .flatMap((dir) => sourceFiles(dir))
      .filter((file) => /max-w-[4567]xl\b/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
