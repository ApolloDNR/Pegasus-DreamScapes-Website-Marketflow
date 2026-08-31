# Peggy Access Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace permanent Peggy v1 capabilities with row-bound 24-hour v2 credentials, allow seven-day-bounded server recovery with at most one client refresh/replay per logical operation, and make every Peggy response non-cacheable.

**Architecture:** `server/peggy-access.ts` remains the single capability boundary: it issues and verifies canonical signed v2 payloads, classifies valid/expired/invalid proof, applies refresh grace separately, guards existing operations, and exposes a focused dependency-injected refresh registrar. A pure transport-injected client helper inspects an untouched cloned expiry response, performs at most one refresh and one replay, and is adopted by canonical Peggy with raw `fetch` and by Dock/dormant Chat with `authenticatedRequest`. Production composes the Task 4A identity registrar first, the refresh registrar second, then singular `/api/peggy` and `/api/admin/peggy` no-store prefixes before all remaining Peggy routes.

**Tech Stack:** React 18, TypeScript 5.6, TanStack Query, Express 4, Node `crypto`, native Fetch/Response/AbortSignal, Vitest, Testing Library, Node 22.23.2.

## Global Constraints

- Work only on successor branch `codex/launch-recovery-v2`. The accepted predecessor is exactly `082edfbd0f41dcb3a25c2754dd6a6feda3638c44` (`docs: record Task 4A acceptance`); do not rewrite or amend it.
- An independent reviewer compares this complete draft with accepted HEAD, Program Task 4B, adjacent Tasks 4A/4C/5, the accepted Task 4A child plan, all three Task 4B reconnaissance/adjudication reports, and every named source/test path. Dispatch requires zero Blocker and zero Major plan finding.
- After plan review, the controller promotes this draft byte-for-byte to `docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md` and creates one docs-only checkpoint, `docs: add Peggy access refresh plan`. Implementation starts only from that committed checkpoint.
- Execute with `superpowers:subagent-driven-development`: one fresh implementer for this single parent-task boundary, then fresh specification and code-quality reviewers. Record ignored orchestration evidence under `.superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/`; never stage it.
- Use Node `22.23.2`. Provision `node-linux-x64@22.23.2` under `/tmp/task4b-node22` with writable cache `/tmp/task4b-node-cache` only when `/tmp/task4b-node22/node_modules/node-linux-x64/bin/node` is absent. Every Node/npm/npx command below self-contains `PATH=/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH` plus matching uppercase/lowercase `NPM_CONFIG_CACHE`/`npm_config_cache` values because the inherited environment may define the uppercase option and tool calls may start fresh shells.
- Before RED, run `npm ci` under that pinned runtime and prove `package-lock.json` retains SHA-256 `ef8b16c62e1ee0c50d92230bf8a243945c27d96bcac5fe79f80ab36cd6567c12` and remains byte-for-byte unchanged.
- Public brand casing is exactly **Pegasus Dreamscapes**. Peggy remains intake/orientation, never a decision-maker. Do not change public copy, calculator judgment/explanation wording, AI disclosure, privacy/retention wording, or accessibility labels.
- MarketFlow remains private beta and reviewed access only; authentication alone is never approval.
- Do not mutate production, `main`, Render, any live/staging database, DNS, payment systems, or any external service. Do not push, deploy, issue live/staging requests, or apply a migration.
- Add no dependency, migration, schema/storage interface change, conversation mutation, deletion control, generation ID, broad abort machinery, token persistence, token-family/revocation table, provider/model work, or calculator change. Task 4C owns calculator schema/wording; Task 5 owns deletion, message atomicity, delete/late-response races, and full retention truth.
- Authorized implementation scope is exactly thirteen paths: modify `shared/peggy-access.ts`, `server/peggy-access.ts`, `server/routes.ts`, `server/__tests__/peggy-access.test.ts`, `server/__tests__/peggy-route-auth.test.ts`, `server/__tests__/launch-security-route-contract.test.ts`, `client/src/pegasus/peggy.tsx`, `client/src/components/peggy-dock.tsx`, `client/src/components/peggy-chat.tsx`, `client/src/__tests__/peggy-handoff.test.tsx`, and `client/src/__tests__/peggy-client-session-boundary.test.tsx`; create `client/src/lib/peggy-access.ts` and `client/src/__tests__/peggy-access-refresh.test.ts`.
- Verify byte-for-byte unchanged `server/peggy-route-auth.ts`, `server/peggy.ts`, `server/storage.ts`, `shared/schema.ts`, `client/src/lib/queryClient.ts`, `client/src/contexts/peggy-context.tsx`, `client/src/PublicApp.tsx`, `client/src/App.tsx`, `client/src/LegacyApp.tsx`, `client/src/pegasus/Landing.tsx`, `client/src/pages/privacy.tsx`, `client/src/__tests__/peggy-public-truth.test.tsx`, `server/peggy-phone.ts`, migrations, and dependency manifests.
- Token v2 is exactly `v2.<base64url-json-payload>.<base64url-hmac>`. The canonical decoded JSON is an ordinary object whose exact key order is `namespace`, `version`, `conversationId`, `sessionId`, `userId`, `issuedAt`, `expiresAt`. The signature is HMAC-SHA256 over the literal ASCII `v2.<payload-segment>` with the trimmed configured secret.
- The payload namespace is exactly `pegasus:peggy-conversation-access`; version is exactly `v2`; row ID/session/nullable-owner bindings equal the current row; timestamps are nonnegative safe-integer Unix milliseconds; `expiresAt === issuedAt + 86_400_000`; and future-issued claims are invalid. Issuance captures its injected clock exactly once. A token is valid at `issuedAt <= now < expiresAt` and expired at `now >= expiresAt`.
- Verification is total and returns exactly `{ status: "valid", expiresAt }`, `{ status: "expired", expiresAt }`, or `{ status: "invalid" }`. It rejects legacy v1 immediately, tokens over 2,048 characters, noncanonical/padded base64url, segment-count errors, invalid UTF-8/JSON, noncanonical object bytes/key order, malformed claims, unsafe arithmetic, tampering, and cross-row/session/owner binding. Compare the exact 32-byte signature with `timingSafeEqual` only after an equal-length check.
- Issued lifetime is exactly 24 hours (`86_400_000` ms). Anonymous renewal grace begins inclusively at `expiresAt` and ends inclusively seven days later (`604_800_000` ms). The verifier classifies an authentic row-bound token as expired at any age after expiry, and a non-owner guarded operation returns the exact coded 401 at any expired age. Only refresh applies the seven-day grace and maps one millisecond beyond it to the ordinary 404. An authentic token whose `expiresAt === Number.MAX_SAFE_INTEGER - 604_800_000` remains the last safe boundary and may renew; if `expiresAt + 604_800_000` would exceed `Number.MAX_SAFE_INTEGER`, refresh returns that same no-store 404 without issuance. A valid v2 capability never refreshes early.
- Refresh is exactly `POST /api/peggy/conversations/:id/access/refresh`, accepts no identity/body authority, and returns exactly `{ id, accessToken }`. It loads one existing row and never creates, starts, updates, deletes, messages, or invokes a provider.
- Any supplied `X-Peggy-Conversation-Token` header—including blank/whitespace—selects capability refresh semantics even for the exact row owner. Only an authentic expired v2 token at `expiresAt <= now <= expiresAt + 604_800_000` may renew. A header-absent exact normalized OIDC/Supabase row owner is the separate account-recovery path and may recover at any time. Anonymous/different owner, valid/v1/malformed/tampered/cross-row/future/beyond-grace token, invalid ID, and deleted/missing row are indistinguishable `404 { message: "Conversation not found" }`.
- Refresh resolves/trim-checks the secret before clock/storage; missing/blank secret returns exact 503 with zero storage. It captures one valid millisecond clock value for verification, grace, and issuance. Dependency exceptions are caught locally as exact generic 500 and never reach production's message-echoing global handler.
- The normal access guard sets no-store defensively, keeps current invalid-ID 400 behavior, loads the row once, and catches dependency exceptions locally. Body `userId`, `sessionId`, and `accessToken`, arbitrary identity headers, and the legacy session object are never identity or capability authority. Exact normalized row ownership always wins for guarded operations, even if the owner also supplied a malformed or expired Peggy header. A non-owner with valid v2 succeeds; a non-owner with any authentic row-bound expired v2 gets exact `401 { message: "Conversation access expired", code: "PEGGY_ACCESS_EXPIRED" }` even beyond refresh grace; v1/invalid proof gets the ordinary 404. Header-presence precedence applies only to refresh.
- Register the accepted Task 4A identity registrar first and the focused refresh registrar second; each owns `peggyIdentityNoStore` before its injected limiter. Immediately afterward mount exactly one `app.use("/api/peggy", peggyIdentityNoStore)` and exactly one `app.use("/api/admin/peggy", peggyIdentityNoStore)` before all later history/list/chat/finish/phone/admin/suggestions/feedback routes. This avoids double middleware on registrar routes while covering every later 200/400/401/403/404/429/500/503 outcome.
- Client `peggyFetchWithSingleRefresh` requires an injected fetcher. Canonical public Peggy injects raw `fetch` and must not import Supabase-aware code. Dock and dormant Chat inject `authenticatedRequest`; `apiRequest` remains unchanged and is not used for guarded chat/feedback after adoption.
- Exactly one means per logical helper invocation: original once; only an exact cloned `401` body whose `code === "PEGGY_ACCESS_EXPIRED"` triggers refresh once; a valid exact replacement triggers replay once; the replay is returned without recursion. There is no module-global single-flight, token-family lifetime, or cross-operation one-refresh claim. Concurrent logical calls may each spend their own bounded budget.
- Original/non-expiry and replay responses remain untouched and readable. A non-2xx refresh response is returned as the helper's final raw response with no replacement/replay. Any successful 2xx refresh status other than exact HTTP 200 (including 201, 204, or 299) throws only generic `Error("Peggy access refresh failed")` without interpreting its body, replacing credentials, invoking the callback, or replaying. Only exact 200 enters replacement parsing; invalid JSON, extra/missing fields, wrong/nonpositive ID, blank/same token, or mismatched conversation ID throws that same generic error, replaces nothing, and never replays. The replacement token is opaque to browser code; the client never decodes it or requires a version prefix.
- Clone caller headers; never mutate caller `RequestInit`/`Headers`. Original and replay preserve URL, method, string body, credentials, signal, Authorization, Content-Type, and custom headers, changing only the Peggy capability. Refresh is POST with no body, the same signal/credentials/non-Peggy headers, and the old Peggy capability. Check abort before and after every awaited fetch, expiry-clone JSON, and refresh JSON; also check before credential replacement, after the credential callback/ref reread, before replay, and after replay. Preserve the exact AbortError/rejection.
- The helper captures the composite credential once. After refresh validation it replaces only when the ref still has the captured row and failed token. If the row changed/cleared, return the untouched original expiry with no callback/replay. If another invocation already refreshed the same row, never overwrite it; replay with the current same-row token. After installing/callback, re-read the ref and abort state before replay so a synchronous replacement/abort stops the leg.
- Canonical keeps the composite credential only in a ref and retains one AbortController per send. Dock/dormant mirror a composite credential ref to existing component-memory state; creation/New clears or replaces both atomically. Creation/suggestions/calculator remain on their existing transports. Chat/feedback reject every final non-ok response before JSON parsing, and the helper's generic rejection for an unexpected successful refresh status enters the same existing error/fallback path rather than being misread as a successful chat or feedback response. Feedback marks success only after a successful original/replay. Replay creates no duplicate optimistic or live-region message. Preserve existing create/chat New guards; do not add a shared chat/feedback operation lock, so the real supported feedback-refresh-versus-New race proves helper CAS prevents stale replacement/replay/success marking without Task 5 generation IDs.
- Create one primary implementation commit `fix: expire Peggy credentials with bounded refresh`. The same implementer addresses Blocker/Major specification and Critical/Important quality findings in additive focused commits; never amend/squash. The controller adjudicates every Minor.
- Never stage `.recovery/`, `.superpowers/`, generated `dist/`, the child plan, program/acceptance ledgers, later-task paths, or unrelated changes.

---

## Controller-only pre-dispatch plan checkpoint

After independent preflight reports no Blocker/Major:

```bash
cmp -s .recovery/task4b-peggy-access-refresh-draft.md docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
sha256sum .recovery/task4b-peggy-access-refresh-draft.md docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
git diff --check -- docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
git add -- docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
test "$(git diff --cached --name-only | wc -l | tr -d ' ')" = "1"
git commit -m "docs: add Peggy access refresh plan"
test "$(git rev-parse HEAD^)" = "082edfbd0f41dcb3a25c2754dd6a6feda3638c44"
git show --format= --name-only HEAD | sed '/^$/d'
```

Expected: hashes match; only the tracked child plan is cached/committed; its parent is accepted Task 4A. Never stage `.recovery/`.

## File Map

- Modify `shared/peggy-access.ts`: shared header, exact expiry code/body, and shared `{ id, accessToken }` response DTO.
- Modify `server/peggy-access.ts`: canonical v2 codec, total verifier, bounded access guard, and injected refresh registrar.
- Modify `server/routes.ts`: inject verified identity into access, compose refresh after Task 4A registrar, and mount two singular section no-store prefixes.
- Modify `server/__tests__/peggy-access.test.ts`: pure crypto/clock matrix plus live guard/refresh behavior and non-leaking error budgets.
- Modify `server/__tests__/peggy-route-auth.test.ts`: replace only the new-issuance v1 format assertion with exact v2 payload/lifetime proof.
- Modify `server/__tests__/launch-security-route-contract.test.ts`: non-vacuous production registrar/no-store/auth/order composition.
- Create `client/src/lib/peggy-access.ts`: pure injected-fetch original/refresh/replay state machine.
- Create `client/src/__tests__/peggy-access-refresh.test.ts`: raw Response/clone/abort/header/budget/concurrency unit contract.
- Modify canonical Peggy and its handoff test: raw-fetch adoption, one visual turn, fallback, handoff, same signal, and no second refresh.
- Modify Dock/dormant Chat and the real component boundary test: authenticated raw transport adoption for chat/feedback, response checking, token replacement, and creation/New/storage preservation.

### Task 4B: Expire Peggy credentials with one bounded per-operation refresh

**Files:**
- Modify: `shared/peggy-access.ts`
- Modify: `server/peggy-access.ts`
- Modify: `server/routes.ts`
- Modify: `server/__tests__/peggy-access.test.ts`
- Modify: `server/__tests__/peggy-route-auth.test.ts`
- Modify: `server/__tests__/launch-security-route-contract.test.ts`
- Create: `client/src/lib/peggy-access.ts`
- Create: `client/src/__tests__/peggy-access-refresh.test.ts`
- Modify: `client/src/pegasus/peggy.tsx`
- Modify: `client/src/components/peggy-dock.tsx`
- Modify: `client/src/components/peggy-chat.tsx`
- Modify: `client/src/__tests__/peggy-handoff.test.tsx`
- Modify: `client/src/__tests__/peggy-client-session-boundary.test.tsx`

**Interfaces:**
- Produces `PEGGY_ACCESS_EXPIRED_CODE`, `PeggyConversationAccessExpiredResponse`, canonical v2 `createPeggyConversationAccessToken`, total structured `verifyPeggyConversationAccessToken`, hardened `createPeggyConversationAccessGuard`, and `registerPeggyConversationAccessRefreshRoute`.
- Production refresh consumes only no-store, the existing public intake limiter, existing row lookup/secret resolver, narrow verified-user resolver, one clock, verifier, and issuer; it exposes no mutation/provider dependency.
- Produces pure `peggyFetchWithSingleRefresh(input)` with a required `PeggyFetchTransport` and caller-owned composite `{ id, accessToken }` ref. Its compare-and-swap prevents a late refresh from overwriting a newer token or replacement conversation.
- Preserves accepted Task 4A create/new/calculator and page-memory interfaces, Task 4C's transitional calculator seam, and Task 5's deletion/storage ownership.

- [ ] **Step 1: Confirm reviewed plan checkpoint, accepted base, pinned runtime, clean install, and ignored workspace.**

Run:

```bash
git status --short --untracked-files=no
git branch --show-current
git log -5 --oneline
test "$(git rev-parse HEAD^)" = "082edfbd0f41dcb3a25c2754dd6a6feda3638c44"
git ls-files --error-unmatch docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
git diff --exit-code HEAD -- docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
if [ ! -x /tmp/task4b-node22/node_modules/node-linux-x64/bin/node ]; then
  mkdir -p /tmp/task4b-node22 /tmp/task4b-node-cache /tmp/task4b-npm-cache
  env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-node-cache npm_config_cache=/tmp/task4b-node-cache npm install --prefix /tmp/task4b-node22 --no-save node-linux-x64@22.23.2
fi
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache node --version
test "$(sha256sum package-lock.json | cut -d ' ' -f1)" = "ef8b16c62e1ee0c50d92230bf8a243945c27d96bcac5fe79f80ab36cd6567c12"
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npm ci
test "$(sha256sum package-lock.json | cut -d ' ' -f1)" = "ef8b16c62e1ee0c50d92230bf8a243945c27d96bcac5fe79f80ab36cd6567c12"
git diff --exit-code -- package-lock.json
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/__tests__/peggy-client-session-boundary.test.tsx client/src/__tests__/peggy-handoff.test.tsx
```

Expected: tracked clean; branch `codex/launch-recovery-v2`; HEAD is the reviewed docs-only plan checkpoint whose parent is `082edf...`; plan unchanged; runtime prints `v22.23.2`; clean install exits 0; lock hash and bytes stay unchanged; the accepted baseline reports exactly 5 files and 156 tests PASS. Stop on mismatch.

- [ ] **Step 2: Initialize ignored SDD evidence using packaged scripts and `apply_patch` only.**

Run:

```bash
bash /root/.codex/plugins/cache/openai-curated-remote/superpowers/6.2.0/skills/subagent-driven-development/scripts/sdd-workspace docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
bash /root/.codex/plugins/cache/openai-curated-remote/superpowers/6.2.0/skills/subagent-driven-development/scripts/task-brief docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md 4B .superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/task-4B-brief.md
git rev-parse HEAD
```

The scripts are intentionally invoked through `bash`. Using `apply_patch`, create `.superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/implementation-base.sha` containing the exact full SHA printed above plus newline. Using `apply_patch`, create `progress.md` with this literal content; then add an `Implementer:` bullet containing the exact fresh worker identity reported by the controller (never a metavariable or editing token):

```md
# SDD ledger — plan: docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md

- Implementation base: recorded verbatim in implementation-base.sha
- Parent task: 4B — Expire Peggy credentials with one bounded per-operation refresh
- Branch: codex/launch-recovery-v2
- Runtime: Node 22.23.2

## Task 4B

- Status: implementation dispatched
- RED evidence: pending
- GREEN evidence: pending
- Review evidence: pending
```

Verify:

```bash
test "$(cat .superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/implementation-base.sha)" = "$(git rev-parse HEAD)"
sed -n '1,16p' .superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/progress.md
git status --short --ignored .superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh
```

Expected: base matches HEAD, the ledger names the literal implementer identity and sibling base file without any editing token, and the workspace is ignored. Never stage it.

- [ ] **Step 3: Replace the access test with complete canonical-v2, live-guard, and live-refresh RED coverage.**

Replace `server/__tests__/peggy-access.test.ts` with this complete file. It imports the focused module as a namespace so absent Task 4B exports cannot fail collection. Exact fallback constants keep the test clock geometry meaningful, while the test-only registrar fallback installs a readable 501 response. A separate non-vacuity assertion still requires the literal production constants and registrar export, so the fallbacks cannot hide a missing or mutated public surface. All behavioral assertions therefore execute on the accepted base; the fallback is never production code and disappears automatically once the real exports exist. Defaulted token-segment destructuring also keeps the legacy two-segment v1 issuer inside assertion paths during RED.

```ts
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response as ExpressResponse,
} from "express";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import * as peggyAccessModule from "../peggy-access";
import type {
  PeggyConversationAccessRecord,
} from "../peggy-access";

const {
  createPeggyConversationAccessGuard,
  createPeggyConversationAccessToken,
  PEGGY_CONVERSATION_ACCESS_HEADER,
  verifyPeggyConversationAccessToken,
} = peggyAccessModule;

type RefreshRegistrar = (
  app: Pick<Express, "post">,
  options: {
    noStore: RequestHandler;
    rateLimit: RequestHandler;
    [key: string]: unknown;
  },
) => void;

const task4bExports = peggyAccessModule as unknown as Record<string, unknown>;
const tokenLifetimeExport = task4bExports.PEGGY_ACCESS_TOKEN_LIFETIME_MS;
const refreshGraceExport = task4bExports.PEGGY_ACCESS_REFRESH_GRACE_MS;
const refreshRegistrarExport =
  task4bExports.registerPeggyConversationAccessRefreshRoute;
const PEGGY_ACCESS_TOKEN_LIFETIME_MS =
  typeof tokenLifetimeExport === "number" ? tokenLifetimeExport : 86_400_000;
const PEGGY_ACCESS_REFRESH_GRACE_MS =
  typeof refreshGraceExport === "number" ? refreshGraceExport : 604_800_000;
const registerPeggyConversationAccessRefreshRoute: RefreshRegistrar =
  typeof refreshRegistrarExport === "function"
    ? refreshRegistrarExport as RefreshRegistrar
    : (app, { noStore, rateLimit }) => {
        app.post(
          "/api/peggy/conversations/:id/access/refresh",
          noStore,
          rateLimit,
          (_req, res) => res.status(501).json({
            message: "Task 4B refresh registrar is not implemented",
          }),
        );
      };

const accessSource = readFileSync(
  resolve(import.meta.dirname, "../peggy-access.ts"),
  "utf8",
);

const TEST_SECRET = "test-only-peggy-conversation-secret".repeat(2);
const NAMESPACE = "pegasus:peggy-conversation-access";
const ISSUED_AT = 1_800_000_000_000;
const EXPIRES_AT = ISSUED_AT + PEGGY_ACCESS_TOKEN_LIFETIME_MS;
const GRACE_END = EXPIRES_AT + PEGGY_ACCESS_REFRESH_GRACE_MS;

describe("Task 4B server export surface", () => {
  it("locks the exact lifetime, grace, and refresh registrar exports", () => {
    expect(tokenLifetimeExport).toBe(86_400_000);
    expect(refreshGraceExport).toBe(604_800_000);
    expect(refreshRegistrarExport).toBeTypeOf("function");
  });
});

type Conversation = PeggyConversationAccessRecord & { title: string };

const anonymousRow: Conversation = {
  id: 41,
  sessionId: "11111111-1111-4111-8111-111111111111",
  userId: null,
  title: "Anonymous",
};
const secondRow: Conversation = {
  id: 42,
  sessionId: "22222222-2222-4222-8222-222222222222",
  userId: null,
  title: "Second",
};
const ownedRow: Conversation = {
  id: 43,
  sessionId: "33333333-3333-4333-8333-333333333333",
  userId: "owner-43",
  title: "Owned",
};

function payloadFor(
  row: PeggyConversationAccessRecord,
  issuedAt = ISSUED_AT,
) {
  return {
    namespace: NAMESPACE,
    version: "v2",
    conversationId: row.id,
    sessionId: row.sessionId,
    userId: row.userId ?? null,
    issuedAt,
    expiresAt: issuedAt + 86_400_000,
  };
}

function tokenFromPayloadJson(
  payloadJson: string,
  secret = TEST_SECRET,
): string {
  const payloadSegment = Buffer.from(payloadJson, "utf8").toString("base64url");
  const signingInput = `v2.${payloadSegment}`;
  const signature = createHmac("sha256", secret.trim())
    .update(signingInput, "utf8")
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function tokenFromPayload(
  payload: Record<string, unknown>,
  secret = TEST_SECRET,
): string {
  return tokenFromPayloadJson(JSON.stringify(payload), secret);
}

function tokenFromPayloadBytes(payload: Buffer): string {
  const payloadSegment = payload.toString("base64url");
  const signingInput = `v2.${payloadSegment}`;
  const signature = createHmac("sha256", TEST_SECRET)
    .update(signingInput, "utf8")
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function tokenWithPaddedPayload(
  row: PeggyConversationAccessRecord,
): string {
  const canonical = Buffer.from(
    JSON.stringify(payloadFor(row)),
    "utf8",
  ).toString("base64url");
  const padded = `${canonical}=`;
  const signingInput = `v2.${padded}`;
  const signature = createHmac("sha256", TEST_SECRET)
    .update(signingInput, "utf8")
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function issue(
  row: PeggyConversationAccessRecord,
  issuedAt = ISSUED_AT,
): string {
  return createPeggyConversationAccessToken(
    row,
    TEST_SECRET,
    () => issuedAt,
  );
}

describe("Peggy v2 capability wire contract", () => {
  it("encodes the exact canonical object and signs the literal version/payload", () => {
    const now = vi.fn(() => ISSUED_AT);
    const token = createPeggyConversationAccessToken(ownedRow, TEST_SECRET, now);
    expect(now).toHaveBeenCalledOnce();
    const segments = token.split(".");
    expect(segments).toHaveLength(3);
    expect(segments[0]).toBe("v2");
    expect(segments[1]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(segments[2]).toMatch(/^[A-Za-z0-9_-]+$/);
    const json = Buffer.from(segments[1], "base64url").toString("utf8");
    expect(json).toBe(JSON.stringify(payloadFor(ownedRow)));
    const payload = JSON.parse(json);
    expect(Object.keys(payload)).toEqual([
      "namespace",
      "version",
      "conversationId",
      "sessionId",
      "userId",
      "issuedAt",
      "expiresAt",
    ]);
    expect(payload).toEqual(payloadFor(ownedRow));
    expect(payload.expiresAt - payload.issuedAt).toBe(86_400_000);
    const independentSignature = createHmac("sha256", TEST_SECRET)
      .update(`v2.${segments[1]}`, "utf8")
      .digest("base64url");
    expect(segments[2]).toBe(independentSignature);
  });

  it("is deterministic only for the same row, secret, and millisecond", () => {
    const token = issue(anonymousRow);
    expect(issue(anonymousRow)).toBe(token);
    expect(issue(anonymousRow, ISSUED_AT + 1)).not.toBe(token);
    expect(issue(secondRow)).not.toBe(token);
    expect(issue({ ...anonymousRow, sessionId: "changed" })).not.toBe(token);
    expect(issue({ ...anonymousRow, userId: "new-owner" })).not.toBe(token);
    expect(createPeggyConversationAccessToken(
      anonymousRow,
      `${TEST_SECRET}-different`,
      () => ISSUED_AT,
    )).not.toBe(token);
  });

  it.each([
    ["blank secret", anonymousRow, "   ", ISSUED_AT],
    ["zero id", { ...anonymousRow, id: 0 }, TEST_SECRET, ISSUED_AT],
    ["unsafe id", { ...anonymousRow, id: Number.MAX_SAFE_INTEGER + 1 }, TEST_SECRET, ISSUED_AT],
    ["non-string session", { ...anonymousRow, sessionId: 1 }, TEST_SECRET, ISSUED_AT],
    ["invalid owner", { ...anonymousRow, userId: 1 }, TEST_SECRET, ISSUED_AT],
    ["negative time", anonymousRow, TEST_SECRET, -1],
    ["fractional time", anonymousRow, TEST_SECRET, ISSUED_AT + 0.5],
    ["unsafe time", anonymousRow, TEST_SECRET, Number.MAX_SAFE_INTEGER],
  ])("rejects invalid issuance input: %s", (_label, row, secret, nowMs) => {
    expect(() => createPeggyConversationAccessToken(
      row as PeggyConversationAccessRecord,
      secret as string,
      () => nowMs as number,
    )).toThrow();
  });

  it("uses exact valid/expired boundaries and one verification clock read", () => {
    const token = issue(anonymousRow);
    for (const [nowMs, expected] of [
      [ISSUED_AT - 1, { status: "invalid" }],
      [ISSUED_AT, { status: "valid", expiresAt: EXPIRES_AT }],
      [EXPIRES_AT - 1, { status: "valid", expiresAt: EXPIRES_AT }],
      [EXPIRES_AT, { status: "expired", expiresAt: EXPIRES_AT }],
      [GRACE_END, { status: "expired", expiresAt: EXPIRES_AT }],
      [GRACE_END + 1, { status: "expired", expiresAt: EXPIRES_AT }],
      [GRACE_END + 365 * 24 * 60 * 60 * 1_000, { status: "expired", expiresAt: EXPIRES_AT }],
    ] as const) {
      const now = vi.fn(() => nowMs);
      expect(verifyPeggyConversationAccessToken(
        anonymousRow,
        token,
        TEST_SECRET,
        now,
      )).toEqual(expected);
      expect(now).toHaveBeenCalledOnce();
    }
  });

  it.each([
    ["namespace", { ...payloadFor(anonymousRow), namespace: "other" }],
    ["payload version", { ...payloadFor(anonymousRow), version: "v3" }],
    ["row id", { ...payloadFor(anonymousRow), conversationId: 42 }],
    ["session", { ...payloadFor(anonymousRow), sessionId: "other" }],
    ["owner", { ...payloadFor(anonymousRow), userId: "other" }],
    ["id type", { ...payloadFor(anonymousRow), conversationId: "41" }],
    ["unsafe id", { ...payloadFor(anonymousRow), conversationId: Number.MAX_SAFE_INTEGER + 1 }],
    ["issued type", { ...payloadFor(anonymousRow), issuedAt: "now" }],
    ["negative issue", { ...payloadFor(anonymousRow), issuedAt: -1 }],
    ["fractional issue", { ...payloadFor(anonymousRow), issuedAt: ISSUED_AT + 0.5 }],
    ["unsafe expiry", { ...payloadFor(anonymousRow), expiresAt: Number.MAX_SAFE_INTEGER + 1 }],
    ["short lifetime", { ...payloadFor(anonymousRow), expiresAt: EXPIRES_AT - 1 }],
    ["long lifetime", { ...payloadFor(anonymousRow), expiresAt: EXPIRES_AT + 1 }],
    ["extra key", { ...payloadFor(anonymousRow), extra: true }],
  ])("rejects correctly signed noncanonical claim: %s", (_label, payload) => {
    expect(verifyPeggyConversationAccessToken(
      anonymousRow,
      tokenFromPayload(payload),
      TEST_SECRET,
      () => ISSUED_AT,
    )).toEqual({ status: "invalid" });
  });

  it("rejects reordered and duplicate canonical keys even when signed", () => {
    const value = payloadFor(anonymousRow);
    const reordered = JSON.stringify({
      version: value.version,
      namespace: value.namespace,
      conversationId: value.conversationId,
      sessionId: value.sessionId,
      userId: value.userId,
      issuedAt: value.issuedAt,
      expiresAt: value.expiresAt,
    });
    const duplicate = `{"namespace":"${NAMESPACE}","version":"v2","conversationId":41,"conversationId":41,"sessionId":"${anonymousRow.sessionId}","userId":null,"issuedAt":${ISSUED_AT},"expiresAt":${EXPIRES_AT}}`;
    for (const payloadJson of [reordered, duplicate]) {
      expect(verifyPeggyConversationAccessToken(
        anonymousRow,
        tokenFromPayloadJson(payloadJson),
        TEST_SECRET,
        () => ISSUED_AT,
      )).toEqual({ status: "invalid" });
    }
  });

  it.each([
    ["empty", ""],
    ["legacy v1", `v1.${createHmac("sha256", TEST_SECRET).update("legacy").digest("base64url")}`],
    ["two segments", "v2.payload"],
    ["four segments", "v2.payload.signature.extra"],
    ["empty payload", "v2..signature"],
    ["empty signature", "v2.payload."],
    ["padded signature", `${issue(anonymousRow)}=`],
    ["correctly signed padded payload", tokenWithPaddedPayload(anonymousRow)],
    ["whitespace", ` ${issue(anonymousRow)}`],
    ["oversize", `v2.${"a".repeat(2_100)}.signature`],
    ["invalid JSON", tokenFromPayloadJson("not json")],
    ["null JSON", tokenFromPayloadJson("null")],
    ["array JSON", tokenFromPayloadJson("[]")],
    ["invalid UTF-8", tokenFromPayloadBytes(Buffer.from([0xc3, 0x28]))],
  ])("returns invalid without throwing for malformed %s", (_label, token) => {
    expect(() => verifyPeggyConversationAccessToken(
      anonymousRow,
      token,
      TEST_SECRET,
      () => ISSUED_AT,
    )).not.toThrow();
    expect(verifyPeggyConversationAccessToken(
      anonymousRow,
      token,
      TEST_SECRET,
      () => ISSUED_AT,
    )).toEqual({ status: "invalid" });
  });

  it("enforces the last representable token length below the 2,048 cap", () => {
    const belowCapRow = {
      ...anonymousRow,
      sessionId: "s".repeat(1_336),
    };
    const firstOverCapRow = {
      ...anonymousRow,
      sessionId: "s".repeat(1_337),
    };
    const belowCap = issue(belowCapRow);
    const firstOverCap = issue(firstOverCapRow);

    expect(belowCap).toHaveLength(2_047);
    expect(firstOverCap).toHaveLength(2_049);
    expect(verifyPeggyConversationAccessToken(
      belowCapRow,
      belowCap,
      TEST_SECRET,
      () => ISSUED_AT,
    )).toEqual({ status: "valid", expiresAt: EXPIRES_AT });
    expect(verifyPeggyConversationAccessToken(
      firstOverCapRow,
      firstOverCap,
      TEST_SECRET,
      () => ISSUED_AT,
    )).toEqual({ status: "invalid" });
  });

  it("rejects tampering, wrong signature length, blank secret, and cross-binding", () => {
    const token = issue(anonymousRow);
    const [version = "", payload = "", signature = ""] = token.split(".");
    const last = payload.at(-1) === "A" ? "B" : "A";
    const tamperedPayload = `${payload.slice(0, -1)}${last}`;
    for (const candidate of [
      `${version}.${tamperedPayload}.${signature}`,
      `${version}.${payload}.AA`,
      `${version}.${payload}.${signature.slice(1)}`,
    ]) {
      expect(verifyPeggyConversationAccessToken(
        anonymousRow,
        candidate,
        TEST_SECRET,
        () => ISSUED_AT,
      )).toEqual({ status: "invalid" });
    }
    expect(verifyPeggyConversationAccessToken(
      anonymousRow,
      token,
      "   ",
      () => ISSUED_AT,
    )).toEqual({ status: "invalid" });
    for (const row of [
      secondRow,
      { ...anonymousRow, sessionId: "other-session" },
      { ...anonymousRow, userId: "owner" },
    ]) {
      expect(verifyPeggyConversationAccessToken(
        row,
        token,
        TEST_SECRET,
        () => ISSUED_AT,
      )).toEqual({ status: "invalid" });
    }
  });

  it("checks length then signature before decoding or parsing claims", () => {
    const lengthCheck = accessSource.indexOf(
      "actualSignature.length !== expectedSignature.length",
    );
    const timingCompare = accessSource.indexOf(
      "timingSafeEqual(actualSignature, expectedSignature)",
    );
    const utf8Decode = accessSource.indexOf('new TextDecoder("utf-8"');
    const jsonParse = accessSource.indexOf("JSON.parse(payloadText)");
    expect([lengthCheck, timingCompare, utf8Decode, jsonParse].every(
      (index) => index >= 0,
    )).toBe(true);
    expect(lengthCheck).toBeLessThan(timingCompare);
    expect(timingCompare).toBeLessThan(utf8Decode);
    expect(utf8Decode).toBeLessThan(jsonParse);
  });
});

const conversations = new Map<number, Conversation>();
const calls: string[] = [];
let nowMs = ISSUED_AT;
let configuredSecret: string | null = TEST_SECRET;
let limited = false;
let rejectLookup = false;
let rejectClock = false;
let rejectIdentity = false;
let rejectVerify = false;
let rejectIssue = false;
let guardedHandlerCalls = 0;
let downstreamErrorCalls = 0;
let server: Server | undefined;
let baseUrl = "";

function noStore(_req: Request, res: ExpressResponse, next: NextFunction) {
  calls.push("no-store");
  res.set("Cache-Control", "no-store");
  next();
}

const refreshLimit: RequestHandler = (_req, res, next) => {
  calls.push("limit");
  if (limited) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  next();
};

async function getConversation(id: number): Promise<Conversation | undefined> {
  calls.push("lookup");
  if (rejectLookup) throw new Error("lookup sentinel secret");
  return conversations.get(id);
}

function getSecret(): string | null {
  calls.push("secret");
  return configuredSecret;
}

function clock(): number {
  calls.push("clock");
  if (rejectClock) throw new Error("clock sentinel secret");
  return nowMs;
}

function getVerifiedUserId(req: Request): string | null {
  calls.push("identity");
  if (rejectIdentity) throw new Error("identity sentinel secret");
  const authRequest = req as Request & {
    user?: { claims?: { sub?: unknown } };
    supabaseUser?: { id?: unknown };
  };
  for (const candidate of [
    authRequest.user?.claims?.sub,
    authRequest.supabaseUser?.id,
  ]) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

const verifyToken = (
  row: PeggyConversationAccessRecord,
  token: string,
  secret: string,
  now: () => number = () => nowMs,
) => {
  calls.push("verify");
  if (rejectVerify) throw new Error("verify sentinel secret");
  return verifyPeggyConversationAccessToken(row, token, secret, now);
};

const createToken = (
  row: PeggyConversationAccessRecord,
  secret: string,
  now: () => number = () => nowMs,
) => {
  calls.push("issue");
  if (rejectIssue) throw new Error("issue sentinel secret");
  return createPeggyConversationAccessToken(row, secret, now);
};

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.session = { user: { id: "forged-session-owner" } };
    const oidc = req.get("x-test-oidc-user");
    const supabase = req.get("x-test-supabase-user");
    if (oidc) req.user = { claims: { sub: oidc } };
    if (supabase) req.supabaseUser = { id: supabase };
    next();
  });

  const guard = createPeggyConversationAccessGuard({
    getConversation,
    getSecret,
    getVerifiedUserId,
    now: clock,
    verifyAccessToken: verifyToken,
  });

  app.get("/api/peggy/guard/:id", guard, (_req, res) => {
    guardedHandlerCalls += 1;
    res.json({ id: res.locals.peggyConversation.id });
  });
  app.post(
    "/api/peggy/guard-chat",
    noStore,
    refreshLimit,
    guard,
    (_req, res) => {
      guardedHandlerCalls += 1;
      res.json({ accepted: true });
    },
  );
  registerPeggyConversationAccessRefreshRoute(app, {
    noStore,
    rateLimit: refreshLimit,
    getConversation,
    getSecret,
    getVerifiedUserId,
    now: clock,
    verifyAccessToken: verifyToken,
    createAccessToken: createToken,
  });
  app.use((error: unknown, _req: Request, res: ExpressResponse, _next: NextFunction) => {
    downstreamErrorCalls += 1;
    res.status(500).json({
      message: error instanceof Error ? error.message : String(error),
    });
  });

  server = createServer(app);
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) =>
    server!.close((error) => error ? reject(error) : resolve()),
  );
});

beforeEach(() => {
  conversations.clear();
  for (const row of [anonymousRow, secondRow, ownedRow]) {
    conversations.set(row.id, { ...row });
  }
  calls.length = 0;
  nowMs = ISSUED_AT;
  configuredSecret = TEST_SECRET;
  limited = false;
  rejectLookup = false;
  rejectClock = false;
  rejectIdentity = false;
  rejectVerify = false;
  rejectIssue = false;
  guardedHandlerCalls = 0;
  downstreamErrorCalls = 0;
});

function requestHeaders(
  token?: string,
  extra: Record<string, string> = {},
): Record<string, string> {
  return token === undefined
    ? extra
    : { ...extra, [PEGGY_CONVERSATION_ACCESS_HEADER]: token };
}

async function guarded(
  id: string | number,
  token?: string,
  extra: Record<string, string> = {},
) {
  return fetch(`${baseUrl}/api/peggy/guard/${id}`, {
    headers: requestHeaders(token, extra),
  });
}

async function refresh(
  id: string | number,
  token?: string,
  extra: Record<string, string> = {},
) {
  return fetch(`${baseUrl}/api/peggy/conversations/${id}/access/refresh`, {
    method: "POST",
    headers: requestHeaders(token, extra),
  });
}

async function responseShape(response: globalThis.Response) {
  return {
    status: response.status,
    cache: response.headers.get("cache-control"),
    body: await response.json(),
  };
}

const notFoundShape = {
  status: 404,
  cache: "no-store",
  body: { message: "Conversation not found" },
};

describe("Peggy guarded-operation access", () => {
  it("admits valid v2 proof and exact header-absent OIDC/Supabase owners", async () => {
    const token = issue(anonymousRow);
    nowMs = EXPIRES_AT - 1;
    const capabilityResponse = await guarded(41, token);
    expect(capabilityResponse.status).toBe(200);
    expect(capabilityResponse.headers.get("cache-control")).toBe("no-store");
    expect(guardedHandlerCalls).toBe(1);

    calls.length = 0;
    const oidcOwnerResponse = await guarded(43, undefined, {
      "x-test-oidc-user": " owner-43 ",
    });
    expect(oidcOwnerResponse.status).toBe(200);
    expect(oidcOwnerResponse.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["lookup", "identity"]);

    calls.length = 0;
    expect((await guarded(43, undefined, {
      "x-test-supabase-user": "owner-43",
    })).status).toBe(200);
    expect(calls).toEqual(["lookup", "identity"]);
  });

  it("returns coded 401 for authentic non-owner expiry at any age", async () => {
    const token = issue(anonymousRow);
    for (const candidateNow of [
      EXPIRES_AT,
      GRACE_END,
      GRACE_END + 1,
      GRACE_END + 365 * 24 * 60 * 60 * 1_000,
    ]) {
      nowMs = candidateNow;
      expect(await responseShape(await guarded(41, token))).toEqual({
        status: 401,
        cache: "no-store",
        body: {
          message: "Conversation access expired",
          code: "PEGGY_ACCESS_EXPIRED",
        },
      });
      expect(guardedHandlerCalls).toBe(0);
    }
  });

  it("makes missing, v1, malformed, tampered, cross-row, future, and deleted proof indistinguishable", async () => {
    const token = issue(anonymousRow);
    const [version = "", payload = "", signature = ""] = token.split(".");
    const invalid = [
      undefined,
      "v1.invalid",
      "v2.invalid",
      `${version}.${payload}.${signature.slice(1)}`,
      issue(secondRow),
      issue(anonymousRow, ISSUED_AT + 1),
    ];
    for (const candidate of invalid) {
      expect(await responseShape(await guarded(41, candidate))).toEqual(notFoundShape);
    }
    conversations.delete(41);
    expect(await responseShape(await guarded(41, token))).toEqual(notFoundShape);
  });

  it("lets exact OIDC/Supabase guarded ownership win for every header state", async () => {
    const token = issue(ownedRow);
    const ownerHeaders: Array<Record<string, string>> = [
      { "x-test-oidc-user": "owner-43" },
      { "x-test-supabase-user": " owner-43 " },
    ];
    for (const ownerHeader of ownerHeaders) {
      for (const [candidateNow, supplied] of [
        [EXPIRES_AT - 1, undefined],
        [EXPIRES_AT - 1, "   "],
        [EXPIRES_AT - 1, "v1.invalid"],
        [EXPIRES_AT - 1, issue(secondRow)],
        [EXPIRES_AT, token],
        [GRACE_END + 1, token],
      ] as const) {
        nowMs = candidateNow;
        expect((await guarded(43, supplied, ownerHeader)).status).toBe(200);
      }
    }
  });

  it("rejects header/session identity spoofing and a different verified owner", async () => {
    const response = await fetch(`${baseUrl}/api/peggy/guard/43`, {
      headers: {
        "content-type": "application/json",
        "x-user-id": "owner-43",
        "x-test-oidc-user": "different-owner",
      },
    });
    expect(await responseShape(response)).toEqual(notFoundShape);
  });

  it("rejects guarded POST body owner/session/token authority", async () => {
    const response = await fetch(`${baseUrl}/api/peggy/guard-chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": "owner-43",
      },
      body: JSON.stringify({
        conversationId: 43,
        userId: "owner-43",
        sessionId: ownedRow.sessionId,
        accessToken: issue(ownedRow),
      }),
    });

    expect(await responseShape(response)).toEqual(notFoundShape);
    expect(calls).toEqual([
      "no-store", "limit", "lookup", "identity", "secret",
    ]);
    expect(calls).not.toContain("verify");
    expect(guardedHandlerCalls).toBe(0);
  });

  it("keeps invalid guarded IDs as no-store 400 without lookup", async () => {
    expect(await responseShape(await guarded("not-an-id"))).toEqual({
      status: 400,
      cache: "no-store",
      body: { message: "Invalid conversation id" },
    });
    expect(calls).toEqual([]);
  });

  it("keeps a pre-guard limiter terminal and no-store", async () => {
    limited = true;
    const response = await fetch(`${baseUrl}/api/peggy/guard-chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: 41 }),
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "limit"]);
    expect(guardedHandlerCalls).toBe(0);
  });

  it.each([
    ["lookup", () => { rejectLookup = true; }, issue(anonymousRow)],
    ["clock", () => { rejectClock = true; }, issue(anonymousRow)],
    ["verification", () => { rejectVerify = true; }, issue(anonymousRow)],
    ["identity", () => { rejectIdentity = true; }, undefined],
  ])("contains %s failure as generic no-store 500", async (_label, arrange, token) => {
    arrange();
    const response = await guarded(token === undefined ? 43 : 41, token);
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/sentinel|secret|clock|lookup/i);
    expect(downstreamErrorCalls).toBe(0);
    expect(guardedHandlerCalls).toBe(0);
  });
});

describe("Peggy refresh registrar", () => {
  it("runs no-store then limiter before all refresh work", async () => {
    limited = true;
    const response = await refresh(41, issue(anonymousRow));
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "limit"]);
  });

  it.each([
    ["exact expiry", EXPIRES_AT],
    ["middle grace", EXPIRES_AT + 3 * 24 * 60 * 60 * 1_000],
    ["inclusive grace end", GRACE_END],
  ])("renews authentic expired proof at %s", async (_label, candidateNow) => {
    nowMs = candidateNow;
    const response = await refresh(41, issue(anonymousRow));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(Object.keys(body)).toEqual(["id", "accessToken"]);
    expect(body.id).toBe(41);
    expect(body.accessToken).toMatch(/^v2\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(verifyPeggyConversationAccessToken(
      anonymousRow,
      body.accessToken,
      TEST_SECRET,
      () => candidateNow,
    )).toEqual({
      status: "valid",
      expiresAt: candidateNow + PEGGY_ACCESS_TOKEN_LIFETIME_MS,
    });
    expect(calls).toEqual([
      "no-store", "limit", "secret", "clock", "lookup", "verify", "issue",
    ]);
  });

  it("returns exact 404 without issuance when refresh grace would overflow", async () => {
    const issuedAt =
      Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_TOKEN_LIFETIME_MS;
    const expiresAt = Number.MAX_SAFE_INTEGER;
    const token = issue(anonymousRow, issuedAt);
    nowMs = expiresAt;

    expect(await responseShape(await refresh(41, token))).toEqual(
      notFoundShape,
    );
    expect(calls).toEqual([
      "no-store", "limit", "secret", "clock", "lookup", "verify",
    ]);
    expect(calls).not.toContain("issue");
  });

  it("renews once at the last safe refresh-grace arithmetic boundary", async () => {
    const expiresAt =
      Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_REFRESH_GRACE_MS;
    const issuedAt = expiresAt - PEGGY_ACCESS_TOKEN_LIFETIME_MS;
    const token = issue(anonymousRow, issuedAt);
    nowMs = expiresAt;

    const response = await refresh(41, token);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(Object.keys(body)).toEqual(["id", "accessToken"]);
    expect(body.id).toBe(41);
    expect(calls).toEqual([
      "no-store", "limit", "secret", "clock", "lookup", "verify", "issue",
    ]);
    expect(calls.filter((call) => call === "issue")).toHaveLength(1);
  });

  it("allows only header-absent exact OIDC/Supabase owners to recover anytime", async () => {
    nowMs = GRACE_END + 365 * 24 * 60 * 60 * 1_000;
    const ownerHeaders: Array<Record<string, string>> = [
      { "x-test-oidc-user": "owner-43" },
      { "x-test-supabase-user": " owner-43 " },
    ];
    for (const headers of ownerHeaders) {
      calls.length = 0;
      const response = await refresh(43, undefined, headers);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        id: 43,
        accessToken: expect.stringMatching(/^v2\./),
      });
      expect(calls).toEqual([
        "no-store", "limit", "secret", "clock", "lookup", "identity", "issue",
      ]);
    }
  });

  it("rejects refresh body owner/session/token authority without issuance", async () => {
    nowMs = EXPIRES_AT;
    const response = await fetch(
      `${baseUrl}/api/peggy/conversations/43/access/refresh`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "owner-43",
        },
        body: JSON.stringify({
          conversationId: 43,
          userId: "owner-43",
          sessionId: ownedRow.sessionId,
          accessToken: issue(ownedRow),
        }),
      },
    );

    expect(await responseShape(response)).toEqual(notFoundShape);
    expect(calls).toEqual([
      "no-store", "limit", "secret", "clock", "lookup", "identity",
    ]);
    expect(calls).not.toContain("verify");
    expect(calls).not.toContain("issue");
  });

  it("never lets owner identity override a supplied token path", async () => {
    const token = issue(ownedRow);
    for (const [candidateNow, supplied, expectedStatus] of [
      [EXPIRES_AT - 1, token, 404],
      [EXPIRES_AT, token, 200],
      [GRACE_END + 1, token, 404],
      [EXPIRES_AT, "v1.invalid", 404],
      [EXPIRES_AT, "   ", 404],
    ] as const) {
      nowMs = candidateNow;
      const response = await refresh(43, supplied, {
        "x-test-oidc-user": "owner-43",
      });
      expect(response.status).toBe(expectedStatus);
    }
  });

  it("allows a different authenticated caller only with authentic expired capability", async () => {
    nowMs = EXPIRES_AT;
    expect((await refresh(41, issue(anonymousRow), {
      "x-test-oidc-user": "different-user",
    })).status).toBe(200);
    expect(await responseShape(await refresh(41, undefined, {
      "x-test-oidc-user": "different-user",
    }))).toEqual(notFoundShape);
  });

  it("makes valid, v1, malformed, tampered, cross-row, future, beyond-grace, absent, and deleted proof indistinguishable", async () => {
    const token = issue(anonymousRow);
    const [version = "", payload = "", signature = ""] = token.split(".");
    for (const [candidateNow, candidate] of [
      [EXPIRES_AT - 1, token],
      [EXPIRES_AT, "v1.invalid"],
      [EXPIRES_AT, "v2.invalid"],
      [EXPIRES_AT, `${version}.${payload}.${signature.slice(1)}`],
      [EXPIRES_AT, issue(secondRow)],
      [ISSUED_AT, issue(anonymousRow, ISSUED_AT + 1)],
      [GRACE_END + 1, token],
      [EXPIRES_AT, undefined],
    ] as const) {
      nowMs = candidateNow;
      expect(await responseShape(await refresh(41, candidate))).toEqual(notFoundShape);
    }
    conversations.delete(41);
    nowMs = EXPIRES_AT;
    expect(await responseShape(await refresh(41, token))).toEqual(notFoundShape);
  });

  it.each(["not-an-id", "0", "9007199254740992"])(
    "returns no-store 404 for invalid refresh id %s before secret/storage",
    async (id) => {
      expect(await responseShape(await refresh(id, issue(anonymousRow)))).toEqual(notFoundShape);
      expect(calls).toEqual(["no-store", "limit"]);
    },
  );

  it.each([null, "   "])(
    "returns exact 503 for missing/blank secret before clock/storage (%s)",
    async (secret) => {
      configuredSecret = secret;
      const response = await refresh(41, issue(anonymousRow));
      expect(await responseShape(response)).toEqual({
        status: 503,
        cache: "no-store",
        body: { message: "Peggy conversation access is unavailable" },
      });
      expect(calls).toEqual(["no-store", "limit", "secret"]);
    },
  );

  it.each([
    ["lookup", () => { rejectLookup = true; }, issue(anonymousRow), 41],
    ["clock", () => { rejectClock = true; }, issue(anonymousRow), 41],
    ["verification", () => { rejectVerify = true; }, issue(anonymousRow), 41],
    ["issuance", () => { rejectIssue = true; }, issue(anonymousRow), 41],
    ["identity", () => { rejectIdentity = true; }, undefined, 43],
  ])("contains refresh %s failure as generic no-store 500", async (
    _label,
    arrange,
    token,
    id,
  ) => {
    nowMs = EXPIRES_AT;
    arrange();
    const response = await refresh(id, token);
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/sentinel|secret|clock|lookup/i);
    expect(downstreamErrorCalls).toBe(0);
  });
});
```

The RED deliberately requires: exact canonical object bytes and HMAC input; v1 invalidation; safe clock/lifetime/bindings; coded non-owner guard expiry at any age; guarded-owner precedence; refresh-only header precedence, inclusive grace, and overflow-safe grace rejection; no-store before limiter; local generic failures; exact refresh DTO; and zero early/unsafe issuance. It does not claim cross-invocation/lifetime single-flight.

- [ ] **Step 4: Run the server access RED and record only causal failures.**

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-access.test.ts
```

Expected on the accepted base: all 77 tests collect and execute; 73 FAIL at explicit contract/behavioral assertions and 4 PASS. The first failure is the non-vacuity export assertion (`tokenLifetimeExport` is `undefined`, not `86_400_000`); the permanent v1 issuer's injected-clock assertion (zero calls instead of one), exact 2,047/2,049-character boundary, guarded-POST body poison, refresh body poison/zero-issuance case, and last-safe refresh-grace equality are also causal. The error scan must show no failed suite, module-resolution error, `TypeError`, `ReferenceError`, or `SyntaxError`. No monolithic route import, database, provider, or external request occurs. Record the exact failed assertion names/counts and zero collection errors in the ignored ledger.

- [ ] **Step 5: Add RED for Task 4A issuance compatibility and exact production composition.**

In `server/__tests__/peggy-route-auth.test.ts`, replace the complete `accepts an absent body as empty context at %s` parameterized test with the following. Keep every other Task 4A test and opaque v1 poison fixture unchanged:

```ts
  it.each([
    "/api/peggy/conversations",
    "/api/peggy/conversations/new",
  ])("accepts an absent body as empty context at %s", async (path) => {
    const beforeIssue = Date.now();
    const response = await post(path, undefined);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    const afterIssue = Date.now();
    expect(body).toEqual({
      id: 100,
      accessToken: expect.stringMatching(
        /^v2\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
      ),
    });
    const [, payloadSegment] = body.accessToken.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadSegment, "base64url").toString("utf8"),
    );
    expect(Object.keys(payload)).toEqual([
      "namespace",
      "version",
      "conversationId",
      "sessionId",
      "userId",
      "issuedAt",
      "expiresAt",
    ]);
    expect(payload).toMatchObject({
      namespace: "pegasus:peggy-conversation-access",
      version: "v2",
      conversationId: 100,
      sessionId: "00000000-0000-4000-8000-000000000001",
      userId: null,
    });
    expect(payload.issuedAt).toBeGreaterThanOrEqual(beforeIssue);
    expect(payload.issuedAt).toBeLessThanOrEqual(afterIssue);
    expect(payload.expiresAt - payload.issuedAt).toBe(86_400_000);
    expect(startCalls).toEqual([expect.objectContaining({ context: {} })]);
  });
```

In `server/__tests__/launch-security-route-contract.test.ts`, extend the existing `../peggy-access` import/wiring ownership by appending this test inside the existing describe. It reuses the already-total `sliceBetweenOnce` helper:

```ts
  it("composes refresh and singular Peggy no-store prefixes in exact order", () => {
    expect(
      routesSource.match(/registerPeggyConversationAccessRefreshRoute/g),
    ).toHaveLength(2); // one import plus one production call
    expect(
      routesSource.match(
        /app\.use\("\/api\/peggy", peggyIdentityNoStore\);/g,
      ),
    ).toHaveLength(1);
    expect(
      routesSource.match(
        /app\.use\("\/api\/admin\/peggy", peggyIdentityNoStore\);/g,
      ),
    ).toHaveLength(1);

    const guardFactory = sliceBetweenOnce(
      routesSource,
      "const requirePeggyConversationAccess =",
      "\n\n  const peggyIdentityNoStore",
      "Peggy access guard factory",
    );
    for (const dependency of [
      "createPeggyConversationAccessGuard({",
      "getConversation: (id) => storage.getPeggyConversation(id)",
      "getVerifiedUserId: getVerifiedPeggyUserId",
    ]) {
      expect(guardFactory).toContain(dependency);
    }

    const peggyComposition = sliceBetweenOnce(
      routesSource,
      "const requirePeggyConversationAccess =",
      "\n  // Get conversation history",
      "Peggy access composition",
    );
    const ordered = [
      "registerPeggyIdentityRoutes(app, {",
      "registerPeggyConversationAccessRefreshRoute(app, {",
      'app.use("/api/peggy", peggyIdentityNoStore);',
      'app.use("/api/admin/peggy", peggyIdentityNoStore);',
    ].map((anchor) => peggyComposition.indexOf(anchor));
    expect(ordered.every((index) => index >= 0)).toBe(true);
    expect(ordered).toEqual([...ordered].sort((a, b) => a - b));

    const refreshWiring = sliceBetweenOnce(
      peggyComposition,
      "registerPeggyConversationAccessRefreshRoute(app, {",
      '\n\n  app.use("/api/peggy", peggyIdentityNoStore);',
      "Peggy refresh registrar wiring",
    );
    for (const dependency of [
      "noStore: peggyIdentityNoStore",
      "rateLimit: publicIntakeRateLimit",
      "getConversation: (id) => storage.getPeggyConversation(id)",
      "getVerifiedUserId: getVerifiedPeggyUserId",
      "getSecret: getPeggyConversationAccessSecret",
      "verifyAccessToken: verifyPeggyConversationAccessToken",
      "createAccessToken: createPeggyConversationAccessToken",
    ]) {
      expect(refreshWiring).toContain(dependency);
    }
    expect(refreshWiring).not.toMatch(
      /startWebConversation|createPeggyConversation\s*\(|updatePeggy|deletePeggy|peggy\.chat|analyzeCalculator/,
    );

    const publicPrefix = routesSource.indexOf(
      'app.use("/api/peggy", peggyIdentityNoStore);',
    );
    for (const route of [
      'app.get("/api/peggy/conversations/:id"',
      'app.get("/api/peggy/conversations"',
      'app.post("/api/peggy/chat"',
      'app.post("/api/peggy/conversations/:id/finish"',
      '"/api/peggy/phone/webhook"',
      'app.post("/api/peggy/suggestions"',
      'app.post("/api/peggy/messages/:id/feedback"',
    ]) {
      expect(routesSource.indexOf(route), `${route} after public no-store`).toBeGreaterThan(
        publicPrefix,
      );
    }
    const adminPrefix = routesSource.indexOf(
      'app.use("/api/admin/peggy", peggyIdentityNoStore);',
    );
    for (const route of [
      'app.get("/api/admin/peggy/conversations", isHybridAuthenticated,',
      'app.get("/api/admin/peggy/conversations/:id", isHybridAuthenticated,',
    ]) {
      expect(routesSource.indexOf(route), `${route} after admin no-store`).toBeGreaterThan(
        adminPrefix,
      );
    }
  });
```

Update the `../peggy-access` import in `server/routes.ts` is not part of this RED step. The new source contract must fail before production composition exists.

- [ ] **Step 6: Run the combined server/static RED under pinned Node.**

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts
```

Expected: FAIL only for missing v2/refresh/no-store composition. The unchanged Task 4A context, identity, parser, calculator, owner-history, and token-oracle assertions remain green. Record exact failures before implementation.

- [ ] **Step 7: Implement the shared expiry contract and the complete v2/guard/refresh boundary.**

Replace `shared/peggy-access.ts` with:

```ts
export const PEGGY_CONVERSATION_ACCESS_HEADER =
  "X-Peggy-Conversation-Token";

export const PEGGY_ACCESS_EXPIRED_CODE = "PEGGY_ACCESS_EXPIRED";

export interface PeggyConversationAccessResponse {
  id: number;
  accessToken: string;
}

export interface PeggyConversationAccessExpiredResponse {
  message: "Conversation access expired";
  code: typeof PEGGY_ACCESS_EXPIRED_CODE;
}
```

Replace `server/peggy-access.ts` with the following complete module. Do not retain the v1 array encoder or boolean verifier.

```ts
import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import {
  PEGGY_ACCESS_EXPIRED_CODE,
  PEGGY_CONVERSATION_ACCESS_HEADER,
  type PeggyConversationAccessExpiredResponse,
  type PeggyConversationAccessResponse,
} from "@shared/peggy-access";

export {
  PEGGY_ACCESS_EXPIRED_CODE,
  PEGGY_CONVERSATION_ACCESS_HEADER,
};

export const PEGGY_ACCESS_TOKEN_LIFETIME_MS = 86_400_000;
export const PEGGY_ACCESS_REFRESH_GRACE_MS = 604_800_000;

const TOKEN_VERSION = "v2";
const TOKEN_NAMESPACE = "pegasus:peggy-conversation-access";
const MAX_TOKEN_LENGTH = 2_048;
const NOT_FOUND_RESPONSE = { message: "Conversation not found" } as const;
const INTERNAL_ERROR_RESPONSE = { message: "Internal server error" } as const;
const UNAVAILABLE_RESPONSE = {
  message: "Peggy conversation access is unavailable",
} as const;
const INVALID_ID_RESPONSE = { message: "Invalid conversation id" } as const;
const EXPIRED_RESPONSE: PeggyConversationAccessExpiredResponse = {
  message: "Conversation access expired",
  code: PEGGY_ACCESS_EXPIRED_CODE,
};
const PAYLOAD_KEYS = [
  "namespace",
  "version",
  "conversationId",
  "sessionId",
  "userId",
  "issuedAt",
  "expiresAt",
] as const;
const BASE64URL_SEGMENT = /^[A-Za-z0-9_-]+$/;

export interface PeggyConversationAccessRecord {
  id: number;
  sessionId: string;
  userId?: string | null;
}

interface PeggyConversationAccessPayload {
  namespace: typeof TOKEN_NAMESPACE;
  version: typeof TOKEN_VERSION;
  conversationId: number;
  sessionId: string;
  userId: string | null;
  issuedAt: number;
  expiresAt: number;
}

export type PeggyConversationAccessVerification =
  | { status: "valid"; expiresAt: number }
  | { status: "expired"; expiresAt: number }
  | { status: "invalid" };

type VerifyAccessToken = (
  conversation: PeggyConversationAccessRecord,
  token: string,
  secret: string,
  now?: () => number,
) => PeggyConversationAccessVerification;

type CreateAccessToken = (
  conversation: PeggyConversationAccessRecord,
  secret: string,
  now?: () => number,
) => string;

interface PeggyConversationAccessGuardOptions<
  T extends PeggyConversationAccessRecord,
> {
  getConversation: (id: number) => Promise<T | undefined>;
  getSecret?: () => string | null | undefined;
  getVerifiedUserId?: (req: Request) => string | null;
  now?: () => number;
  verifyAccessToken?: VerifyAccessToken;
}

interface PeggyConversationAccessRefreshRouteOptions<
  T extends PeggyConversationAccessRecord,
> {
  noStore: RequestHandler;
  rateLimit: RequestHandler;
  getConversation: (id: number) => Promise<T | undefined>;
  getSecret?: () => string | null | undefined;
  getVerifiedUserId?: (req: Request) => string | null;
  now?: () => number;
  verifyAccessToken?: VerifyAccessToken;
  createAccessToken?: CreateAccessToken;
}

function normalizedUserId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function authenticatedUserId(req: Request): string | null {
  const authRequest = req as Request & {
    user?: { claims?: { sub?: unknown } };
    supabaseUser?: { id?: unknown };
  };
  return (
    normalizedUserId(authRequest.user?.claims?.sub) ??
    normalizedUserId(authRequest.supabaseUser?.id)
  );
}

function normalizeConversation(
  conversation: PeggyConversationAccessRecord,
): Omit<PeggyConversationAccessPayload, "issuedAt" | "expiresAt"> {
  if (
    !Number.isSafeInteger(conversation.id) ||
    conversation.id <= 0 ||
    typeof conversation.sessionId !== "string" ||
    !conversation.sessionId ||
    !(
      conversation.userId == null ||
      (typeof conversation.userId === "string" && conversation.userId.length > 0)
    )
  ) {
    throw new Error("Invalid Peggy conversation access record");
  }
  return {
    namespace: TOKEN_NAMESPACE,
    version: TOKEN_VERSION,
    conversationId: conversation.id,
    sessionId: conversation.sessionId,
    userId: conversation.userId ?? null,
  };
}

function readClock(now: () => number): number {
  const value = now();
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Invalid Peggy conversation access clock");
  }
  return value;
}

function decodeCanonicalBase64url(segment: string): Buffer | null {
  if (!segment || !BASE64URL_SEGMENT.test(segment)) return null;
  try {
    const decoded = Buffer.from(segment, "base64url");
    return decoded.toString("base64url") === segment ? decoded : null;
  } catch {
    return null;
  }
}

function hasExactPayloadShape(
  value: unknown,
): value is PeggyConversationAccessPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  return (
    keys.length === PAYLOAD_KEYS.length &&
    keys.every((key, index) => key === PAYLOAD_KEYS[index]) &&
    record.namespace === TOKEN_NAMESPACE &&
    record.version === TOKEN_VERSION &&
    Number.isSafeInteger(record.conversationId) &&
    (record.conversationId as number) > 0 &&
    typeof record.sessionId === "string" &&
    record.sessionId.length > 0 &&
    (record.userId === null ||
      (typeof record.userId === "string" && record.userId.length > 0)) &&
    Number.isSafeInteger(record.issuedAt) &&
    (record.issuedAt as number) >= 0 &&
    Number.isSafeInteger(record.expiresAt) &&
    (record.expiresAt as number) >= 0 &&
    (record.issuedAt as number) <=
      Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_TOKEN_LIFETIME_MS &&
    record.expiresAt ===
      (record.issuedAt as number) + PEGGY_ACCESS_TOKEN_LIFETIME_MS
  );
}

export function getPeggyConversationAccessSecret(): string | null {
  return (
    process.env.PEGGY_CONVERSATION_ACCESS_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim() ||
    null
  );
}

export function createPeggyConversationAccessToken(
  conversation: PeggyConversationAccessRecord,
  secret: string,
  now: () => number = Date.now,
): string {
  const normalizedSecret = secret.trim();
  if (!normalizedSecret) {
    throw new Error("Peggy conversation access secret is not configured");
  }
  const issuedAt = readClock(now);
  if (issuedAt > Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_TOKEN_LIFETIME_MS) {
    throw new Error("Invalid Peggy conversation access clock");
  }
  const payload: PeggyConversationAccessPayload = {
    ...normalizeConversation(conversation),
    issuedAt,
    expiresAt: issuedAt + PEGGY_ACCESS_TOKEN_LIFETIME_MS,
  };
  const payloadSegment = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signed = `${TOKEN_VERSION}.${payloadSegment}`;
  const signature = createHmac("sha256", normalizedSecret)
    .update(signed, "ascii")
    .digest("base64url");
  return `${signed}.${signature}`;
}

export function verifyPeggyConversationAccessToken(
  conversation: PeggyConversationAccessRecord,
  token: string,
  secret: string,
  now: () => number = Date.now,
): PeggyConversationAccessVerification {
  try {
    const normalizedSecret = secret.trim();
    if (
      !normalizedSecret ||
      typeof token !== "string" ||
      token.length > MAX_TOKEN_LENGTH
    ) {
      return { status: "invalid" };
    }
    const segments = token.split(".");
    if (segments.length !== 3 || segments[0] !== TOKEN_VERSION) {
      return { status: "invalid" };
    }
    const payloadBytes = decodeCanonicalBase64url(segments[1]);
    const actualSignature = decodeCanonicalBase64url(segments[2]);
    if (!payloadBytes || !actualSignature || actualSignature.length !== 32) {
      return { status: "invalid" };
    }
    const expectedSignature = createHmac("sha256", normalizedSecret)
      .update(`${TOKEN_VERSION}.${segments[1]}`, "ascii")
      .digest();
    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return { status: "invalid" };
    }
    const payloadText = new TextDecoder("utf-8", { fatal: true }).decode(
      payloadBytes,
    );
    const payload: unknown = JSON.parse(payloadText);
    if (
      !hasExactPayloadShape(payload) ||
      JSON.stringify(payload) !== payloadText
    ) {
      return { status: "invalid" };
    }
    const expectedConversation = normalizeConversation(conversation);
    if (
      payload.conversationId !== expectedConversation.conversationId ||
      payload.sessionId !== expectedConversation.sessionId ||
      payload.userId !== expectedConversation.userId
    ) {
      return { status: "invalid" };
    }
    const nowMs = readClock(now);
    if (payload.issuedAt > nowMs) return { status: "invalid" };
    return nowMs < payload.expiresAt
      ? { status: "valid", expiresAt: payload.expiresAt }
      : { status: "expired", expiresAt: payload.expiresAt };
  } catch {
    return { status: "invalid" };
  }
}

function requestedConversationId(req: Request): number | null {
  const rawId = req.body?.conversationId ?? req.params.id;
  const id = typeof rawId === "number" ? rawId : Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function refreshConversationId(req: Request): number | null {
  const rawId = req.params.id;
  if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) return null;
  const id = Number(rawId);
  return Number.isSafeInteger(id) ? id : null;
}

function isExactOwner(
  conversation: PeggyConversationAccessRecord,
  userId: string | null,
): boolean {
  return Boolean(userId && conversation.userId && userId === conversation.userId);
}

function sendInternalError(res: Response): Response {
  return res.status(500).json(INTERNAL_ERROR_RESPONSE);
}

export function createPeggyConversationAccessGuard<
  T extends PeggyConversationAccessRecord,
>({
  getConversation,
  getSecret = getPeggyConversationAccessSecret,
  getVerifiedUserId = authenticatedUserId,
  now = Date.now,
  verifyAccessToken = verifyPeggyConversationAccessToken,
}: PeggyConversationAccessGuardOptions<T>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.set("Cache-Control", "no-store");
    const conversationId = requestedConversationId(req);
    if (conversationId === null) {
      return res.status(400).json(INVALID_ID_RESPONSE);
    }
    try {
      const conversation = await getConversation(conversationId);
      if (!conversation) return res.status(404).json(NOT_FOUND_RESPONSE);

      if (isExactOwner(conversation, getVerifiedUserId(req))) {
        res.locals.peggyConversation = conversation;
        return next();
      }

      const accessToken =
        req.get(PEGGY_CONVERSATION_ACCESS_HEADER)?.trim() || "";
      const secret = getSecret()?.trim() || "";
      if (!accessToken || !secret) {
        return res.status(404).json(NOT_FOUND_RESPONSE);
      }
      const nowMs = readClock(now);
      const verification = verifyAccessToken(
        conversation,
        accessToken,
        secret,
        () => nowMs,
      );
      if (verification.status === "valid") {
        res.locals.peggyConversation = conversation;
        return next();
      }
      if (verification.status === "expired") {
        return res.status(401).json(EXPIRED_RESPONSE);
      }
      return res.status(404).json(NOT_FOUND_RESPONSE);
    } catch {
      return sendInternalError(res);
    }
  };
}

export function registerPeggyConversationAccessRefreshRoute<
  T extends PeggyConversationAccessRecord,
>(
  app: Pick<Express, "post">,
  {
    noStore,
    rateLimit,
    getConversation,
    getSecret = getPeggyConversationAccessSecret,
    getVerifiedUserId = authenticatedUserId,
    now = Date.now,
    verifyAccessToken = verifyPeggyConversationAccessToken,
    createAccessToken = createPeggyConversationAccessToken,
  }: PeggyConversationAccessRefreshRouteOptions<T>,
): void {
  app.post(
    "/api/peggy/conversations/:id/access/refresh",
    noStore,
    rateLimit,
    async (req: Request, res: Response) => {
      const conversationId = refreshConversationId(req);
      if (conversationId === null) {
        return res.status(404).json(NOT_FOUND_RESPONSE);
      }
      try {
        const secret = getSecret()?.trim() || "";
        if (!secret) return res.status(503).json(UNAVAILABLE_RESPONSE);
        const nowMs = readClock(now);
        const conversation = await getConversation(conversationId);
        if (!conversation) return res.status(404).json(NOT_FOUND_RESPONSE);

        const suppliedToken = req.get(PEGGY_CONVERSATION_ACCESS_HEADER);
        if (suppliedToken !== undefined) {
          const verification = verifyAccessToken(
            conversation,
            suppliedToken.trim(),
            secret,
            () => nowMs,
          );
          if (
            verification.status !== "expired" ||
            verification.expiresAt >
              Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_REFRESH_GRACE_MS ||
            nowMs > verification.expiresAt + PEGGY_ACCESS_REFRESH_GRACE_MS
          ) {
            return res.status(404).json(NOT_FOUND_RESPONSE);
          }
        } else if (!isExactOwner(conversation, getVerifiedUserId(req))) {
          return res.status(404).json(NOT_FOUND_RESPONSE);
        }

        const body: PeggyConversationAccessResponse = {
          id: conversation.id,
          accessToken: createAccessToken(conversation, secret, () => nowMs),
        };
        return res.status(200).json(body);
      } catch {
        return sendInternalError(res);
      }
    },
  );
}
```

The guard intentionally asks verified identity before token verification, because exact owner precedence is a guarded-operation rule. The refresh handler intentionally tests header presence before identity, because refresh has the opposite precedence. The verifier reports authentic expiry at every age; only the refresh handler applies the inclusive seven-day bound.

- [ ] **Step 8: Wire verified ownership, refresh, and the two singular section no-store prefixes.**

In the `./peggy-access` import in `server/routes.ts`, add the registrar and verifier while preserving the existing issuer/secret imports:

```ts
import {
  createPeggyConversationAccessGuard,
  createPeggyConversationAccessToken,
  getPeggyConversationAccessSecret,
  registerPeggyConversationAccessRefreshRoute,
  verifyPeggyConversationAccessToken,
} from "./peggy-access";
```

Replace the Peggy composition block from `const requirePeggyConversationAccess =` through the identity registrar call with this exact ordering. Leave `// Get conversation history` and all following handlers in place.

```ts
  const requirePeggyConversationAccess =
    createPeggyConversationAccessGuard({
      getConversation: (id) => storage.getPeggyConversation(id),
      getVerifiedUserId: getVerifiedPeggyUserId,
    });

  const peggyIdentityNoStore: RequestHandler = (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  };
  const peggyCalculatorRateLimit = rateLimit(10, 60_000);

  registerPeggyIdentityRoutes(app, {
    noStore: peggyIdentityNoStore,
    publicCreateRateLimit: publicIntakeRateLimit,
    calculatorRateLimit: peggyCalculatorRateLimit,
    isHybridAuthenticated,
    getVerifiedPeggyUserId,
    randomUUID,
    getAccessSecret: getPeggyConversationAccessSecret,
    createAccessToken: createPeggyConversationAccessToken,
    startWebConversation: peggy.startWebConversation,
    parseCalculatorRequest: parseTransitionalPeggyCalculatorRequest,
    analyzeCalculator: peggy.analyzeCalculatorResults,
  });

  registerPeggyConversationAccessRefreshRoute(app, {
    noStore: peggyIdentityNoStore,
    rateLimit: publicIntakeRateLimit,
    getConversation: (id) => storage.getPeggyConversation(id),
    getVerifiedUserId: getVerifiedPeggyUserId,
    getSecret: getPeggyConversationAccessSecret,
    verifyAccessToken: verifyPeggyConversationAccessToken,
    createAccessToken: createPeggyConversationAccessToken,
  });

  app.use("/api/peggy", peggyIdentityNoStore);
  app.use("/api/admin/peggy", peggyIdentityNoStore);
```

Do not add section middleware before either focused registrar: each registrar already owns one no-store invocation followed by its limiter. Do not move, duplicate, or change the history/chat/finish/phone/admin/suggestions/feedback handlers.

- [ ] **Step 9: Run focused server GREEN and prove the implementation has no v1 issuance path.**

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts
rg -n 'TOKEN_VERSION|v1|registerPeggyConversationAccessRefreshRoute|app\.use\("/api/(admin/)?peggy"' shared/peggy-access.ts server/peggy-access.ts server/routes.ts
git diff --check -- shared/peggy-access.ts server/peggy-access.ts server/routes.ts server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts
```

Expected: all three files PASS; production issuance/version is only `v2`; `v1` appears only in explicit rejection tests; one refresh registrar call and exactly one public plus one admin prefix appear; diff check is silent. Update the ignored ledger with GREEN output.

- [ ] **Step 10: Create the pure client helper RED with raw-response, CAS, concurrency, and abort mutations.**

Create `client/src/__tests__/peggy-access-refresh.test.ts` with this complete file:

```ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  getSupabaseSync: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseSync: authState.getSupabaseSync,
}));

import { PEGGY_CONVERSATION_ACCESS_HEADER } from "@shared/peggy-access";
import { authenticatedRequest } from "@/lib/queryClient";

type PeggyFetchTransport = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

interface PeggyAccessCredentialRef {
  current: { id: number; accessToken: string } | null;
}

interface PeggyFetchWithSingleRefreshInput {
  fetcher: PeggyFetchTransport;
  credentialRef: PeggyAccessCredentialRef;
  input: string;
  init: RequestInit;
  onCredentialChange?: (
    credential: { id: number; accessToken: string },
  ) => void;
}

type PeggyFetchWithSingleRefresh = (
  options: PeggyFetchWithSingleRefreshInput,
) => Promise<Response>;

const helperPath = resolve(import.meta.dirname, "../lib/peggy-access.ts");
const helperModule: Record<string, unknown> = existsSync(helperPath)
  ? await import(/* @vite-ignore */ helperPath)
  : {};
const helperExport = helperModule?.peggyFetchWithSingleRefresh;
const peggyFetchWithSingleRefresh: PeggyFetchWithSingleRefresh =
  typeof helperExport === "function"
    ? helperExport as PeggyFetchWithSingleRefresh
    : async ({ fetcher, input, init }) => fetcher(input, init);

const CHAT_URL = "/api/peggy/chat";
const OLD = { id: 41, accessToken: "opaque-old-token" };
const FRESH = { id: 41, accessToken: "opaque-fresh-token" };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function expiredResponse(): Response {
  return jsonResponse(
    {
      message: "Conversation access expired",
      code: "PEGGY_ACCESS_EXPIRED",
    },
    401,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function ref(
  value: PeggyAccessCredentialRef["current"] = { ...OLD },
): PeggyAccessCredentialRef {
  return { current: value };
}

function headersAt(fetcher: ReturnType<typeof vi.fn>, index: number): Headers {
  return new Headers(fetcher.mock.calls[index][1]?.headers);
}

describe("peggyFetchWithSingleRefresh", () => {
  beforeEach(() => {
    authState.getSession.mockReset();
    authState.getSupabaseSync.mockReset().mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["success", jsonResponse({ response: "already fine" })],
    ["ordinary unauthorized", jsonResponse({ message: "Unauthorized" }, 401)],
    ["wrong code", jsonResponse({ code: "SOMETHING_ELSE" }, 401)],
    ["message-only expiry", jsonResponse({ message: "Conversation access expired" }, 401)],
    ["non-object body", jsonResponse(["PEGGY_ACCESS_EXPIRED"], 401)],
    ["malformed JSON", new Response("{", { status: 401 })],
    ["forbidden", jsonResponse({ message: "Forbidden" }, 403)],
    ["not found", jsonResponse({ message: "Conversation not found" }, 404)],
    ["rate limited", jsonResponse({ message: "Too many requests" }, 429)],
    ["server error", jsonResponse({ message: "Internal server error" }, 500)],
  ])("returns the untouched readable original for %s", async (_label, original) => {
    const fetcher = vi.fn(async () => original);
    const credentialRef = ref();
    const response = await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: 41, message: "Hello" }),
      },
    });

    expect(response).toBe(original);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(credentialRef.current).toEqual(OLD);
    expect(await original.text()).not.toBe("");
  });

  it("refreshes and replays once while cloning headers and preserving request semantics", async () => {
    const controller = new AbortController();
    const originalHeaders = new Headers({
      Authorization: "Bearer account-token",
      "Content-Type": "application/json",
      "X-Custom": "kept",
      [PEGGY_CONVERSATION_ACCESS_HEADER]: OLD.accessToken,
    });
    const body = JSON.stringify({
      conversationId: OLD.id,
      message: "Private question",
    });
    const replay = jsonResponse({ messageId: 900, response: "Bounded answer" });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH))
      .mockResolvedValueOnce(replay);
    const credentialRef = ref();
    const onCredentialChange = vi.fn();

    const response = await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: {
        method: "POST",
        headers: originalHeaders,
        body,
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      },
      onCredentialChange,
    });

    expect(response).toBe(replay);
    expect(await response.json()).toEqual({
      messageId: 900,
      response: "Bounded answer",
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      CHAT_URL,
      "/api/peggy/conversations/41/access/refresh",
      CHAT_URL,
    ]);

    const originalInit = fetcher.mock.calls[0][1] as RequestInit;
    const refreshInit = fetcher.mock.calls[1][1] as RequestInit;
    const replayInit = fetcher.mock.calls[2][1] as RequestInit;
    expect(originalInit).toMatchObject({
      method: "POST",
      body,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    expect(refreshInit).toMatchObject({
      method: "POST",
      body: undefined,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    expect(replayInit).toMatchObject({
      method: "POST",
      body,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    for (const index of [0, 1]) {
      expect(headersAt(fetcher, index).get("Authorization")).toBe(
        "Bearer account-token",
      );
      expect(headersAt(fetcher, index).get("Content-Type")).toBe(
        "application/json",
      );
      expect(headersAt(fetcher, index).get("X-Custom")).toBe("kept");
      expect(
        headersAt(fetcher, index).get(PEGGY_CONVERSATION_ACCESS_HEADER),
      ).toBe(OLD.accessToken);
    }
    expect(
      headersAt(fetcher, 2).get(PEGGY_CONVERSATION_ACCESS_HEADER),
    ).toBe(FRESH.accessToken);
    expect(originalHeaders.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe(
      OLD.accessToken,
    );
    expect(credentialRef.current).toEqual(FRESH);
    expect(onCredentialChange).toHaveBeenCalledOnce();
    expect(onCredentialChange).toHaveBeenCalledWith(FRESH);
  });

  it.each([201, 204, 299])(
    "rejects unexpected successful refresh status %i without reading or replay",
    async (status) => {
      const unexpectedSuccess = status === 204
        ? new Response(null, { status })
        : jsonResponse(FRESH, status);
      const jsonSpy = vi.spyOn(unexpectedSuccess, "json");
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce(expiredResponse())
        .mockResolvedValueOnce(unexpectedSuccess);
      const credentialRef = ref();
      const onCredentialChange = vi.fn();

      await expect(peggyFetchWithSingleRefresh({
        fetcher,
        credentialRef,
        input: CHAT_URL,
        init: { method: "POST" },
        onCredentialChange,
      })).rejects.toEqual(new Error("Peggy access refresh failed"));
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(jsonSpy).not.toHaveBeenCalled();
      expect(credentialRef.current).toEqual(OLD);
      expect(onCredentialChange).not.toHaveBeenCalled();
    },
  );

  it.each([300, 400, 401, 404, 429, 500, 503])(
    "returns the raw refresh %i response without replacement or replay",
    async (status) => {
      const refreshFailure = jsonResponse({ message: "Refresh failed" }, status);
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce(expiredResponse())
        .mockResolvedValueOnce(refreshFailure);
      const credentialRef = ref();
      const onCredentialChange = vi.fn();

      const response = await peggyFetchWithSingleRefresh({
        fetcher,
        credentialRef,
        input: CHAT_URL,
        init: { method: "POST" },
        onCredentialChange,
      });

      expect(response).toBe(refreshFailure);
      expect(await response.json()).toEqual({ message: "Refresh failed" });
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(credentialRef.current).toEqual(OLD);
      expect(onCredentialChange).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["invalid JSON", new Response("{", { status: 200 })],
    ["null", jsonResponse(null)],
    ["array", jsonResponse([FRESH])],
    ["missing token", jsonResponse({ id: 41 })],
    ["extra key", jsonResponse({ ...FRESH, expiresAt: 1 })],
    ["mismatched id", jsonResponse({ id: 42, accessToken: "other" })],
    ["unsafe id", jsonResponse({ id: Number.MAX_SAFE_INTEGER + 1, accessToken: "other" })],
    ["zero id", jsonResponse({ id: 0, accessToken: "other" })],
    ["blank token", jsonResponse({ id: 41, accessToken: "   " })],
    ["same token", jsonResponse({ id: 41, accessToken: OLD.accessToken })],
    ["non-string token", jsonResponse({ id: 41, accessToken: 7 })],
  ])("fails closed on malformed refresh success: %s", async (_label, malformed) => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(malformed);
    const credentialRef = ref();
    const onCredentialChange = vi.fn();

    await expect(
      peggyFetchWithSingleRefresh({
        fetcher,
        credentialRef,
        input: CHAT_URL,
        init: { method: "POST" },
        onCredentialChange,
      }),
    ).rejects.toEqual(new Error("Peggy access refresh failed"));
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(credentialRef.current).toEqual(OLD);
    expect(onCredentialChange).not.toHaveBeenCalled();
  });

  it("treats a valid replacement token as opaque and trims its boundary whitespace", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse({ id: 41, accessToken: " opaque-no-version " }))
      .mockResolvedValueOnce(jsonResponse({ response: "ok" }));
    const credentialRef = ref();

    await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
    });

    expect(credentialRef.current).toEqual({
      id: 41,
      accessToken: "opaque-no-version",
    });
    expect(
      headersAt(fetcher, 2).get(PEGGY_CONVERSATION_ACCESS_HEADER),
    ).toBe("opaque-no-version");
  });

  it("returns a replayed expiry without recursion", async () => {
    const secondExpiry = expiredResponse();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH))
      .mockResolvedValueOnce(secondExpiry);

    const response = await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef: ref(),
      input: CHAT_URL,
      init: { method: "POST" },
    });

    expect(response).toBe(secondExpiry);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(await response.json()).toMatchObject({
      code: "PEGGY_ACCESS_EXPIRED",
    });
  });

  it("preserves exact transport rejection at original, refresh, and replay", async () => {
    for (const stage of ["original", "refresh", "replay"] as const) {
      const failure = new Error(`${stage} network sentinel`);
      const fetcher = vi.fn();
      if (stage === "original") {
        fetcher.mockRejectedValueOnce(failure);
      } else {
        fetcher.mockResolvedValueOnce(expiredResponse());
        if (stage === "refresh") {
          fetcher.mockRejectedValueOnce(failure);
        } else {
          fetcher
            .mockResolvedValueOnce(jsonResponse(FRESH))
            .mockRejectedValueOnce(failure);
        }
      }
      const credentialRef = ref();
      await expect(peggyFetchWithSingleRefresh({
        fetcher,
        credentialRef,
        input: CHAT_URL,
        init: { method: "POST" },
      })).rejects.toBe(failure);
      expect(fetcher).toHaveBeenCalledTimes(
        stage === "original" ? 1 : stage === "refresh" ? 2 : 3,
      );
      expect(credentialRef.current).toEqual(
        stage === "replay" ? FRESH : OLD,
      );
    }
  });

  it("lets authenticatedRequest add the current bearer and cookie policy to all legs", async () => {
    authState.getSupabaseSync.mockReturnValue({
      auth: { getSession: authState.getSession },
    });
    authState.getSession.mockResolvedValue({
      data: { session: { access_token: "current-account-token" } },
      error: null,
    });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH))
      .mockResolvedValueOnce(jsonResponse({ response: "authenticated replay" }));

    await peggyFetchWithSingleRefresh({
      fetcher: authenticatedRequest,
      credentialRef: ref(),
      input: CHAT_URL,
      init: { method: "POST" },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    for (const [index, expectedToken] of [
      [0, OLD.accessToken],
      [1, OLD.accessToken],
      [2, FRESH.accessToken],
    ] as const) {
      const request = fetchSpy.mock.calls[index][1] as RequestInit;
      expect(request.credentials).toBe("include");
      expect(new Headers(request.headers).get("Authorization")).toBe(
        "Bearer current-account-token",
      );
      expect(new Headers(request.headers).get(
        PEGGY_CONVERSATION_ACCESS_HEADER,
      )).toBe(expectedToken);
    }
    fetchSpy.mockRestore();
  });

  it("never lets a late same-row refresh overwrite another invocation's winner", async () => {
    const refreshes = [deferred<Response>(), deferred<Response>()];
    let originalCount = 0;
    let refreshCount = 0;
    const replayTokens: string[] = [];
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith("/access/refresh")) {
        return refreshes[refreshCount++].promise;
      }
      if (originalCount++ < 2) return expiredResponse();
      replayTokens.push(
        new Headers(init?.headers).get(PEGGY_CONVERSATION_ACCESS_HEADER) || "",
      );
      return jsonResponse({ response: "replayed" });
    });
    const credentialRef = ref();
    const onCredentialChange = vi.fn();

    const first = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange,
    });
    const second = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange,
    });
    await vi.waitFor(() => expect(refreshCount).toBe(2));

    const winner = { id: 41, accessToken: "winner-from-second" };
    refreshes[1].resolve(jsonResponse(winner));
    await second;
    refreshes[0].resolve(jsonResponse({ id: 41, accessToken: "late-first" }));
    await first;

    expect(credentialRef.current).toEqual(winner);
    expect(onCredentialChange).toHaveBeenCalledOnce();
    expect(onCredentialChange).toHaveBeenCalledWith(winner);
    expect(replayTokens).toEqual([winner.accessToken, winner.accessToken]);
    expect(fetcher).toHaveBeenCalledTimes(6);
  });

  it("returns the original expiry when the conversation changes during refresh", async () => {
    const pendingRefresh = deferred<Response>();
    const original = expiredResponse();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(original)
      .mockImplementationOnce(() => pendingRefresh.promise);
    const credentialRef = ref();
    const onCredentialChange = vi.fn();
    const operation = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange,
    });
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    credentialRef.current = { id: 99, accessToken: "new-conversation" };
    pendingRefresh.resolve(jsonResponse(FRESH));

    await expect(operation).resolves.toBe(original);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(credentialRef.current).toEqual({
      id: 99,
      accessToken: "new-conversation",
    });
    expect(onCredentialChange).not.toHaveBeenCalled();
  });

  it("replays with the current same-row token when another invocation already won", async () => {
    const pendingRefresh = deferred<Response>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockImplementationOnce(() => pendingRefresh.promise)
      .mockResolvedValueOnce(jsonResponse({ response: "winner replay" }));
    const credentialRef = ref();
    const onCredentialChange = vi.fn();
    const operation = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange,
    });
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    credentialRef.current = { id: 41, accessToken: "already-won" };
    pendingRefresh.resolve(jsonResponse({ id: 41, accessToken: "late-result" }));

    await operation;
    expect(credentialRef.current).toEqual({ id: 41, accessToken: "already-won" });
    expect(onCredentialChange).not.toHaveBeenCalled();
    expect(
      headersAt(fetcher, 2).get(PEGGY_CONVERSATION_ACCESS_HEADER),
    ).toBe("already-won");
  });

  it("rechecks the ref after the credential callback before replay", async () => {
    const original = expiredResponse();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(original)
      .mockResolvedValueOnce(jsonResponse(FRESH));
    const credentialRef = ref();

    const response = await peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { method: "POST" },
      onCredentialChange: () => {
        credentialRef.current = { id: 99, accessToken: "replacement-row" };
      },
    });

    expect(response).toBe(original);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(credentialRef.current).toEqual({
      id: 99,
      accessToken: "replacement-row",
    });
  });

  it("preserves an already-aborted reason without calling transport", async () => {
    const controller = new AbortController();
    const reason = new DOMException("cancelled before original", "AbortError");
    controller.abort(reason);
    const fetcher = vi.fn();
    const credentialRef = ref();

    await expect(peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { signal: controller.signal },
    })).rejects.toBe(reason);
    expect(fetcher).not.toHaveBeenCalled();
    expect(credentialRef.current).toEqual(OLD);
  });

  it("checks abort after original and expiry-clone awaits", async () => {
    const originalPending = deferred<Response>();
    const firstController = new AbortController();
    const firstReason = new DOMException("after original", "AbortError");
    const firstFetcher = vi.fn(() => originalPending.promise);
    const firstRef = ref();
    const first = peggyFetchWithSingleRefresh({
      fetcher: firstFetcher,
      credentialRef: firstRef,
      input: CHAT_URL,
      init: { signal: firstController.signal },
    });
    firstController.abort(firstReason);
    originalPending.resolve(expiredResponse());
    await expect(first).rejects.toBe(firstReason);
    expect(firstFetcher).toHaveBeenCalledTimes(1);
    expect(firstRef.current).toEqual(OLD);

    const clonePending = deferred<unknown>();
    const cloneResponse = expiredResponse();
    vi.spyOn(cloneResponse, "clone").mockReturnValue({
      json: () => clonePending.promise,
    } as Response);
    const secondController = new AbortController();
    const secondReason = new DOMException("after clone", "AbortError");
    const secondFetcher = vi.fn().mockResolvedValueOnce(cloneResponse);
    const secondRef = ref();
    const second = peggyFetchWithSingleRefresh({
      fetcher: secondFetcher,
      credentialRef: secondRef,
      input: CHAT_URL,
      init: { signal: secondController.signal },
    });
    await vi.waitFor(() => expect(cloneResponse.clone).toHaveBeenCalledOnce());
    secondController.abort(secondReason);
    clonePending.resolve({ code: "PEGGY_ACCESS_EXPIRED" });
    await expect(second).rejects.toBe(secondReason);
    expect(secondFetcher).toHaveBeenCalledTimes(1);
    expect(secondRef.current).toEqual(OLD);
  });

  it("checks abort after refresh fetch/JSON, callback, and replay fetch", async () => {
    const refreshPending = deferred<Response>();
    const refreshController = new AbortController();
    const refreshReason = new DOMException("after refresh", "AbortError");
    const refreshFetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockImplementationOnce(() => refreshPending.promise);
    const refreshRef = ref();
    const refreshOperation = peggyFetchWithSingleRefresh({
      fetcher: refreshFetcher,
      credentialRef: refreshRef,
      input: CHAT_URL,
      init: { signal: refreshController.signal },
    });
    await vi.waitFor(() => expect(refreshFetcher).toHaveBeenCalledTimes(2));
    refreshController.abort(refreshReason);
    refreshPending.resolve(jsonResponse(FRESH));
    await expect(refreshOperation).rejects.toBe(refreshReason);
    expect(refreshFetcher).toHaveBeenCalledTimes(2);
    expect(refreshRef.current).toEqual(OLD);

    const jsonPending = deferred<unknown>();
    const refreshResponse = jsonResponse(FRESH);
    vi.spyOn(refreshResponse, "json").mockImplementation(() => jsonPending.promise);
    const jsonController = new AbortController();
    const jsonReason = new DOMException("after refresh json", "AbortError");
    const jsonFetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(refreshResponse);
    const jsonRef = ref();
    const jsonOperation = peggyFetchWithSingleRefresh({
      fetcher: jsonFetcher,
      credentialRef: jsonRef,
      input: CHAT_URL,
      init: { signal: jsonController.signal },
    });
    await vi.waitFor(() => expect(refreshResponse.json).toHaveBeenCalledOnce());
    jsonController.abort(jsonReason);
    jsonPending.resolve(FRESH);
    await expect(jsonOperation).rejects.toBe(jsonReason);
    expect(jsonFetcher).toHaveBeenCalledTimes(2);
    expect(jsonRef.current).toEqual(OLD);

    const callbackController = new AbortController();
    const callbackReason = new DOMException("inside callback", "AbortError");
    const callbackFetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH));
    const callbackRef = ref();
    await expect(peggyFetchWithSingleRefresh({
      fetcher: callbackFetcher,
      credentialRef: callbackRef,
      input: CHAT_URL,
      init: { signal: callbackController.signal },
      onCredentialChange: () => callbackController.abort(callbackReason),
    })).rejects.toBe(callbackReason);
    expect(callbackFetcher).toHaveBeenCalledTimes(2);
    expect(callbackRef.current).toEqual(FRESH);

    const replayPending = deferred<Response>();
    const replayController = new AbortController();
    const replayReason = new DOMException("after replay", "AbortError");
    const replayFetcher = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse())
      .mockResolvedValueOnce(jsonResponse(FRESH))
      .mockImplementationOnce(() => replayPending.promise);
    const replayRef = ref();
    const replayOperation = peggyFetchWithSingleRefresh({
      fetcher: replayFetcher,
      credentialRef: replayRef,
      input: CHAT_URL,
      init: { signal: replayController.signal },
    });
    await vi.waitFor(() => expect(replayFetcher).toHaveBeenCalledTimes(3));
    replayController.abort(replayReason);
    replayPending.resolve(jsonResponse({ response: "late" }));
    await expect(replayOperation).rejects.toBe(replayReason);
    expect(replayFetcher).toHaveBeenCalledTimes(3);
    expect(replayRef.current).toEqual(FRESH);
  });

  it("keeps concurrent AbortSignals independent", async () => {
    const firstRefresh = deferred<Response>();
    const secondRefresh = deferred<Response>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    let refreshCount = 0;
    const fetcher: PeggyFetchTransport = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).endsWith("/access/refresh")) {
          refreshCount += 1;
          return refreshCount === 1
            ? firstRefresh.promise
            : secondRefresh.promise;
        }
        const token = new Headers(init?.headers).get(
          PEGGY_CONVERSATION_ACCESS_HEADER,
        );
        return token === OLD.accessToken
          ? expiredResponse()
          : jsonResponse({ response: "second survived" });
      },
    );
    const credentialRef = ref();
    const first = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { signal: firstController.signal },
    });
    const second = peggyFetchWithSingleRefresh({
      fetcher,
      credentialRef,
      input: CHAT_URL,
      init: { signal: secondController.signal },
    });
    await vi.waitFor(() => expect(refreshCount).toBe(2));
    const firstReason = new DOMException("only first", "AbortError");
    firstController.abort(firstReason);
    firstRefresh.resolve(jsonResponse({ id: 41, accessToken: "aborted-result" }));
    secondRefresh.resolve(jsonResponse(FRESH));

    await expect(first).rejects.toBe(firstReason);
    await expect(second).resolves.toBeInstanceOf(Response);
    expect(firstController.signal.aborted).toBe(true);
    expect(secondController.signal.aborted).toBe(false);
    expect(credentialRef.current).toEqual(FRESH);
    const calls = (fetcher as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.filter(([, init]) =>
      (init as RequestInit | undefined)?.signal === firstController.signal,
    )).toHaveLength(2);
    expect(calls.filter(([, init]) =>
      (init as RequestInit | undefined)?.signal === secondController.signal,
    )).toHaveLength(3);
  });
});
```

This matrix returns a non-2xx refresh as the raw final response, never the original 401. It rejects every successful 2xx other than exact 200 as a generic error before body interpretation, even for a syntactically valid DTO with 201 or empty 204. It deliberately accepts an opaque replacement without a `v2` prefix only at exact 200. The three concurrency mutations prove that correctness comes from the shared composite-ref compare-and-swap, not a component-wide operation lock.

- [ ] **Step 11: Run the pure client RED.**

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run client/src/__tests__/peggy-access-refresh.test.ts
```

Expected on the accepted base: all 44 tests collect and execute; 34 FAIL at behavioral assertions and 10 PASS because the existence-gated test fallback performs only the original leg. The first failure expects the successful replay response but receives the original coded 401; the 201/204/299 cases each fail at their expected generic-rejection assertion, and native status 300 fails at its expected raw-response assertion rather than at collection. There must be no failed suite, transform/module-resolution error, `TypeError`, `ReferenceError`, `SyntaxError`, jsdom, Supabase, network, or unrelated-suite error. Record the exact failed assertion names/counts and zero collection errors in the ignored ledger.

- [ ] **Step 12: Implement the pure injected transport with composite-ref compare-and-swap.**

Create `client/src/lib/peggy-access.ts` with this complete module:

```ts
import {
  PEGGY_ACCESS_EXPIRED_CODE,
  PEGGY_CONVERSATION_ACCESS_HEADER,
  type PeggyConversationAccessResponse,
} from "@shared/peggy-access";

export type PeggyFetchTransport = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface PeggyAccessCredentialRef {
  current: PeggyConversationAccessResponse | null;
}

export interface PeggyFetchWithSingleRefreshInput {
  fetcher: PeggyFetchTransport;
  credentialRef: PeggyAccessCredentialRef;
  input: string;
  init: RequestInit;
  onCredentialChange?: (
    credential: PeggyConversationAccessResponse,
  ) => void;
}

const REFRESH_FAILURE = "Peggy access refresh failed";

function throwIfAborted(signal: AbortSignal | null | undefined): void {
  if (!signal?.aborted) return;
  throw (
    signal.reason ??
    new DOMException("The operation was aborted", "AbortError")
  );
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
      ? error.name === "AbortError"
      : Boolean(
          error &&
            typeof error === "object" &&
            "name" in error &&
            (error as { name?: unknown }).name === "AbortError",
        )
  );
}

function withCredential(
  init: RequestInit,
  accessToken: string,
): RequestInit {
  const headers = new Headers(init.headers);
  headers.set(PEGGY_CONVERSATION_ACCESS_HEADER, accessToken);
  return { ...init, headers };
}

function sameRow(
  credential: PeggyConversationAccessResponse | null,
  expected: PeggyConversationAccessResponse,
): credential is PeggyConversationAccessResponse {
  return credential !== null && credential.id === expected.id;
}

async function isExactExpiryResponse(
  response: Response,
  signal: AbortSignal | null | undefined,
): Promise<boolean> {
  if (response.status !== 401) return false;
  try {
    const body: unknown = await response.clone().json();
    throwIfAborted(signal);
    return Boolean(
      body &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        (body as { code?: unknown }).code === PEGGY_ACCESS_EXPIRED_CODE,
    );
  } catch (error) {
    throwIfAborted(signal);
    if (isAbortError(error)) throw error;
    return false;
  }
}

function parseReplacement(
  value: unknown,
  expected: PeggyConversationAccessResponse,
): PeggyConversationAccessResponse | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) return null;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const id = record.id;
  if (
    keys.length !== 2 ||
    !keys.includes("id") ||
    !keys.includes("accessToken") ||
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    id !== expected.id ||
    typeof record.accessToken !== "string"
  ) {
    return null;
  }
  const accessToken = record.accessToken.trim();
  if (!accessToken || accessToken === expected.accessToken) return null;
  return { id, accessToken };
}

export async function peggyFetchWithSingleRefresh({
  fetcher,
  credentialRef,
  input,
  init,
  onCredentialChange,
}: PeggyFetchWithSingleRefreshInput): Promise<Response> {
  const captured = credentialRef.current;
  if (
    !captured ||
    !Number.isSafeInteger(captured.id) ||
    captured.id <= 0 ||
    !captured.accessToken
  ) {
    throw new Error("Peggy conversation access unavailable");
  }
  const signal = init.signal;
  throwIfAborted(signal);

  const original = await fetcher(
    input,
    withCredential(init, captured.accessToken),
  );
  throwIfAborted(signal);
  if (!(await isExactExpiryResponse(original, signal))) return original;
  throwIfAborted(signal);

  const beforeRefresh = credentialRef.current;
  if (!sameRow(beforeRefresh, captured)) return original;

  const refreshInit = withCredential(
    { ...init, method: "POST", body: undefined },
    captured.accessToken,
  );
  throwIfAborted(signal);
  const refreshResponse = await fetcher(
    `/api/peggy/conversations/${captured.id}/access/refresh`,
    refreshInit,
  );
  throwIfAborted(signal);
  if (!refreshResponse.ok) return refreshResponse;
  if (refreshResponse.status !== 200) throw new Error(REFRESH_FAILURE);

  let rawReplacement: unknown;
  try {
    rawReplacement = await refreshResponse.json();
    throwIfAborted(signal);
  } catch (error) {
    throwIfAborted(signal);
    if (isAbortError(error)) throw error;
    throw new Error(REFRESH_FAILURE);
  }
  const replacement = parseReplacement(rawReplacement, captured);
  if (!replacement) throw new Error(REFRESH_FAILURE);
  throwIfAborted(signal);

  let current = credentialRef.current;
  if (!sameRow(current, captured)) return original;
  if (current.accessToken === captured.accessToken) {
    credentialRef.current = replacement;
    onCredentialChange?.(replacement);
  }

  throwIfAborted(signal);
  current = credentialRef.current;
  if (
    !sameRow(current, captured) ||
    !current.accessToken ||
    current.accessToken === captured.accessToken
  ) {
    return original;
  }
  throwIfAborted(signal);
  const replay = await fetcher(input, withCredential(init, current.accessToken));
  throwIfAborted(signal);
  return replay;
}
```

The only shared mutable boundary is the caller-owned composite ref. Replacement is synchronous before the optional state callback. A later result for the same failed token cannot overwrite a different current token; a different/null row cannot replay; the callback is followed by both abort and ref checks. There is no module state or recursion.

- [ ] **Step 13: Run pure helper GREEN, then mutation-check every await and concurrency boundary.**

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run client/src/__tests__/peggy-access-refresh.test.ts
rg -n 'await |throwIfAborted|credentialRef\.current|response\.clone\(\)|refreshResponse\.ok|body: undefined' client/src/lib/peggy-access.ts
git diff --check -- client/src/lib/peggy-access.ts client/src/__tests__/peggy-access-refresh.test.ts
```

Expected: PASS. Manually map each of the five awaits (original fetch, clone JSON, refresh fetch, refresh JSON, replay fetch) to an immediate post-await abort check; also verify pre-refresh, pre-CAS, post-callback/ref, and pre-replay checks. The concurrent tests must show six independent transport calls for two successful logical invocations, explicitly proving there is no global single-flight claim.

- [ ] **Step 14: Add rendered RED for canonical raw fetch and both authenticated legacy surfaces.**

In `client/src/__tests__/peggy-handoff.test.tsx`, add the shared header import after the Peggy import and add a native-response helper after `deferred`:

```ts
import { PEGGY_CONVERSATION_ACCESS_HEADER } from "@shared/peggy-access";

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    statusText: status === 200 ? "OK" : "Injected failure",
    headers: { "Content-Type": "application/json" },
  });
}
```

Append these tests inside `describe("Peggy — handoff action buttons", ...)`:

```ts
  it("uses raw fetch for one bounded refresh/replay without a duplicate visual turn", async () => {
    const replay = deferred<Response>();
    let chatCount = 0;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/peggy/conversations") {
        return Promise.resolve(jsonResponse({
          id: 31,
          accessToken: "opaque-canonical-old",
        }));
      }
      if (url === "/api/peggy/conversations/31/access/refresh") {
        return Promise.resolve(jsonResponse({
          id: 31,
          accessToken: "opaque-canonical-fresh",
        }));
      }
      if (url === "/api/peggy/chat") {
        chatCount += 1;
        return chatCount === 1
          ? Promise.resolve(jsonResponse({
              message: "Conversation access expired",
              code: "PEGGY_ACCESS_EXPIRED",
            }, 401))
          : replay.promise;
      }
      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPeggy();
    await sendMessage("refresh this one visual turn");
    expect(screen.getAllByText("refresh this one visual turn")).toHaveLength(1);

    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith("/access/refresh"),
      )).toHaveLength(1);
      expect(fetchMock.mock.calls.filter(([input]) =>
        String(input) === "/api/peggy/chat",
      )).toHaveLength(2);
    });

    const refreshCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/access/refresh"),
    );
    const chatCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input) === "/api/peggy/chat",
    );
    expect(refreshCalls).toHaveLength(1);
    expect(chatCalls).toHaveLength(2);
    const originalInit = chatCalls[0][1] as RequestInit;
    const refreshInit = refreshCalls[0][1] as RequestInit;
    const replayInit = chatCalls[1][1] as RequestInit;
    expect(originalInit.signal).toBeInstanceOf(AbortSignal);
    expect(refreshInit.signal).toBe(originalInit.signal);
    expect(replayInit.signal).toBe(originalInit.signal);
    expect(refreshInit.method).toBe("POST");
    expect(refreshInit.body).toBeUndefined();
    expect(originalInit.credentials).toBeUndefined();
    expect(refreshInit.credentials).toBeUndefined();
    expect(replayInit.credentials).toBeUndefined();
    expect(new Headers(originalInit.headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("opaque-canonical-old");
    expect(new Headers(refreshInit.headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("opaque-canonical-old");
    expect(new Headers(replayInit.headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("opaque-canonical-fresh");
    expect(new Headers(originalInit.headers).get("Authorization")).toBeNull();
    expect(new Headers(refreshInit.headers).get("Authorization")).toBeNull();

    replay.resolve(jsonResponse({
      response:
        'Refreshed once. [[HANDOFF]]{"action":"strategylab"}[[/HANDOFF]]',
    }));
    expect(await screen.findByText("Refreshed once.")).toBeVisible();
    expect(screen.getAllByText("refresh this one visual turn")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Open Strategy Lab/ })).toBeVisible();
  });

  it.each([
    ["raw 404", () => jsonResponse({ message: "Conversation not found" }, 404)],
    ["valid DTO with unexpected 201", () => jsonResponse({
      id: 32,
      accessToken: "must-not-install",
    }, 201)],
    ["empty unexpected 204", () => new Response(null, { status: 204 })],
  ] as const)("renders the existing error fallback after %s without replay", async (
    _label,
    refreshResponse,
  ) => {
    const refresh = deferred<Response>();
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/peggy/conversations") {
        return Promise.resolve(jsonResponse({ id: 32, accessToken: "opaque-old" }));
      }
      if (url === "/api/peggy/chat") {
        return Promise.resolve(jsonResponse({
          message: "Conversation access expired",
          code: "PEGGY_ACCESS_EXPIRED",
        }, 401));
      }
      if (url === "/api/peggy/conversations/32/access/refresh") {
        return refresh.promise;
      }
      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPeggy();
    await sendMessage("fail closed once");
    refresh.resolve(refreshResponse());

    expect(await screen.findByText(/I can.t reach my brain at the moment/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Start a Review/ })).toBeVisible();
    expect(fetchMock.mock.calls.filter(([input]) =>
      String(input) === "/api/peggy/chat",
    )).toHaveLength(1);
    expect(fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/access/refresh"),
    )).toHaveLength(1);
    expect(screen.getAllByText("fail closed once")).toHaveLength(1);
  });
```

In `client/src/__tests__/peggy-client-session-boundary.test.tsx`, replace `jsonResponse` with a real clonable response:

```ts
function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    statusText: status === 200 ? "OK" : "Injected failure",
    headers: { "Content-Type": "application/json" },
  });
}
```

Then add these helpers before `describe("PeggyDock focused control boundary", ...)`:

```ts
type AccessSurface = "Dock" | "dormant";

async function renderAccessSurface(surface: AccessSurface) {
  fakeContext({
    isOpen: true,
    context: { page: "home", surface: `refresh-${surface.toLowerCase()}` },
  });
  renderWithClient(fakePeggyTree(
    surface === "Dock" ? <PeggyDock /> : <PeggyChatBubble />,
  ));
  await waitFor(() =>
    expect(callsFor("/api/peggy/conversations")).toHaveLength(1),
  );
  if (surface === "Dock") {
    fireEvent.click(screen.getByTestId("button-peggy-dock"));
  }
  await waitFor(() =>
    expect(screen.getByTestId("input-peggy-message")).toBeEnabled(),
  );
}

async function sendAccessSurfaceMessage(message: string, reply: string) {
  fireEvent.change(screen.getByTestId("input-peggy-message"), {
    target: { value: message },
  });
  fireEvent.click(screen.getByTestId("button-peggy-send"));
  await waitFor(() => expect(screen.getByText(reply)).toBeVisible());
}
```

Append this describe after the existing dormant transport describe and before `CanonicalHarness`:

```ts
describe.each(["Dock", "dormant"] as const)(
  "%s bounded access refresh",
  (surface) => {
    it("refreshes chat and feedback through authenticatedRequest without duplicate UI", async () => {
      let chatCount = 0;
      let feedbackCount = 0;
      let refreshCount = 0;
      fetchMock.mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") {
          return Promise.resolve(jsonResponse({ id: 201, accessToken: "opaque-old" }));
        }
        if (url === "/api/peggy/chat") {
          chatCount += 1;
          return Promise.resolve(chatCount === 1
            ? jsonResponse({
                message: "Conversation access expired",
                code: "PEGGY_ACCESS_EXPIRED",
              }, 401)
            : jsonResponse({ messageId: 501, response: "One rendered reply" }));
        }
        if (url === "/api/peggy/messages/501/feedback") {
          feedbackCount += 1;
          return Promise.resolve(feedbackCount === 1
            ? jsonResponse({
                message: "Conversation access expired",
                code: "PEGGY_ACCESS_EXPIRED",
              }, 401)
            : jsonResponse({ success: true }));
        }
        if (url === "/api/peggy/conversations/201/access/refresh") {
          refreshCount += 1;
          return Promise.resolve(jsonResponse({
            id: 201,
            accessToken: refreshCount === 1 ? "opaque-chat" : "opaque-feedback",
          }));
        }
        throw new Error(`Unexpected URL ${url}`);
      });

      await renderAccessSurface(surface);
      await sendAccessSurfaceMessage("one optimistic turn", "One rendered reply");
      expect(screen.getAllByText("one optimistic turn")).toHaveLength(1);
      expect(screen.getAllByText("One rendered reply")).toHaveLength(1);
      expect(callsFor("/api/peggy/chat")).toHaveLength(2);
      expect(capturedRequest("/api/peggy/chat", 0).credentials).toBe("include");
      expect(capturedRequest("/api/peggy/chat", 0).headers.get(
        PEGGY_CONVERSATION_ACCESS_HEADER,
      )).toBe("opaque-old");
      expect(capturedRequest("/api/peggy/chat", 1).headers.get(
        PEGGY_CONVERSATION_ACCESS_HEADER,
      )).toBe("opaque-chat");

      fireEvent.click(screen.getByTestId("button-feedback-helpful-501"));
      expect(await screen.findByText("Thanks!")).toBeVisible();
      expect(callsFor("/api/peggy/messages/501/feedback")).toHaveLength(2);
      expect(capturedRequest(
        "/api/peggy/messages/501/feedback",
        0,
      ).headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe("opaque-chat");
      expect(capturedRequest(
        "/api/peggy/messages/501/feedback",
        1,
      ).headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe("opaque-feedback");
      expect(callsFor(
        "/api/peggy/conversations/201/access/refresh",
      )).toHaveLength(2);
      expect(capturedRequest(
        "/api/peggy/conversations/201/access/refresh",
        0,
      )).toMatchObject({ method: "POST", credentials: "include", body: undefined });
      expect(capturedRequest(
        "/api/peggy/conversations/201/access/refresh",
        1,
      ).headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe("opaque-chat");
    });

    it("lets feedback refresh race with New but never overwrite/replay/mark success", async () => {
      const lateRefresh = deferred<Response>();
      let createCount = 0;
      let chatCount = 0;
      fetchMock.mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") {
          createCount += 1;
          return Promise.resolve(jsonResponse(createCount === 1
            ? { id: 301, accessToken: "old-row-token" }
            : { id: 302, accessToken: "replacement-row-token" }));
        }
        if (url === "/api/peggy/chat") {
          chatCount += 1;
          return Promise.resolve(jsonResponse({
            messageId: chatCount === 1 ? 601 : 602,
            response: chatCount === 1 ? "Old row reply" : "Replacement reply",
          }));
        }
        if (url === "/api/peggy/messages/601/feedback") {
          return Promise.resolve(jsonResponse({
            message: "Conversation access expired",
            code: "PEGGY_ACCESS_EXPIRED",
          }, 401));
        }
        if (url === "/api/peggy/conversations/301/access/refresh") {
          return lateRefresh.promise;
        }
        throw new Error(`Unexpected URL ${url}`);
      });

      await renderAccessSurface(surface);
      await sendAccessSurfaceMessage("seed old row", "Old row reply");
      fireEvent.click(screen.getByTestId("button-feedback-helpful-601"));
      await waitFor(() => expect(callsFor(
        "/api/peggy/conversations/301/access/refresh",
      )).toHaveLength(1));
      expect(screen.getByTestId("button-peggy-new")).toBeEnabled();
      fireEvent.click(screen.getByTestId("button-peggy-new"));
      await waitFor(() =>
        expect(callsFor("/api/peggy/conversations")).toHaveLength(2),
      );
      await waitFor(() =>
        expect(screen.getByTestId("input-peggy-message")).toBeEnabled(),
      );
      await act(async () => {
        lateRefresh.resolve(jsonResponse({ id: 301, accessToken: "stale-late-token" }));
        await lateRefresh.promise;
        await Promise.resolve();
      });

      expect(callsFor("/api/peggy/messages/601/feedback")).toHaveLength(1);
      expect(screen.queryByText("Thanks!")).toBeNull();
      await sendAccessSurfaceMessage("use replacement row", "Replacement reply");
      const replacementChat = capturedRequest("/api/peggy/chat", 1);
      expect(replacementChat.body).toMatchObject({ conversationId: 302 });
      expect(replacementChat.headers.get(
        PEGGY_CONVERSATION_ACCESS_HEADER,
      )).toBe("replacement-row-token");
      expect(fetchMock.mock.calls.some(([, init]) =>
        new Headers((init as RequestInit | undefined)?.headers).get(
          PEGGY_CONVERSATION_ACCESS_HEADER,
        ) === "stale-late-token",
      )).toBe(false);
    });
  },
);
```

The second parameterized test deliberately leaves feedback outside the existing New guard. It is the supported race: the ref is synchronously cleared/replaced by New, so a late old-row refresh returns the original expiry, makes no feedback replay, never marks success, and cannot affect the replacement chat.

- [ ] **Step 15: Run rendered RED for all three clients.**

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
```

Expected: FAIL because canonical still performs raw chat directly, Dock/dormant still use throwing `apiRequest`, no surface maintains the composite credential ref, unexpected successful refresh statuses do not yet enter the existing caller error path, and non-ok feedback can incorrectly parse/mark. Existing Task 4A page-memory, create/New serialization, pending-prompt, storage, calculator, and handoff cases remain green.

- [ ] **Step 16: Adopt the helper in canonical Peggy with raw fetch and one composite ref.**

In `client/src/pegasus/peggy.tsx`, replace the shared access import and add the pure helper import:

```ts
import type { PeggyConversationAccessResponse } from '@shared/peggy-access';
import { peggyFetchWithSingleRefresh } from '@/lib/peggy-access';
```

Replace the two independent conversation refs:

```ts
  const conversationAccessRef =
    useRef<PeggyConversationAccessResponse | null>(null);
```

In `send`, replace the old create guard `if (convIdRef.current == null) {` with the composite guard:

```ts
        if (conversationAccessRef.current == null) {
```

Inside the create response branch in `send`, replace the assignments through the `No conversation access` check with:

```ts
          const id = conv?.id ?? conv?.conversation?.id;
          const rawAccessToken =
            conv?.accessToken ?? conv?.conversation?.accessToken;
          const accessToken =
            typeof rawAccessToken === 'string' ? rawAccessToken.trim() : '';
          if (!Number.isSafeInteger(id) || (id as number) <= 0 || !accessToken) {
            throw new Error('No conversation access');
          }
          conversationAccessRef.current = {
            id: id as number,
            accessToken,
          };
```

Replace the direct guarded chat fetch, from `const conversationAccessToken` through the closing `fetch` call, with:

```ts
        const credential = conversationAccessRef.current;
        if (!credential) throw new Error('No conversation access');

        const res = await peggyFetchWithSingleRefresh({
          fetcher: fetch,
          credentialRef: conversationAccessRef,
          input: '/api/peggy/chat',
          init: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: credential.id,
              message: content,
              context: { surface: 'public-peggy' },
            }),
            signal: controller.signal,
          },
        });
```

Keep the existing `if (!res.ok)`, fallback/handoff parsing, single optimistic assistant placeholder, one controller per send, unmount abort, page-memory behavior, and `send` dependencies unchanged. Canonical must not import `authenticatedRequest`, `apiRequest`, Supabase, QueryClient, or storage.

- [ ] **Step 17: Adopt the same helper in Dock and dormant Chat using authenticatedRequest.**

In both `client/src/components/peggy-dock.tsx` and `client/src/components/peggy-chat.tsx`, replace the query-client import and add the pure helper import:

```ts
import { apiRequest, authenticatedRequest } from "@/lib/queryClient";
import { peggyFetchWithSingleRefresh } from "@/lib/peggy-access";
```

Immediately after `createConversationInFlightRef`, add the composite ref in each component:

```ts
  const conversationAccessRef =
    useRef<PeggyConversationAccessResponse | null>(null);
```

After the Peggy context hook and before `createConversationMutation`, add this state mirror in each component:

```ts
  const replaceConversationAccess = useCallback(
    (credential: PeggyConversationAccessResponse) => {
      conversationAccessRef.current = credential;
      setConversationId(credential.id);
      setConversationAccessToken(credential.accessToken);
    },
    [],
  );
```

In each `createConversationMutation`, replace `onSuccess` with:

```ts
    onSuccess: (data) => {
      replaceConversationAccess(data);
    },
```

Replace each complete `chatMutation` with:

```ts
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const credential = conversationAccessRef.current;
      if (!credential) throw new Error('No conversation');
      const response = await peggyFetchWithSingleRefresh({
        fetcher: authenticatedRequest,
        credentialRef: conversationAccessRef,
        input: '/api/peggy/chat',
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [PEGGY_CONVERSATION_ACCESS_HEADER]: credential.accessToken,
          },
          body: JSON.stringify({
            conversationId: credential.id,
            message,
            context,
          }),
        },
        onCredentialChange: replaceConversationAccess,
      });
      if (!response.ok) {
        throw new Error(`Peggy request failed: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        id: data.messageId,
        role: 'assistant',
        content: data.response
      }]);
    }
  });
```

In each `startFreshConversation`, synchronously clear the ref before the two existing state clears:

```ts
      conversationAccessRef.current = null;
      setConversationId(null);
      setConversationAccessToken(null);
```

Replace each complete `feedbackMutation` with:

```ts
  const feedbackMutation = useMutation({
    mutationFn: async ({ messageId, feedback }: { messageId: number; feedback: string }) => {
      const credential = conversationAccessRef.current;
      if (!credential) throw new Error('No conversation');
      const response = await peggyFetchWithSingleRefresh({
        fetcher: authenticatedRequest,
        credentialRef: conversationAccessRef,
        input: `/api/peggy/messages/${messageId}/feedback`,
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [PEGGY_CONVERSATION_ACCESS_HEADER]: credential.accessToken,
          },
          body: JSON.stringify({
            conversationId: credential.id,
            feedback,
          }),
        },
        onCredentialChange: replaceConversationAccess,
      });
      if (!response.ok) {
        throw new Error(`Peggy feedback failed: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      setMessages(prev => prev.map(m =>
        m.id === variables.messageId
          ? { ...m, feedback: variables.feedback }
          : m
      ));
    }
  });
```

Do not change `apiRequest` usage for creation, suggestions, or calculator. Do not add a feedback/chat shared lock or include feedback pending state in New's existing guard. The synchronous composite-ref clear is the correctness boundary for feedback refresh racing New; the existing create/chat checks remain the UX boundary.

- [ ] **Step 18: Run rendered/client GREEN and adjacent Task 4A truth gates.**

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run client/src/__tests__/peggy-access-refresh.test.ts client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-refusals.test.ts client/src/__tests__/peggy-public-truth.test.tsx client/src/__tests__/peggy-cta-routing.test.tsx client/src/__tests__/peggy-quick-prompts.test.ts client/src/__tests__/query-client-auth.test.ts client/src/__tests__/root-app-boundary.test.tsx
rg -n 'peggyFetchWithSingleRefresh|authenticatedRequest|apiRequest|conversationAccessRef|feedbackMutation|startFreshConversation' client/src/pegasus/peggy.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx
! rg -n '^import .*queryClient|authenticatedRequest|apiRequest|supabase' client/src/pegasus/peggy.tsx
! rg -n '^import .*queryClient|^import .*supabase|^import .*react|localStorage|sessionStorage' client/src/lib/peggy-access.ts
git diff --check -- client/src/lib/peggy-access.ts client/src/__tests__/peggy-access-refresh.test.ts client/src/pegasus/peggy.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
```

Expected: focused and adjacent files PASS. Source inspection shows canonical injects only raw `fetch`; Dock/dormant inject `authenticatedRequest` only for guarded chat/feedback; existing `apiRequest` remains for create/suggestions/calculator; each component has one composite ref; no new shared operation lock exists; diff check is silent.

- [ ] **Step 19: Run combined focused, adjacent, full, type, build, and mutation-resistance gates.**

Run each command separately under pinned Node 22:

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/__tests__/peggy-access-refresh.test.ts client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-refusals.test.ts client/src/__tests__/peggy-public-truth.test.tsx client/src/__tests__/peggy-cta-routing.test.tsx client/src/__tests__/peggy-quick-prompts.test.ts client/src/__tests__/query-client-auth.test.ts client/src/__tests__/root-app-boundary.test.tsx
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npm test
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npm run check
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npm run build
```

Expected: six focused files, six adjacent files, and the complete suite exit 0 with no skipped/failed file, unhandled rejection, React warning, or unexpected network call. TypeScript exits 0. The production build and its included bundle-budget gate pass. Do not stage generated `dist/`.

If and only if `npm run build` reaches the `tsx` CLI but fails before repository code at a numbered `/tmp/tsx-*` IPC pipe with `EPERM`, record that exact environment-only failure and execute the same entrypoint without the listener followed by the unchanged bundle gate:

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache node --import tsx script/build.ts
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npm run check:bundle
```

No other build failure permits the fallback. Do not alter scripts or dependencies. Then inspect every hunk and run hygiene:

```bash
git diff --check
git diff --stat
git status --short --untracked-files=all
git diff -- shared/peggy-access.ts server/peggy-access.ts server/routes.ts server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/lib/peggy-access.ts client/src/__tests__/peggy-access-refresh.test.ts client/src/pegasus/peggy.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
! rg -n "TODO|FIXME|TBD|PLACEHOLDER" shared/peggy-access.ts server/peggy-access.ts server/routes.ts server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/lib/peggy-access.ts client/src/__tests__/peggy-access-refresh.test.ts client/src/pegasus/peggy.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
```

Confirm these behavioral mutations are killed by live tests, not only source matching:

1. Reintroducing v1, changing key order/HMAC input, accepting padded/noncanonical segments, parsing before signature authentication, changing the 24-hour lifetime, raising the 2,048-character verifier cap to admit the first 2,049-character canonical token, future acceptance, unsafe time arithmetic, or cross-row/session/owner proof fails the independent codec matrix.
2. Checking the normal guard's header before owner, treating body `userId`/`sessionId`/`accessToken`, arbitrary identity headers, or the legacy session as authority, limiting expired classification to refresh grace, delegating an exception to the global handler, or dropping no-store fails live owner/body-poison/any-age-expiry/generic-error cases.
3. Refreshing a valid token, accepting v1/malformed/cross-row/beyond-grace proof, treating refresh body identity/session/token poison as owner or capability authority, removing the near-`MAX_SAFE_INTEGER` grace-overflow rejection, changing its last-safe `>` boundary to `>=`, letting owner override a supplied header, disallowing header-absent old owners, moving secret after clock/storage, issuing after unsafe grace arithmetic, or invoking any mutation/provider dependency fails the live refresh response/call ledger.
4. Moving a section prefix before either focused registrar, duplicating a prefix, placing a prefix after any later Peggy route, omitting verified identity/limiter/real verifier/issuer, or introducing mutation dependencies fails the canonical production composition contract.
5. Reading the original 401 instead of a clone, accepting a generic 401, limiting raw refresh failures to `status >= 400` instead of the executable 299-success/300-non-2xx boundary, returning/parsing any successful 2xx other than exact 200 instead of throwing the generic error first, accepting malformed 200, decoding/requiring `v2` client-side, mutating caller headers, changing signal/body/credentials, recursing on replay, or sharing a global promise fails the pure helper matrix.
6. Removing a post-await abort check, swallowing an AbortError, replacing a winner token with a late result, replaying after conversation replacement, or failing to re-read after the callback fails the targeted abort/CAS mutations.
7. Routing canonical through authenticated transport, leaving Dock/dormant guarded calls on `apiRequest`, treating a 201 refresh DTO as a successful chat/feedback body, marking feedback before successful replay, duplicating optimistic/live output, or altering error-fallback/handoff/page-memory behavior fails the three real rendered surfaces.
8. Adding feedback to New's guard or relying on a shared operation lock instead of CAS fails the rendered feedback-refresh→New test, which requires New to remain enabled and the late old result to perform neither replay nor success marking.

Do not weaken assertions, add sleeps, increase timeouts, or classify a failure as unrelated without reproducing it at the implementation base. Record exact file/test/build counts and any permitted IPC ruling in ignored `progress.md`.

- [ ] **Step 20: Prove the exact thirteen-path scope and every protected boundary before staging.**

Inspect full status, including the two new client files:

```bash
git status --short --untracked-files=all
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache node --input-type=module <<'NODE'
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const expected = [
  "client/src/__tests__/peggy-access-refresh.test.ts",
  "client/src/__tests__/peggy-client-session-boundary.test.tsx",
  "client/src/__tests__/peggy-handoff.test.tsx",
  "client/src/components/peggy-chat.tsx",
  "client/src/components/peggy-dock.tsx",
  "client/src/lib/peggy-access.ts",
  "client/src/pegasus/peggy.tsx",
  "server/__tests__/launch-security-route-contract.test.ts",
  "server/__tests__/peggy-access.test.ts",
  "server/__tests__/peggy-route-auth.test.ts",
  "server/peggy-access.ts",
  "server/routes.ts",
  "shared/peggy-access.ts",
].sort();
const status = execFileSync(
  "git",
  ["status", "--porcelain=v1", "--untracked-files=all"],
  { encoding: "utf8" },
);
const dirty = status
  .split("\n")
  .filter(Boolean)
  .map((line) => line.slice(3))
  .filter((path) =>
    !path.startsWith(".recovery/") &&
    !path.startsWith(".superpowers/") &&
    !path.startsWith("dist/"),
  );
const implementationBase = readFileSync(
  ".superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/implementation-base.sha",
  "utf8",
).trim();
const committed = execFileSync(
  "git",
  ["diff", "--name-only", `${implementationBase}..HEAD`],
  { encoding: "utf8" },
).split("\n").filter(Boolean);
const actual = [...new Set([...committed, ...dirty])].sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  console.error({ expected, actual });
  process.exit(1);
}
console.log(`Task 4B scope OK: ${actual.length} paths`);
NODE
```

Then compare protected paths with the recorded docs-checkpoint implementation base:

```bash
task4b_base="$(cat .superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/implementation-base.sha)"
test -n "$task4b_base"
git diff --exit-code "$task4b_base" -- server/peggy-route-auth.ts server/peggy.ts server/storage.ts shared/schema.ts client/src/lib/queryClient.ts client/src/contexts/peggy-context.tsx client/src/PublicApp.tsx client/src/App.tsx client/src/LegacyApp.tsx client/src/pegasus/Landing.tsx client/src/pages/privacy.tsx client/src/__tests__/peggy-public-truth.test.tsx server/peggy-phone.ts package.json package-lock.json
git diff --exit-code "$task4b_base" -- docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md docs/qa/security-launch-recovery-ledger.md docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
git diff --check -- shared/peggy-access.ts server/peggy-access.ts server/routes.ts server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/lib/peggy-access.ts client/src/__tests__/peggy-access-refresh.test.ts client/src/pegasus/peggy.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
test "$(sha256sum package-lock.json | cut -d ' ' -f1)" = "ef8b16c62e1ee0c50d92230bf8a243945c27d96bcac5fe79f80ab36cd6567c12"
```

Expected: the Node assertion reports exactly the same 13 implementation paths both before the primary commit and during any additive review fix by unioning the committed base-to-head range with current tracked/untracked work; every protected diff exits 0; the child plan is unchanged after its checkpoint; lock hash remains exact; whitespace check is silent. Neither porcelain nor `git diff --name-only` alone proves both phases.

- [ ] **Step 21: Create the primary implementation commit, then run fresh specification, quality, and security reviews.**

Stage only the authorized manifest:

```bash
git add -- shared/peggy-access.ts server/peggy-access.ts server/routes.ts server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/lib/peggy-access.ts client/src/__tests__/peggy-access-refresh.test.ts client/src/pegasus/peggy.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
git diff --cached --name-only | LC_ALL=C sort
git diff --cached --check
test "$(git diff --cached --name-only | wc -l | tr -d ' ')" = "13"
git diff --cached | rg -n -i "access[_-]?token=|authorization: bearer [a-z0-9._-]{20,}|api[_-]?key=|password=|secret=" && exit 1 || true
```

The cached manifest must be exactly:

```text
client/src/__tests__/peggy-access-refresh.test.ts
client/src/__tests__/peggy-client-session-boundary.test.tsx
client/src/__tests__/peggy-handoff.test.tsx
client/src/components/peggy-chat.tsx
client/src/components/peggy-dock.tsx
client/src/lib/peggy-access.ts
client/src/pegasus/peggy.tsx
server/__tests__/launch-security-route-contract.test.ts
server/__tests__/peggy-access.test.ts
server/__tests__/peggy-route-auth.test.ts
server/peggy-access.ts
server/routes.ts
shared/peggy-access.ts
```

Inspect, commit, and prove the exact parent and path set:

```bash
git diff --cached --stat
git diff --cached
git commit -m "fix: expire Peggy credentials with bounded refresh"
test "$(git rev-parse HEAD^)" = "$(cat .superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/implementation-base.sha)"
git show --stat --oneline HEAD
git show --format= --name-only HEAD | sed '/^$/d' | LC_ALL=C sort
test "$(git show --format= --name-only HEAD | sed '/^$/d' | wc -l | tr -d ' ')" = "13"
git status --short --untracked-files=no
```

Expected: the primary commit has the required subject, exactly 13 paths, and the reviewed docs checkpoint as its parent; tracked worktree is clean. Never amend or squash it.

**Controller-only review checkpoint — the implementer does not self-approve.** Dispatch three fresh read-only reviewers in order and save their full reports under the ignored SDD directory:

1. **Specification:** compare `$(cat implementation-base.sha)..HEAD` with this complete plan, Program Task 4B, accepted Task 4A and adjacent 4C/5, all recon/adjudication reports, and every changed line. Re-run focused commands as useful. Report Blocker/Major/Minor with file/evidence and explicitly verify all frozen server, no-store, helper, CAS, abort, surface, and 13-path contracts.
2. **Code quality:** only after specification has zero unresolved Blocker/Major, independently inspect the complete range for correctness, total parsing, safe crypto/time arithmetic, Express error containment, Fetch response ownership, concurrent ref races, React behavior, TypeScript quality, non-vacuous tests, and maintainability. Report Critical/Important/Minor with evidence.
3. **Security:** only after specification and quality are clear, use `codex-security:security-diff-scan` on the exact fresh range `$(cat implementation-base.sha)..HEAD`. Treat capability forgery, owner normalization, expiry/grace oracles, cache disclosure, credential leakage/persistence, refresh amplification, abort crossing, and stale-token overwrite as security-sensitive. Triage every candidate against live/static tests. Acceptance requires zero confirmed unresolved finding at any severity.

**Additive review-fix protocol:** Any specification Blocker/Major, quality Critical/Important, or confirmed security finding returns to the same implementer with exact evidence. Every Minor is explicitly accepted or returned by the controller. Where behavior changes, first add/strengthen a causal test, make the smallest in-scope fix, repeat Steps 19–20, stage only the same 13-path manifest, and create an additive commit such as `fix: address Peggy refresh specification review`, `fix: address Peggy refresh quality review`, or `fix: address Peggy refresh security review`. Never amend the primary commit. After any fix, discard stale approvals and repeat fresh specification, quality, and security reviews over the complete base-to-head range. Record identities, SHAs, findings, adjudications, fixes, and rerun evidence in ignored `progress.md` and separate ignored reports.

- [ ] **Step 22: Run the final controller acceptance checkpoint and hand back exact evidence.**

Only after fresh reviews approve the final head, rerun acceptance from a tracked-clean tree:

```bash
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-access.test.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/__tests__/peggy-access-refresh.test.ts client/src/__tests__/peggy-handoff.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npx vitest run server/__tests__/peggy-refusals.test.ts client/src/__tests__/peggy-public-truth.test.tsx client/src/__tests__/peggy-cta-routing.test.tsx client/src/__tests__/peggy-quick-prompts.test.ts client/src/__tests__/query-client-auth.test.ts client/src/__tests__/root-app-boundary.test.tsx
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npm test
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npm run check
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache npm run build
git diff --check
git status --short --untracked-files=no
```

The Step 19 IPC-only fallback is permitted under its exact condition; any other failure blocks acceptance. Verify final history, exact range, protected paths, and lock:

```bash
task4b_base="$(cat .superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/implementation-base.sha)"
git log --oneline --decorate "$task4b_base..HEAD"
test "$(git log --format=%s "$task4b_base..HEAD" | grep -Fxc "fix: expire Peggy credentials with bounded refresh")" = "1"
git diff --name-only "$task4b_base..HEAD" | LC_ALL=C sort
test "$(git diff --name-only "$task4b_base..HEAD" | wc -l | tr -d ' ')" = "13"
env PATH="/tmp/task4b-node22/node_modules/node-linux-x64/bin:$PATH" NPM_CONFIG_CACHE=/tmp/task4b-npm-cache npm_config_cache=/tmp/task4b-npm-cache node --input-type=module <<'NODE'
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const expected = [
  "client/src/__tests__/peggy-access-refresh.test.ts",
  "client/src/__tests__/peggy-client-session-boundary.test.tsx",
  "client/src/__tests__/peggy-handoff.test.tsx",
  "client/src/components/peggy-chat.tsx",
  "client/src/components/peggy-dock.tsx",
  "client/src/lib/peggy-access.ts",
  "client/src/pegasus/peggy.tsx",
  "server/__tests__/launch-security-route-contract.test.ts",
  "server/__tests__/peggy-access.test.ts",
  "server/__tests__/peggy-route-auth.test.ts",
  "server/peggy-access.ts",
  "server/routes.ts",
  "shared/peggy-access.ts",
].sort();
const implementationBase = readFileSync(
  ".superpowers/sdd/2026-08-14-pegasus-peggy-access-refresh/implementation-base.sha",
  "utf8",
).trim();
const actual = execFileSync(
  "git",
  ["diff", "--name-only", `${implementationBase}..HEAD`],
  { encoding: "utf8" },
).split("\n").filter(Boolean).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  console.error({ expected, actual });
  process.exit(1);
}
console.log(`Task 4B final range OK: ${actual.length} paths`);
NODE
git diff --exit-code "$task4b_base" HEAD -- server/peggy-route-auth.ts server/peggy.ts server/storage.ts shared/schema.ts client/src/lib/queryClient.ts client/src/contexts/peggy-context.tsx client/src/PublicApp.tsx client/src/App.tsx client/src/LegacyApp.tsx client/src/pegasus/Landing.tsx client/src/pages/privacy.tsx client/src/__tests__/peggy-public-truth.test.tsx server/peggy-phone.ts package.json package-lock.json docs/superpowers/plans/2026-08-14-pegasus-peggy-access-refresh.md
test "$(sha256sum package-lock.json | cut -d ' ' -f1)" = "ef8b16c62e1ee0c50d92230bf8a243945c27d96bcac5fe79f80ab36cd6567c12"
git status --short --untracked-files=all
```

Expected: one primary commit plus only additive reviewed fixes; the complete range remains exactly the 13 authorized paths; protected surfaces and plan are unchanged; tracked tree is clean; only intentional recovery evidence appears untracked (ignored SDD evidence appears only with `--ignored`). Report final head/range, focused and adjacent file/test counts, full-suite count, type/build/bundle evidence and any IPC ruling, exact manifest, and all three final review verdicts. The controller—not the child implementer—updates global acceptance bookkeeping and decides whether Task 4C may begin. Do not push or deploy.
