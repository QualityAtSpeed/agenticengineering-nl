---
name: blog-creator
description: Add an external blog post as an article card for the agenticengineering.nl site. Use whenever the user asks to publish, create, draft, or add a blog / blog post / blogpost for this site from an external URL.
---

# blog-creator

Add an external blog post as an article card in `news/`.

## When to use

- User provides a URL to an external blog post and asks to publish, add, or create a blog/article card for this site.
- Output target: `news/YYYY-MM-DD-slug.md` (frontmatter only, no body).

## Inputs to gather

Confirm before writing:

1. **URL** — external blog post URL. Required.
2. **Author** — full name. Ask if not known.
3. **Date** — from the blog post itself. Ask if not fetchable.
4. **Tags** (optional) — array of short strings.
5. **Image** (optional) — path or URL.

## Workflow

### 1. Fetch summary

Use WebFetch on the provided URL. Extract:

- Title (NL and EN if available, otherwise translate)
- Summary (1-2 sentences)
- Author name
- Publication date

### 2. Derive slug

From the URL path or EN title:

- Lowercase
- Strip diacritics (é→e, ï→i)
- Replace non-alphanumeric runs with single hyphen
- Trim leading/trailing hyphens
- Max 60 chars, cut on word boundary

### 3. Translate title + summary

Translate title and summary to both NL and EN if only one locale was found.
Natural phrasing — not word-for-word. Preserve brand names verbatim.

### 4. Preview + approval

Show user the full file contents before writing:

```
File: news/YYYY-MM-DD-slug.md
---
title_nl: '...'
title_en: '...'
url: '...'
type: 'blog'
date: 'YYYY-MM-DD'
author: '...'
summary_nl: '...'
summary_en: '...'
---
```

Wait for explicit approval before writing.

### 5. Write file

Shape:

```md
---
title_nl: '<NL title>'
title_en: '<EN title>'
url: '<external URL>'
type: 'blog'
date: '<YYYY-MM-DD>'
author: '<full name>'
summary_nl: '<NL summary>'
summary_en: '<EN summary>'
---
```

Required: title_nl, title_en, url, date, summary_nl, summary_en.
Optional: author, tags, image — omit line entirely if absent.
All values in single quotes. Apostrophes inside single-quoted YAML strings must be escaped by doubling: `testscenario''s`.
Filename: `news/YYYY-MM-DD-slug.md` where date matches the `date` frontmatter field.

### 6. Verify

Run `pnpm exec tsc --noEmit`. Clean = done.

## House rules

- No git commits without explicit ask.
- Show file contents before writing; wait for explicit approval.
- Use pnpm, not npm.

## Failure modes

- **Slug collision** — file already exists. Ask: overwrite or new slug.
- **Date not found** — ask user to provide it.
- **Ambiguous locale** — ask user before translating.
