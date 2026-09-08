# FAQ-pagina — design

**Datum:** 2026-07-10 · **Branch:** `feat/FAQ` · **Status:** goedgekeurd door Jorick

## Doel

Tweetalige (NL/EN) FAQ-pagina op `/[locale]/faq` met 9 vragen over de trainingen. Vindbaar via hoofdnavigatie en footer. Machine-leesbaar via schema.org `FAQPage` JSON-LD.

## Aanpak

Translations-gedreven (aanpak A): alle content in `messages/{nl,en}.json` onder de `faq`-namespace, zodat `verify:i18n` NL/EN-pariteit bewaakt. Accordion met native `<details>/<summary>` — geen client-JS.

Afgewezen alternatieven: typed catalogue in `data/faq.ts` (geen niet-tekstuele velden, dus overkill) en markdown zoals `news/` (geen pipeline nodig; parity-check dekt markdown niet).

## Componenten

### 1. Route

- `app/[locale]/faq/page.tsx` — async server component naar het patroon van `app/[locale]/about/page.tsx`: `setRequestLocale`, `getTranslations('faq')`, `metadataFor('/faq', 'pages.faq')`.
- Layout: `max-w-3xl`, h1 + intro, daaronder de accordion-items, onderaan een CTA-link naar `/contact`.

### 2. Content (messages)

Nieuwe namespace in **beide** message-files:

```jsonc
"faq": {
  "title": "…",
  "intro": "…",
  "items": [ { "question": "…", "answer": "…" } ],  // 9 items, indices NL == EN
  "ctaLabel": "…",   // "Staat je vraag er niet tussen?"
  "ctaLink": "…"     // "Neem contact op"
}
```

Plus `meta.pages.faq.title` / `.description` in beide files.

Antwoorden zijn plain text (geen inline links) — houdt accordion én JSON-LD simpel. Doorverwijzen gebeurt via de vaste CTA onderaan.

De 9 vragen (NL; EN is vertaling; certificaat-vraag bewust weggelaten):

1. Wat is agentic engineering? — AI-agents die code genereren en verifiëren, aangestuurd door een engineer.
2. Voor wie is de training? — Basic: hele DevOps-teams (dev, QA, ops) + managers; Advanced: tech leads, staff+, managers.
3. Welke voorkennis heb ik nodig? — git + command line, één programmeertaal, laptop met Claude Code/OpenCode + Claude Pro; Advanced vereist Basic of vergelijkbare ervaring.
4. Wat kan ik na afloop? — Basic: werkende feature op starter repo, failure modes, test-first, hooks/quality gates, MCP, governance-starter. Advanced: 90-dagen rolloutplan, subagents, policy via CI, observability/cost guardrails.
5. Wat is het format en de duur? — Basic 2 dagen (16 u), Advanced 1 dag (8 u); remote, in-company of open inschrijving.
6. Werken jullie met Claude Code, welke tools? — Claude Code centraal (OpenCode kan ook); MCP servers, hooks, subagents, CI-integratie.
7. Wat kost het, en zijn er kortingen? — €999 p.p. excl. btw (beide trainingen); early-bird op aangekondigde cohorts; referral-code geeft korting bij boeking.
8. Kan het in-company? — Ja, beide trainingen; aanvragen via contactformulier.
9. In welke taal wordt de training gegeven? — Nederlands en Engels, beide beschikbaar.

> Exacte NL/EN-formuleringen worden bij implementatie geschreven en door Jorick gereviewd.

### 3. SEO / JSON-LD

- `buildFaqJsonLd({ items })` in `lib/structured-data.ts` (conventie: JSON-LD alleen daar). Pure functie: `{question, answer}[]` → `FAQPage` met `Question`/`acceptedAnswer`-nodes.
- Gerenderd op de FAQ-pagina via bestaand `components/JsonLd.tsx`.
- `/faq` toevoegen aan `PATHS` in `app/sitemap.ts`.
- Kanttekening: Google toont FAQ rich results sinds 2023 vrijwel alleen voor overheids-/gezondheidssites; schema blijft nuttig voor AI-assistants en crawlers.

### 4. Navigatie

- `nav.faq` key in beide message-files.
- Link toevoegen in `components/Nav.tsx`, `components/MobileMenu.tsx` en `components/Footer.tsx` (pagina's-kolom).

### 5. UI-detail

- Native `<details>/<summary>` per item; `summary` gestyled naar sitepalet (tokens uit `app/globals.css`, richtlijnen `DESIGN.md`: JetBrains Mono display, OKLCH-tokens).
- Geen client component nodig; geen state.

## Testen

- Unit (vitest): `buildFaqJsonLd` — juiste `@type`s, alle items aanwezig, tekst ongewijzigd.
- CI-gates die de rest dekken: `verify:i18n` (pariteit), `typecheck`, `lint`, `build`.
- Geen aparte e2e.

## Randvoorwaarden

- `readme-check` pre-commit hook: README.md in dezelfde commit bijwerken met nieuwe route.
- Alle nieuwe translation keys in **beide** `messages/*.json`, anders faalt CI.
