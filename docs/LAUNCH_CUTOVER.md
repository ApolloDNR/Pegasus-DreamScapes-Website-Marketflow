# Pegasus Dreamscapes Launch Cutover

Last verified from this workspace: 2026-06-04.

## Current External Blocker

`main` contains the launch website and health/readiness checks, but the public domain is not serving that Node app yet.

Observed DNS:

- `pegasusdreamscapes.com` resolves to Squarespace IPs: `198.49.23.145`, `198.185.159.144`, `198.49.23.144`, `198.185.159.145`.
- `www.pegasusdreamscapes.com` is a CNAME to `ext-sq.squarespace.com`.

That means the public domain is still on Squarespace. It cannot prove `/api/health`, `/api/readiness`, or the Pegasus HQ intake bridge until DNS points to the deployed Node host.

## Source Baseline

- GitHub repo: `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`
- Production branch: `main`
- Current verified main merge: `c40f3f4` (`Add live launch cutover smoke`)
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
6. Point `pegasusdreamscapes.com` and `www.pegasusdreamscapes.com` away from Squarespace and to the production host.
7. Wait for DNS propagation.
8. Run `npm run smoke:live`.
9. Submit one real production `/submit` smoke test and verify both Pegasus HQ intake receipt and staff notification email delivery.
10. Complete qualified legal/compliance review before public QR/card distribution.

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
- `npm run smoke:live`

`npm run smoke:live` intentionally fails while the domain still points at Squarespace or `/api/readiness` is not ready.
