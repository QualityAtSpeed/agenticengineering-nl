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
    const data = parseFrontmatter(validFile, 'fixture.md');
    expect(data).toEqual({
      title: 'shipping agent loops',
      url: 'https://example.com/post',
      date: '2026-05-12',
      summary_nl: 'korte samenvatting',
      summary_en: 'short summary',
    });
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
    const data = parseFrontmatter(file, 'apo.md') as Record<string, string>;
    expect(data.title).toBe("it's a post");
  });
});
