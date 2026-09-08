---
name: new-article
description: Create a timeline entry (external link with a short summary) for the agenticengineering-nl website. Covers both news articles (third-party source, og:image thumbnail) and blog posts (own blog at another site, no thumbnail). Use whenever the user says "new article", "add news item", "new blog", "add blog post", "post a link", "share an article", "voeg nieuwsitem toe", or otherwise wants to publish an external link with a summary to the /articles page. This skill collects metadata, writes a markdown file under /news, creates a feature branch, and opens a pull request.
---

# new-article

Guide the user through publishing a timeline entry (external link + short summary, shown on the `/articles` page). Output is a single markdown file under `/news/` plus a feature branch and a pull request.

Two entry types share the same flow:

- `article` — external news/article on a third-party site. og:image fetched as thumbnail.
- `blog` — blog post (typically on the user's own blog elsewhere). No thumbnail, no image fetch.

The site is internationalised (Dutch default, English secondary) via `next-intl`. The `/articles` page renders a single feed but summaries must exist in both `nl` and `en` so the page can pick the active locale.

## Inputs to collect

Ask the user for each, one short question at a time. Do not invent values.

1. **Type** — `blog` or `article`. Ask first. Default to `article` if unclear, but confirm. This drives the image-fetch and frontmatter shape.
2. **Title in original language** (`title_en` or `title_nl`) — verbatim from the source.
3. **Title in the other language** — translate yourself and show back for approval. Both `title_nl` and `title_en` are required in the frontmatter so the page can render the active locale.
4. **URL** of the source (must start with `http://` or `https://`).
5. **Publish date** (`YYYY-MM-DD`) auto-fill from today. Ask to confirm.
6. **Summary in Dutch** (`summary_nl`) — 1–3 sentences, plain language.
7. **Summary in English** (`summary_en`) — 1–3 sentences. If the user only provides one language, translate to the other yourself and show the translation back for approval before writing.
8. **Placed by** (`placed_by`) — name of the person adding this entry. Ask: "Who is placing this article? (your name)". No default; do not invent a value.

Optional fields (only include in frontmatter if the user supplies them): `image`, `tags`, `author`.

## Filename and slug

- Slug = lowercase, ASCII-only, hyphenated transform of the title. Strip diacritics (`café` → `cafe`), drop punctuation, collapse whitespace to single `-`.
- Filename: `news/<YYYY-MM-DD>-<slug>.md` relative to the repo root.
- If the file already exists, append `-2`, `-3`, … until unique. Do not overwrite.

## File format

Write exactly this structure (both types — `type` field is the only difference):

```markdown
---
title_nl: '<dutch title>'
title_en: '<english title>'
url: '<url>'
source_url: '<url>'
type: 'article' # or 'blog'
date: '<YYYY-MM-DD>'
summary_nl: '<dutch summary>'
summary_en: '<english summary>'
placed_by: '<name>'
---
```

Notes:

- Use single quotes around every value to keep YAML predictable with apostrophes.
- Escape any embedded `'` by doubling it (`it''s`).
- `url` is required (where the entry redirects on click).
- `source_url` is optional. If omitted, `url` is used as the scrape source. Only set `source_url` when the click target differs from the canonical page that hosts the og:image (e.g. tracked / rewritten links). For both types, omit the line whenever `source_url` would equal `url`.
- `type` is `'article'` or `'blog'` — drives the inline label (`// article` vs `// blog`) on the `/articles` page. Always write it explicitly even though the schema defaults to `'article'`.
- No body content — frontmatter only. The `/articles` page renders from frontmatter.
- End the file with a trailing newline.

## Image fetch

Same flow for `type: article` and `type: blog`: download the source's og:image to `public/news/` and write the path back into the frontmatter as `image:`. No og:image → entry renders the qas-icon fallback.

**Security gate (control flow — can abort the skill).** Before fetching, the effective scrape source (`source_url` if set, otherwise `url`) must pass a trusted-domain check against `data/trusted-domains.json`. If the hostname is not on the list, ask the user whether to add it; on **no**, abort the skill before writing the markdown file. The og:image host is checked against the same list during the fetch.

**REQUIRED:** Read `references/image-fetch.md` before running the fetch (output sequence step 6). It has the full three-step flow (trusted-domain check, `pnpm article:image` command, write-back) and the manual image fallback.

## Branch and pull request flow

Honour the repo's collaboration rules: the user runs every git/gh command. Never execute git or gh yourself. Show the commands and a one-line reason; let the user execute.

Before showing commands, confirm:

- working tree is clean (`git status`),
- `main` is up to date (`git fetch && git status`).

Then propose, in this order:

1. `git checkout -b news/<slug>`
2. After the markdown file is written and `pnpm article:image` has run, stage both:
   - `git add news/<YYYY-MM-DD>-<slug>.md`
   - `git add public/news/<YYYY-MM-DD>-<slug>.*` (only if the fetch produced an image)
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

1. Acknowledge the request and ask `type`: blog or article? Confirm scope.
2. Collect inputs in the order above. One question at a time — keep it tight.
3. Derive slug and filename. Show them back for confirmation.
4. Show the final markdown file content for approval before writing.
5. After approval, write the file with the Write tool to `<repo>/news/<YYYY-MM-DD>-<slug>.md`. Create the `/news/` directory if it doesn't exist yet.
6. Run the image fetch flow per `references/image-fetch.md`: trusted-domain check on the effective source (Step 1), run `pnpm article:image '<effective-source>' <YYYY-MM-DD>-<slug>` yourself, capture the JSON line, and write the `image:` field back into the frontmatter (Steps 2 and 3).
7. If a warning blocks the fetch, walk the user through the manual image fallback (in `references/image-fetch.md`).
8. Show the git/gh command sequence. User runs each.
9. After PR creation, run `gh pr view --json url,headRefName` to get the PR number, then show the Vercel preview URL: `https://<repo-name>-git-<branch-slug>-<team-slug>.vercel.app` — or run `gh pr checks` and surface the Vercel deployment URL directly once checks appear. Tell the user to open it and confirm the article renders in both locales.
10. Stop after the preview URL is shared. Do not suggest further changes.

## Edge cases

- **URL malformed**: ask again, don't guess a fix.
- **Date in future or far past**: confirm with the user; do not block.
- **Title in Dutch with diacritics**: keep diacritics in `title`; strip them only from the slug.
- **Duplicate filename**: increment suffix (`-2`, `-3`); inform the user.
- **User aborts mid-flow**: do nothing destructive; leave any partially-written file in place only if explicitly approved.
- **Repo not clean / not on main**: surface the situation and ask how to proceed.

## What this skill is NOT for

- Editing existing entries → do that directly, no skill needed.
- Bulk import of multiple links → ask the user to invoke the skill once per item.
