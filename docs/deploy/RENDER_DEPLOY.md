# Render Deploy Runbook — Pegasus DreamScapes

Last updated: 2026-07-12. Pairs with `render.yaml` at the repo root.

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
   (or, for a fresh start with no legacy data: run `npm run db:push` once
   locally with `DATABASE_URL=<NEON_URL>` to create the schema.)

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
3. SQL Editor: run `supabase-migration-opportunities.sql` from the repo
   root (adds the deal-routing opportunities tables) if not yet applied.

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
   | `SENDGRID_API_KEY` | SendGrid dashboard (or leave blank to launch without email, see note) |
   | `DEFAULT_FROM_EMAIL` | e.g. `apollo@pegasusdreamscapes.com` (must be a SendGrid-verified sender) |
   | `STAFF_NOTIFICATION_EMAIL` | where intake notifications go, e.g. `apollosynd@gmail.com` |
   | `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI dashboard (powers Peggy) |
   | `PEGASUS_HQ_PUBLIC_INTAKE_URL` | HQ intake endpoint if HQ is live; blank otherwise |
   | `GOOGLE_MAPS_API_KEY` / `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud console, if maps are enabled |

4. Deploy. First build takes ~5–8 minutes. The service URL will look like
   `https://pegasus-dreamscapes.onrender.com`.

Note on email: if `SENDGRID_API_KEY` is blank the site still runs; intake
records are stored but notification emails are skipped. Verify a sender
address in SendGrid before broad launch.

## Step 4 — Domain

1. Render → the service → Settings → Custom Domains → add
   `pegasusdreamscapes.com` and `www.pegasusdreamscapes.com`.
2. Render shows the DNS records it needs. In Squarespace (where the domain
   is parked) → Domains → DNS settings:
   - apex `pegasusdreamscapes.com`: `A` record → the IP Render displays
   - `www`: `CNAME` → the `*.onrender.com` target Render displays
   - Remove the Squarespace parking records for those hosts.
3. Wait for DNS + certificate (minutes to ~an hour). Render shows both green.

## Step 5 — Launch smoke test (10 minutes)

On https://pegasusdreamscapes.com:

1. `/` renders, dark-mode toggle works, no console errors.
2. `/submit-property` → complete a real test submission → confirm the
   intake record exists (and the notification email if SendGrid is set).
3. `/strategy-lab` runs an analysis end to end.
4. `/signup` → create a test account → sign in → a protected action works
   (e.g. saving an analysis).
5. `/privacy`, `/terms`, footer disclosure present.
6. Phone check: no horizontal scroll on `/`, `/submit`, `/strategy-lab`.

## Rollback

- Bad deploy: Render → Deploys → "Rollback" to the previous build (instant).
- Bad code: revert the commit on `main`; Render auto-deploys the revert.
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
