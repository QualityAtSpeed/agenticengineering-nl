---
name: blog-creator
description: Generate bilingual NL+EN blog posts for the agenticengineering.nl site from a single source-language text. Use whenever the user asks to publish, create, draft, or add a blog / blog post / blogpost for this site (NOT external article links — those live in data/articles.json). Auto-translates source → other locale, derives slug from title, writes blogs/<slug>.nl.md + blogs/<slug>.en.md with shared frontmatter matching lib/blogs.ts schema.
---

# blog-creator

Generate paired NL+EN blog markdown files from a single source-language text.

## When to use

- User provides blog text and asks to publish, create, draft, or add a blog post for this site.
- Output target: `blogs/<slug>.nl.md` + `blogs/<slug>.en.md` at repo root.
- NOT for: external article links (those live in `data/articles.json`).

## Inputs to gather

Confirm before writing files:

1. **Source body** — markdown text in NL or EN.
2. **Title** — user provides explicitly. Do not invent.
3. **Summary** — 1-2 sentences. If absent, draft from body and ask user to approve.
4. **Author** — name of writer. Ask if not established in session.
5. **Tags** (optional) — array of short strings.
6. **Image** (optional) — path or URL.

## Workflow

### 1. Detect source language

Read the body. NL markers: `ik`, `een`, `het`, `en`, `niet`, `is`, `met`. EN markers: `the`, `and`, `is`, `to`, `of`, `with`. If ambiguous, ask user.

### 2. Derive slug

From the title (prefer EN for ASCII):

- Lowercase
- Strip diacritics (é→e, ï→i)
- Replace non-alphanumeric runs with single hyphen
- Trim leading/trailing hyphens
- Max 60 chars, cut on word boundary

Confirm slug with user. Slug = filename stem (no date prefix; date lives in frontmatter).

### 3. Date

Use today's date in YYYY-MM-DD: `date +%Y-%m-%d`. Quote as string in frontmatter.

### 4. Translate

Translate body, title, summary to the other locale. Preserve verbatim:

- Markdown structure (headings, lists, code blocks, links)
- Code blocks and inline code
- URLs
- Brand names (agenticengineering.nl, Claude Code, Codex, etc.)

Aim for natural target-language phrasing, not word-for-word.

### 5. Preview + approval

Show user:

- Slug
- Date
- Shared frontmatter (author, tags, image)
- NL title + summary
- EN title + summary
- First ~10 lines of each translated body

Wait for explicit approval before writing.

### 6. Write files

Shape:

```md
---
title: '<locale-specific title>'
summary: '<locale-specific summary>'
date: '<YYYY-MM-DD>'
author: '<name>'
tags: ['<tag1>', '<tag2>']
image: '<path>'
---

<locale-specific body>
```

Required: title, summary, date. Optional: author, tags, image — omit line entirely if absent. Dates quoted strings (single quotes). Both files share identical date/author/tags/image — `lib/blogs.ts` enforces date match across locales.

### 7. Verify

Run `pnpm exec tsc --noEmit`. Suggest user preview at `/articles/<slug>` via `pnpm dev`.

## House rules

- No git commits without explicit ask.
- No destructive commands.
- Show file contents before writing; wait for explicit approval.
- Use pnpm, not npm.

## Failure modes

- **Slug collision** — both filenames exist. Ask user: overwrite or new slug.
- **Untranslatable proper nouns** — keep verbatim, note in preview.
- **Ambiguous source language** — ask user before translating.
