# Render Deploy Runbook — Pegasus DreamScapes

Last updated: 2026-09-14. Pairs with `render.yaml` at the repo root.

This gets pegasusdreamscapes.com live on Render with the database on Neon
and auth on Supabase. Total hands-on time: roughly 30–45 minutes.

## Why this shape

- The app no longer needs Replit to boot (Replit OIDC is optional as of the
  `feature/portable-auth` change; users sign in through Supabase at `/signup`).
- The code already speaks Neon's serverless Postgres driver, so a Neon
  `DATABASE_URL` works with zero code changes.
- Render's `starter` web service is a flat, predictable monthly price —
  no usage-based surprises.

## Provisioning checkpoint

The connected Vercel `pegasus-dreamscapes-preview` project is a protected,
non-indexable review destination. It does not replace the Render production
destination in this runbook. Render service settings, the website's Neon
database, and SendGrid sender configuration were not accessible through the
connected tools during the September 13 review; their production readiness
remains unverified.

The connected Supabase project `knfmdyufodbnqsgkzhqw` is healthy, but a read-only
schema check confirmed that it has no `public.opportunities`, `public.hq_outbox`,
or `public.admin_audit_log` tables. That is the HQ/auth project, not evidence
that the separate website database is ready. Keep website launch migrations
on the reviewed Neon database named by `DATABASE_URL`.

To finish provisioning, make the existing Render service and website database
available, confirm the database backup, and configure the variables in Step 3
in the host's secret settings. Confirm the SendGrid-verified sender, the staff
recipient, and the deployed HQ intake endpoint. Do not paste credentials into
chat, commit them, copy preview defaults into production, or provision a
replacement backend without resolving the existing data destination.

## Step 0 — Protect the data you already have

Your current production data lives in the Replit-provisioned database.
Before anything else, from the Replit workspace shell:

```bash
pg_dump "$DATABASE_URL" --format=custom --file=pegasus-backup-$(date +%Y%m%d).dump
```

Download that file and keep it somewhere safe. This is the rollback of last
resort no matter what else happens.

## Step 1 — Database (pick ONE)

**Option A — keep the existing Replit database (fastest, zero migration).**
Replit's Postgres is Neon under the hood and its `DATABASE_URL` works from
outside Replit. Copy `DATABASE_URL` from the Replit workspace secrets and use
it in Step 3. Risk to accept: the database's lifecycle stays tied to your
Replit account/billing. Fine for launch week; plan Option B soon after.

**Option B — own Neon account (recommended long-term).**
1. Create a free account at neon.tech, then a project named `pegasus-prod`
   (region: US West to match Supabase).
2. Copy its connection string (the pooled one).
3. Restore your data into it:
   `pg_restore --no-owner --dbname "<NEON_URL>" pegasus-backup-<date>.dump`
4. Against a disposable staging database first, review and apply the explicit
   SQL in `migrations/`, including `0004_hq_outbox_delivery.sql` and
   `0005_public_opportunities.sql`. Apply the same reviewed files to production
   only after the staging restore and intake smoke pass.

For a completely empty database, `npm run db:push` can create the wider legacy
schema, but it is interactive and not the production migration record. Run it
only against an empty staging database, inspect the generated changes, then
retain the reviewed SQL artifacts used for production.

## Step 2 — Supabase auth configuration

In the Supabase dashboard for project `knfmdyufodbnqsgkzhqw`
(Pegasus Command Center):

1. Authentication → URL Configuration:
   - Site URL: `https://pegasusdreamscapes.com`
   - Additional redirect URLs: `https://www.pegasusdreamscapes.com`,
     `https://pegasus-dreamscapes.onrender.com` (Render's default URL,
     exact value visible after Step 3), and your local dev URL.
2. Project Settings → API: copy the `anon` key and the `service_role`
   key for Step 3. The service-role key is what lets the server verify
   user tokens and perform admin operations — treat it like a password.
3. Keep Supabase for auth. Canonical website opportunities and `hq_outbox`
   live in the Postgres database named by Render's `DATABASE_URL`; apply the
   launch SQL there, not to an unrelated Supabase database.
4. Before staging traffic, run a read-only inventory of `pg_policies`, table
   and effective column grants, exposed views, default privileges, sequences,
   and every `SECURITY DEFINER` function across each exposed Data API schema.
   Apply `supabase-rls-hardening.sql` only after that inventory is reviewed and
   backed up. Ordinary authenticated users must not have effective `EXECUTE`
   on privileged admin functions, including access inherited through `PUBLIC`.
   Any intentionally client-callable `SECURITY DEFINER` function must enforce
   authorization internally and fail a normal-user RPC test. The repository's
   read-only inventory is `docs/deploy/SUPABASE_LAUNCH_VERIFICATION.sql`.

## Step 3 — Render

1. Create an account at render.com (sign in with GitHub).
2. New → Blueprint → select `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`.
   Render reads `render.yaml` and shows the `pegasus-dreamscapes` service.
3. Fill in the env vars it asks for:

   | Variable | Where it comes from |
   |---|---|
   | `DATABASE_URL` | Step 1 (Replit secret or Neon dashboard) |
   | `SUPABASE_URL` | `https://knfmdyufodbnqsgkzhqw.supabase.co` |
   | `SUPABASE_ANON_KEY` | Supabase → Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (secret!) |
   | `SENDGRID_API_KEY` | SendGrid dashboard (required for production readiness) |
   | `DEFAULT_FROM_EMAIL` | e.g. `apollo@pegasusdreamscapes.com` (must be a SendGrid-verified sender) |
   | `STAFF_NOTIFICATION_EMAIL` | where intake notifications go, e.g. `apollosynd@gmail.com` |
   | `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI dashboard (powers Peggy) |
   | `PEGASUS_HQ_PUBLIC_INTAKE_URL` | Explicit HTTPS production HQ intake endpoint (required in production) |
   | `GOOGLE_MAPS_API_KEY` / `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud console, if maps are enabled |

4. Render waits for the GitHub `launch verification` check before deploying.
   First build takes roughly 5–8 minutes. The service URL will look like
   `https://pegasus-dreamscapes.onrender.com`.
5. Confirm `/api/ready` returns 200. A 503 means the required launch tables or
   columns, production email settings, or HTTPS HQ contract is incomplete; do
   not attach the public domain.

Keep `SITE_INDEXABLE=false` through release-candidate verification. Indexing
is a separate, explicit cutover step below; `APP_ENV=production` alone does
not enable it. `SESSION_SECRET` is generated by the Render Blueprint. Maps
keys are optional when maps are disabled, and Replit OIDC variables are needed
only if that authentication method is deliberately enabled. The launch smoke
requires the ten variables listed in `scripts/launch-intake-smoke.mjs`;
checking names alone does not establish valid credentials, sender verification,
or delivery.

Email delivery deliberately fails visibly when SendGrid is missing and never
prints message bodies to logs. Verify the sender and prove staff plus customer
receipt before broad launch.

The HQ recovery worker also reclaims a `forwarding` row after its five-minute
lease expires. This protects queued intake from a process restart between the
database status change and the outbound request; HQ still owns idempotency for
safe replay.

## Step 4 — Prove the Render release candidate

Start with the read-only check:

```bash
npm run smoke:launch -- --base-url https://YOUR_RENDER_SERVICE
```

This requires JSON health and database/configuration readiness. It does not
prove valid authentication, HQ delivery, or email delivery. A missing setting,
HTML sign-in response, redirect, timeout, or unready database must not be
treated as a pass.

Keep Squarespace serving the public domain. Run Step 6 against the
`onrender.com` URL, including a marked intake whose database row, HQ outbox
state, HQ receipt, and both notification emails are confirmed. Check desktop,
tablet, and mobile layouts there before changing DNS.

Verify the deployed HQ request and response contract before this smoke. On
September 13, a read-only GET to the [latest connected HQ deployment's intake
endpoint](https://pegasus-hq-operating-system-3g7b13hab-apollosynd-8973s-projects.vercel.app/api/public/intake)
returned 503 `not_configured`. It advertised contract version 2 with required
fields `contractVersion`, `idempotencyKey`, and `submission`, and success fields
`ok`, `reference`, `statusUrl`, and `message`. The website still sends a flat
payload. It now accepts either a legacy `hq_submission_id` or a validated
public reference, as detailed in [HQ contract readiness](../qa/hq-contract-readiness.md).
Pointing its environment variable at this endpoint alone will not complete
the integration. Resolve the contract,
receipt identifiers, and non-property inquiry handling against the intended
deployed receiver before enabling forwarding. Do not substitute the older HQ
`main` contract for deployed evidence. A 2xx response without a traceable HQ
receipt is insufficient launch evidence, and website `/api/ready` does not
prove remote HQ delivery.

## Step 5 — Domain

1. Render → the service → Settings → Custom Domains → add
   `pegasusdreamscapes.com` and `www.pegasusdreamscapes.com`.
2. Render shows the DNS records it needs. In Squarespace (where the domain
   is parked) → Domains → DNS settings:
   - apex `pegasusdreamscapes.com`: `A` record → the IP Render displays
   - `www`: `CNAME` → the `*.onrender.com` target Render displays
   - Remove the Squarespace parking records for those hosts.
3. Wait for DNS + certificate (minutes to ~an hour). Render shows both green.

Preserve MX, SPF, DKIM, DMARC, verification, and other non-website DNS records.
Remove only the Squarespace website records that conflict with Render.

After the canonical domain has valid SSL and passes the live smoke, set
`SITE_INDEXABLE=true` on the **Render production service only**, retaining
`APP_ENV=production`. Apply the environment update using Render's normal
deployment flow and recheck the public domain. Both values are required by
`server/deployment-policy.ts`; even then only requests to
`pegasusdreamscapes.com` are indexable. Verify the canonical site's
`/robots.txt`, response headers, canonical URLs, and `/sitemap.xml` allow the
intended public routes. Confirm that `www` redirects to the canonical apex.

Never enable indexing on Vercel previews or the `onrender.com` review URL.
Those hosts must retain `noindex` and disallow crawling. The Vercel config's
preview environment and `X-Robots-Tag` header must remain unchanged.

## Step 6 — Launch smoke test (10 minutes)

After the environment, HQ contract, and test notifications are authorized,
choose a test mailbox you control and run:

```bash
npm run smoke:launch -- --base-url https://YOUR_RENDER_SERVICE --post-test-lead --test-email YOUR_AUTHORIZED_TEST_EMAIL
```

The CLI checks health/readiness first and sends one marked opportunity. The
test recipient is explicit; no hardcoded phone or default mailbox is used.
It requires HTTP 201 with the canonical UUID and `New` status. Preserve that
UUID as the correlation reference while checking the database, HQ outbox and
receiver receipt, and both email receipts. A queued outbox is still pending.
If the POST fails or returns an ambiguous receipt, inspect existing records
before rerunning to avoid a duplicate. The CLI never automatically retries.

Run this on the Render release candidate first, then repeat on
https://pegasusdreamscapes.com after cutover (URLs below are the v5.1 spine —
`/property-owners`, `/deal-partners`, `/how-we-operate`, `/our-work`,
`/bring-an-opportunity` — the old `/sellers`, `/dealfinders`,
`/deal-strategy`, `/submit-property` paths 301-redirect to them):

1. `/` renders (hero: "Complex real estate, made executable."),
   dark-mode toggle works, no console errors.
2. `/bring-an-opportunity` → pick "A property I own" → complete a real
   test submission → confirm the intake record exists (and the
   notification email if SendGrid is set).
3. `/bring-an-opportunity?intent=deal-jv` lands mid-flow on the
   Property step with the deal-finder path preselected.
4. `/strategy-lab` → "Begin a read" → an analysis runs end to end.
5. `/signup` → create a test account → sign in → a protected action
   works (e.g. saving an analysis).
6. `/our-work` — Nelson Drive photos load; numbers block shows
   Acquired/Built/All-in/Sold and the "not net profit" disclosure.
7. `/property-owners`, `/deal-partners`, `/how-we-operate` render;
   legacy `/sellers` redirects to `/property-owners`.
8. `/privacy`, `/terms`, `/disclosures` load; footer identity paragraph
   (KW East Bay · CA DRE #02333658) present on every page.
9. Talk to Peggy opens; greeting identifies her as an AI concierge.
10. Phone check: no horizontal scroll on `/`, `/bring-an-opportunity`,
    `/our-work`, `/strategy-lab`; mobile menu opens and navigates.

## Rollback

- Bad deploy: Render → Deploys → "Rollback" to the previous build (instant).
- Bad code: revert the commit on `main`; Render deploys the revert after CI
  checks pass.
- Database: restore the Step-0 dump into a fresh database and point
  `DATABASE_URL` at it.

## After launch

- Watch Render logs for the first day (Render → Logs).
- Move to Option B (own Neon account) if you launched on Option A.
- Decommission the Replit deployment once the domain is stable to stop
  double-spending.
