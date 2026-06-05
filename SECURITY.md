# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in this project, please report it **privately**. Do not open a public GitHub issue, pull request, or discussion — that exposes the issue before a fix is available.

Report by either:

- Using GitHub's **[Private vulnerability reporting](https://github.com/QualityAtSpeed/agenticengineering-nl/security/advisories/new)** (Security tab → "Report a vulnerability"), or
- Emailing **hello@agenticengineering.nl** with the details.

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce (proof-of-concept if possible).
- Affected URL, file, or component.

## What to expect

- We aim to acknowledge your report within **5 business days**.
- We will keep you informed of progress toward a fix.
- Once resolved, we are happy to credit you in the advisory unless you prefer to remain anonymous.

## Scope

This repository is the marketing and intake website for the Agentic Engineering training programme. Relevant concerns include the contact-form API (`/api/contact`), the email pipeline (Resend), security headers, and any handling of user-submitted input.

Please act in good faith: do not run automated scanners against the production site at a rate that degrades service, and do not access, modify, or exfiltrate data that is not your own.
