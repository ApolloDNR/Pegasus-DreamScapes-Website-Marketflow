# Pegasus Website–HQ Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the approved website reliably record inquiries, deliver them to HQ, track notifications and support Peggy, beginning with isolated synthetic-data proof.

**Architecture:** Preserve Express/React and add explicitly scoped PostgreSQL website storage within the intended Supabase platform. HQ receives an additive versioned general-inquiry contract; durable queues separate recording from delivery. Three independently reviewable subsystem plans below share frozen contracts.

**Tech Stack:** Node 22.23.2, TypeScript, React, Express, Drizzle, PostgreSQL 17 test service, Supabase Auth, existing email and OpenAI providers; existing HQ Next.js and SQL migrations.

**Spec:** `docs/superpowers/specs/2026-10-02-website-supabase-hq-integration-design.md` (owner approved October 2, 2026).

## Owner summary

First prove the complete process safely: a visitor submits once, the website saves the inquiry, HQ shows it with the original consent and context, and notification attempts can be traced. Then prove Peggy and failure recovery. The approved appearance and business paths stay intact.

Recommended execution: implement one task at a time with a separate review after each task, then review the complete changes. This is the more thorough choice because two applications share identity, private information and delivery responsibilities. Approval of this plan allows implementation and isolated tests; it does not authorize paid hosting, credential installation, access changes in real accounts, live migrations or public launch.

## Global constraints

- Preserve `/api/opportunities` UUID receipts and `/api/leads` integer receipt compatibility.
- No silent truncation, placeholder property address, synthesized contact, or conversion of false consent to true is allowed.
- Keep existing v1/v2 routes and RPCs compatible with their current callers.
- Browser anonymous/authenticated roles do not receive direct access to raw inquiries, outboxes or Peggy transcripts.
- Missing credentials return an honest unavailable result before new conversation/message writes.
- Preview defaults remain off for automatic seeding, HQ recovery and daily reports.
- No new database provider, payment system, expanded public marketplace, phone integration or cosmetic redesign.
- Real role/grant/secret creation and live migrations require separate approval. Disposable local/CI roles and schema-only fixtures are test artifacts.
- No production `.env` files, rows, credentials or external sends in automated tests. No `db:push` against any connected account.

## Review focus

1. Lost success response followed by repeated submission: retain one record and one job per destination (A2).
2. Two organizations with the same email/name: verified subject and membership, never contact-string matching (A3).
3. General inquiry with no address and no privacy acknowledgement: preserve actual facts and show in HQ without creating a property seed (B2).
4. Worker loses lease or email response is ambiguous: no false success, stale-worker overwrite or blind duplicate send (C1/C2).
5. Historical queued payload cannot meet the new contract: quarantine for review without conversion or automatic replay (C1).

## Repositories, branches and dependencies

Website: `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`, existing draft #26 / `codex/launch-recovery-v2`, verified implementation base `188f6645a9bc1dd55f7d7f85affd06a606a473e5`; local documentation head `f621ae194407304ccd7d8094ae9cdea7f4cf26a7`. Before execution fetch remote and compare; preserve later changes and create an isolated worktree using the worktree skill. Integration work branch: `codex/website-hq-integration-v1`, based on the reviewed website source plus these documents. Do not overwrite the visual-preview branch during backend development.

HQ: `ApolloDNR/Pegasus-HQ-Operating-system`, merged baseline `5dc108996c0651fae118d821c5c1e7e6cb9bb69b`; integration branch `agent/website-inquiries-v1` from current reviewed main in a separate checkout. Draft #289 is evidence, not a wholesale dependency to merge. Preserve other workers' checkouts.

Partition proof: HQ draft #292, `b79a73c66b7a2cbf8d657f40a411ed601ff0e427`, already passed real PostgreSQL tests including UTC boundaries ([run](https://github.com/ApolloDNR/Pegasus-HQ-Operating-system/actions/runs/36959948019)). Recheck that pinned artifact before consuming it. Reuse `tests/activity-partition/candidate.sql`, `tests/activity-partition/verify.py` and `.github/workflows/activity-partition-isolated.yml`; do not duplicate or live-apply it. This focused proof does not establish full Supabase Auth behavior.

Execution order: A1 → A2 → A3; B1 can start after A1's contract fixture review, B2 after B1; C1 requires A2+B2, C2 requires A2, C3 requires A3, C4 requires all. Each task is a small commit and independent review gate. Publication of new integration PRs is a separate coordinated action; no merge or deploy implied.

## Isolated test harness

Each repository gets an explicit PostgreSQL 17 service workflow. Harnesses connect only to the workflow's disposable loopback database and reject other hosts/database names. They do not load application environment files. Synthetic Supabase identity tables are sufficient for database authorization semantics; provider JWT verification is tested with mocked `auth.getUser`, then separately in approved staging. Add scripts named `test:integration:website` and `test:integration:website-inquiries` in the respective repositories. Run schema migrations twice, inspect grants/RLS, and verify unrelated baseline rows and schema objects remain unchanged.

---

## Plan A: Website persistence and identity

### A1. Explicit storage boundary and PostgreSQL adapter

**Files:** Create `shared/website-schema.ts`, `migrations/website/0001_website_foundation.sql`, `server/website/db.ts`, `server/website/__tests__/database.integration.test.ts`, `scripts/test-website-db.mjs`, `.github/workflows/website-integration.yml`. Modify `shared/schema.ts`, `server/db.ts`, `package.json`, `package-lock.json` and the public-route storage imports only.

**Interfaces:** `createWebsiteDb(connectionString: string): { db: WebsiteDb; close(): Promise<void> }`. `WebsiteDb` is the Drizzle node-postgres database parameterized by `shared/website-schema.ts`. Existing schema exports retain their public TypeScript names; only migrated tables bind to `pgSchema('website')`. Add `pg` as a direct dependency at the reviewed lockfile version; do not replace unrelated legacy tables wholesale.

- [ ] Write `isolates_website_tables`, `preserves_public_schema`, `migration_is_repeatable` and `browser_roles_cannot_read_private_tables`: assert `website.opportunities`, `leads`, `hq_outbox`, `notification_outbox`, `peggy_conversations`, `peggy_messages`, `admin_audit_log` exist; UUID opportunity/integer lead IDs retain their types; no parallel `users` table is created; anon/authenticated cannot select raw records.
- [ ] Run `npm run test:integration:website`; expect missing adapter/migration failures, not a network connection to a real project.
- [ ] Implement the adapter, explicit schema objects and additive SQL. Copy required column definitions and indexes from current schemas; replace identity dependencies with nullable verified Auth subject and explicit organization IDs. Inventory foreign-key closure before migration and reject references to legacy public user tables. Enable RLS; tests exercise grants using disposable roles. Keep TLS verification enabled outside the loopback harness.
- [ ] Run `npm run test:integration:website && npm run check`; expect all assertions pass and no type errors. Generate and inspect SQL; never run global schema push.
- [ ] Commit only this boundary and tests: `feat: isolate website persistence in dedicated schema`.

### A2. Atomic intake and stable visitor retries

**Files:** Create `shared/website-inquiry-contract.ts`, `server/website/intake.ts`, `server/website/__tests__/intake.integration.test.ts`, `client/src/lib/intake-idempotency.ts`. Modify `server/opportunityRoutes.ts`, the `/api/leads` handler in `server/routes.ts`, `server/storage.ts`, `client/src/pegasus/forms.tsx` and each existing `/api/leads` caller. Add `client/src/__tests__/intake-idempotency.test.ts`.

**Interfaces:** `WebsiteRecordRef = {type:'opportunity'; id:string} | {type:'lead'; id:number}`. `recordWebsiteInquiry(input: {kind:'opportunity'|'lead'; payload:unknown; idempotencyKey:string; authSubject:string|null}, db:WebsiteDb): Promise<{record:WebsiteRecordRef; duplicate:boolean}>`. `WebsiteInquiryEnvelopeV1 = {contractVersion:1; idempotencyKey:string; websiteRecord:WebsiteRecordRef; submission:{kind:'opportunity'|'lead'; captured:Record<string,unknown>; consent:{contact:boolean; copyVersion:string|null; capturedAt:string|null; privacyAcknowledged:boolean|null}}}`. `captured` validates against a frozen copy of the corresponding existing accepted server fields, including routing/attribution, rather than arbitrary unknown keys. Canonical hashing sorts object keys recursively and retains array order, null and false.

- [ ] Write `records_and_jobs_are_atomic`, `lost_response_retry_is_single_record`, `changed_payload_same_key_conflicts`, `preserves_nonproperty_and_false_privacy`, and `preserves_receipt_types`. Assert rollback leaves zero records/jobs; twenty concurrent identical requests produce one record and one HQ job plus one job per email purpose; changed content returns 409; no address/consent fabrication.
- [ ] Run `npm test -- server/website/__tests__/intake.integration.test.ts client/src/__tests__/intake-idempotency.test.ts`; expect missing implementation failures.
- [ ] Implement one transaction for record/audit/jobs and a unique idempotency index. Persist a UUID per browser submission attempt; retain through timeout/back/retry, replace only after confirmed success or explicit new inquiry. Generate a server key for old clients lacking one without claiming retry protection for those clients. Preserve honeypot, minimum 3000ms duration, rate limits and existing confirmation copy. Hash only the durable canonical payload, excluding changing anti-spam timing and transport metadata. Derive organization server-side, never from visitor input. Return existing receipt shapes only after commit.
- [ ] Run targeted tests, `npm run test:integration:website` and existing lead/opportunity route tests. Add fixtures covering all active intake doors and their current maximum field lengths, Unicode and full current 100 KiB request-body boundary; the new HQ envelope cannot silently narrow currently accepted content.
- [ ] Commit: `feat: persist inquiry and delivery intent atomically`.

### A3. Shared identity and organization-scoped reads

**Files:** Create `server/website/identity.ts`, `server/website/__tests__/identity.test.ts` and `identity.integration.test.ts`; modify `server/supabaseAuth.ts`, public-record staff guards in `server/routes.ts`/`server/opportunityRoutes.ts`, and Peggy ownership lookup only.

**Interfaces:** `resolveWebsiteStaff(authSubject:string, orgId:string, db:WebsiteDb): Promise<{accountId:string; orgId:string; role:'owner'|'admin'}|null>`. Resolve `public.accounts.auth_user_id` → account ID → `public.memberships.account_id`, requiring matching `org_id`, `status='active'` and `role IN ('owner','admin')`. This conservative initial staff read boundary does not grant other membership roles implicit access. `authSubject` comes solely from verified Supabase `auth.getUser` output.

- [ ] Write `rejects_editable_metadata_role`, `denies_other_org_same_email`, `denies_inactive_membership`, `denies_unmapped_subject`, `guest_intake_still_works`. Assert 401 for missing identity, 403 for insufficient membership; no query results leak before authorization. Verify catalog mapping against reviewed HQ migrations before using it; mismatches stop this task.
- [ ] Run `npm test -- server/website/__tests__/identity.test.ts`; expect missing resolver failures.
- [ ] Implement exact mapping and integrate guards without creating users/passwords or auto-provisioning memberships. Test server role needs against disposable SQL grants; real grants remain approval-gated.
- [ ] Run identity unit/integration tests and existing Peggy access/auth tests; expect cross-organization denial and unchanged guest conversation-token protections.
- [ ] Commit: `feat: scope website access to shared identity`.

---

## Plan B: HQ versioned generic inquiry bridge

### B1. Additive contract and durable acceptance

**Files (HQ):** Create `src/lib/website-inquiries/schema.ts`, `src/lib/website-inquiries/accept.ts`, `src/app/api/public/website-inquiries/route.ts`, `supabase/migrations/20261002040000_website_inquiry_foundation.sql`, `tests/website-inquiries/contract.test.ts`, `tests/website-inquiries/database.test.ts`, `scripts/test-website-inquiries.mjs`. Copy reviewed contract fixtures from A2 into `tests/website-inquiries/fixtures/` with checksums; no runtime import across repositories.

**Interfaces:** `acceptWebsiteInquiry(envelope:WebsiteInquiryEnvelopeV1, context:{orgId:string}): Promise<WebsiteInquiryReceiptV1>`; receipt `{contractVersion:1; inquiryId:string; reference:string; websiteRecord:WebsiteRecordRef; idempotencyKey:string}`. `hq.website_inquiries` stores original validated envelope, canonical hash, correlated IDs, organization and creation time. Transport credential maps to organization on the server; client-selected organization is rejected.

- [ ] Write `same_key_same_payload_returns_original_receipt`, `same_key_changed_payload_409`, `general_inquiry_without_address_accepted`, `false_privacy_stays_false`, `invalid_transport_401`, `no_payload_in_logs`, `v1_v2_existing_contracts_unchanged`. Assert concurrent submissions produce exactly one HQ record and one audit event. Body limit must include the complete A2 accepted envelope, not just the source body's 100 KiB; set a 256 KiB transport cap and test maximum fixtures.
- [ ] Run `npm run test:integration:website-inquiries`; expect missing route/table failures using only isolated PostgreSQL.
- [ ] Implement strict envelope validation, fixed version, bounded fields from A2 fixtures, atomic insert/audit and unique organization/key constraint. Use server-only transport authentication with constant-time comparison and no logged secret. Missing configuration returns 503; invalid credential 401; conflict 409. Do not call strict property-seed RPCs. Apply corrected partition candidate only inside isolated harness before ledger tests.
- [ ] Run contract/database tests plus existing public-intake tests from HQ package scripts; expect old v1/v2 tests unchanged and no dropped original context. Verify anonymous/browser roles cannot execute mutation functions or read raw inquiries.
- [ ] Commit: `feat: accept versioned website inquiries in HQ`.

### B2. Organization-scoped inbox visibility

**Files (HQ):** Create `src/lib/website-inquiries/inbox.ts`, `src/app/api/website-inquiries/route.ts`, `src/components/website-inquiries/inbox-section.tsx`, `tests/website-inquiries/inbox.test.tsx`. Modify `src/app/dashboard/intake/page.tsx`, the existing Intake hub, using `src/lib/supabase/cached-auth.ts` organization context. Add a separate read-only website-inquiry section beside existing recent intake; do not recast general inquiries as deals.

**Interfaces:** `listWebsiteInquiries(context:{orgId:string; accountId:string}, cursor:string|null): Promise<{items:WebsiteInquiryInboxItem[]; nextCursor:string|null}>`; item `{id:string; reference:string; createdAt:string; kind:'opportunity'|'lead'; captured:Record<string,unknown>; consent:WebsiteInquiryEnvelopeV1['submission']['consent']}`. Server-side existing HQ organization authorization precedes reads.

- [ ] Write `inquiry_visible_to_own_org_only`, `original_context_and_consent_rendered`, `general_inquiry_does_not_create_seed`, `cursor_has_no_duplicates`. Include HTML/script-looking notes and assert rendered as text.
- [ ] Run `npm test -- tests/website-inquiries/inbox.test.tsx`; expect absent module/component failures.
- [ ] Implement a read-only section in the current inbox with reference, category, captured details and consent evidence. Do not add conversion, sending, approvals or other business actions in this repair.
- [ ] Run inbox and existing inbox/access tests; use rendered synthetic browser checks to verify narrow/mobile layout and no cross-org data in response or DOM.
- [ ] Commit: `feat: display website inquiries in existing HQ inbox`.

---

## Plan C: Reliable delivery, Peggy and release evidence

### C1. Lease-based HQ delivery and receipt verification

**Files (website):** Create `server/website/delivery.ts`, `server/website/__tests__/delivery.integration.test.ts`; modify `server/integrations/hq-client.ts`, `server/integrations/hq-config.ts`, and `server/application.ts` worker integration.

**Interfaces:** `deliverHqBatch(db:WebsiteDb, transport:(payload:WebsiteInquiryEnvelopeV1)=>Promise<WebsiteInquiryReceiptV1>, now:Date): Promise<{claimed:number; delivered:number; deferred:number; quarantined:number}>`. Claim at most 25 rows, 60-second leases, 15-second request timeout, maximum five concurrent requests, attempt backoff 30s/2m/10m/1h/6h then review after ten attempts. Every completion update compares lease token; receipt must match version, key and record identity.

- [ ] Write `two_workers_one_claim`, `lease_expiry_recovers`, `stale_worker_cannot_complete`, `wrong_receipt_never_marks_delivered`, `legacy_payload_quarantined`, `ambiguous_timeout_same_key_retries`. Assert no lost record, unchanged original payload and no dependency on a cached health 2xx.
- [ ] Run delivery unit/integration tests; expect missing lease implementation failures.
- [ ] Implement `FOR UPDATE SKIP LOCKED` claims, deterministic classification (400/401/403/409 quarantine; timeout/429/5xx retry), bounded retries and correlation validation. Only new contract jobs use new endpoint; old pending jobs require explicit reviewed mapping/reconciliation. Retain preview recovery opt-in and shutdown cleanup. A missing endpoint leaves jobs pending with clear status.
- [ ] Run tests with worker crash between HQ acceptance and local completion; expect retry yields the same HQ receipt, one inquiry and correct final delivery status.
- [ ] Commit: `feat: recover HQ deliveries without duplicate inquiries`.

### C2. Traceable email queue

**Files:** Create `server/website/notifications.ts`, `server/website/__tests__/notifications.test.ts`; modify `server/email.ts`, public intake handlers and startup wiring.

**Interfaces:** `dispatchNotification(job:NotificationJob, sender:NotificationSender): Promise<'accepted'|'deferred'|'needs_reconciliation'>`; `NotificationJob` identifies website record, purpose (`staff` or `receipt`), immutable rendered payload and job UUID. `NotificationSender` returns provider message ID on confirmed acceptance or typed `definitely_not_sent`/`ambiguous` outcome. Database uniqueness is record+purpose, not recipient alone.

- [ ] Write `one_job_per_purpose`, `provider_acceptance_is_not_delivery`, `ambiguous_send_is_not_resent`, `definite_failure_retries`, `email_html_escaped`, `staging_recipient_not_allowlisted_blocked`.
- [ ] Run `npm test -- server/website/__tests__/notifications.test.ts`; expect missing dispatch implementation failures.
- [ ] Implement durable state transitions and existing templates. Confirm provider's actual idempotency support before using it; absent support, an ambiguous result enters manual reconciliation. Email worker is off by default in preview and enabled only when `PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS` is exactly `true`; serverless startup never starts it. Isolated tests inject a fake sender, never a provider key. Do not automatically reactivate daily reports.
- [ ] Run tests and existing email escaping/receipt tests; expect preserved original confirmation copy and separate acceptance/delivery evidence.
- [ ] Commit: `feat: track inquiry notification outcomes durably`.

### C3. Peggy persistence and honest availability

**Files:** Modify `server/peggy.ts`, `server/peggy-ai.ts`, `server/peggy-route-auth.ts`, relevant storage methods in `server/storage.ts`; add `server/website/__tests__/peggy.integration.test.ts`.

**Interfaces:** Retain existing route and conversation-token contracts. Use A1 website tables and A3 verified optional subject ownership; no new public identity or model-provider interface.

- [ ] Write `missing_key_creates_no_rows`, `token_cannot_read_other_conversation`, `verified_subject_ownership_only`, `provider_failure_preserves_editable_draft`, `private_workspace_not_passively_sent`. Assert real provider output is required for an answer; server exceptions never create fabricated assistant messages.
- [ ] Run new integration tests plus existing `peggy-availability`, `peggy-access`, `peggy-route-auth` and page-guide privacy tests; new schema tests must fail before migration integration.
- [ ] Bind persistence to dedicated schema without changing explicit Memo-to-Peggy confirmation, provider/model or private-context filtering. Keep missing-key checks before writes.
- [ ] Run targeted tests and real-entry missing-key smoke; expect honest 503 and zero rows, with normal routes still available.
- [ ] Commit: `feat: persist Peggy safely in shared platform`.

### C4. Full isolated journey and activation packet

**Files:** Create `scripts/check-website-hq-journey.mjs`, `docs/qa/website-hq-integration-evidence.md`; extend website/HQ integration workflows and existing rendered QA fixtures.

**Interfaces:** Evidence records immutable website/HQ SHAs, migration checksums, test counts, synthetic correlation IDs, queued/delivered/reconciliation counts and screenshot provenance. No secret values, visitor contact data or signed URLs.

- [ ] Write a journey test that starts both isolated applications with fake provider adapters: submit → stable website receipt → HQ inbox → tracked staff/receipt acceptance → Peggy reply. Include double click/back/timeout/restart, general and property inquiries, consent false/absent, unauthorized reads and provider outage. It fails until all preceding interfaces work.
- [ ] Run `node scripts/check-website-hq-journey.mjs`; expect the complete synthetic chain and no external network sends.
- [ ] Run website `npm run check`, `npm test`, `npm run build`, `npm run check:a11y:full`, the existing CI guide/journey/render matrix, and both PostgreSQL integration suites. Require all tests and exact-head CI green; inspect fresh mobile/desktop light/dark images, do not infer visual quality from green tests.
- [ ] Assemble one activation request naming the isolated Supabase/host target, any cost, secret names and secure handoff, least-privilege grants, test sender/recipients, AI synthetic-content scope, worker switches and teardown/rollback. Preserve the three existing preview flags, add `PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS=false`, and leave seeding/daily reports off. No approval by implication from a test pass.
- [ ] Commit evidence and reviewed runbooks: `test: prove website to HQ integration in isolation`.

## Completion and release boundary

Implementation is complete when both isolated apps satisfy C4 and a fresh whole-branch reviewer accepts the complete diff. Then approved staging can establish real provider receipts, JWT identity and configured-host behavior. Passing mocked/isolated tests alone does not establish live email arrival, an active contact number, brokerage/legal approval or public readiness. Keep existing live data untouched until backup/preflight/rollback and explicit live approval are recorded.

## Self-review

Coverage: dedicated storage/identity A1–A3; preserved intake facts and compatibility A2/B1; generic inbox B2; durable HQ/email C1/C2; Peggy C3; full validation and activation gates C4. All five review-focus conditions have owning tests. HQ inbox insertion is grounded in main’s `src/app/dashboard/intake/page.tsx`; B2 adds a read-only section rather than a new CRM. Partition proof is reused, not reapplied live. No implementation has started under this plan.
