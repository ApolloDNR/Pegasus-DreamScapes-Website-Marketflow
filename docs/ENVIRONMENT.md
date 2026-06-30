# Environment

## Runtime

Node app with Vite client and server bundle.

## Package Manager

Use npm unless the repo is intentionally migrated.

## Commands

```powershell
npm install
npm run dev
npm run check
npm test
npm run build
npm run start
```

## Git Note

This checkout can trigger a Windows dubious-ownership warning. Use a one-off override when needed:

```powershell
git -c safe.directory="C:/Users/Apoll/OneDrive/Documentos/New project/repos/pegasus-dreamscapes-website-github-main" status --short --branch
```

Do not set global Git config without Apollo approval.

## Required Environment Variables

Use `.env.example` as the source list. Verify without printing secrets:

- `DATABASE_URL`
- `SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `PEGASUS_HQ_PUBLIC_INTAKE_URL`
- `DEFAULT_FROM_EMAIL`
- `STAFF_NOTIFICATION_EMAIL`
- production auth/session variables used by the host

## Launch Smoke

Use the launch smoke script without printing secrets:

```powershell
npm run smoke:launch -- --example
npm run smoke:launch -- --env
npm run smoke:launch -- --base-url https://YOUR_DEPLOYED_SITE --post-test-lead
```

`--example` verifies `.env.example` lists the required production variables. `--env` verifies the current process environment has the required production variables set. `--post-test-lead` sends a clearly marked discardable lead through `/api/leads`; use it only against staging or production when Apollo is ready to confirm the database row, HQ outbox/forwarding row, and staff notification.

## Deployment

Production must verify SSL, canonical domain, `/robots.txt`, `/sitemap.xml`, OG image, favicon, route health, form success/error states, and real intake notification flow.
