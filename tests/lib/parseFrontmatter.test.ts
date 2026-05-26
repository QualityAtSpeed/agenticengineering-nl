import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '@/lib/parseFrontmatter';

const validFile = `---
title: 'shipping agent loops'
url: 'https://example.com/post'
date: '2026-05-12'
summary_nl: 'korte samenvatting'
summary_en: 'short summary'
---
`;

describe('parseFrontmatter', () => {
  it('returns the parsed YAML object for a valid frontmatter-only file', () => {
    const { fm, body } = parseFrontmatter(validFile, 'fixture.md');
    expect(fm).toEqual({
      title: 'shipping agent loops',
      url: 'https://example.com/post',
      date: '2026-05-12',
      summary_nl: 'korte samenvatting',
      summary_en: 'short summary',
    });
    expect(body).toBe('');
  });

  it('returns the body when content follows the closing delimiter', () => {
    const file = `---\ntitle: 'with body'\n---\nFirst paragraph.\n\nSecond paragraph.\n`;
    const { fm, body } = parseFrontmatter(file, 'body.md');
    expect(fm).toEqual({ title: 'with body' });
    expect(body).toBe('First paragraph.\n\nSecond paragraph.');
  });

  it('throws when the leading --- delimiter is missing', () => {
    const bad = `title: 'no delimiters'\n`;
    expect(() => parseFrontmatter(bad, 'bad.md')).toThrow(/frontmatter/i);
    expect(() => parseFrontmatter(bad, 'bad.md')).toThrow(/bad\.md/);
  });

  it('throws when the closing --- delimiter is missing', () => {
    const bad = `---\ntitle: 'unterminated'\n`;
    expect(() => parseFrontmatter(bad, 'bad.md')).toThrow(/frontmatter/i);
  });

  it('throws when the YAML body is invalid', () => {
    const bad = `---\ntitle: '\n---\n`;
    expect(() => parseFrontmatter(bad, 'bad.md')).toThrow();
  });

  it('handles apostrophes escaped as doubled single quotes (skill convention)', () => {
    const file = `---\ntitle: 'it''s a post'\n---\n`;
    const { fm } = parseFrontmatter(file, 'apo.md');
    expect((fm as Record<string, string>).title).toBe("it's a post");
  });
});
