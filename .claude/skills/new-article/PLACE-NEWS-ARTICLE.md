---
name: new-article
description: Create a news item (interesting article link with a short summary) for the agenticengineering-nl website. Use whenever the user says "new article", "add news item", "post a link", "share an article", "voeg nieuwsitem toe", or otherwise wants to publish an external link with a summary to the /news area of the site. Do NOT use for full blog posts (separate skill). This skill collects metadata, writes a markdown file under /news, creates a feature branch, and opens a pull request.
---

# new-article

Guide the user through publishing a news item (external link + short summary, shown later on the `/news` page). Output is a single markdown file under `/news/` plus a feature branch and a pull request.

The site is internationalised (Dutch default, English secondary) via `next-intl`. News pages render a single feed but summaries must exist in both `nl` and `en` so the page can pick the active locale.

## Inputs to collect

Ask the user for each, one short question at a time. Do not invent values.

1. **Title in original language** (`title_en` or `title_nl`) — verbatim from the source article.
2. **Title in the other language** — translate yourself and show back for approval. Both `title_nl` and `title_en` are required in the frontmatter so the `/news` page can render the active locale.
3. **URL** of the source article (must start with `http://` or `https://`).
4. **Publish date** (`YYYY-MM-DD`) auto-fill from today. Ask to confirm
5. **Summary in Dutch** (`summary_nl`) — 1–3 sentences, plain language.
6. **Summary in English** (`summary_en`) — 1–3 sentences. If the user only provides one language, translate to the other yourself and show the translation back for approval before writing.

Optional fields (only include in frontmatter if the user supplies them): `image`, `tags`, `author`.

## Filename and slug

- Slug = lowercase, ASCII-only, hyphenated transform of the title. Strip diacritics (`café` → `cafe`), drop punctuation, collapse whitespace to single `-`.
- Filename: `news/<YYYY-MM-DD>-<slug>.md` relative to the repo root.
- If the file already exists, append `-2`, `-3`, … until unique. Do not overwrite.

## File format

Write exactly this structure:

```markdown
---
title_nl: '<dutch title>'
title_en: '<english title>'
url: '<url>'
source_url: '<url>'
date: '<YYYY-MM-DD>'
summary_nl: '<dutch summary>'
summary_en: '<english summary>'
---
```

Notes:

- Use single quotes around every value to keep YAML predictable with apostrophes.
- Escape any embedded `'` by doubling it (`it''s`).
- `url` and `source_url` are both required and usually identical. `source_url` is read by `scripts/fetch-article-images.ts` to download the og:image.
- No body content — frontmatter only. The `/news` page renders from frontmatter.
- End the file with a trailing newline.

## Image fetch

After writing the markdown file, the og:image needs to be downloaded to `public/news/`. The site reads `public/news/.cache.json` at build time to resolve each article's image path.

Show this command for the user to run:

```
pnpm fetch:images
```

What it does:

- Reads every `news/*.md`, finds the `source_url`, fetches the page HTML and parses the `<meta property="og:image">` tag.
- Downloads the image to `public/news/<slug>.<ext>` and updates `public/news/.cache.json`.
- Skips articles whose ETag/Last-Modified matches the cache (no re-download).
- Skips articles that already have an `image:` field in their frontmatter.

SSRF guards in the script (defense-in-depth — still only run on trusted URLs):

- Only `http:` and `https:` schemes accepted.
- DNS resolves hostname; rejects loopback, RFC1918 private, link-local, unique-local, carrier-grade NAT, multicast, reserved, and unspecified ranges (via `ipaddr.js`).
- Redirect chain capped (max 3) with the same host check at every hop.

If the run prints `[warn] <slug>: ...`, deal with it before opening the PR:

- `og:image not found` or fetch failed → use the **manual image fallback** below.
- `blocked range: ...` → the source's og:image points to an internal host. Almost always a bug on their side; use the manual fallback.
- `scheme not allowed: ...` → og:image is not http(s); use the manual fallback.

### Manual image fallback

1. Save a custom image to `public/news/<YYYY-MM-DD>-<slug>.<ext>` (`.jpg`, `.png`, `.webp`, or `.gif`).
2. Add `image: '/news/<YYYY-MM-DD>-<slug>.<ext>'` to the article frontmatter — the script skips articles with an `image` override.

## Branch and pull request flow

Honour the repo's collaboration rules: the user runs every git/gh command. Never execute git or gh yourself. Show the commands and a one-line reason; let the user execute.

Before showing commands, confirm:

- working tree is clean (`git status`),
- `main` is up to date (`git fetch && git status`).

Then propose, in this order:

1. `git checkout -b news/<slug>`
2. After the markdown file is written and `pnpm fetch:images` has run, stage both:
   - `git add news/<YYYY-MM-DD>-<slug>.md`
   - `git add public/news/<YYYY-MM-DD>-<slug>.* public/news/.cache.json` (only if the fetch produced files)
3. `git commit -m "news: add <title>"` — keep the subject ≤72 chars; truncate the title if needed.
4. `git push -u origin news/<slug>`
5. `gh pr create --title "news: add <title>" --body "<body>"` where `<body>` is:

   ```
   ## Summary
   - Adds news item linking to <url>

   ## Test plan
   - [ ] Visit `/news` locally and confirm the item renders in both `nl` and `en`
   - [ ] Confirm the article card shows the expected thumbnail
   ```

Show each command in its own fenced block with a one-sentence reason. Wait for the user before moving on.

## Output sequence (what you do, in order)

1. Acknowledge the request and confirm scope (news link, not a blog post).
2. Collect inputs in the order above. One question at a time — keep it tight.
3. Derive slug and filename. Show them back for confirmation.
4. Show the final markdown file content for approval before writing.
5. After approval, write the file with the Write tool to `<repo>/news/<YYYY-MM-DD>-<slug>.md`. Create the `/news/` directory if it doesn't exist yet.
6. Show the `pnpm fetch:images` command for the user to run. Inspect the output: success messages or warnings.
7. If a warning blocks the fetch, walk the user through the manual image fallback.
8. Show the git/gh command sequence. User runs each.
9. Stop after PR creation. Do not suggest further changes.

## Edge cases

- **URL malformed**: ask again, don't guess a fix.
- **Date in future or far past**: confirm with the user; do not block.
- **Title in Dutch with diacritics**: keep diacritics in `title`; strip them only from the slug.
- **Duplicate filename**: increment suffix (`-2`, `-3`); inform the user.
- **User aborts mid-flow**: do nothing destructive; leave any partially-written file in place only if explicitly approved.
- **Repo not clean / not on main**: surface the situation and ask how to proceed.

## What this skill is NOT for

- Full blog posts (own page, body content, hero image) → a separate skill.
- Editing existing news items → do that directly, no skill needed.
- Bulk import of multiple links → ask the user to invoke the skill once per item.
