import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf8');

function block(selectorStart: string): string {
  const start = css.indexOf(selectorStart);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') depth--;
    if (depth === 0) return css.slice(open + 1, i);
  }
  return '';
}

const token = (scope: string, name: string) =>
  new RegExp(`--color-${name}:\\s*([^;]+);`).exec(scope)?.[1].trim();

describe('design tokens (app/globals.css)', () => {
  const theme = block('@theme');
  const components = block('@layer components');
  const band = block('.surface-dark');

  it('defines the muted light palette', () => {
    expect(token(theme, 'bg-page')).toBe('#cdd3cd');
    expect(token(theme, 'bg-base')).toBe('#e1e5e1');
    expect(token(theme, 'text-muted')).toBe('#434d47');
    expect(token(theme, 'brand')).toBe('#2f3a34');
    expect(token(theme, 'border-strong')).toBe('#6b736d');
    expect(token(theme, 'accent-orange')).toBe('#734105');
    expect(token(theme, 'accent-red')).toBe('#8f2a0e');
  });

  it('defines .surface-dark inside @layer components', () => {
    expect(components).toContain('.surface-dark');
    expect(token(band, 'bg-page')).toBe('#0f3b25');
    expect(token(band, 'brand')).toBe('#ffffff');
    expect(token(band, 'accent-green-hover')).toBe('#56d364');
    expect(token(band, 'border-strong')).toBe('#6b9a82');
  });

  it('defines the house dark theme on :root.dark', () => {
    const dark = block(':root.dark');
    expect(token(dark, 'bg-page')).toBe('#010409');
    expect(token(dark, 'bg-base')).toBe('#0d1117');
    expect(token(dark, 'bg-elevated')).toBe('#161b22');
    expect(token(dark, 'text-primary')).toBe('#e6edf3');
    expect(token(dark, 'brand')).toBe('#58a6ff');
    expect(token(dark, 'on-accent')).toBe('#0d1117');
  });

  it('has no unused accent-blue token', () => {
    expect(css).not.toContain('--color-accent-blue');
  });

  it('paints html/body with bg-page', () => {
    expect(block('html,')).toContain('var(--color-bg-page)');
  });
});
