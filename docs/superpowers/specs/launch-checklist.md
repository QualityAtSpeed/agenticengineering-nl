# agenticengineering.nl — Launch checklist

Run this list before flipping prod DNS / before first promotion.

## Content

- [ ] Real prices set in `data/trainings.ts`
- [ ] Real KVK + address + VAT in `messages/*.json` `impressum` keys
- [ ] Real social URLs in `components/Footer.tsx`
- [ ] Real collaborator bios + photos under `public/instructors/`
- [ ] Logo replaced in `public/logo.svg`
- [ ] OG images under `public/og/{nl,en}.png`

## Infrastructure

- [ ] Vercel project linked to `main` for prod
- [ ] DNS A/CNAME for `agenticengineering.nl` → Vercel
- [ ] Resend domain verification (SPF, DKIM, DMARC) for `agenticengineering.nl`
- [ ] Env vars in Vercel: `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL`

## Security

- [ ] securityheaders.com — grade A or A+
- [ ] Mozilla Observatory — B+ or higher
- [ ] `pnpm audit` clean
- [ ] CodeQL (GitHub default) clean
- [ ] gitleaks clean on full repo
- [ ] Manual: header-injection attempt on form rejected (curl with `\r\n` in name)
- [ ] Manual: rate-limit fires after 5 requests/minute from one IP
- [ ] Manual: cross-origin POST returns 403
- [ ] Manual: oversize message (>5000 char) returns 400
- [ ] TLS cert valid + HSTS preload-eligible

## Functional

- [ ] CI green on `main`
- [ ] Both locales render hero, trainings, about, contact, impressum
- [ ] Language switcher preserves path on every page
- [ ] Contact form delivers email to `CONTACT_EMAIL`
- [ ] All 8 Basic modules + 7 Advanced modules render with bullets

## Performance

- [ ] Lighthouse mobile: Performance ≥95, A11y 100, BP ≥95, SEO 100
- [ ] LCP < 2.5s on throttled mobile

## Risks (track if not yet resolved)

- [ ] Privacy policy / cookie notice (recommended before public traffic)
- [ ] T&C / terms of training engagement (before first paid booking)
- [ ] Upstash/Vercel KV for distributed rate-limit (before scale or multi-region)
