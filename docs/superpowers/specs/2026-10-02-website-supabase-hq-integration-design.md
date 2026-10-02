# Pegasus website and HQ integration design

Status: architecture approved by owner on October 2, 2026. Detailed implementation plan requires review before execution; live activation remains separately gated.

## What this delivers

Keep the Pegasus website and the business experience already approved. Use Supabase for the website and operating system, as Apollo intended. A visitor's inquiry must be recorded once, reach the appropriate HQ inbox, and produce traceable notification attempts. Peggy must answer through the configured service without reading private work automatically. Failures must preserve the inquiry and explain what actually happened.

The first delivery is an isolated, synthetic-data demonstration. It does not move the public domain, expose live data, send unsolicited emails, or require Apollo to inspect another visual preview before the wiring works. Existing live HQ records remain untouched.

Approval of this document approves the design for implementation planning. Paid resources, credential installation, grants/security changes, live migrations, recurring notifications and public cutover retain separate approval gates.

## Evidence and starting points

- Website source `188f6645a9bc1dd55f7d7f85affd06a606a473e5`, existing draft PR #26, preserves the approved six-section site and visitor routes. Its Express API currently uses a Neon WebSocket driver and a legacy default/public schema. That implementation is not evidence Apollo selected Neon.
- Apollo clarified that Supabase supported both the website and operating system, and cautioned that the database might be outdated. The active Supabase project contains HQ and MarketFlow schemas and shared identity. The current website's public intake/Peggy tables are absent.
- Live Supabase has 109 applied migration versions, matching all 109 active SQL migrations on HQ main `5dc108996c0651fae118d821c5c1e7e6cb9bb69b`. It is aligned with merged HQ, rather than an arbitrary abandoned database.
- Draft HQ #289 at `027095b73fa76867d673b1d2cc5ce3509b073d2b`, stacked on draft #288, adds three unapplied migrations: activity partition continuity, vault evidence review separation, and public intake hardening. They are not automatically an approved release bundle.
- Live activity partitions stop at July 1, 2026. Current ledger writes are at risk even though the merged migration ledger matches. An isolated partition-repair proof is a separate existing-interface task.
- Production HQ v1 and draft v2 both require an address and two true consent flags. The website permits real non-property inquiries and records only the contact consent actually collected. V1 drops extra context; v2 rejects the current flat shape. Neither can be selected solely because a health response is green.
- Vercel preview has no configured provider variables. No Render service or replacement database has been provisioned. The source now isolates missing Peggy credentials and disables preview startup seeding/recovery/reports unless independently opted in.

These facts supersede old runbook claims that a separate Neon database is necessarily the intended destination. No live schema is to be modified merely to make the current code compile.

## Options and recommendation

**Recommended: retain the website API, use a dedicated website schema in the existing Supabase project, and give HQ a narrow versioned website-inquiry interface.** This preserves the current frontend and separates website persistence from HQ's operating records. Changes are additive, testable independently, and reversible without rewriting existing HQ data.

**Alternative: rewrite the website directly against existing HQ intake RPCs.** This removes a storage boundary, but today's RPCs cannot preserve all inquiry categories, lengths and consent facts. It would couple website changes to HQ internals and replace more working behavior. Do not choose it merely because the RPC already exists.

**Alternative: deploy the website's entire legacy public schema into Supabase.** This resembles its current ORM, but risks collisions with shared identity and creates many unused marketplace tables. It is outside this repair.

The safe default is the recommended approach. It introduces no new database provider, no new payment system, and no expanded public marketplace.

## Scope and ownership

This design covers the existing public inquiry doors, durable HQ/email delivery, web Peggy, and the authentication needed to read the resulting records. Strategy Lab calculations remain local and unchanged. Existing beta/private boundaries remain. Legacy operator marketplaces, billing, voice/phone, new CRM automation, and cosmetic redesign are excluded.

Supabase remains the data platform. HQ owns its operating records, ledger and ingestion policy. The website owns its raw visitor submissions, consent evidence, Peggy conversations and delivery jobs. The website does not write directly into arbitrary HQ tables.

Retain the existing Node/Express runtime and Drizzle query layer; replace the Neon-only connection transport with a supported PostgreSQL driver and explicit schema binding. Use a provider-supported pooler appropriate to the selected host. Do not disable TLS verification or install a WebSocket proxy merely to preserve the old driver.

For reliable scheduled recovery, the recommended runtime is the repository's persistent Node service shape. A Render staging service requires explicit account/cost approval because none exists. Keeping all live operations on Vercel instead requires a separate reviewed durable-job execution design; fire-and-forget promises and timers are not that design. The existing Vercel browsing preview can remain during validation.

## Website persistence and identity

Create an explicitly bound `website` schema through reviewed additive migrations in isolated staging first. The initial migration contains only the dependency closure needed by the public routes: canonical opportunities, existing unified leads, HQ outbox, notification outbox, Peggy conversations/messages and audit records. Preserve `/api/opportunities` UUID receipts and `/api/leads` integer receipt compatibility; do not consolidate IDs or payload semantics during this repair. Static authored content and local calculators require no migration of fictional content.

Use Supabase Auth as the identity authority. Store the verified Auth subject for optional signed-in ownership; guest intake remains valid. Server-side verification supplies identity, never a client-submitted user ID. Map staff authorization to the existing authoritative organization-membership/role model after its exact column mapping is reviewed. Do not create a competing password/user directory, infer staff from editable metadata, or grant all authenticated users access. If an existing identity cannot be mapped unambiguously, access fails closed.

The website database role receives only reviewed access to its schema. Browser anonymous/authenticated roles do not receive direct access to raw inquiries, outboxes or Peggy transcripts. Staff reads remain authenticated and organization-scoped. Actual role/grant/secret creation requires approval. No service-role key reaches the browser.

## HQ contract without invented facts

Keep existing v1/v2 routes and RPCs compatible with their current callers. Add a separate HQ-owned website-inquiry contract rather than silently broadening an old strict route. Proposed HTTP destination: `POST /api/public/website-inquiries`, with numeric `contractVersion: 1` specific to that destination. Transport is server-to-server, authenticated with an explicitly provisioned credential and bounded request limits; credential setup is a separate approval.

The envelope carries:

- Original UUID idempotency key; website record ID and record type (`opportunity` or `lead`)
- Existing visitor/category code, contact fields and optional location fields
- Narrative, source attribution and routing context as explicitly named bounded fields
- The actual contact-consent value, copy version and capture timestamp; privacy acknowledgement as false or absent when not collected
- No authentication tokens, browser history, model-provider secrets or unrelated private records

Contract limits must accept every currently valid website submission or reject it before recording/queuing with a clear field error. No silent truncation, placeholder property address, synthesized contact, or conversion of false consent to true is allowed. Notes and structured context remain inspectable as their original captured facts.

HQ records every valid website inquiry as a generic inbox item first. An address is optional for a relationship/general inquiry. Property-specific seed creation or other consequential workflow requires the actual facts and eligibility that workflow requires; accepting a general inquiry does not bypass those conditions. Existing strict seed RPCs are not called with invented data. An additive HQ inquiry record and existing-inbox presentation are part of this scope; no new broad CRM is included.

HQ returns a versioned receipt containing its durable inquiry ID/reference, the correlated website record ID and the accepted idempotency key. A duplicate with the same key and canonical payload returns the original receipt. Reusing the key with different content returns an explicit conflict. The website validates the full receipt and correlation before marking delivery complete. HTTP 2xx alone is never sufficient.

The current contact checkbox and privacy notice remain unchanged by default. This design preserves their facts; it does not declare them legally sufficient for a new use. If review requires another acknowledgement, proposed wording and behavior must receive approval before implementation or activation.

## Durable delivery and failure behavior

Create the visitor record, consent audit and required delivery jobs in one database transaction. If that transaction fails, do not return a recorded receipt. Once it succeeds, the website may truthfully confirm recording even while HQ/email is unavailable, without claiming downstream delivery.

Workers claim jobs with bounded leases and concurrency, retain the original payload/key, and recover abandoned leases after restart. Retry transient failures with bounded backoff. Permanent schema/consent errors remain visible for review; they are not dropped or altered automatically. A safe retry must not create another inquiry. The visitor-facing submission path also needs a stable idempotency key so a lost HTTP response cannot duplicate a recorded inquiry on retry.

Email uses a separate durable queue for the existing staff notification and submitter receipt. Record provider acceptance and message IDs distinctly from delivered-inbox evidence. Ambiguous send outcomes require inspection/reconciliation rather than blindly sending again. Do not log recipient/content payloads or treat a successful API call as proof a person received email.

Preview defaults remain off for automatic seeding, HQ recovery and daily reports. Their independent opt-ins are `PEGASUS_PREVIEW_ENABLE_SEEDING`, `PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY`, and `PEGASUS_PREVIEW_ENABLE_PEGGY_REPORTS`. Direct POST effects are not controlled by these startup switches. Only synthetic data and explicitly approved test recipients are used during stage validation.

## Peggy behavior

Persist web conversations/messages in the website schema while retaining conversation-access-token checks and optional verified Auth ownership. Keep the configured model/provider and existing explicit-send flow. Missing credentials return an honest unavailable result before new conversation/message writes. Provider failures preserve editable client drafts and do not manufacture answers.

The page guide uses public authored text; private form/workspace values remain excluded. The deliberate Memo-to-Peggy handoff remains reviewable and is sent only on the visitor's explicit action. Configuring AI credentials or sending synthetic test content to the chosen provider requires the approved setup/test scope. Phone integration is excluded.

## Phased acceptance

1. **Ledger safety proof:** independently test partition continuity against an isolated schema baseline, including October 2026 writes, preservation of earlier rows, repeat application, future partition coverage and unchanged security grants. No wholesale draft merge or live application.
2. **Website storage and identity contract:** approve a written implementation plan, then build the dedicated-schema adapter and additive migrations in an isolated schema-only environment. Test both public receipt contracts, identity separation, consent capture and atomic job creation. No real records copied by default.
3. **Versioned HQ bridge:** agree the exact contract with HQ, add generic inquiry intake/inbox visibility without breaking old interfaces, and prove full-context/idempotent transport under success, conflict, timeout, restart and permanent failure. Test property and non-property categories.
4. **Notifications and Peggy:** after secure configuration and recipient approval, prove one marked inquiry from website receipt to HQ inbox/receipt and both test emails; exercise a bounded synthetic Peggy conversation and authenticated access. Test missing-service and interrupted/repeated flows.
5. **Release review:** inspect the queued-data state, rollback, contact availability, owner/device experience and brokerage/legal approval. Public hosting/domain/indexing/merge and recurring worker activation require their own decisions.

Each phase has its own focused implementation plan and review. The first production data change is not authorized by this design or by a passing isolated test.

## Decisions and stop conditions

The technical recommendation above is selected for review, so Apollo need not choose database plumbing ad hoc. Before implementation planning, approve or correct this written design. Before activation, confirm only the actual named isolated environment/hosting commitment, secure credentials, test sender/recipients, and any legally required consent-copy change. Exact shared identity-column mapping and HQ inbox projection are engineering review gates against the reconciled schema, not questions to answer from memory.

Stop on source/schema disagreement, missing backup, unexpectedly sensitive data, an unreviewed permission expansion, a request to fabricate consent/address, unsupported historical payloads, or an ambiguous external write. Preserve the item and report the precise blocker.

## Sources

- Website [PR #26](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/pull/26), current code and `docs/qa/hq-contract-readiness.md`
- HQ [PR #289](https://github.com/ApolloDNR/Pegasus-HQ-Operating-system/pull/289) and live metadata/migration comparison on October 2, 2026
- [Supabase PostgreSQL connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Neon driver transport explanation](https://neon.com/blog/serverless-driver-for-postgres)
