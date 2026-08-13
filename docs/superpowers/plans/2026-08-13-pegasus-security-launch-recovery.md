# Pegasus Security Launch Recovery Program Plan

> **Execution rule:** This program spans independent UI, security, database, integration, and release subsystems. Do not dispatch its requirement summaries directly. Before each numbered task or tightly coupled lettered group, create and commit a child implementation plan in `docs/superpowers/plans/` using `superpowers:writing-plans`; that child must contain actual test code, minimal implementation code, exact RED/GREEN commands, exact staging commands, and exact `git add --` paths with no placeholders. Execute the child using `superpowers:subagent-driven-development`, with a fresh implementer, specification review, code-quality review, and durable acceptance checkpoint.

**Goal:** Reconstruct the lost launch-hardening work from approved commit `4487bec1378c701cc77a6cef421b9921ddf522d4`, close every still-applicable PR #25 review finding, and produce a CI-green, visually verified Pegasus Dreamscapes launch candidate without touching production, DNS, or live data before Apollo approves those gates.

**Architecture:** Work only on successor branch `codex/launch-recovery-v2`. Security and data-integrity changes are ordered by boundary: recoverable baseline, request contracts, Peggy authorization and deletion, private documents, identity/RLS, financial transactions, reliability, then UI/verification closure. Each task starts with a focused failing regression, applies the smallest compliant change, passes focused tests and TypeScript, receives two-stage review, and is committed before later work. Git, the successor pull request, this plan, and the tracked recovery ledger are the durable record; the plan-scoped SDD ledger is the local orchestration record. Chat narration is not completion evidence.

**Tech stack:** React 18, TypeScript, Vite, Wouter, Express, Vitest, Drizzle/PostgreSQL, Supabase Auth/PostgREST, TanStack Query, SendGrid, Pegasus HQ HTTPS outbox, Playwright/axe, GitHub Actions, Render.

## Master execution contract

1. On every session, read this plan, `AGENTS.md`, the required repository source-of-truth documents, tracked `docs/qa/security-launch-recovery-ledger.md`, and the local plan-scoped ledger at `.superpowers/sdd/2026-08-13-pegasus-security-launch-recovery/progress.md` when that workspace still exists.
2. Reconcile `git log`, the tracked ledger, successor PR head, plan checkboxes, and then the local ledger. Resume at the first task without durable accepted evidence; never recreate an accepted commit merely because a temporary checkout disappeared.
3. Use Node `22.23.2` for install and verification commands. Use `npx vitest run <paths>` for focused Vitest runs.
4. Record each RED assertion, GREEN command, reviewer decision, exact commit, and any deferred minor finding in the SDD ledger.
5. Do not combine later-task paths into an earlier commit. Stage exact paths with `git add -- <path>` and inspect `git diff --cached --name-only` before every commit.
6. Fast-forward the remote successor branch through the connected GitHub API when local Git credentials are unavailable. Never force-update a branch.
7. Stop only for a verified external-access blocker, destructive-data risk, legal/compliance decision, production/deployment approval, source-of-truth contradiction, or a repeated verification failure that cannot be resolved safely.

## Required child-plan and closure protocol for every implementation task

1. Create the child implementation plan before dispatch. The first child is `docs/superpowers/plans/2026-08-13-pegasus-recovery-foundation.md` for Task 1. Later child plans are created only after reconciling accepted prior interfaces, so code snippets cannot drift from the real tree.
2. Run a preflight review on the child plan. It is dispatchable only when every code-changing step includes actual code/fixtures and the reviewer reports no blocking/major ambiguity.
3. The implementer runs the child plan's RED command, implements only its named paths, runs GREEN plus TypeScript, inspects exact staged paths, and creates the named implementation commit.
4. A fresh specification reviewer checks the task contract against that commit. The same implementer fixes every blocking/major finding in new focused commits; the reviewer rechecks only those findings until approved or the SDD review cap is reached.
5. A fresh code-quality reviewer then reviews the accepted implementation diff. The implementer fixes blocking/major findings and the reviewer rechecks them. Minor findings are either fixed or recorded with an explicit ruling.
6. After both approvals, append the RED/GREEN commands, implementation/fix commit SHAs, reviewer verdicts, and remaining rulings to the child plan's local SDD ledger and tracked `docs/qa/security-launch-recovery-ledger.md`; check the task in this program plan and child plan.
7. Commit only the tracked ledger and plan checkboxes as `docs: record Task <id> acceptance`, fast-forward all commits to `codex/launch-recovery-v2`, and verify the remote contains them. A task is not durably complete until this checkpoint is remote.

## Global product and safety constraints

- Public brand casing is exactly **Pegasus Dreamscapes**.
- MarketFlow is private beta and reviewed access only; authentication alone is never approval.
- Peggy is intake and orientation, never a decision-maker.
- Strategy Lab output is directional education, not a valuation, appraisal, offer, advice, or recommendation.
- Deal Blueprint remains by review; no checkout, guaranteed result, guaranteed offer, guaranteed return, or public securities solicitation.
- Preserve the locked editorial navy, copper, cream, Playfair Display, Inter, restrained Cinzel system, approved routes, and approved homepage composition.
- Do not add fake inventory, metrics, testimonials, status, notification delivery, trust claims, or persuasive placeholder data.
- Unauthorized and nonexistent private objects use indistinguishable responses with `Cache-Control: no-store`.
- Do not mutate production, `main`, Render production, the live database, DNS, payment systems, or submit a live/staging test lead without the applicable recorded approval.
- Public distribution remains blocked on qualified legal/compliance and KW/broker review.
- No completion claim is valid without fresh evidence from the exact final commit.

## Known recovery baseline

- Approved source: `4487bec1378c701cc77a6cef421b9921ddf522d4`.
- Local/remote successor: `codex/launch-recovery-v2`.
- PR #25 remains the review-history source; the successor pull request replaces its implementation head.
- Baseline Node `22.23.2` TypeScript and production build/bundle budget pass.
- Baseline Vitest: 110 files, 1,250 passed and one deterministic failure in `client/src/__tests__/lane-pages-prd-v1.test.tsx`; the first lazy `/buyers` page exceeds the suite's one-second default wait while later lane cases pass.
- Review inventory: 46 actionable findings reviewed at the approved base, 5 already fixed, 41 still applicable, including 8 unresolved inline CodeRabbit threads.

## Definition of done

- Every finding `F01` through `F41` in the appendix maps to one or more narrow implementing commits and passing regressions. `F02` intentionally spans guarded calculator access, explanatory output, and truthful deletion/retention lifecycle commits.
- The listing-inquiry `name`/`fullName` mismatch found during recovery is fixed and covered.
- Peggy token-oracle, calculator-cost, retention, deletion, and late-response races are closed.
- Private objects, participant documents, staff routes, mixed identities, and Supabase ownership/RLS contracts fail closed.
- MarketFlow price/date/expiry/counter/notification behavior is server-owned and transactionally atomic.
- Node 22 clean install, production audit, example environment smoke, TypeScript, all Vitest tests, build, bundle budget, diff/secret hygiene, route/SEO/accessibility checks, and CodeRabbit review pass on the exact successor PR head.
- The canonical public-route registry passes automated health/accessibility checks at 1440px, 768px, and 390px; the 18 priority routes receive manual screenshot review; and all 12 named journeys pass on an immutable non-production artifact.
- Non-production staging proves readiness, auth negatives, one approved marked opportunity, database/HQ/notification delivery, and rollback before a production decision is requested.

---

### Task 1: Lock recovery state and stabilize the deterministic baseline

**Files:**
- Modify: `README.md`
- Modify: `docs/AUTOMATION_GOAL.md`
- Modify: `docs/qa/launch-completion-status.md`
- Modify: `docs/qa/security-launch-recovery-ledger.md`
- Create: `client/src/pegasus/category-page.tsx`
- Modify: `client/src/pegasus/Landing.tsx`
- Modify: `client/src/pegasus/pages.tsx`
- Modify: `client/src/__tests__/pegasus-no-blank-shell.test.tsx`
- Test: `client/src/__tests__/lane-pages-prd-v1.test.tsx`
- Test: `client/src/__tests__/cta-labels.test.tsx`
- Test: `client/src/__tests__/cta-routing.test.tsx`
- Plan: `docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md`

**Interfaces:**
- The automation goal points only to this plan, branch `codex/launch-recovery-v2`, and the successor PR once created.
- The launch ledger distinguishes historical evidence from recovery-candidate evidence and records the baseline test failure truthfully.
- `README.md` uses exact public brand casing, `dist/index.cjs`, Node 22/`npm ci`, and points route QA to the canonical registry/gate rather than stale `/services`, `/sell`, `/invest`, and `/submit-deal` paths. The newer locked design/launch documents explicitly supersede the legacy CMS-copy section wherever they conflict.
- `category-page.tsx` exports the unchanged `CategoryPage` contract and `pages.tsx` re-exports it for source compatibility. `Landing.tsx` lazy-loads that focused module instead of transforming the broad `./pages` chunk before the first `/buyers` paint.

- [ ] **Step 1: Preserve the RED baseline.** Run `npx vitest run client/src/__tests__/lane-pages-prd-v1.test.tsx` twice in fresh processes. Record that `/buyers` times out while the module's later lane cases pass. Add a static regression in `pegasus-no-blank-shell.test.tsx` requiring `CategoryPage` to lazy-import `./category-page`, not derive from `loadPages()`, and run it to RED.
- [ ] **Step 2: Reconcile recovery documentation.** Replace stale PR #25/old-branch resume pointers, correct README casing/runtime/routes, state the locked-doc precedence over legacy CMS fallback copy, and label every old commit/run as historical. Add source commit, successor branch, current test count, review count, external blockers, and first resume command.
- [ ] **Step 3: Isolate the production lazy boundary.** Move `WhatYouGet` and `CategoryPage` unchanged into `category-page.tsx` with only their used imports, re-export from `pages.tsx`, and point `Landing.tsx` at the focused module. Do not make the route eager, change locked copy, or relax test timeouts.
- [ ] **Step 4: Run GREEN.** Run `npx vitest run client/src/__tests__/pegasus-no-blank-shell.test.tsx client/src/__tests__/lane-pages-prd-v1.test.tsx client/src/__tests__/cta-labels.test.tsx client/src/__tests__/cta-routing.test.tsx`, `npm run check`, `npm run build`, and `git diff --check`. Confirm the built `/buyers` boundary is not coupled to the broad pages chunk.
- [ ] **Step 5: Commit.** Stage the named Task 1 paths and commit `fix: lock recovery and isolate public lane loading`.

### Task 2: Align listing inquiry UI, API, and database contracts

**Files:**
- Create: `shared/listing-inquiry-contract.ts`
- Create: `client/src/lib/listing-inquiry.ts`
- Modify: `client/src/contexts/deal-action-context.tsx`
- Modify: `server/routes.ts`
- Create: `client/src/__tests__/listing-inquiry-contract.test.ts`
- Create: `server/__tests__/listing-inquiry-contract.test.ts`
- Test: `server/__tests__/public-data-route-contract.test.ts`

**Interfaces:**
- `listingInquiryRequestSchema` is strict and accepts: positive safe-integer `listingId`; `inquiryType` in `info|tour|offer`; trimmed `fullName` of 1–255 characters; a required valid email of at most 320 characters; optional trimmed phone of at most 50 characters; optional message of at most 4,000 characters; at most three `preferredShowingDates` strings of at most 100 characters; and optional boolean `preApproved`.
- Both reachable UIs require email even when phone is the preferred contact; phone remains optional. Client builders map UI `name` to API `fullName`. The tour builder zips each nonblank date with its same-index nonblank time as `YYYY-MM-DD HH:mm` (or the date alone) into `preferredShowingDates`; no live time choice is silently discarded. The server never accepts the obsolete `name`, `preferredDates`, `preferredTimes`, or `isPreApproved` aliases.
- The unused legacy `ListingInquiryForm` is removed rather than retaining a caller that cannot provide the required identity fields.
- Public listing context for an authenticated first-time buyer uses an explicit public projection and excludes inquiries, showing instructions, private contacts, owner IDs, and audit fields.

- [ ] **Step 1: Write RED tests.** Prove both reachable listing modals require valid email and build valid canonical requests, a `name`-only/phone-only request fails, a tour zips dates/times and persists `preApproved`, first-time public context is readable, and a private listing remains a non-enumerating 404.
- [ ] **Step 2: Run RED.** Run `npx vitest run client/src/__tests__/listing-inquiry-contract.test.ts server/__tests__/listing-inquiry-contract.test.ts server/__tests__/public-data-route-contract.test.ts`. Expected: forms emit `name`, route ignores tour fields, and public first-contact projection is absent.
- [ ] **Step 3: Implement the shared strict schema and explicit builders.** Parse before any access/storage call; persist only parsed fields; remove the dead legacy form; do not expose private context to make first contact work.
- [ ] **Step 4: Run GREEN.** Repeat the focused command, then `npm run check` and `git diff --check`.
- [ ] **Step 5: Commit.** Stage only Task 2 paths and commit `fix: align listing inquiry contracts`.

### Task 3: Require valid wholesale dates and one displayed/submitted amount

**Files:**
- Modify: `client/src/pages/marketflow/offer-studio.tsx`
- Modify: `client/src/contexts/deal-action-context.tsx` wholesale accept/counter sections only
- Test: `client/src/__tests__/marketflow-offer-studio.test.tsx`
- Create: `client/src/__tests__/wholesale-offer-terms.test.tsx`
- Test: `server/__tests__/marketflow-offer-payload.test.ts`

**Interfaces:**
- Offer Studio and both reachable wholesale modals expose a required date input, focus it, show a date-specific error, and perform zero POSTs while invalid. The accept modal adds an editable input initialized from `deal.closingDate`; it no longer displays an uneditable `TBD` while attempting submission.
- Offer Studio's authoritative amount is the entered `composer.offerPrice`. Accept's authoritative total assignment price is `Number(deal.contractPrice) + Number(deal.assignmentFee)` and must be a safe valid amount before acknowledgement/submission. Counter's authoritative total is `Number(deal.contractPrice) + Number(counterAssignmentFee)`. Each value is computed once, displayed as “Total assignment price,” acknowledged where applicable, and sent unchanged as `payload.offerPrice`; `deal.askingPrice` never silently overrides it.
- Outgoing payloads are explicit allowlists and never include `expiresAt`, recipient/owner IDs, counts, status, UI-only fields, or money aliases.

- [ ] **Step 1: Write RED tests.** Replace the existing blank-date success expectation with zero network calls and visible/focused validation; prove accept renders an editable initialized date and blocks/focuses it when blank; add valid create/accept/counter cases with distinctive amounts and exact displayed/acknowledged/request-body equality.
- [ ] **Step 2: Run RED.** Run `npx vitest run client/src/__tests__/marketflow-offer-studio.test.tsx client/src/__tests__/wholesale-offer-terms.test.tsx server/__tests__/marketflow-offer-payload.test.ts`.
- [ ] **Step 3: Implement the minimal form guards and explicit payload builders.** Keep the strict server validator authoritative and add explicit empty/whitespace date server regressions.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: require complete wholesale offer terms` with only Task 3 paths.

### Task 4A: Remove Peggy's session-ID token oracle and guard calculator analysis

**Files:**
- Modify: `server/routes.ts` Peggy create/new/calculator routes only
- Modify: `server/peggy.ts` conversation-start path only
- Modify: `client/src/components/peggy-dock.tsx`
- Modify: `client/src/components/peggy-chat.tsx`
- Modify: `client/src/contexts/peggy-context.tsx`
- Modify: `server/__tests__/launch-security-route-contract.test.ts`
- Create: `server/__tests__/peggy-route-auth.test.ts`

**Interfaces:**
- Peggy create/new accepts only bounded context. It starts a fresh conversation with a server-generated `randomUUID()` correlation value and never calls anonymous `getOrCreateConversation` using `req.body.sessionId`.
- A raw browser ID cannot select an existing row or mint access. Clients stop sending/storing `peggy_session_id` as authorization material and have no timestamp/`Math.random` fallback.
- `POST /api/peggy/analyze-calculator` registers `isHybridAuthenticated` before model work, derives `userId` from the verified request, uses a server-generated correlation value, and performs no provider/storage work for anonymous callers.

- [ ] **Step 1: Write RED tests.** Require middleware/session source patterns; prove anonymous calculator 401 with zero side effects; prove two create calls with the same attacker body ID create distinct server IDs; prove replay cannot retrieve/mint access to another conversation; and prove no predictable browser fallback remains.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/launch-security-route-contract.test.ts server/__tests__/peggy-route-auth.test.ts`.
- [ ] **Step 3: Implement server-controlled creation/calculator identity and remove client session credentials.** Preserve authenticated history through its already-guarded owner route.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: bind Peggy creation to server identity` with only Task 4A paths.

### Task 4B: Expire Peggy credentials with exactly one bounded refresh

**Files:**
- Modify: `shared/peggy-access.ts`
- Modify: `server/peggy-access.ts`
- Modify: `server/routes.ts` access-refresh registration only
- Test: `server/__tests__/peggy-access.test.ts`
- Create: `client/src/lib/peggy-access.ts`
- Create: `client/src/__tests__/peggy-access-refresh.test.ts`
- Modify: `client/src/pegasus/peggy.tsx`
- Modify: `client/src/components/peggy-dock.tsx`
- Modify: `client/src/components/peggy-chat.tsx`
- Test: `client/src/__tests__/peggy-handoff.test.tsx`

**Interfaces:**
- Token version 2 is `v2.<base64url-json-payload>.<base64url-hmac>` and signs namespace, version, conversation ID, session/owner binding, integer `issuedAt`, and integer `expiresAt`. Issued lifetime is exactly 24 hours; renewal grace is exactly seven days after expiry. Verification returns `{status:"valid",expiresAt}`, `{status:"expired",expiresAt}`, or `{status:"invalid"}` using constant-time signature comparison and an injectable millisecond clock.
- Only the authenticated row owner or an authentic token for the existing row may renew during that seven-day grace. Invalid/wrong/beyond-grace/deleted tokens remain indistinguishable `404 {"message":"Conversation not found"}`; authentic expiry from a guarded operation returns `401 {"message":"Conversation access expired","code":"PEGGY_ACCESS_EXPIRED"}`.
- `peggyFetchWithSingleRefresh` sends the original once, refreshes once with raw fetch, replaces the credential, replays once, and returns the replay result without recursion. Supabase authorization and Peggy headers survive.

- [ ] **Step 1: Write RED server tests.** Cover valid/expired/malformed/tampered/cross-row/beyond-grace tokens, deleted-row denial, refresh binding, and no conversation creation during refresh.
- [ ] **Step 2: Write RED client tests.** Cover normal one-call success, expiry→refresh→replay three-call success, invalid 404/no refresh, refresh failure/no replay, replay expiry/no second refresh, and preserved headers.
- [ ] **Step 3: Run RED.** Run `npx vitest run server/__tests__/peggy-access.test.ts client/src/__tests__/peggy-access-refresh.test.ts client/src/__tests__/peggy-handoff.test.tsx`.
- [ ] **Step 4: Implement issuance, verification, refresh route, helper, and client adoption.** The general access guard never accepts an expired token.
- [ ] **Step 5: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 6: Commit.** Commit `fix: expire Peggy credentials with bounded refresh` with only Task 4B paths.

### Task 4C: Lock Peggy calculator input and wording to explanation only

**Files:**
- Create: `shared/peggy-calculator.ts`
- Modify: `server/routes.ts` calculator parser only
- Modify: `server/peggy.ts` calculator prompt builder only
- Create: `server/__tests__/peggy-calculator-route.test.ts`
- Create: `server/__tests__/peggy-calculator-wording.test.ts`
- Test: `client/src/__tests__/peggy-public-truth.test.tsx`

**Interfaces:**
- The request schema allowlists `arv`, `roi`, `brrrr`, `cashflow`, `wholesale`, `piti`, `ownvsrent`, and `hardmoney`. Each `inputs`/`results` tree is at most three levels deep, 64 keys total, 16 KiB when JSON-serialized, and contains only keys up to 64 characters plus null/boolean/finite-number/string values (strings at most 1,000 characters) or arrays of at most 50 permitted values. Validation occurs before database/provider work.
- Prompt output explains result drivers, assumptions, sensitivities, missing facts, and verification needs. It explicitly says it is not a valuation, offer, advice, or recommendation and never asks whether this is a “good opportunity.”

- [ ] **Step 1: Write RED tests.** Cover malformed/oversize/non-finite input 400 with zero provider work, valid authenticated analysis, required explanatory language, and forbidden judgment/recommendation phrases.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/peggy-calculator-route.test.ts server/__tests__/peggy-calculator-wording.test.ts client/src/__tests__/peggy-public-truth.test.tsx`.
- [ ] **Step 3: Implement the strict parser and pure prompt builder.** Preserve exact public brand casing.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: keep Peggy calculator analysis explanatory` with only Task 4C paths.

### Task 5: Delete Peggy conversations atomically and truthfully

**Files:**
- Create: `migrations/0006_peggy_conversation_deletion.sql`
- Modify: `shared/schema.ts` Peggy relation only
- Modify: `server/storage.ts` Peggy interface/operations only
- Modify: `server/peggy.ts`
- Modify: `server/routes.ts` Peggy DELETE route and chat conversation-gone mapping only
- Modify: `client/src/pegasus/peggy.tsx`
- Modify: `client/src/pages/privacy.tsx`
- Create: `server/__tests__/peggy-deletion.test.ts`
- Create: `client/src/__tests__/peggy-deletion.test.tsx`
- Test: `client/src/__tests__/peggy-public-truth.test.tsx`
- Test: `server/__tests__/migration-contract.test.ts`

**Interfaces:**
- `DELETE /api/peggy/conversations/:id` uses `publicIntakeRateLimit` and the Peggy access guard before a 204 response; absent/wrong/invalid objects remain 404.
- Migration first fails with a named exception if any orphan message exists; it never deletes or repairs user data automatically. After separately reviewed remediation leaves zero orphans, it adds a real foreign key from `peggy_messages.conversation_id` to `peggy_conversations.id` with `ON DELETE CASCADE` and proves the constraint/postcondition. Orphan remediation is outside this automatic plan and requires explicit data review.
- Message insertion plus parent count/timestamps is one transaction that first proves/locks the parent. A missing parent produces a typed conversation-gone result and no orphan.
- If deletion wins while AI work is pending, late assistant/error writes and notifications are suppressed; no parent or child is recreated.
- The public control is two-step: `Delete this conversation`, explanatory confirmation, destructive confirmation, and Cancel. It aborts the request, ignores late client promises by generation ID, resets only after 204, and retains transcript on failure.
- Privacy copy distinguishes the active Pegasus database copy from separately saved browser chats, AI-provider/email/HQ/log/backup copies, and privacy-request processes. It promises no fixed automatic purge period that does not exist.

- [ ] **Step 1: Write RED storage/runtime tests.** Cover owner/token delete, wrong identity 404, atomic child removal, token renewal after deletion denied, message transaction rollback, and deferred AI completion after deletion leaving both tables empty.
- [ ] **Step 2: Write RED UI/truth tests.** Cover confirmation/cancel, DELETE header, success reset, failure retention, in-flight abort/late response, separate Saved-page copy, and prohibited retention promises.
- [ ] **Step 3: Run RED.** Run `npx vitest run server/__tests__/peggy-deletion.test.ts client/src/__tests__/peggy-deletion.test.tsx client/src/__tests__/peggy-public-truth.test.tsx server/__tests__/migration-contract.test.ts`.
- [ ] **Step 4: Implement fail-fast migration, atomic storage behavior, DELETE plus chat gone-error mapping, client control, and truthful copy.** Do not apply the migration to a live or staging database in this task.
- [ ] **Step 5: Run GREEN.** Repeat focused tests, then `npm run check` and `git diff --check`.
- [ ] **Step 6: Commit.** Commit `fix: make Peggy deletion atomic and truthful` with only Task 5 paths.

### Task 6: Enforce private object, document, and staff-route boundaries

**Files:**
- Modify: `server/replit_integrations/object_storage/routes.ts`
- Modify: `server/legacy-private-access.ts`
- Modify: `server/routes.ts` document/staff registrations only
- Test: `server/__tests__/object-storage-routes.test.ts`
- Test: `server/__tests__/legacy-private-access.test.ts`
- Test: `server/__tests__/legacy-private-route-contract.test.ts`
- Test: `server/__tests__/launch-integrity-contract.test.ts`
- Test: `server/__tests__/public-marketplace.test.ts`

**Interfaces:**
- Object GET loads metadata, resolves the verified server principal, calls `canAccessObjectEntity` before `downloadObject`, and collapses unauthorized/missing/unreadable objects to byte-identical `404 {"error":"Object not found"}` with `Cache-Control: no-store`.
- Participant documents honor `accessLevel`: ordinary public documents allow authorized participants, `verified` requires verified status, and `approved_buyers` requires buyer approval. Owner/staff views stay unfiltered.
- `/api/admin/analytics/dashboard` and adjacent `/api/marketplace/admin/*` routes register `isAuthenticated` immediately before `requireStaffRole`.
- Source-contract tests assert every anchor and required token exists before comparing positions; public DTO tests reject `showingInstructions`, `submittedBy`, `createdBy`, and `linkedDealId` explicitly.

- [ ] **Step 1: Write RED tests.** Cover object owner/public allow, non-owner/missing equivalence and zero streaming; the document access matrix and snake/camel flags; owner/staff bypass; middleware order; non-vacuous delete authorization; and the four DTO negatives.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/object-storage-routes.test.ts server/__tests__/legacy-private-access.test.ts server/__tests__/legacy-private-route-contract.test.ts server/__tests__/launch-integrity-contract.test.ts server/__tests__/public-marketplace.test.ts`.
- [ ] **Step 3: Implement ACL-before-stream, entitlement filtering, staff auth order, and reliable test helpers.** Do not reveal which private object or document exists.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: restore private data boundaries` with only Task 6 paths.

### Task 7: Reject mixed login identities before reviewed MarketFlow access

**Files:**
- Create: `shared/staff-roles.ts`
- Modify: `shared/schema.ts` role export only
- Modify: `shared/marketflow-inventory-access.ts`
- Modify: `server/routes.ts` staff-role import/uses only
- Modify: `server/storage.ts` staff-role import/use only
- Modify: `server/marketflow-inventory-authorization.ts`
- Modify: `server/supabase-marketplace-privacy.ts`
- Modify: `client/src/lib/shell-mode.ts`
- Test: `server/__tests__/marketflow-inventory-authorization.test.ts`
- Test: `server/__tests__/supabase-marketplace-contract.test.ts`
- Test: `client/src/__tests__/marketflow-role-gating.test.ts`
- Test: `client/src/__tests__/marketflow-shell-mode.test.ts`

**Interfaces:**
- One principal resolver normalizes all nonempty `req.user.claims.sub`, `req.supabaseUser.id`, and `req.session.user.id` subjects. If two exist, all must match; mismatch returns no identity before admin-email allowlists or profile/role queries.
- Email is taken only from the provider that supplied the accepted subject; identities and emails are never mixed across providers.
- `STAFF_ROLES` lives in constants-only `shared/staff-roles.ts`; the set and candidate values use identical trim/lowercase normalization.
- Access middleware resolves once and passes the principal to the policy resolver; no duplicate authentication query occurs.
- `classifyShellMode` passes `normalizeSpaPath(location)` to all Pegasus/standalone/not-found classifiers.

- [ ] **Step 1: Write RED tests.** Cover claims-only, Supabase-only, session-only, matching dual/triple subjects, every mismatch pair, an attacker combining a foreign subject with an admin email, normalized roles, one principal-resolution call, and query/hash/trailing-slash shell paths.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/marketflow-inventory-authorization.test.ts server/__tests__/supabase-marketplace-contract.test.ts client/src/__tests__/marketflow-role-gating.test.ts client/src/__tests__/marketflow-shell-mode.test.ts`.
- [ ] **Step 3: Extract the lightweight role constant; update the exact imports in `shared/schema.ts`, `shared/marketflow-inventory-access.ts`, `server/routes.ts`, and `server/storage.ts`; and implement one fail-closed principal.** Assert mismatch produces no profile/role/database calls.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check` and `npm run build` to prove the shared client import stays bundle-safe.
- [ ] **Step 5: Commit.** Commit `fix: bind MarketFlow access to one identity` with only Task 7 paths.

### Task 8A: Preserve Supabase identity provenance through application storage

**Files:**
- Modify: `server/supabase-marketplace-privacy.ts`
- Modify: `server/routes.ts` Supabase identity/ownership branches only
- Modify: `server/lib/supabase.ts`
- Modify: `server/supabase-storage.ts`
- Modify: `server/user-provisioning-routes.ts`
- Modify: `server/user-profile-route.ts`
- Modify: `server/__tests__/supabase-marketplace-contract.test.ts`
- Modify: `server/__tests__/supabase-marketplace-privacy.test.ts`
- Create: `server/__tests__/supabase-storage-identity.test.ts`
- Modify: `server/__tests__/user-provisioning-routes.test.ts`
- Create: `server/__tests__/user-profile-route.test.ts`
- Test: `server/__tests__/launch-integrity-contract.test.ts`

**Interfaces:**
- Reuse `SupabaseMarketplaceIdentity`; do not create a competing principal type. Verified Supabase UUIDs populate native columns, legacy subjects populate external columns, and a bare string is rejected rather than silently treated as Supabase.
- All identity-scoped storage operations, including saved items and notification list/read/mark-all, accept the typed identity and select the matching column. A single-notification read mutation includes both row ID and recipient predicate.
- Deal/project ownership resolves native or external owner consistently. Application service-role calls retain explicit Express authorization; RLS is never claimed to constrain `supabaseAdmin`.

- [ ] **Step 1: Write RED tests.** Prove correct native/external columns for profiles, reputation, badges, saved items, commitments, offers, owners, and notifications; prove native/external self access and cross-user denial; prove notification read mutations are recipient-scoped; prove a bare string is rejected; and prove mixed identity fails before service-role queries.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/supabase-marketplace-contract.test.ts server/__tests__/supabase-marketplace-privacy.test.ts server/__tests__/supabase-storage-identity.test.ts server/__tests__/user-provisioning-routes.test.ts server/__tests__/user-profile-route.test.ts server/__tests__/launch-integrity-contract.test.ts`.
- [ ] **Step 3: Implement reusable native/external mappings and pass the typed identity through routes/helpers/storage.** Keep provider-neutral strings only on intentionally local PostgreSQL paths.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check` and `git diff --check`.
- [ ] **Step 5: Commit.** Commit `fix: preserve Supabase identity provenance` with only Task 8A paths.

### Task 8B: Make Supabase identity migration and RLS contracts deterministic

**Files:**
- Create: `supabase-migration-identity-ownership.sql`
- Modify: `supabase-schema.sql`
- Modify: `supabase-rls-hardening.sql`
- Modify: `server/__tests__/supabase-rls-contract.test.ts`
- Modify: `docs/deploy/SUPABASE_LAUNCH_VERIFICATION.sql`
- Modify: `SUPABASE_SETUP.md`

**Interfaces:**
- Fresh schema and hardening SQL implement the server-only DTO model consistently: no public profile SELECT policy or authenticated broad profile UPDATE privilege. Self writes use the authenticated application allowlist.
- The migration joins external identities to `auth.users` before any native UUID backfill, preserves unmatched legacy rows, detects collisions, covers all actual identity-column pairs, and contains executable table/policy/postcondition assertions. UUID shape alone is never provenance.
- Authenticated ownership policies remain UUID-based; external identities remain application/service-role only. Raw DTO-owned table grants stay revoked.
- Every REVOKE test is bounded to one SQL statement. Safety assertions inspect both `qual` and `with_check`. Setup and read-only verification documents state the exact migration order.

- [ ] **Step 1: Write RED exact-file SQL contract tests.** Read the migration by exact filename; assert joins to `auth.users`, no UUID-shape casts, exact target tables, policy/table presence, statement-bounded REVOKEs, `qual` plus `with_check`, partial uniqueness for native/external saved items, and executable collision/postcondition checks. Actual fixture execution belongs to the approved disposable/staging database in Task 17; do not claim local database behavior from source regex.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/supabase-rls-contract.test.ts`.
- [ ] **Step 3: Implement transaction-wrapped migration, consistent schema/hardening policy, executable assertions, setup order, and read-only inventory.** Do not broaden PostgREST grants merely to exercise a policy.
- [ ] **Step 4: Run GREEN.** Repeat the focused test, then `npm run check` and `git diff --check`.
- [ ] **Step 5: Commit.** Commit `fix: harden Supabase identity ownership` with only Task 8B paths.

### Task 9: Make MarketFlow offers server-owned and transactionally atomic

**Files:**
- Create: `migrations/0007_marketflow_offer_integrity.sql`
- Modify: `shared/schema.ts` MarketFlow offer/negotiation definitions only
- Modify: `server/marketflow-offer-payload.ts`
- Modify: `server/marketflow-financial-integrity.ts`
- Modify: `server/storage.ts` canonical MarketFlow operations only
- Create: `server/marketflow-offer-routes.ts`
- Modify: `server/routes.ts` canonical offer registration only
- Modify: `client/src/pages/marketflow/offer-studio.tsx`
- Modify: `client/src/pages/marketflow-negotiate.tsx`
- Test: `client/src/__tests__/marketflow-offer-studio.test.tsx`
- Create: `client/src/__tests__/marketflow-offer-payload-contract.test.ts`
- Test: `server/__tests__/marketflow-offer-payload.test.ts`
- Test: `server/__tests__/marketflow-financial-integrity.test.ts`
- Create: `server/__tests__/marketflow-offer-routes.test.ts`
- Test: `server/__tests__/launch-security-route-contract.test.ts`
- Test: `server/__tests__/migration-contract.test.ts`

**Interfaces:**
- New and counter offers expire exactly seven 24-hour days after server `now`; client `expiresAt` is rejected/ignored and never forwarded to storage.
- Persisted parent terms validate against their creation-time date floor; a once-valid closing date stays actionable after the calendar advances. New counter terms validate against response time.
- `counterCount` and negotiation `offerCount` are non-null/nonnegative and bounded before PostgreSQL integer increment. Ceiling returns a deterministic 409 without evaluating overflow.
- Offer/counter/accept/reject state, negotiation pointer/counts, and one durable local `notifications` row commit in the same Drizzle transaction. A notification insert failure rolls back all mutations and produces generic HTTP 500.
- Notification messages use server-built safe metadata and contain no arbitrary notes/private property data. Dead `broadcastToUser` success paths are removed; HTTP polling is authoritative.
- Offer Studio and the secondary negotiate page send the same six-field canonical payload and understand persisted `sent` status; money/authority aliases are removed.
- Migration deterministically backfills null expiry from `created_at + interval '7 days'`, backfills counts, sets defaults/not-null/checks, fails if required tables are absent, and proves postconditions.

- [ ] **Step 1: Write RED payload/UI tests.** Assert exact canonical screen-to-request amount on both clients, no aliases/authority fields, real `sent` controls, numeric/date boundaries, past-new rejection, and once-valid stored acceptance.
- [ ] **Step 2: Write RED storage/HTTP/migration tests.** Assert exact seven-day deadlines, fresh counter expiry/depth, counter/offer-count ceiling, atomic rollback on notification failure for create and respond, live Express 500/200/409 controls, removal of both dead broadcast paths, and exact-file non-vacuous migration SQL/postconditions. Actual seeded migration execution belongs to Task 17.
- [ ] **Step 3: Run RED.** Run `npx vitest run client/src/__tests__/marketflow-offer-studio.test.tsx client/src/__tests__/marketflow-offer-payload-contract.test.ts server/__tests__/marketflow-offer-payload.test.ts server/__tests__/marketflow-financial-integrity.test.ts server/__tests__/marketflow-offer-routes.test.ts server/__tests__/launch-security-route-contract.test.ts server/__tests__/migration-contract.test.ts`.
- [ ] **Step 4: Implement migration, validators, transaction, narrow route module, and both clients.** Remove unused bypass storage helpers if no callers remain.
- [ ] **Step 5: Run GREEN.** Repeat focused tests, then `npm run check`, `npm run build`, and `git diff --check`.
- [ ] **Step 6: Commit.** Commit `fix: make MarketFlow offers transactionally durable` with only Task 9 paths.

### Task 10: Serialize HQ delivery and secure its control surfaces

**Files:**
- Modify: `client/src/pages/admin-hq-outbox.tsx`
- Modify: `server/integrations/hq-config.ts`
- Modify: `server/integrations/hq-client.ts`
- Modify: `server/storage.ts` HQ interface/claim only
- Test: `server/__tests__/hq-client.test.ts`
- Create: `client/src/__tests__/admin-hq-outbox-cache.test.tsx`

**Interfaces:**
- HQ React Query keys include the authenticated user ID and remove prior-user outbox queries on identity change.
- Non-production `http:` HQ endpoints allow only `localhost`, `127.0.0.1`, or `::1`; every remote hostname requires HTTPS.
- `claimHqOutbox(id, observedStatus, observedUpdatedAt, now)` conditionally changes eligible pending/stale rows to forwarding. A second worker receives no row and performs no POST.
- Retry uses the same claim operation; active forwarding rows cannot be double-delivered.

- [ ] **Step 1: Write RED tests.** Cover cache separation/removal, remote HTTP rejection, three loopback allowances, and two concurrent workers selecting the same row but producing exactly one network POST.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/hq-client.test.ts client/src/__tests__/admin-hq-outbox-cache.test.tsx`.
- [ ] **Step 3: Implement identity cache keys, URL policy, conditional Drizzle claim, and drain/retry use.** Keep payload logging redacted.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: serialize HQ delivery claims` with only Task 10 paths.

### Task 11: Make readiness and rendered verification failure-complete

**Files:**
- Modify: `server/readiness.ts`
- Modify: `scripts/check-visual-accessibility.mjs`
- Create: `shared/public-launch-routes.json`
- Modify: `client/src/__tests__/pegasus-no-blank-shell.test.tsx`
- Modify: `client/src/__tests__/standalone-no-blank-shell.test.tsx`
- Test: `server/__tests__/readiness.test.ts`
- Test: `server/__tests__/visual-accessibility-gate-contract.test.ts`

**Interfaces:**
- Successful readiness results are cached for 30 seconds with an injectable clock; failures are never cached. Every `/api/ready` response sets `Cache-Control: no-store`.
- `shared/public-launch-routes.json` has exact `pegasus`, `standalone`, and `gateOnly` arrays. The Pegasus blank-shell test requires `pegasus` to equal `PEGASUS_URLS`; the standalone blank-shell test consumes `standalone` instead of maintaining a private list; the visual-gate contract requires every crawlable `SEO_ROUTES` key plus every JSON route to be present. `gateOnly` contains `/__launch-404-check`. This makes the exhaustive automated gate fail when a public registry grows without QA coverage.
- Each route/viewport/theme visual check owns a `try/catch/finally`; a navigation/H1/axe failure records route identity and health evidence, closes the page, continues through the matrix, and leaves the final process nonzero.
- The canonical JSON registry drives the exhaustive automated route list. A separate 18-route priority screenshot subset and 12-journey list remain explicit; no error handler turns a failure into a pass.

- [ ] **Step 1: Write RED tests.** Prove readiness probe call counts across success TTL/failure, no-store headers, JSON equality/coverage against Pegasus/standalone/SEO registries, per-route catch/finally, later-route execution after an injected early failure, and nonzero final status.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/readiness.test.ts server/__tests__/visual-accessibility-gate-contract.test.ts client/src/__tests__/pegasus-no-blank-shell.test.tsx client/src/__tests__/standalone-no-blank-shell.test.tsx`.
- [ ] **Step 3: Implement the cache, canonical route registry, and route-local failure collection.** Do not cache degraded/failed dependency results.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: make launch health checks failure-complete` with only Task 11 paths.

### Task 12A: Make dashboard fallbacks truthful and stable

**Files:**
- Modify: `client/src/contexts/notification-context.tsx`
- Modify: `client/src/components/negotiation-analytics.tsx`
- Modify: `client/src/pages/analytics.tsx`
- Create: `client/src/__tests__/launch-safe-dashboard-fallbacks.test.tsx`

**Interfaces:**
- Authenticated HTTP polling reports delivery availability/connected state without claiming WebSocket connectivity.
- `recentTrend: "stable"` renders “Stable” with a neutral icon; `up` and `down` retain their correct directions.
- `displayData.laneStats ?? EMPTY_ANALYTICS_DATA.laneStats` prevents runtime crashes and renders zero-state values when an older API omits the field.

- [ ] **Step 1: Write RED tests.** Cover authenticated polling state, all three trend values, and absent lane stats.
- [ ] **Step 2: Run RED.** Run `npx vitest run client/src/__tests__/launch-safe-dashboard-fallbacks.test.tsx`.
- [ ] **Step 3: Implement only the truthful polling and dashboard fallback paths.**
- [ ] **Step 4: Run GREEN.** Repeat the focused test, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: harden dashboard fallback states` with only Task 12A paths.

### Task 12B: Keep mobile overlays and workflow semantics accessible

**Files:**
- Modify: `client/src/components/legacy-workflow-notice.tsx`
- Modify: `client/src/components/cookie-consent.tsx`
- Modify: `client/src/pegasus/_group.css`
- Create: `client/src/__tests__/legacy-workflow-notice.test.tsx`
- Test: `client/src/__tests__/peggy-mobile-cookie-layout.test.ts`

**Interfaces:**
- Workflow fallback renders `Button asChild` with one link child, never a link wrapping a button.
- Cookie details toggles `pg-cookie-details-open`; Peggy is hidden while the modal-like details panel is open, then returns after close. At 390px the banner and Peggy remain independently reachable and never overlap.

- [ ] **Step 1: Write RED tests.** Assert one semantic link/no nested button and details-open/closed 390px Peggy geometry/state.
- [ ] **Step 2: Run RED.** Run `npx vitest run client/src/__tests__/legacy-workflow-notice.test.tsx client/src/__tests__/peggy-mobile-cookie-layout.test.ts`.
- [ ] **Step 3: Implement `asChild`, details class toggling/cleanup, and the locked-design CSS state.**
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: align workflow and mobile overlay semantics` with only Task 12B paths.

### Task 12C: Canonicalize retirement, feedback, and saved-deal routes

**Files:**
- Modify: `server/public-library-retirement.ts`
- Modify: `server/routes.ts` feedback/saved-deal/retirement registrations only
- Test: `server/__tests__/public-library-retirement.test.ts`
- Test: `server/__tests__/public-data-route-contract.test.ts`
- Test: `server/__tests__/launch-security-route-contract.test.ts`

**Interfaces:**
- `/resources` registers exactly one permanent 301 to `/strategy-lab`; the shadowing 302/duplicate is removed.
- Peggy feedback uses `rateLimit(30, 60_000)`, independently of the six-per-15-minute intake bucket.
- Each saved-deal handler computes `normalizedDealType = dealType.trim().toLowerCase()` after type validation and uses it for access, persistence, lookup, and deletion.

- [ ] **Step 1: Write RED tests.** Cover one `/resources` 301, feedback middleware order/configuration, and save/delete round trips for whitespace/mixed-case aliases.
- [ ] **Step 2: Run RED.** Run `npx vitest run server/__tests__/public-library-retirement.test.ts server/__tests__/public-data-route-contract.test.ts server/__tests__/launch-security-route-contract.test.ts`.
- [ ] **Step 3: Implement only the permanent redirect, dedicated feedback limiter, and one normalized value per saved-deal handler.**
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check`.
- [ ] **Step 5: Commit.** Commit `fix: canonicalize public route contracts` with only Task 12C paths.

### Task 13: Make review and launch evidence non-vacuous

**Files:**
- Modify: `client/src/__tests__/marketflow-pages-gating.test.tsx`
- Modify: `server/__tests__/launch-security-route-contract.test.ts`
- Create: `scripts/check-secret-assignments.mjs`
- Create: `server/__tests__/secret-assignment-gate-contract.test.ts`
- Modify: `docs/qa/launch-completion-status.md`

**Interfaces:**
- CTA contrast tests parse and assert the rendered foreground color before computing foreground/background contrast; they do not assume white text.
- Every source slice asserts start and end anchors exist and are ordered before evaluating positive/negative content.
- `scripts/check-secret-assignments.mjs` scans tracked text through captured `git grep` output, recognizes `SUPABASE_SERVICE_ROLE_KEY`, `SENDGRID_API_KEY`, and `DATABASE_URL` assignments, and emits only `path:line:KEY=<redacted>` before failing. It never writes a matched value to stdout, stderr, an exception, or the ledger.
- The launch ledger calls run #205 an observed accessibility-gate failure and the later suite “not evaluated,” never “failed only” when sequential jobs were skipped.
- Every automated gate row records full commit SHA, command, UTC timestamp, and result. A Git tree hash is never labeled an exact commit.

- [ ] **Step 1: Write RED tests.** Assert actual foreground parsing, source-slice helper failures for absent start/end/reversed anchors, and a secret-gate fixture whose fake value never appears in captured stdout/stderr. Add a ledger contract assertion for corrected run #205 wording and evidence columns.
- [ ] **Step 2: Run RED.** Run `npx vitest run client/src/__tests__/marketflow-pages-gating.test.tsx server/__tests__/launch-security-route-contract.test.ts server/__tests__/secret-assignment-gate-contract.test.ts`.
- [ ] **Step 3: Implement reliable assertions, value-redacting secret gate, and historical wording/evidence schema.** Preserve historical facts while distinguishing them from current recovery evidence.
- [ ] **Step 4: Run GREEN.** Repeat focused tests, then `npm run check` and `git diff --check`.
- [ ] **Step 5: Commit.** Commit `test: make launch evidence non-vacuous` with only Task 13 paths.

### Task 14: Run the exact-commit local release and security gate

**Files:**
- Modify: `docs/qa/launch-completion-status.md` with exact results only
- Inspect: `.env.example`, `render.yaml`, `.github/workflows/`, `docs/deploy/`, migrations, SQL artifacts, and the final diff

**Interfaces:**
- The runtime candidate commit/tree is immutable during the gate. Any source correction creates a new runtime candidate and restarts this task from Step 1. The later evidence-only documentation successor is a distinct commit with the same runtime tree and is the final PR head for CI.
- Security review uses the `codex-security:security-diff-scan` workflow against exact range `4487bec1378c701cc77a6cef421b9921ddf522d4...<runtime-candidate-SHA>`. Record findings/rulings in the tracked ledger and stop if that workflow is unavailable; do not substitute an unnamed manual scan.

- [ ] **Step 1: Clean install under Node 22.** Run `NPM_CONFIG_CACHE=/tmp/pegasus-recovery-node22-cache npx --yes -p node@22.23.2 -c 'node --version && npm ci --cache /tmp/pegasus-recovery-node22-cache'`. Require `v22.23.2`, exit 0, and an unchanged lockfile.
- [ ] **Step 2: Run the release commands under Node 22.** Run separately: `NPM_CONFIG_CACHE=/tmp/pegasus-recovery-node22-cache npx --yes -p node@22.23.2 -c 'npm audit --omit=dev --audit-level=high'`; the same prefix with `npm run smoke:launch -- --example`; with `npm run check`; with `npm test`; and with `npm run build`. Require zero high/critical production advisories, environment-contract pass, zero TypeScript errors, zero skipped/failed tests, and bundle-budget pass.
- [ ] **Step 3: Run security and hygiene checks.** Invoke `codex-security:security-diff-scan` for the exact base/runtime range. Run `git diff --check`, `git status --short`, `git diff --name-only 4487bec1378c701cc77a6cef421b9921ddf522d4...HEAD`, and `NPM_CONFIG_CACHE=/tmp/pegasus-recovery-node22-cache npx --yes -p node@22.23.2 -c 'node scripts/check-secret-assignments.mjs'`. The scanner may print only redacted path/line/key identifiers.
- [ ] **Step 4: Reconcile all findings.** Use the appendix to point every `F01`–`F41` to its implementation commit and focused passing test. Record the listing-inquiry regression separately.
- [ ] **Step 5: Record exact evidence.** Add runtime commit/tree, UTC timestamp, commands, test/file counts, build/bundle sizes, audit result, and security review outcome to both tracked QA ledgers.
- [ ] **Step 6: Commit documentation only.** Commit `docs: record Pegasus recovery release gate`. Record the runtime predecessor/tree inside tracked files, but keep the documentation successor's eventual GitHub run URL/head evidence in the external PR/check system so the commit does not need to self-reference. Task 15 requires CI on this documentation successor.

### Task 15: Publish the successor PR and close CodeRabbit review

**Files:**
- Modify: successor pull-request title/body/checklist and review threads through GitHub only

**Interfaces:**
- Remote branch `codex/launch-recovery-v2` fast-forwards to the locally verified commit; local and remote Git tree SHAs match.
- The successor PR targets `main`, states that it supersedes PR #25, links the approved base, and contains test/security/visual/staging status without claiming blocked evidence.
- If `coderabbit --version` is available, run `coderabbit review --agent` from the repository and remain silent while it is active. If the CLI is absent, do not execute an unverified remote installer without explicit approval; rely on the installed GitHub CodeRabbit app on the successor PR and request a review there.
- Every new CodeRabbit finding and all 8 unresolved PR #25 inline threads receive evidence-backed resolution. Do not label a manual review as CodeRabbit.
- Any source-changing CodeRabbit or CI fix returns to Task 14 Step 1 and reruns the complete release/security gate. A tracked-document-only fix reruns exact-head CI but does not invalidate the unchanged runtime tree.

- [ ] **Step 1: Confirm concurrency safety.** Fetch remote branch/PR state, compare parents and tree SHAs, and stop on an unexpected remote move until reconciled. Never force-update.
- [ ] **Step 2: Publish by fast-forward.** Use Git credentials if available or create blobs/tree/commit and move the branch through the connected GitHub API. Verify byte-for-byte tree equality.
- [ ] **Step 3: Open/update a draft successor PR.** Include the 41-finding map, exact Node/test/build/security evidence, and clearly marked visual/staging/production gates.
- [ ] **Step 4: Run CodeRabbit review on the exact head.** Address each actionable finding with a focused regression and reviewed commit, then follow the source/docs restart rule above. Resolve old threads only after linking the equivalent tested fix.
- [ ] **Step 5: Require exact-head GitHub Actions green.** Do not cite an older run. Record run URL/ID, head SHA, job results, and CodeRabbit disposition in the PR body/comment and GitHub checks, not in a new tracked commit.
- [ ] **Step 6: Freeze the exact head.** Do not create a post-CI evidence commit. If tracked evidence truly must change, publish it and repeat Step 5 on that new head.

### Task 16: Prove the canonical route gate and priority visual matrix

**Files:**
- Modify: `docs/qa/launch-completion-status.md`
- Test artifact: exact production build from the successor PR head

**Priority screenshot subset:** `/`, `/property-owners`, `/deal-partners`, `/how-we-operate`, `/development`, `/investments`, `/strategy-lab`, `/work-with-apollo`, `/marketflow`, `/marketflow/deals`, `/bring-an-opportunity`, `/connect`, `/peggy`, `/contact`, `/privacy`, `/terms`, `/disclosures`, `/__launch-404-check`. The exhaustive automated route set comes from `shared/public-launch-routes.json` and must include `/about`, `/our-work`, `/buyers`, `/capital`, and every other current Pegasus/standalone public route.

**Journeys:** desktop navigation/More, mobile navigation, theme toggle, homepage hero CTA, opportunity validation, Strategy Lab primary interaction, MarketFlow access request/anonymous hold, Peggy open-close-handoff-delete, contact validation, cookie choice/manage, keyboard focus order, branded 404 recovery.

- [ ] **Step 1: Serve the exact production artifact locally.** Run the built frontend/API-safe preview without production secrets. Confirm the commit manifest and noindex behavior where applicable.
- [ ] **Step 2: Run `npm run check:a11y`.** Require every canonical route at each configured viewport/theme and all journeys to execute. A blocked egress assertion or unhealthy route is a failure, not a skip.
- [ ] **Step 3: Inspect 1440px, 768px, and 390px priority captures.** Verify identity, meaningful content, H1, no overlay/overflow, clear CTA, focus, contrast, no relevant console error, and locked design coherence. Store screenshots outside tracked source.
- [ ] **Step 4: Fix P0/P1 and material trust/conversion P2 defects through new red/green/review commits.** Every source-changing fix returns to Task 14 Step 1, then Task 15 exact-head review/CI, before the entire automated gate and priority captures rerun. No source fix can proceed directly to staging on focused/visual checks alone.
- [ ] **Step 5: Publish an immutable non-production preview only after explicit authorization naming the target.** The preview must be noindex, expose no production secrets/data, return explicit 503 JSON for unavailable APIs, and advertise its commit. Repeat the matrix against its URL.
- [ ] **Step 6: Replace every canonical route, priority screenshot, and journey `PENDING` cell with PASS or a launch ruling and commit `docs: record exact-head visual QA`.** Because this is evidence-only, the runtime tree stays fixed; republish and run Task 15 Steps 1, 2, 5, and 6 on the new documentation head without adding a self-referential run commit.

### Task 17: Prove non-production staging and rollback after approval

**Files:**
- Modify: `docs/qa/launch-completion-status.md`
- Execute/inspect: `docs/deploy/RENDER_DEPLOY.md`
- Execute/inspect: `docs/deploy/SUPABASE_LAUNCH_VERIFICATION.sql`
- Execute against application `DATABASE_URL`: reviewed `migrations/0006_peggy_conversation_deletion.sql` and `migrations/0007_marketflow_offer_integrity.sql`
- Execute against Supabase staging PostgreSQL, in order: `supabase-migration-identity-ownership.sql`, then `supabase-rls-hardening.sql`
- Execute: `scripts/launch-intake-smoke.mjs`

**Approval gate:** Before any staging access—including control-surface checks or read-only inventory—deploy, migration, data mutation, fault injection, or marked test lead, record Apollo's explicit approval naming the non-production Render service, application database, Supabase project/database, and exact PR commit. Production is never a substitute.

- [ ] **Step 1: After approval, resolve control surfaces without printing secrets.** Verify access to the named non-production Render service, application PostgreSQL, Supabase PostgreSQL/project, protected env configuration, SendGrid test recipients, and Pegasus HQ test endpoint.
- [ ] **Step 2: Run read-only impact inventories.** On application PostgreSQL, count Peggy orphans, null/old offer expiries, invalid counts, and integer ceilings. On Supabase PostgreSQL, count identity backfill matches/unmatched/conflicts and inventory policies/grants/views/default privileges/functions. Stop on any orphan, collision, missing target, or ownership conflict; do not auto-delete/remap.
- [ ] **Step 3: Back up and prove recoverability before migration.** Create/verify recoverable backups for both targets. Restore each backup to an isolated disposable clone and run integrity/readiness queries there; never rehearse a destructive restore over staging. Record restore duration and identifiers privately without connection strings.
- [ ] **Step 4: Apply only reviewed migrations with fail-fast behavior.** Apply `0006` then `0007` to the application database. Apply identity ownership then RLS hardening to Supabase PostgreSQL. Verify every SQL postcondition and readiness schema check; never cross the targets.
- [ ] **Step 5: Deploy the exact green PR commit.** Require `/api/ready` 200/no-store, correct commit metadata, auth/login/logout, self access, cross-account/anonymous denial, private-object anti-enumeration, and reviewed MarketFlow access boundaries.
- [ ] **Step 6: Run one marked opportunity.** Execute `npm run smoke:launch -- --base-url "$PEGASUS_STAGING_BASE_URL" --post-test-lead`; verify opportunity row, HQ outbox claim/forward, staff/customer notifications, redacted logs, and approved cleanup.
- [ ] **Step 7: Exercise approved financial and deletion fixtures.** Prove seven-day offers/counters, Peggy delete-versus-late-AI race, native/external identity writes, RLS self success, and cross-user failure with discardable staging fixtures. Do not introduce or activate a staging fault-injection hook. Atomic notification-failure rollback is accepted only from Task 9's exact-head live-Express/transaction behavioral test; rerun that test after the disposable application-database clone has passed migration fixtures. Never break shared notification infrastructure. Use no real customer property/contact data.
- [ ] **Step 8: Prove rollback and database recovery separately.** Rehearse application deploy rollback on staging. Preserve the disposable-clone restore proof for each database and document the reviewed forward-fix/recovery path for non-reversible schema changes; do not imply app rollback reverses migrations.
- [ ] **Step 9: Record `GO` or `NO-GO`.** Any failed P0/security/data assertion is NO-GO with one exact blocker and resume point.

### Task 18: Controlled production handoff

**Files:**
- Modify: `docs/qa/launch-completion-status.md`

- [ ] **Step 1: Present the final evidence packet.** Include final PR SHA/tree, exact-head CI, CodeRabbit disposition, 41-finding map, security scan, 18-route/12-journey matrix, staging readiness/intake/auth/RLS/financial/deletion/rollback proof, remaining P2 rulings, and qualified legal/KW review status.
- [ ] **Step 2: Request one explicit production decision.** Ask only after qualified legal/KW review is satisfied or explicitly rules the exact soft-launch scope safe. Ask whether to merge the exact post-Task-16 gated successor PR head and start the controlled Render production deployment. This does not imply DNS, broad distribution, or payment approval.
- [ ] **Step 3: After approval only, merge and deploy the reviewed commit.** Verify deployed SHA, `/api/ready`, canonical intake, auth, private-data negatives, routes/mobile/accessibility/SEO/SSL assets, notifications, HQ, and logs.
- [ ] **Step 4: Soft-launch and monitor.** Invite the approved small test group, record journey friction/errors/form completion for several days, fix repeated defects through reviewed commits, and request separate approval before DNS changes or broad QR/card distribution.

---

## Exhaustive PR #25 finding assignment

Each of the 41 findings still applicable at `4487bec` appears exactly once below. The recovery-only listing-inquiry mismatch is Task 2 and does not change the review count.

| ID | Finding | Task |
| --- | --- | ---: |
| F01 | Wholesale empty close date | 3 |
| F02 | Peggy calculator access, explanation, and retention truth | 4A, 4C, 5 |
| F03 | Peggy session-ID token mint/IDOR | 4A |
| F04 | Cookie Manage panel covers Peggy | 12B |
| F05 | Duplicate/shadowed `/resources` redirect | 12C |
| F06 | Staff-role set normalization mismatch | 7 |
| F07 | Contrast test assumes white foreground | 13 |
| F08 | Run #205 skipped-suite wording | 13 |
| F09 | HQ outbox cache not identity-scoped | 10 |
| F10 | Object download lacks ACL-before-stream | 6 |
| F11 | Predictable Peggy `Math.random` fallback | 4A |
| F12 | Contradictory Supabase profile policy/grants | 8B |
| F13 | Remote non-TLS HQ endpoint accepted | 10 |
| F14 | Participant document levels ignored | 6 |
| F15 | Staff role guard lacks prior authentication | 6 |
| F16 | Polling notification state always disconnected | 12A |
| F17 | Offer events lack durable notifications | 9 |
| F18 | Gate rows omit exact commit/timestamp | 13 |
| F19 | Visual gate aborts after one route failure | 11 |
| F20 | Readiness lacks cache and no-store | 11 |
| F21 | HQ workers can double-deliver one row | 10 |
| F22 | Displayed and submitted offer prices differ | 3 |
| F23 | Counters have no expiry/depth increment | 9 |
| F24 | Stored offer dates revalidated against moving today | 9 |
| F25 | Native/external owner resolution differs | 8A |
| F26 | External owners cannot list/mark notifications | 8A |
| F27 | Stable negotiation trend shown as declining | 12A |
| F28 | Workflow notice nests link and button | 12B |
| F29 | Analytics crashes on missing `laneStats` | 12A |
| F30 | Peggy feedback shares intake rate bucket | 12C |
| F31 | Saved-deal type persistence/delete mismatch | 12C |
| F32 | First-time public listing context unavailable | 2 |
| F33 | Route source slices can pass vacuously | 13 |
| F34 | Delete authorization ordering test can pass vacuously | 6 |
| F35 | Public DTO negative-field assertions incomplete | 6 |
| F36 | RLS REVOKE regex crosses statements | 8B |
| F37 | SQL safety assertion ignores `with_check` | 8B |
| F38 | MarketFlow identity resolved twice | 7 |
| F39 | MarketFlow ID/email can come from different providers | 7 |
| F40 | Shell classification ignores normalized path | 7 |
| F41 | Client role gate imports database-heavy schema | 7 |

## Final recovery rule

When a task passes both reviews, follow the Required closure protocol and publish the tracked acceptance checkpoint before checking it complete. If a reviewer finds an out-of-scope issue, ledger it with severity and routing; do not silently expand the current task. If this workspace disappears, recover from the remote successor branch, this plan, and `docs/qa/security-launch-recovery-ledger.md`, then resume at the first task without a remote accepted checkpoint.
