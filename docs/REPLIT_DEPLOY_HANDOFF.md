# Replit Deploy Handoff

Last verified from this workspace: 2026-06-04.

This handoff is for taking the already-merged launch website from GitHub `main` into the existing Replit production deployment. It does not contain secret values.

## Source Baseline

- GitHub repo: `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`
- Production branch: `main`
- Current verified main merge: `036c606` (`Update launch cutover status (#16)`)
- Minimum launch app commit: `4caddfc` (`Fix mobile launch navigation (#15)`)
- Replit config file: `.replit`
- Replit deployment target: `autoscale`
- Build command: `npm run build`
- Start command: `npm run start`
- Runtime port: `5000`

## Replit Deployment Steps

1. Open the existing Replit project connected to this website repo.
2. Sync or pull the latest GitHub `main` branch.
3. Confirm the deployed source is at `4caddfc` or newer.
4. Confirm `.replit` still uses autoscale deployment with build `npm run build` and run `npm run start`.
5. Add the required production environment variables in Replit Secrets or Deployment environment settings.
6. Set `APP_BUILD_COMMIT` to the deployed Git commit if Replit does not automatically expose a supported Git commit variable.
7. Run `npm run env:production` in the Replit shell or an equivalent secret-safe host check.
8. Deploy the autoscale app.
9. Check the Replit deployment URL before touching DNS by running `npm run smoke:live -- --base=<replit-deployment-url> --canonical=https://pegasusdreamscapes.com --expected-commit=<sha> --skip-dns`, then confirm:
   - `/api/health` returns JSON with `service: "pegasus-dreamscapes-website"`.
   - `/api/health` includes `build.shortCommit` matching the expected deploy commit.
   - `/api/readiness` returns `200` with `status: "ready"`.
   - `/robots.txt` returns the public robots file.
   - `/sitemap.xml` returns production URLs for the launch route set.
10. Attach the production custom domains in Replit.
11. Move DNS records at the domain registrar to the exact records Replit provides for the custom domain.
12. Wait for DNS propagation.
13. Run `npm run smoke:live -- --expected-commit=<sha>`.
14. Submit one real production `/submit` smoke and confirm both Pegasus HQ intake receipt and staff notification email delivery.
15. Complete qualified legal/compliance review before public QR/card distribution.

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
- `APP_BUILD_COMMIT` for deployed commit proof if Replit does not expose another supported Git commit environment variable

## DNS Cutover Notes

The latest local DNS check showed Squarespace records still serving the public domain:

- Apex A records: `198.185.159.144`, `198.185.159.145`, `198.49.23.144`, `198.49.23.145`
- `www` CNAME: `ext-sq.squarespace.com`

Replace those records with the exact DNS records shown by Replit custom domains. Do not guess or hard-code a Replit target without confirming it in Replit.

## Current Replit Preview Status

Checked on 2026-06-04:

- `https://41a8aaaf-db4e-44db-8781-c0795f489b15-00-3hxadsutgm3ci.spock.replit.dev`
- Pre-DNS smoke failed because the URL returned Replit's `Run this app to see the result` 404 shell for the homepage, `/api/health`, `/api/readiness`, `/robots.txt`, and `/sitemap.xml`.

This URL is not a valid production candidate until it serves the Pegasus Express app and passes:

`npm run smoke:live -- --base=<replit-deployment-url> --canonical=https://pegasusdreamscapes.com --expected-commit=<sha> --skip-dns`

## Do Not Launch If

- The deployed source is older than `4caddfc`.
- The deployment cannot prove the expected commit through `/api/health` build metadata.
- The Replit deployment URL shows `Run this app to see the result`.
- `/api/readiness` returns `503` or lists missing required configuration.
- `pegasusdreamscapes.com` still resolves to Squarespace.
- `/submit` does not create the expected Pegasus HQ intake record.
- Staff notification email is not delivered.
- Legal/compliance review is not complete.
