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
- `url` and `source_url` are both required and usually identical. `source_url` is used by the image fetch step below to download the og:image.
- No body content — frontmatter only. The `/news` page renders from frontmatter.
- End the file with a trailing newline.

## Image fetch

The og:image for the article gets downloaded to `public/news/` and the resulting path is written back into the markdown frontmatter as an `image:` field. Two security gates apply:

1. **Trusted-domain check.** The hostname of `source_url` must appear in `data/trusted-domains.json`. The list is suffix-matched: an entry `medium.com` matches `medium.com` and any `*.medium.com` subdomain.
2. **og:image host check.** The hostname of the og:image URL parsed from the page HTML must also match the trusted list.

### Step 1 — Check the source hostname

Parse the hostname from the URL the user provided. Read `data/trusted-domains.json` (a JSON array of strings).

- If the hostname matches (exact or `*.<entry>` suffix), proceed to Step 2.
- If it does not match, ask the user:

  > Hostname `<host>` is not in `data/trusted-domains.json`. Add it? (y/n)
  - On **yes**: insert the hostname into the array, keep alphabetical order, show the diff for confirmation, then write the file with the Edit tool. Then proceed to Step 2.
  - On **no**: abort the skill before writing the markdown file. Tell the user why.

### Step 2 — Fetch the image

After the markdown file is written, warn the user that a Chromium browser window will pop up for a few seconds (it is required to bypass anti-bot challenges on sources like Medium and GeekWire; the window closes itself when the fetch finishes — do not interact with it).

Then run this command yourself with the Bash tool (the user has pre-authorised the image fetch step inside this skill — do not stop to ask):

```
pnpm article:image '<source_url>' <YYYY-MM-DD>-<slug>
```

What it does:

- Reads `data/trusted-domains.json` and verifies both the source host and the og:image host are on the list.
- Fetches the source URL, parses the `<meta property="og:image">` tag, downloads the image to `public/news/<YYYY-MM-DD>-<slug>.<ext>` (atomic write).
- Prints a single JSON line on stdout: `{ "imagePath": "/news/...", "ok": true }` on success, or `{ "imagePath": "/qas-icon.svg", "ok": false, "reason": "..." }` on failure (the process also exits non-zero on failure — that is expected, not an error condition for the skill).

### Step 3 — Write the image path back into the frontmatter

Parse the JSON line from stdout. If `ok: true`, edit the article's frontmatter to add the `image:` field directly under `date:`:

```yaml
image: '<imagePath>'
```

If `ok: false`, surface the `reason` to the user (common ones: `HTTP 403` for anti-bot-protected sources like Medium/GeekWire, `og:image not found`, `og:image host not trusted: <host>`). Do not write an `image:` field — the article will fall back to `/qas-icon.svg`. Offer the **manual image fallback** below; the user decides whether to use it or ship with the fallback icon.

### Manual image fallback

1. Save a custom image to `public/news/<YYYY-MM-DD>-<slug>.<ext>` (`.jpg`, `.png`, `.webp`, or `.gif`).
2. Set `image: '/news/<YYYY-MM-DD>-<slug>.<ext>'` in the article frontmatter.

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

1. Acknowledge the request and confirm scope (news link, not a blog post).
2. Collect inputs in the order above. One question at a time — keep it tight.
3. Derive slug and filename. Show them back for confirmation.
4. Show the final markdown file content for approval before writing.
5. After approval, write the file with the Write tool to `<repo>/news/<YYYY-MM-DD>-<slug>.md`. Create the `/news/` directory if it doesn't exist yet.
6. Run the trusted-domain check (Image fetch — Step 1). Then show the `pnpm article:image '<source_url>' <YYYY-MM-DD>-<slug>` command for the user to run, capture the JSON line, and write the `image:` field back into the frontmatter (Image fetch — Steps 2 and 3).
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
