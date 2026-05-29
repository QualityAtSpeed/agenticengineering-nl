# Product

## Register

brand

## Users

Engineering teams, tech leads, and CTOs in NL/EU adopting agentic workflows with Claude Code. Mix of junior/mid devs new to Claude Code and seniors already using it. They visit on desktop during work hours, evaluate whether the trainings are technically credible, and decide whether to recommend them to their team or sign up themselves. They do not want to be sold to. They want to see the curriculum, the price, who teaches it, and proof the operator is competent.

## Product Purpose

Marketing site for `agenticengineering.nl`. Sells two trainings: Basic (2 days) and Advanced (1 day), in Claude Code with agentic workflows. The site exists to convert qualified leads into contact-form submissions; success is a booked training. Trust is built by showing — full curriculum visible, real instructor, working contact flow — not by repeating marketing claims.

Bilingual NL / EN with `/[locale]` routing. Primary audience is Dutch engineering teams; English is for international reach and to demonstrate the trainings can be delivered in either language.

## Brand Personality

Expert, pragmatic, confident. Voice is direct and lowercase-comfortable, like a senior engineer explaining a workflow. No exclamation marks, no hype, no "unlock", no "revolutionary". Technical specifics over abstract benefits. Show prices, show the 15 module titles with bullets, show the test/CI badges if relevant. Visual register is friendly-formal: white surface, blue brand-deep headlines, green action color. Restrained, not playful; legible, not loud.

## Anti-references

What this must NOT look like:

- **Consulting-firm corporate.** Navy palette, headshot grids, capability buzzwords ("digital transformation", "synergy"), Big-4 / McKinsey aesthetic. The site is not Deloitte's training arm.
- Generic SaaS landing pages (purple-to-pink gradients, hero-metric grids, stock dev illustrations).
- Bootcamp / online-course-mill energy (countdown timers, "ENROLL NOW" red CTAs, testimonial carousels, sticker badges).
- AI-tool sameness (gradient on black, sparkle icons, "agents that ship" taglines, vague "build the future" hero copy).

## Design Principles

1. **Practice what you preach.** The site itself is built with agentic engineering — visible CI, real tests, locale parity enforced, security headers live. Engineers can inspect the source on GitHub and find it consistent with what the training teaches.
2. **Show, don't tell.** Curriculum modules with bullets are above the fold of the trainings section. Price, duration, delivery formats are shown — not gated behind "Contact us for pricing".
3. **Restraint with one signal.** Action green (`#1f8f50`) is reserved for primary CTAs and success states; brand blue (`#0b6fb0` / `#0a4d7a`) carries identity in headlines, links, and the logo. Surfaces stay white or near-white. Everywhere else is neutral.
4. **Dev-respect copy.** Treat readers as senior engineers. Lowercase CTA verbs (`book training`, `view curriculum`). No marketing punctuation. Plain technical English (or plain technical Dutch).
5. **Bilingual without translation rot.** NL and EN message keys are checked at parity in CI; both locales are first-class, not "NL with EN as afterthought".

## Accessibility & Inclusion

WCAG 2.1 AA across all routes. Enforced by `e2e/a11y.spec.ts` (axe-core, runs in CI). `prefers-reduced-motion` honored, all transitions clamped to `0.01ms`. Focus rings visible (brand-blue 2px). Skip-to-content link in layout. No information conveyed by color alone; labels and icons accompany every semantic color. Dutch as primary `lang` attribute; English locale switches `html lang="en"` for screen readers.
