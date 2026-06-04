# Pegasus Dreamscapes Website + MarketFlow

Public website for Pegasus Dreamscapes plus the reviewed MarketFlow private beta surface.

The launch surface is the public face for cards, QR traffic, property intake, Strategy Lab, Work With Apollo, and the private network story. It is not a public securities marketplace, not a guaranteed-offer funnel, and not a replacement for licensed real estate or professional review.

## Local Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill local values.
3. Run the development server: `npm run dev`
4. Run checks before pushing: `npm run verify:launch`

## Commands

- `npm run dev` - local development server.
- `npm run audit:launch` - static launch route, SEO, brand, asset, and copy guard.
- `npm run env:production` - no-secrets production environment readiness check.
- `npm run smoke:live` - live DNS, health, readiness, robots, sitemap, and homepage launch smoke. Use `npm run smoke:live -- --base=<deployment-url> --canonical=https://pegasusdreamscapes.com --skip-dns` only for a pre-DNS deployment URL check.
- `npm run check` - TypeScript check.
- `npm run build` - generate sitemap, build Vite client, copy public assets, and bundle server.
- `npm test` - Vitest suite.
- `npm run verify:launch` - launch audit, TypeScript, production build, and tests.
- `npm run start` - production server from `dist/index.cjs` on Linux/host environments.

## Runtime Health

- `GET /api/health` is a liveness check. It returns `200` when the Node process is serving requests.
- `GET /api/readiness` is a redacted launch wiring check. It returns `200` only when required production configuration is present and valid; otherwise it returns `503` with missing/invalid check names and no secret values.

## Required Production Environment

See `.env.example` for the deployment-ready variable list. Before launch, run `npm run env:production` in the host environment or locally with the production `.env` present. The checker reports missing/invalid keys without printing secret values.

Hard launch requirements:

- `DATABASE_URL`
- `SITE_URL=https://pegasusdreamscapes.com`
- `PEGASUS_HQ_PUBLIC_INTAKE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`
- `DEFAULT_FROM_EMAIL`
- `STAFF_NOTIFICATION_EMAIL`
- `SESSION_SECRET`
- `REPL_ID`

`ISSUER_URL` is optional if the default Replit OIDC issuer is correct. `PORT` is optional and defaults to `5000`.

## Pegasus HQ Intake Bridge

Public property submissions from `/submit`, legacy seller/deal aliases, and the legacy `/api/seller-leads` endpoint bridge into Pegasus HQ through `PEGASUS_HQ_PUBLIC_INTAKE_URL`.

Default target:

`https://pegasus-hq-operating-system.vercel.app/api/public/intake`

This keeps real property opportunities in HQ's canonical `Submission -> Seed` operating spine instead of creating website-only intake records. Contact, investor, vendor, and MarketFlow access requests continue to use the website's existing lead paths and staff notification email.

## Launch Route Set

Primary public routes to smoke before public distribution:

- `/`
- `/connect`
- `/submit`
- `/work-with-apollo`
- `/deal-architecture`
- `/strategy-lab`
- `/development`
- `/capital`
- `/marketflow`
- `/marketflow/access`
- `/peggy-ai`
- `/about`
- `/projects`
- `/projects/nelson-dr`
- `/ecosystem`
- `/dreamscaper-standard`
- `/library`
- `/vendor-network`
- `/contact`
- `/disclosures`
- `/privacy`
- `/terms`

Legacy routes such as `/sell`, `/invest`, `/services`, `/resources`, and `/submit-deal` are redirects or retired surfaces. They should not appear in the public sitemap.

For each public route verify:

- Page renders without visible runtime errors.
- Header, mobile navigation, footer, and primary CTA work.
- Copy uses locked `Pegasus Dreamscapes` casing.
- No guaranteed offers, guaranteed outcomes, public securities solicitation, fake testimonials, or unsupported claims appear.
- MarketFlow is clearly private beta / reviewed access, not a public marketplace.
- Work With Apollo keeps KW/DRE role separation visible.
- Legal pages are reachable from the footer.
- Mobile layout has no horizontal overflow or hidden primary action.

## Production Deployment Checklist

1. Confirm PR checks are green.
2. Configure production environment variables without exposing secrets in chat.
3. Run `npm run env:production` in the production environment.
4. Run `npm run build`.
5. Start with `npm run start`.
6. Confirm `https://pegasusdreamscapes.com` serves the app over SSL.
7. Confirm `/robots.txt` allows the public site and disallows private/admin/API surfaces.
8. Confirm `/sitemap.xml` lists the 22 launch routes with `https://pegasusdreamscapes.com` URLs.
9. Confirm `/og/default.png`, favicon, Apple touch icon, and brand SVGs load.
10. Confirm `/api/health` returns `200`.
11. Confirm `/api/readiness` returns `200` with no required failures.
12. Submit one real production `/submit` smoke test and verify both HQ intake receipt and staff email delivery.
13. Confirm Supabase Auth Site URL and redirect URLs for the production domain.
14. Complete qualified legal/compliance review before public QR/card distribution.

See `docs/LAUNCH_CUTOVER.md` for the current DNS/deployment cutover state and the exact live smoke gate. See `docs/REPLIT_DEPLOY_HANDOFF.md` for the Replit-specific sync, secrets, autoscale deploy, pre-DNS smoke, DNS, and no-launch checks. As of the latest local check, `pegasusdreamscapes.com` still resolves to Squarespace, so DNS must be moved to the production Node host before the site can be called live.

Production runtime expectations:

- Server respects `PORT`.
- Server bundle is `dist/index.cjs`.
- Static client assets and public launch assets are served from `dist/public`.
- `script/build.ts` regenerates sitemap files before each build and copies root `public` assets into `dist/public`.

## CMS Content Override Launch Checklist

`SiteContentProvider` loads homepage editable content from `/api/site-content`. Existing database values can override local fallback copy on the home page. Before launch, confirm production `site_content` rows are either empty/removed or set to approved values for the current homepage.

## Email Notification Checklist

- Property submissions should notify `STAFF_NOTIFICATION_EMAIL`.
- Investor/partner inquiries should notify `STAFF_NOTIFICATION_EMAIL`.
- Contact form submissions should notify `STAFF_NOTIFICATION_EMAIL`.
- MarketFlow access requests should notify `STAFF_NOTIFICATION_EMAIL`.
- `DEFAULT_FROM_EMAIL` must be a verified sender in SendGrid.
- If `SENDGRID_API_KEY` is missing, the server logs the email payload fallback and does not crash, but launch email smoke is not complete.

## Supabase Auth Checklist

- Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- In Supabase Auth settings, set Site URL to `https://pegasusdreamscapes.com`.
- Add allowed redirect URLs for production and canonical auth callback paths used by this app.
- Validate login, signup, and logout redirects from production.
- If Replit Auth remains enabled, also set `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET`.

## Known Post-Launch Maintenance

- Build may emit large chunk-size warnings; treat as a post-launch performance pass unless a low-risk code split is identified.
- Browserslist data may need routine refresh.
- The current public launch can ship before deep polishing of every historical/internal MarketFlow dashboard route, but private/admin surfaces must stay out of the public sitemap and robots policy.
