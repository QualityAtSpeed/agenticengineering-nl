import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { getBlogs, getBlogBySlug } from '@/lib/blogs';

const fixture = (name: string) => path.join(__dirname, 'fixtures', name);

describe('getBlogs', () => {
  it('returns blogs sorted by date desc', () => {
    const blogs = getBlogs(fixture('blogs-valid'));
    expect(blogs.map((b) => b.slug)).toEqual(['2026-05-12-foo', '2026-04-28-bar']);
  });

  it('maps locale-specific title and summary', () => {
    const blogs = getBlogs(fixture('blogs-valid'));
    const foo = blogs.find((b) => b.slug === '2026-05-12-foo')!;
    expect(foo.nl.title).toBe('Foo titel NL');
    expect(foo.en.title).toBe('Foo title EN');
    expect(foo.nl.summary).toBe('Foo samenvatting NL');
    expect(foo.en.summary).toBe('Foo summary EN');
  });

  it('extracts shared frontmatter fields (date, tags, author)', () => {
    const blogs = getBlogs(fixture('blogs-valid'));
    const foo = blogs.find((b) => b.slug === '2026-05-12-foo')!;
    expect(foo.date).toBe('2026-05-12');
    expect(foo.tags).toEqual(['tag-a', 'tag-b']);
    expect(foo.author).toBe('Pascal');
  });

  it('omits optional fields when absent', () => {
    const blogs = getBlogs(fixture('blogs-valid'));
    const bar = blogs.find((b) => b.slug === '2026-04-28-bar')!;
    expect(bar.tags).toBeUndefined();
    expect(bar.author).toBeUndefined();
    expect(bar.image).toBeUndefined();
  });

  it('returns [] when dir missing', () => {
    expect(getBlogs(fixture('does-not-exist'))).toEqual([]);
  });

  it('returns [] when dir empty', () => {
    expect(getBlogs(fixture('blogs-empty'))).toEqual([]);
  });

  it('throws when a locale file is missing', () => {
    expect(() => getBlogs(fixture('blogs-missing-locale'))).toThrow(/missing one locale file/);
  });

  it('throws when dates mismatch across locales', () => {
    expect(() => getBlogs(fixture('blogs-date-mismatch'))).toThrow(/date mismatch/);
  });

  it('throws when tags mismatch across locales', () => {
    expect(() => getBlogs(fixture('blogs-tags-mismatch'))).toThrow(/tags mismatch/);
  });

  it('throws when author mismatches across locales', () => {
    expect(() => getBlogs(fixture('blogs-author-mismatch'))).toThrow(/author mismatch/);
  });

  it('throws when image mismatches across locales', () => {
    expect(() => getBlogs(fixture('blogs-image-mismatch'))).toThrow(/image mismatch/);
  });

  it('throws when a required frontmatter field is missing', () => {
    expect(() => getBlogs(fixture('blogs-missing-field'))).toThrow(/summary/);
  });

  it('throws when frontmatter delimiters are absent', () => {
    expect(() => getBlogs(fixture('blogs-no-frontmatter'))).toThrow(
      /start with --- and end with ---/,
    );
  });
});

describe('getBlogBySlug', () => {
  it('returns matching blog', () => {
    const blog = getBlogBySlug('2026-05-12-foo', fixture('blogs-valid'));
    expect(blog?.slug).toBe('2026-05-12-foo');
  });

  it('returns null when not found', () => {
    expect(getBlogBySlug('nope', fixture('blogs-valid'))).toBeNull();
  });
});
