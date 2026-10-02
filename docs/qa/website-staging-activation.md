# Website staging activation checklist

October 2, 2026. This is a staged operational checklist, not evidence of live delivery or authorization to provision resources. Preserve the existing website architecture and review branch. Current protected Vercel is a browsing preview; the repository's production runbook uses a persistent Render service and the intended website Postgres database (Neon/Replit provenance must be verified). Do not substitute the separate HQ/auth Supabase database.

## Current dependencies

- Public inquiry: browser → `/api/opportunities` → website `opportunities` row → `hq_outbox` → selected HQ receiver. SendGrid staff/customer notifications are separate from storage acceptance.
- Peggy: website database/conversation tables, conversation-access signing secret, and the configured OpenAI-compatible API. Passive page context excludes private work; explicit reviewed handoff remains available.
- Member/admin surfaces: configured Supabase authentication and reviewed access policies; not a prerequisite to anonymous inquiry storage.
- Persistent runtime starts durable HQ pending recovery and Peggy daily reporting; serverless runtime deliberately does not start either. Unawaited notification/forward attempts are not durable serverless delivery proof.

## Safe startup controls

When `APP_ENV=preview`, persistent startup skips these three tasks unless the corresponding value is exactly `true`:

- `PEGASUS_PREVIEW_ENABLE_SEEDING`
- `PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY`
- `PEGASUS_PREVIEW_ENABLE_PEGGY_REPORTS`

Each permission is separate. Production/development behavior is preserved, and serverless never starts these tasks regardless of the flags. These are **startup** controls: they do not block an explicitly submitted inquiry, staff action, or direct delivery attempt. Keep provider delivery configuration unset until the approved isolated test destinations are ready. No existing real database should be activated simply because an HTTP preview renders.

## One approval bundle before activation

1. Identify the actual existing website database/account and ownership. Inspect schema metadata and backup status without exposing secrets or reading unrelated records. If it cannot be recovered, get approval for a new disposable staging database and any cost before creating it. Do not silently replace or restore a production database.
2. Confirm the staging host/service, account, price and billing commitment. Keep it private/non-indexable. Installing database/API credentials for ongoing access requires the secure setup flow and explicit approval; never copy values into chat, logs or Git.
3. Approve reviewed schema/migration work on the named disposable stage. Keep real data, production restore and security/grant changes separately gated. Confirm a rollback path before applying changes.
4. Confirm a SendGrid-verified sender, the staff test recipient, and one explicitly authorized synthetic submitter mailbox. Approve one marked inquiry and the associated staff/customer notifications together. Do not guess recipients or silently use a personal mailbox fallback.
5. Resolve the current HQ v1/v2 receiver decision and consent/address/context-preservation mismatch in `hq-contract-readiness.md`. No adapter may invent an address, turn false consent into true, or silently drop/truncate important context. A GET readiness response alone is insufficient.
6. Approve Peggy service setup and a bounded synthetic AI conversation separately from real visitor data. Choose the existing provider/key path; no model/provider migration is included.
7. Inspect pending outbox/report data before separately enabling recovery or daily reporting. Approve intended recipients, data scope and recurring behavior; do not drain historical real records automatically.

## Configuration names (no secret values)

- Inquiry database: `DATABASE_URL`
- Conversation/session signing: `SESSION_SECRET` or the supported dedicated `PEGGY_CONVERSATION_ACCESS_SECRET`
- Notifications: `SENDGRID_API_KEY`, `DEFAULT_FROM_EMAIL`, `STAFF_NOTIFICATION_EMAIL`; Peggy reports also use `APOLLO_NOTIFICATION_EMAIL`
- Peggy: `AI_INTEGRATIONS_OPENAI_API_KEY`; `AI_INTEGRATIONS_OPENAI_BASE_URL` only when using the existing compatible proxy. The SDK's existing `OPENAI_API_KEY` fallback remains supported, but the full launch contract still names the integration key.
- HQ: `PEGASUS_HQ_PUBLIC_INTAKE_URL`
- Auth/member/admin: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Deployment: `APP_ENV`, `SITE_INDEXABLE`, `SITE_URL`, plus the preview-only flags above

## Verification order

1. Read-only config-presence and schema inventory. No live secrets in output.
2. Start isolated preview with automatic tasks off. Check actual `/api/health` and `/api/ready` JSON. Missing AI must not crash unrelated routes; unconfigured Peggy must fail closed before records/messages are written. Readiness is not a delivery receipt.
3. After the approval bundle, send one marked synthetic inquiry using `smoke:launch -- --base-url <authorized-origin> --post-test-lead --test-email <authorized-test-mailbox>`.
4. Verify canonical website receipt, database record, correlated outbox and traceable HQ receipt, preserved context/consent, and staff/customer delivery evidence separately. Never blindly retry an ambiguous POST; inspect the existing record first.
5. Verify authorized Peggy conversation/authentication and error/retry paths with synthetic content. Finish physical-device/owner acceptance.
6. Public production/domain/indexing/merge, contact reactivation and brokerage/legal approval remain separate final decisions. None is implied by passing stage checks.

## Source verification for this safety slice

On Node 22.23.2: typecheck, 231 test files / 2,647 tests, production build, bundle budget, five deployment-entry runtime profiles, the existing ten-variable launch contract, and diff hygiene pass. The database-configured/no-AI-key profile now boots public pages and returns no-store Peggy 503 responses before conversation creation; unauthenticated calculator access stays 401. The startup matrix covers every combination of preview opt-ins, literal-value parsing, retained non-preview behavior, serverless suppression and HQ shutdown on server close. All backend/service tests use isolated synthetic fixtures, not live provider credentials or delivery receipts. Independent code review found no actionable regression within this slice. The separate phone integration is not changed or certified by the web availability guard.
