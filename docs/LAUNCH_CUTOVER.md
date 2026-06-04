# Pegasus Dreamscapes Launch Cutover

Last verified from this workspace: 2026-06-04.

## Current External Blocker

`main` contains the launch website and health/readiness checks, but the public domain is not serving that Node app yet.

Observed DNS:

- `pegasusdreamscapes.com` resolves to Squarespace IPs: `198.49.23.145`, `198.185.159.144`, `198.49.23.144`, `198.185.159.145`.
- `www.pegasusdreamscapes.com` is a CNAME to `ext-sq.squarespace.com`.

That means the public domain is still on Squarespace. It cannot prove `/api/health`, `/api/readiness`, or the Pegasus HQ intake bridge until DNS points to the deployed Node host.

Known Replit preview checked on 2026-06-04:

- `https://41a8aaaf-db4e-44db-8781-c0795f489b15-00-3hxadsutgm3ci.spock.replit.dev`
- Pre-DNS smoke with `--skip-dns` failed because the URL returned Replit's `Run this app to see the result` 404 shell for the homepage, `/api/health`, `/api/readiness`, `/robots.txt`, and `/sitemap.xml`.
- Treat that URL as not deployed until it returns the Pegasus Express health JSON and production readiness JSON.

## Source Baseline

- GitHub repo: `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`
- Production branch: `main`
- Current verified main merge: `4caddfc` (`Fix mobile launch navigation (#15)`)
- Replit deployment config: `.replit`
- Build command: `npm run build`
- Start command: `npm run start`
- Runtime port: `5000`

## Host Cutover Steps

1. Deploy the latest `main` branch to the production Node host.
2. Configure the required production environment variables in the host. Do not paste secrets into chat.
3. Run `npm run env:production` in the host environment or an equivalent secret-safe host check.
4. Confirm the host serves `GET /api/health` with JSON from `pegasus-dreamscapes-website`.
5. Confirm `GET /api/readiness` returns `200` and `status: "ready"`.
6. Before moving DNS, run `npm run smoke:live -- --base=<deployment-url> --canonical=https://pegasusdreamscapes.com --skip-dns` against the deployed host URL.
7. Point `pegasusdreamscapes.com` and `www.pegasusdreamscapes.com` away from Squarespace and to the production host.
8. Wait for DNS propagation.
9. Run `npm run smoke:live`.
10. Submit one real production `/submit` smoke test and verify both Pegasus HQ intake receipt and staff notification email delivery.
11. Complete qualified legal/compliance review before public QR/card distribution.

## Required Production Environment

Hard launch variables:

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

Optional:

- `ISSUER_URL`
- `PORT`

## Verification Commands

- `npm run audit:launch`
- `npm run env:production`
- `npm run check`
- `npm run build`
- `npm test`
- `npm run smoke:live -- --base=<deployment-url> --canonical=https://pegasusdreamscapes.com --skip-dns`
- `npm run smoke:live`

`npm run smoke:live` intentionally fails while the domain still points at Squarespace or `/api/readiness` is not ready.
Use `--skip-dns` only for a pre-cutover deployment URL check, not for final production launch approval.

## Latest Local Verification Evidence

From local `main` at `4caddfc`:

- `npm run smoke:live` equivalent failed `6/6` because production DNS still resolves to Squarespace, the home page does not contain Pegasus Dreamscapes, API endpoints return HTML instead of JSON, and robots/sitemap are not public app assets.
- `npm run smoke:live -- --base=https://41a8aaaf-db4e-44db-8781-c0795f489b15-00-3hxadsutgm3ci.spock.replit.dev --canonical=https://pegasusdreamscapes.com --skip-dns` failed `5/5` because the Replit preview is not running the Pegasus Node app.
- Local code verification after PR #15: launch audit passed, TypeScript passed, production build passed, and full Vitest passed with 510 tests.
