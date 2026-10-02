# Website staging activation checklist

October 2, 2026. This is an operational checklist, not evidence of live delivery or authorization to provision resources. The approved [shared-Supabase design](../superpowers/specs/2026-10-02-website-supabase-hq-integration-design.md) uses a dedicated `website` schema in the existing Supabase platform. It supersedes historical separate-Neon assumptions. Do not provision a replacement database or migrate the legacy public marketplace/CMS tables to satisfy old startup behavior.

Current protected Vercel is a browsing preview. Durable background execution uses the persistent Node service shape; no Render service, paid resources, live migration, credential installation or grant change is authorized by this checklist. A serverless delivery schedule requires its own reviewed durable-job design.

## Current dependencies

- Public inquiry: browser → `/api/opportunities` or `/api/leads` → dedicated website record, audit and delivery jobs in one transaction. Website recording, HQ acceptance, provider email acceptance and delivered-inbox evidence remain separate outcomes.
- HQ bridge: a server-authenticated versioned request to `/api/public/website-inquiries`, retaining original context, consent and idempotency key. Validate the correlated receipt before marking delivery complete.
- Notifications: a separate durable queue for staff and submitter purposes. Ambiguous sends require reconciliation rather than automatic resend. Non-production recipients must be explicitly allowlisted.
- Peggy: dedicated conversation/message tables, conversation-access signing secret and the existing configured OpenAI-compatible service. Passive page context excludes private work; reviewed explicit handoff remains available.
- Staff reads: verified Supabase identity and authoritative organization membership. Anonymous inquiry recording does not require a member account.

## Safe startup controls

All four background tasks default off in every environment. Persistent startup requires the corresponding global value to be exactly `true`:

| Task | Global opt-in | Additional preview opt-in |
| --- | --- | --- |
| Legacy content seeding | `PEGASUS_ENABLE_SEEDING` | `PEGASUS_PREVIEW_ENABLE_SEEDING` |
| Website HQ delivery | `PEGASUS_ENABLE_HQ_DELIVERY_WORKER` | `PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY` |
| Website notifications | `PEGASUS_ENABLE_NOTIFICATION_WORKER` | `PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS` |
| Legacy Peggy daily reports | `PEGASUS_ENABLE_PEGGY_REPORTS` | `PEGASUS_PREVIEW_ENABLE_PEGGY_REPORTS` |

Preview gating applies when either normalized `APP_ENV` or `VERCEL_ENV` is `preview`. Both global and preview values are then required; a preview flag alone is insufficient. Values such as `TRUE`, `1`, or whitespace-padded `true` are not permissions. Serverless never starts these tasks even with every opt-in set.

Keep seeding and daily reports off for this integration. Legacy seeding still targets public content/marketplace tables outside the approved dedicated schema. This repair does not migrate or invent seed content. The global report flag is a separate explicit activation requirement; notification approval does not reactivate daily reporting.

The default HQ startup path starts only the versioned website worker. It never starts the legacy `hq-client` pending-recovery worker or replays historical incompatible payloads. Inspect and reconcile historical jobs separately under a reviewed mapping. New HQ and notification workers each start once per application instance, use their organization/provider gates before startup's database import, and await their own stop handles on server close; shutdown errors are caught without logging secret or payload details. Node's close event does not make the HTTP `close()` callback a job-drain receipt.

Missing HQ endpoint/token/organization or notification provider key/verified sender/organization leaves that worker disabled; neither worker imports the database from its startup path without a nonempty `DATABASE_URL`. These controls do not suppress normal route database dependencies or authorize direct request-side actions. Keep provider delivery configuration unset until the approved isolated destinations are ready. Rendering a preview is not activation approval.

## One approval bundle before activation

1. Name the isolated schema-only Supabase/PostgreSQL target and account. Inspect metadata and backup/rollback status without exposing secrets or reading unrelated records. Preserve existing live HQ data and the reviewed schema boundary.
2. Confirm the persistent staging host/service, account, price and billing commitment. Keep it private/non-indexable. Installing database/API credentials for ongoing access requires secure setup and explicit approval; never place values in chat, logs or Git.
3. Approve the reviewed additive migrations and least-privilege website role grants on that named target. Keep live data changes, security changes and production restore separately gated. Confirm teardown/rollback before applying anything.
4. Confirm a SendGrid-verified sender, staff test recipient and authorized synthetic submitter mailbox. Set the exact allowlist. Approve one marked inquiry and its two test notifications, with the worker opt-ins needed for that bounded test; do not guess recipients or silently use a personal-mailbox fallback.
5. Confirm the authenticated versioned HQ receiver and matching organization mapping. Its website inquiry route is distinct from legacy v1/v2 public-intake receivers. Never invent an address, turn false consent true, silently truncate context, or treat GET readiness as delivery evidence.
6. Approve Peggy service configuration and bounded synthetic content separately from real visitor data. Retain the existing provider/model configuration; no model migration is included.
7. Inspect pending queues before activation. Record the intended data scope, recipients, worker switches, execution window and stop/rollback steps. Leave legacy seeding and daily reports off. Ongoing worker operation, live recipients and public cutover require their own explicit decisions.

## Configuration names (no secret values)

- Dedicated website database and organization: `DATABASE_URL`, `WEBSITE_ORG_ID`
- Conversation/session signing: `SESSION_SECRET` or `PEGGY_CONVERSATION_ACCESS_SECRET`
- Notifications: `SENDGRID_API_KEY`, `DEFAULT_FROM_EMAIL`, `STAFF_NOTIFICATION_EMAIL`, `PEGASUS_NOTIFICATION_ALLOWED_RECIPIENTS`
- HQ website bridge: `PEGASUS_HQ_WEBSITE_INQUIRY_URL`, `PEGASUS_WEBSITE_INQUIRY_TOKEN`; the legacy `PEGASUS_HQ_PUBLIC_INTAKE_URL` is not a fallback for new delivery jobs
- Peggy: `AI_INTEGRATIONS_OPENAI_API_KEY`; `AI_INTEGRATIONS_OPENAI_BASE_URL` only for the existing compatible proxy. The SDK's existing `OPENAI_API_KEY` fallback remains supported
- Auth/member/admin: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; never put the service-role key in the browser
- Deployment: `APP_ENV`, `VERCEL_ENV` where provided by the host, `SITE_INDEXABLE`, `SITE_URL`, and the independent global/preview opt-ins above
- Legacy daily reports, only if separately approved: `APOLLO_NOTIFICATION_EMAIL` and their existing provider requirements

## Verification order

1. Read-only configuration-presence and schema inventory. No live secrets in output.
2. Start the isolated preview with all automatic tasks off. Check actual `/api/health` and `/api/ready` JSON. Missing AI must not crash unrelated routes; unconfigured Peggy returns unavailable before creating rows. Readiness is not a delivery receipt.
3. After the approval bundle, submit one marked synthetic inquiry to the approved isolated origin with the approved synthetic addresses and explicit worker settings. Preserve its stable idempotency key across a lost response/retry.
4. Verify canonical website receipt, dedicated-schema record, correlated HQ receipt and preserved context/consent. Verify staff/customer provider acceptance separately from inbox arrival. Never blindly resend an ambiguous email; inspect reconciliation status first.
5. Verify authorized Peggy conversation/authentication and failure/retry paths with synthetic content. Finish physical-device/owner acceptance.
6. Review pending queues and stop workers at the approved boundary. Public production/domain/indexing/merge, contact reactivation and brokerage/legal approval remain separate final decisions. None is implied by passing stage checks.

## Source verification scope

`server/__tests__/application-startup.test.ts` exercises the actual application defaults with side-effect adapters replaced by synthetic fixtures: all 16 global and all 16 preview-task combinations, literal global/preview values, production/development defaults, normalized preview identities, serverless suppression, absent worker configuration before database import, versioned-worker wiring and awaited/error-contained shutdown. `server/__tests__/application.test.ts` verifies the dependency boundary and HTTP factory behavior. These tests call no external providers and are not live configuration or delivery evidence. Whole-branch typecheck, tests, build and isolated journey acceptance remain recorded in the integration evidence packet.
