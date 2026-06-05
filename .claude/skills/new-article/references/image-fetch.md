# Image fetch flow

Detailed mechanics for fetching the og:image thumbnail. The main `SKILL.md` summarises the trusted-domain gate and points here; read this file before running the fetch (output sequence step 6).

Identical flow for `type: article` and `type: blog`. The og:image gets downloaded to `public/news/` and the resulting path is written back into the markdown frontmatter as an `image:` field. If no og:image is found, the entry renders the qas-icon fallback. Two security gates apply:

1. **Trusted-domain check.** The hostname of the effective scrape source (`source_url` if set, otherwise `url`) must appear in `data/trusted-domains.json`. The list is suffix-matched: an entry `medium.com` matches `medium.com` and any `*.medium.com` subdomain.
2. **og:image host check.** The hostname of the og:image URL parsed from the page HTML must also match the trusted list.

Throughout the steps below, "effective source" means `source_url` when present in the frontmatter, otherwise `url`.

## Step 1 — Check the source hostname

Parse the hostname from the effective source. Read `data/trusted-domains.json` (a JSON array of strings).

- If the hostname matches (exact or `*.<entry>` suffix), proceed to Step 2.
- If it does not match, ask the user:

  > Hostname `<host>` is not in `data/trusted-domains.json`. Add it? (y/n)
  - On **yes**: insert the hostname into the array, keep alphabetical order, show the diff for confirmation, then write the file with the Edit tool. Then proceed to Step 2.
  - On **no**: abort the skill before writing the markdown file. Tell the user why.

## Step 2 — Fetch the image

After the markdown file is written, warn the user that a Chromium browser window will pop up for a few seconds (it is required to bypass anti-bot challenges on sources like Medium and GeekWire; the window closes itself when the fetch finishes — do not interact with it).

Then run this command yourself with the Bash tool (the user has pre-authorised the image fetch step inside this skill — do not stop to ask). Pass the effective source (`source_url` if you wrote it, otherwise `url`):

```
pnpm article:image '<effective-source>' <YYYY-MM-DD>-<slug>
```

What it does:

- Reads `data/trusted-domains.json` and verifies both the source host and the og:image host are on the list.
- Fetches the source URL, parses the `<meta property="og:image">` tag, downloads the image to `public/news/<YYYY-MM-DD>-<slug>.<ext>` (atomic write).
- Prints a single JSON line on stdout: `{ "imagePath": "/news/...", "ok": true }` on success, or `{ "imagePath": "/qas-icon.svg", "ok": false, "reason": "..." }` on failure (the process also exits non-zero on failure — that is expected, not an error condition for the skill).

## Step 3 — Write the image path back into the frontmatter

Parse the JSON line from stdout. If `ok: true`, edit the article's frontmatter to add the `image:` field directly under `date:`:

```yaml
image: '<imagePath>'
```

If `ok: false`, surface the `reason` to the user (common ones: `HTTP 403` for anti-bot-protected sources like Medium/GeekWire, `og:image not found`, `og:image host not trusted: <host>`). Do not write an `image:` field — the article will fall back to `/qas-icon.svg`. Offer the **manual image fallback** below; the user decides whether to use it or ship with the fallback icon.

## Manual image fallback

1. Save a custom image to `public/news/<YYYY-MM-DD>-<slug>.<ext>` (`.jpg`, `.png`, `.webp`, or `.gif`).
2. Set `image: '/news/<YYYY-MM-DD>-<slug>.<ext>'` in the article frontmatter.
