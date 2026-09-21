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
npm run smoke:launch -- --base-url https://YOUR_DEPLOYED_SITE
npm run smoke:launch -- --base-url https://YOUR_DEPLOYED_SITE --post-test-lead --test-email YOUR_AUTHORIZED_TEST_EMAIL
```

`--example` checks required variable names, and `--env` checks nonempty values and the HQ URL format without printing secrets. Neither verifies credentials. A selected prerequisite failure stops the command before any network request.

`--base-url` is read-only and requires the exact JSON contracts from both `/api/health` and `/api/ready`. Use an HTTP(S) origin without credentials, a path, query, or fragment. Requests have 15-second deadlines and reject redirects, so a sign-in page cannot pass as readiness.

`--post-test-lead` additionally sends one marked opportunity through `/api/opportunities`. It requires an explicitly authorized `--test-email`; no real phone number or default recipient is embedded. This can send staff and customer notifications. Use it only in an authorized environment after the consent-compatible HQ receiver is ready. The command accepts only the canonical HTTP 201 receipt with a UUID and `New` status. It does not retry an ambiguous POST; inspect existing records before rerunning.

A passing command does not certify launch or downstream delivery. Confirm the opportunity row, correlated HQ outbox item in `forwarded` state, traceable HQ receipt, and staff/customer notification receipts. A queued item is not a delivery receipt.

## Deployment

Production must verify SSL, canonical domain, `/robots.txt`, `/sitemap.xml`, OG image, favicon, route health, form success/error states, and real intake notification flow.
