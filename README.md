# Pegasus DreamScapes Website + MarketFlow

## Overview
Public website for Pegasus Dreamscapes (Development • Investments • Systems) plus MarketFlow private beta workflows.

## Local setup
1. Install deps: `npm install`
2. Copy env vars into `.env`
3. Run development server: `npm run dev`

## Required environment variables
See `.env.example` for the complete deployment-ready variable list.

## Pegasus HQ intake bridge
Public property submissions from `/sell`, `/submit`, and the legacy `/api/seller-leads` endpoint are bridged into Pegasus HQ through `PEGASUS_HQ_PUBLIC_INTAKE_URL`.

Default target:
`https://pegasus-hq-operating-system.vercel.app/api/public/intake`

This keeps real property opportunities in HQ's canonical `Submission -> Seed` operating spine instead of creating website-only intake records. Non-property inquiries such as contact, investor, vendor, and MarketFlow access requests continue to use the website's existing lead paths.

## Commands
- Dev: `npm run dev`
- Typecheck/lint checks: `npm run check`
- Build: `npm run build`
- Production start: `npm run start`

## Deployment notes
- Configure all production environment variables.
- Configure Supabase Auth Site URL and allowed redirect URLs for your production domain.
- Configure outbound email provider (SendGrid) and verified sender address.
- Confirm database migration/push workflow used by your host before deploy.
- App should run on a standard Node host that supports `npm run build` and `npm run start`.

## Production deployment checklist
1. `npm install`
2. `npm run check`
3. `npm run build`
4. `npm run start`

Production runtime expectations:
- Server respects `PORT` (defaults to `5000` if unset).
- In production, the server serves API routes and the built Vite client from `dist/public`.
- Build output includes server bundle at `dist/index.js` and static client assets in `dist/public`.

## CMS content override launch checklist
`SiteContentProvider` loads homepage editable content from `/api/site-content`. Existing database values override local fallback copy on the home page. Before launch, confirm these keys in your production `site_content` table are either empty/removed or set to approved values:

- `home.hero.kicker` → `Development • Investments • Systems`
- `home.hero.line1` → `Real estate execution,`
- `home.hero.line2` → `built with`
- `home.hero.line3` → `discipline.`
- `home.hero.subheadline` → `Pegasus Dreamscapes is a real estate development, investment, and systems company built to source opportunities, structure deals, manage execution, and create long-term value.`
- `home.hero.cta_primary` → `Submit a Property`
- `home.hero.cta_secondary` → `Explore MarketFlow`
- `home.stats.0.value` → `Founder-Led`
- `home.stats.0.label` → `Execution Focus`
- `home.stats.1.value` → `East Bay`
- `home.stats.1.label` → `Local Roots`
- `home.stats.2.value` → `Three Pillars`
- `home.stats.2.label` → `Development • Investments • Systems`
- `home.stats.3.value` → `Private Beta`
- `home.stats.3.label` → `MarketFlow in Active Development`
- `home.testimonials.kicker` → `Operating Principles`
- `home.testimonials.title` → `Discipline Before Scale`
- `home.testimonials.description` → `The standards guiding Pegasus Dreamscapes as we build, invest, and systemize real estate execution.`

## Email notification checklist (SendGrid)
- Seller leads should notify `STAFF_NOTIFICATION_EMAIL`.
- Investor/partner inquiries should notify `STAFF_NOTIFICATION_EMAIL`.
- Contact form submissions should notify `STAFF_NOTIFICATION_EMAIL`.
- Submit-deal / offer notifications should notify `STAFF_NOTIFICATION_EMAIL`.
- `DEFAULT_FROM_EMAIL` must be a verified sender in SendGrid.
- If `SENDGRID_API_KEY` is missing, the server logs the email payload fallback and does not crash.

## Supabase auth production checklist
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- In Supabase Auth settings, set Site URL to the production domain (for example `https://pegasusdreamscapes.com`).
- Add allowed redirect URLs for production and canonical auth callback paths used by this app.
- Validate login redirect flow from production.
- Validate signup redirect flow from production.
- Validate logout redirect flow back to public site.
- If Replit Auth is enabled, also set `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET`, and verify there is no conflicting auth UX with Supabase-authenticated areas.

## Public route launch QA checklist
Check each route before launch:
- `/`
- `/about`
- `/services`
- `/sell`
- `/invest`
- `/buyers`
- `/submit-deal`
- `/marketflow`
- `/contact`
- `/privacy`
- `/terms`

For each route verify:
- Page renders without visible runtime errors.
- Nav + footer links work.
- No fake stats or fake testimonials are visible.
- No placeholder phone number appears.
- No unsupported DRE/BBB/A+ claims appear.
- No public investment return claims appear.
- MarketFlow is clearly labeled as private beta.
- Forms show success and error states.
- Mobile layout is acceptable.

## Performance note
Current build may emit large chunk-size warnings. Treat this as a post-launch optimization unless a minimal, low-risk improvement is identified.

## Known beta limitations
- MarketFlow is private beta; features and access may be limited.
- Advanced role dashboards are still in-progress.
- Deal visibility/matching workflows are review-based during beta.
