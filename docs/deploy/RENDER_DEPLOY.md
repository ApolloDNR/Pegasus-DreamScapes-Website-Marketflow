# Render Deploy Runbook — Pegasus DreamScapes

Last updated: 2026-07-30. Pairs with `render.yaml` at the repo root.

This gets pegasusdreamscapes.com live on Render with the database on Neon
and auth on Supabase. Total hands-on time: roughly 30–45 minutes.

## Why this shape

- The app no longer needs Replit to boot (Replit OIDC is optional as of the
  `feature/portable-auth` change; users sign in through Supabase at `/signup`).
- The code already speaks Neon's serverless Postgres driver, so a Neon
  `DATABASE_URL` works with zero code changes.
- Render's `starter` web service is a flat, predictable monthly price —
  no usage-based surprises.

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

Email delivery deliberately fails visibly when SendGrid is missing and never
prints message bodies to logs. Verify the sender and prove staff plus customer
receipt before broad launch.

The HQ recovery worker also reclaims a `forwarding` row after its five-minute
lease expires. This protects queued intake from a process restart between the
database status change and the outbound request; HQ still owns idempotency for
safe replay.

## Step 4 — Prove the Render release candidate

Keep Squarespace serving the public domain. Run Step 5 against the
`onrender.com` URL, including a marked intake whose database row, HQ outbox
state, HQ receipt, and both notification emails are confirmed. Check desktop,
tablet, and mobile layouts there before changing DNS.

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

## Step 6 — Launch smoke test (10 minutes)

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
- Turn on Supabase auth hardening: leaked-password protection and
  additional MFA options (Supabase → Authentication → Settings) — these
  are currently flagged by the security advisor.
- Move to Option B (own Neon account) if you launched on Option A.
- Decommission the Replit deployment once the domain is stable to stop
  double-spending.
