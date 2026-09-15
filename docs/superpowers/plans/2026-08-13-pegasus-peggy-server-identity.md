# Peggy Server Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Peggy's browser-session token oracle, make every public web creation fresh and server-correlated, and require verified hybrid identity before calculator storage or model work.

**Architecture:** Extract only Peggy create, new, and calculator registration into a pure dependency-injected `server/peggy-route-auth.ts` seam. `server/routes.ts` supplies production authentication, limiters, Node `randomUUID`, token functions, a transitional calculator parser, and Peggy operations. Create/new validate a bounded allowlisted context, check the capability secret, create one fresh raw-UUID row, and return only its ID/capability. Legacy clients delete browser pseudo-identity and synchronously serialize creation, while privacy copy distinguishes active page-memory access from an explicitly saved transcript.

**Tech Stack:** React 18, TypeScript 5.6, TanStack Query, Wouter, Express 4, Node `crypto`, Vitest, Testing Library, Drizzle/PostgreSQL, Node 22.23.2.

## Global Constraints

- Work only on successor branch `codex/launch-recovery-v2`. The accepted predecessor is exactly `fe78dc1338a9ccdcb806ce8f9ba1262828da2f71` (`docs: record Task 3 acceptance`); do not rewrite or amend it.
- An independent reviewer compares this complete draft with accepted HEAD, Program Task 4A, adjacent Tasks 4B/4C/5, all Task 4A reconnaissance/audit reports, and every named source/test path. Dispatch requires zero Blocker and zero Major plan finding.
- After plan review, the controller promotes this draft byte-for-byte to `docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md` and creates one docs-only checkpoint, `docs: add Peggy server identity plan`. Implementation starts only from that committed checkpoint.
- Execute with `superpowers:subagent-driven-development`: one fresh implementer for this single parent-task boundary, then fresh specification and code-quality reviewers. Record ignored orchestration evidence under `.superpowers/sdd/2026-08-13-pegasus-peggy-server-identity/`; never stage it.
- Use Node `22.23.2`. Every Node/npm/npx command below pins `PATH=/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH` because tool calls may start fresh shells.
- Public brand casing is exactly **Pegasus Dreamscapes**. Peggy is intake/orientation, never a decision-maker. Do not change calculator judgment or “good deal” explanation wording; Task 4C owns it.
- MarketFlow is private beta and reviewed access only; authentication alone is never approval.
- Do not mutate production, `main`, Render, live database, DNS, payment systems, or any external service. Do not push, deploy, or issue live/staging requests.
- Add no dependency, migration, shared schema/storage change, token version/expiry/refresh behavior, delete control, transactional message work, or retention/deletion promise.
- Explicitly authorize new pure `server/peggy-route-auth.ts` and new `client/src/__tests__/peggy-client-session-boundary.test.tsx`. Live route tests import the focused registrar, never monolithic `server/routes.ts`.
- Authorized implementation scope is exactly eleven paths: create `server/peggy-route-auth.ts`, `server/__tests__/peggy-route-auth.test.ts`, and `client/src/__tests__/peggy-client-session-boundary.test.tsx`; modify `server/routes.ts`, `server/peggy.ts`, `server/__tests__/launch-security-route-contract.test.ts`, `client/src/contexts/peggy-context.tsx`, `client/src/components/peggy-dock.tsx`, `client/src/components/peggy-chat.tsx`, `client/src/pages/privacy.tsx`, and `client/src/__tests__/peggy-public-truth.test.tsx`.
- Verify byte-for-byte unchanged `client/src/pegasus/peggy.tsx`, `server/peggy-access.ts`, `shared/peggy-access.ts`, `server/storage.ts`, `shared/schema.ts`, and dependency manifests.
- Public `POST /api/peggy/conversations` and `/api/peggy/conversations/new` remain anonymous-capable and **always** start fresh. An absent body normalizes to `{}`. Otherwise the body must be a plain object with only optional `context` and optional legacy `sessionId`. If present, `sessionId` must be a string no longer than 255 characters and is then ignored completely. Reject every other outer key before secret/UUID/storage. Never read body `sessionId`, `req.sessionID`, body `userId`, or call `getOrCreateConversation`.
- Create/new bind `userId` only when production middleware already normalized a genuinely verified cookie/bearer identity. Legacy authenticated Dock/Chat use `apiRequest` and preserve owner history. Canonical `PublicApp` has no `SupabaseAuthProvider` initialization and remains an anonymous scoped-capability flow; do not modify `client/src/pegasus/peggy.tsx` in Task 4A.
- Use raw `randomUUID()` without a prefix as the correlation stored in legacy `session_id`. Resolve/trim the capability secret before UUID or storage. Return exactly `{ id, accessToken }`.
- Set `Cache-Control: no-store` before either injected limiter on every create/new/calculator outcome: 200, 400, 401, 429, 500, and 503. Focused handlers catch storage/provider/token exceptions locally and return only `500 { message: "Internal server error" }`; production's global error handler currently echoes `err.message` and must not receive these failures. Wider private Peggy no-store is Task 4B.
- A token-issuer exception occurs after the fresh row insert and can leave an inaccessible residual row; Task 4A prevents response leakage but does not add rollback/cleanup. Task 5 owns transactional lifecycle and deletion work.
- Create context root defaults to `{}` and allows only `page`, `userRole`, `dealId`, `dealType`, `calculatorType`, `calculatorInputs`, `calculatorResults`, `labMode`, `labAnalysis`, and `surface`. Reject unexpected context keys.
- Bound context JSON UTF-8 size at 16,384 bytes. Define container depth with context root at 0; accept objects/arrays through depth 6 and reject a container at 7. This preserves deployed `calculatorResults.__projection.series[].points[]` point objects. Aggregate object keys are at most 256 (deployed 50-year Own-vs-Rent is about 226); key length at most 64 UTF-16 code units; arrays at most 50; strings at most 1,000 UTF-16 code units. Permit only ordinary `Object.prototype` objects, ordinary `Array.prototype` dense arrays whose exact reflected own-key set is `length` plus canonical indices `0..length-1`, finite numbers, booleans, strings, and null. Reject cycles, custom/null prototypes, accessors, symbol/non-enumerable/extra or substituted array keys, holes, dates, bigint/functions/symbols/undefined, all nonfinite values, and any getter without invoking it.
- Semantic limits: `page` <=255 chars; `userRole` <=64; `dealId` positive safe integer <=2,147,483,647; `dealType` exactly `capital | wholesale | retail`; `calculatorType` <=50; `labMode` exactly `explain | stress | prepare`; `surface` <=64; `calculatorInputs`, `calculatorResults`, and `labAnalysis` must be plain objects when present. Do not truncate.
- Invalid create input returns stable `400 { message: "Invalid Peggy conversation context" }` before secret, UUID, storage, token, calculator, or provider work.
- Calculator Task 4A owns only auth/order, verified user, fresh raw UUID, and the current required-object shape. Order is exactly `noStore -> calculatorRateLimit -> isHybridAuthenticated -> handler`, then inside the handler `injected parser -> narrow verified-user resolver/defensive 401 -> randomUUID -> analyze`. Anonymous 401 occurs before parser/UUID/storage/provider; invalid authenticated input stops after parsing without resolving identity or doing UUID/provider work.
- Keep calculator parsing injected into `registerPeggyIdentityRoutes` and wire a transitional parser from `server/routes.ts`. Task 4C must replace only the routes injection with `shared/peggy-calculator.ts`, without changing the registrar. Transitional parsing requires a plain root, nonempty string `calculatorType`, and plain-object `inputs/results`; it returns only those fields and ignores calculator identity extras after auth. Task 4C owns exact eight types, depth 3, 64 keys, byte/value limits, invalid wording, and explanatory prompt.
- `server/peggy.ts` exposes object-argument `startWebConversation({ userId?, correlationId, context })`, with required correlation and no fallback/history lookup. Calculator analysis accepts one object containing verified `userId`, `correlationId`, `calculatorType`, `inputs`, and `results`. Remove web `startConversation`/`getOrCreateConversation` exports/default entries; preserve phone/storage paths.
- Delete Peggy `sessionId` from client context and create/calculator bodies; delete `peggy_session_id` reads/writes/generator/fallback. On legacy provider mount, synchronously guard a once-per-real-mount best-effort `window.localStorage.removeItem("peggy_session_id")`, setting the ref before access. Preserve Strategy Lab IDs/drafts, dock position, `pg:saved:chats`, theme/consent, optimistic message IDs, and phone correlations.
- Both live `PeggyDock` and compiled dormant `PeggyChatBubble` use one synchronous per-component creation ref shared by open effect/New. They clear old ID/token before fresh New, disable/guard New and send while create/chat is pending, serialize same-stack double clicks, reset on rejection, and later chat only with the replacement row/token. Live Dock additionally coalesces pending-prompt, open, and close/reopen retriggers while creation is unresolved; dormant Chat has no pending-prompt contract. Do not add Task 5 generations, aborts, or deletion.
- Client boundary tests do not mock `usePeggyContext`, `apiRequest`, `authenticatedRequest`, `useMutation`, or a production component. The pending/open/retry cases render real `PeggyProvider` + `PeggyDock`; supplemental same-stack Dock/dormant/Ask cases use the real exported context Provider with a local value. Observe all legacy transport at a stubbed `globalThis.fetch`, asserting parsed JSON, `credentials: "include"`, and scoped capability headers.
- Privacy truth: conversation content is associated with a server-created record; active server ID/access credential stay only in loaded-page memory, not local storage; close/reopen on the same mounted page may continue; reload/page close ends that browser view; explicit Save chat writes a separate transcript to local storage. Do not imply server/provider deletion. Task 5 owns full retention/deletion detail.
- Preserve authenticated owner-list route via anchored production assertion; do not extract/edit it. It remains `GET /api/peggy/conversations`, `isHybridAuthenticated`, normalized `req.user?.claims?.sub`, then `storage.getPeggyConversations(userId)`. Preserve the existing broader `getAuthUserId` for unrelated routes. New create/calculator composition uses a narrow `getVerifiedPeggyUserId` that reads only normalized `req.user?.claims?.sub` or `req.supabaseUser?.id`, never `req.session`, body, query, or raw headers.
- Static tests prove anchors/order/composition non-vacuously. Live ephemeral Express/fetch tests cover both create registrations; same captured attacker ID yields two fresh raw correlations/tokens; real v1 access guard denies victim replay and accepts new row; response is minimal; invalid boundaries and absent/blank secret precede work; OIDC/Supabase optional owners and calculator identities are verified; body identity is rejected/inert; auth/limiters/errors are no-store; parser normalization reaches analyzer; anonymous/terminal paths do zero downstream work.
- Avoid unrelated casing, accessibility, routing, copy, or UI edits. Existing `Pegasus DreamScapes` and “good deal” wording are explicitly outside this slice.
- Create one primary implementation commit `fix: bind Peggy creation to server identity`. Same implementer addresses Blocker/Major specification and Critical/Important quality findings in additive focused commits; never amend/squash. Controller adjudicates every Minor.
- Never stage `.recovery/`, `.superpowers/`, generated `dist/`, the child plan, program/acceptance ledgers, Task 4B/4C/5 paths, or unrelated changes.

---

## Controller-only pre-dispatch plan checkpoint

After independent preflight reports no Blocker/Major:

```bash
cmp -s .recovery/task4a-peggy-identity-draft.md docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md
sha256sum .recovery/task4a-peggy-identity-draft.md docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md
git diff --check -- docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md
git add -- docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md
test "$(git diff --cached --name-only | wc -l | tr -d ' ')" = "1"
git commit -m "docs: add Peggy server identity plan"
test "$(git rev-parse HEAD^)" = "fe78dc1338a9ccdcb806ce8f9ba1262828da2f71"
git show --format= --name-only HEAD | sed '/^$/d'
```

Expected: hashes match; only the tracked child plan is cached/committed; its parent is accepted Task 3. Never stage `.recovery/`.

## File Map

- Create `server/peggy-route-auth.ts`: total create parser and injected create/new/calculator handlers.
- Modify `server/routes.ts`: production auth/limiter/UUID/token/Peggy wiring plus transitional calculator parser; remove three inline registrations only.
- Modify `server/peggy.ts`: object web/calculator inputs and fresh insert; no resumption fallback.
- Create `server/__tests__/peggy-route-auth.test.ts`: focused live Express/fetch contract, parser boundaries, real token/guard, real Peggy-to-storage adapter.
- Modify `server/__tests__/launch-security-route-contract.test.ts`: actual registrar/wiring/order/owner-list/object-API assertions.
- Modify legacy provider/Dock/Chat and create `peggy-client-session-boundary.test.tsx`: selective purge, context-only transport, synchronous race closure, dormant and canonical lifecycle evidence.
- Modify privacy and public truth test: page-memory versus separately saved transcript truth.

### Task 4A: Bind Peggy creation to server identity and guard calculator work

**Files:**
- Create: `server/peggy-route-auth.ts`
- Create: `server/__tests__/peggy-route-auth.test.ts`
- Create: `client/src/__tests__/peggy-client-session-boundary.test.tsx`
- Modify: `server/routes.ts`, `server/peggy.ts`, `server/__tests__/launch-security-route-contract.test.ts`
- Modify: `client/src/contexts/peggy-context.tsx`, `client/src/components/peggy-dock.tsx`, `client/src/components/peggy-chat.tsx`, `client/src/pages/privacy.tsx`, `client/src/__tests__/peggy-public-truth.test.tsx`
- Verify unchanged: `client/src/pegasus/peggy.tsx`, `server/peggy-access.ts`, `shared/peggy-access.ts`, `server/storage.ts`, `shared/schema.ts`, dependency manifests

**Interfaces:**
- Produces `parsePeggyCreateContext(body: unknown)`, `registerPeggyIdentityRoutes(app, dependencies)`, `StartWebConversationInput`, `AuthenticatedCalculatorInput`, `startWebConversation(input)`, and object `analyzeCalculatorResults(input)`.
- Parser result is `{ ok: true, value: PeggyContext } | { ok: false }`; absent body is `{}`, present body permits only bounded/inert `sessionId` plus bounded `context`.
- Registrar consumes existing `publicIntakeRateLimit`, `rateLimit(10, 60_000)`, `isHybridAuthenticated`, narrow `getVerifiedPeggyUserId`, Node `randomUUID`, v1 secret/token functions, fresh Peggy insert, and injected calculator parser/analyzer.
- Create/new responses are exactly `{ id: number, accessToken: string }`; calculator retains `{ response: string, conversationId: number }`.
- Owner history stays byte-for-byte in place and is not a resumption path.

- [ ] **Step 1: Confirm reviewed plan checkpoint, accepted base, runtime, and ignored workspace.**

Run:

```bash
git status --short --untracked-files=no
git branch --show-current
git log -4 --oneline
test "$(git rev-parse HEAD^)" = "fe78dc1338a9ccdcb806ce8f9ba1262828da2f71"
git ls-files --error-unmatch docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md
git diff --exit-code HEAD -- docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --version
```

Expected: tracked clean; branch `codex/launch-recovery-v2`; HEAD is reviewed docs-only plan checkpoint whose parent is `fe78dc...`; plan unchanged; Node `v22.23.2`. Stop on mismatch.

- [ ] **Step 2: Initialize ignored SDD evidence using packaged scripts and apply_patch only.**

Run:

```bash
bash /root/.codex/plugins/cache/openai-curated-remote/superpowers/6.2.0/skills/subagent-driven-development/scripts/sdd-workspace docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md
bash /root/.codex/plugins/cache/openai-curated-remote/superpowers/6.2.0/skills/subagent-driven-development/scripts/task-brief docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md 4A .superpowers/sdd/2026-08-13-pegasus-peggy-server-identity/task-4A-brief.md
git rev-parse HEAD
```

The scripts are intentionally non-executable (hence `bash`) and do not create ledger/base files. Using `apply_patch`, create `.superpowers/sdd/2026-08-13-pegasus-peggy-server-identity/implementation-base.sha` containing the exact full SHA printed above plus newline. Using `apply_patch`, create `progress.md` with this content, substituting that observed SHA and the fresh worker identity:

```md
# SDD ledger — plan: docs/superpowers/plans/2026-08-13-pegasus-peggy-server-identity.md

- Implementation base: <exact observed full docs-checkpoint SHA>
- Parent task: 4A — Bind Peggy creation to server identity and guard calculator work
- Branch: codex/launch-recovery-v2
- Runtime: Node 22.23.2

## Task 4A

- Status: implementation dispatched
- Implementer: <fresh worker identity>
- RED evidence: pending
- GREEN evidence: pending
- Review evidence: pending
```

The angle-bracket fields above are editing instructions, not literal placeholders: replace both before saving. Verify:

```bash
test "$(cat .superpowers/sdd/2026-08-13-pegasus-peggy-server-identity/implementation-base.sha)" = "$(git rev-parse HEAD)"
sed -n '1,16p' .superpowers/sdd/2026-08-13-pegasus-peggy-server-identity/progress.md
git status --short --ignored .superpowers/sdd/2026-08-13-pegasus-peggy-server-identity
```

Expected: base matches HEAD, ledger starts with exact header and actual values (no angle brackets), workspace is ignored. Never stage it.

- [ ] **Step 3: Create the complete live server RED against the focused registrar and real Peggy adapter.**
Create `server/__tests__/peggy-route-auth.test.ts` with the following complete file. The conditional production import makes the missing registrar a named causal failure; live tests import the focused registrar, never monolithic `server/routes.ts`.

```ts
import { existsSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
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
import {
  createPeggyConversationAccessGuard,
  createPeggyConversationAccessToken,
  PEGGY_CONVERSATION_ACCESS_HEADER,
} from "../peggy-access";

const peggyStorage = vi.hoisted(() => ({
  createPeggyConversation: vi.fn(),
  getPeggyConversations: vi.fn(),
}));

vi.mock("../storage", () => ({ storage: peggyStorage }));

const peggyModule = await import("../peggy");

type ParseResult<T> = { ok: true; value: T } | { ok: false };
type CalculatorRequest = {
  calculatorType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
};
type Conversation = {
  id: number;
  sessionId: string;
  userId: string | null;
  title: string;
  contactEmail: string;
};
type StartInput = {
  userId?: string;
  correlationId: string;
  context: Record<string, unknown>;
};
type AnalyzeInput = CalculatorRequest & {
  userId: string;
  correlationId: string;
};
type Registrar = (
  app: Pick<express.Express, "post">,
  dependencies: {
    noStore: RequestHandler;
    publicCreateRateLimit: RequestHandler;
    calculatorRateLimit: RequestHandler;
    isHybridAuthenticated: RequestHandler;
    getVerifiedPeggyUserId(req: Request): string | null;
    randomUUID(): string;
    getAccessSecret(): string | null;
    createAccessToken(conversation: Conversation, secret: string): string;
    startWebConversation(input: StartInput): Promise<Conversation>;
    parseCalculatorRequest(body: unknown): ParseResult<CalculatorRequest>;
    analyzeCalculator(input: AnalyzeInput): Promise<{
      response: string;
      conversationId: number;
    }>;
  },
) => void;
type CreateParser = (
  body: unknown,
) => ParseResult<Record<string, unknown>>;

const registrarPath = resolve(process.cwd(), "server/peggy-route-auth.ts");
const routeModule = existsSync(registrarPath)
  ? await import(/* @vite-ignore */ "../peggy-route-auth")
  : {};
const registerPeggyIdentityRoutes = (
  routeModule as { registerPeggyIdentityRoutes?: unknown }
).registerPeggyIdentityRoutes;
const parsePeggyCreateContext = (
  routeModule as { parsePeggyCreateContext?: unknown }
).parsePeggyCreateContext;

function requireRegistrar(): Registrar {
  expect(
    registerPeggyIdentityRoutes,
    "Task 4A needs a focused production Peggy identity registrar",
  ).toBeTypeOf("function");
  if (typeof registerPeggyIdentityRoutes !== "function") {
    throw new Error("Peggy identity registrar is missing");
  }
  return registerPeggyIdentityRoutes as Registrar;
}

function requireCreateParser(): CreateParser {
  expect(
    parsePeggyCreateContext,
    "Task 4A needs the bounded create-context parser",
  ).toBeTypeOf("function");
  if (typeof parsePeggyCreateContext !== "function") {
    throw new Error("Peggy create-context parser is missing");
  }
  return parsePeggyCreateContext as CreateParser;
}

const TEST_SECRET = "test-only-peggy-access-secret".repeat(2);
const conversations = new Map<number, Conversation>();
const calls: string[] = [];
const startCalls: StartInput[] = [];
const analyzeCalls: AnalyzeInput[] = [];
let nextConversationId = 100;
let nextUuid = 1;
let accessSecret: string | null = TEST_SECRET;
let rejectStart = false;
let rejectToken = false;
let rejectUuid = false;
let rejectCalculatorParser = false;
let createLimited = false;
let calculatorLimited = false;
let server: Server | undefined;
let baseUrl = "";

function generatedUuid(): string {
  const tail = String(nextUuid++).padStart(12, "0");
  return `00000000-0000-4000-8000-${tail}`;
}

const noStore: RequestHandler = (_req, res, next) => {
  calls.push("no-store");
  res.set("Cache-Control", "no-store");
  next();
};

const publicCreateRateLimit: RequestHandler = (_req, res, next) => {
  calls.push("create-limit");
  if (createLimited) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  next();
};

const calculatorRateLimit: RequestHandler = (_req, res, next) => {
  calls.push("calculator-limit");
  if (calculatorLimited) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  next();
};

const isHybridAuthenticated: RequestHandler = (req: any, res, next) => {
  calls.push("auth");
  if (req.get("x-test-auth-pass") === "1") {
    next();
    return;
  }
  if (req.user?.claims?.sub) {
    next();
    return;
  }
  res.status(401).json({ message: "Unauthorized" });
};

function getVerifiedPeggyUserId(req: any): string | null {
  calls.push("verified-user");
  for (const candidate of [
    req.user?.claims?.sub,
    req.supabaseUser?.id,
  ]) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

function parseCalculatorRequest(body: unknown): ParseResult<CalculatorRequest> {
  calls.push("calculator-parser");
  if (rejectCalculatorParser) {
    throw new Error("injected calculator parser failure with body detail");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false };
  }
  const value = body as Record<string, unknown>;
  const plain = (candidate: unknown): candidate is Record<string, unknown> => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return false;
    }
    const prototype = Object.getPrototypeOf(candidate);
    return prototype === Object.prototype || prototype === null;
  };
  if (
    typeof value.calculatorType !== "string" ||
    !value.calculatorType.trim() ||
    !plain(value.inputs) ||
    !plain(value.results)
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    value: {
      calculatorType: value.calculatorType,
      inputs: value.inputs,
      results: value.results,
    },
  };
}

function getAccessSecret(): string | null {
  calls.push("secret");
  return accessSecret;
}

function randomUUID(): string {
  calls.push("uuid");
  if (rejectUuid) throw new Error("injected UUID failure with secret detail");
  return generatedUuid();
}

async function startWebConversation(input: StartInput): Promise<Conversation> {
  calls.push("start");
  startCalls.push(input);
  if (rejectStart) throw new Error("injected start failure with secret detail");
  const conversation: Conversation = {
    id: nextConversationId++,
    sessionId: input.correlationId,
    userId: input.userId ?? null,
    title: "New Conversation",
    contactEmail: "must-not-leak@example.test",
  };
  conversations.set(conversation.id, conversation);
  return conversation;
}

function createAccessToken(
  conversation: Conversation,
  secret: string,
): string {
  calls.push("token");
  if (rejectToken) throw new Error("injected token failure with row detail");
  return createPeggyConversationAccessToken(conversation, secret);
}

async function analyzeCalculator(input: AnalyzeInput) {
  calls.push("analyze");
  analyzeCalls.push(input);
  if (input.calculatorType === "throw") {
    throw new Error("injected provider failure with calculator detail");
  }
  return {
    response: `Explained ${input.calculatorType}`,
    conversationId: nextConversationId++,
  };
}

async function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  requireRegistrar();
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  if (typeof registerPeggyIdentityRoutes !== "function") return;
  const app = express();
  app.use(express.json());
  // Simulates production's global auth normalization before anonymous routes.
  app.use((req: any, _res, next) => {
    req.sessionID = "attacker-controlled-express-session";
    req.session = { user: { id: "forged-session-owner" } };
    const oidcUser = req.get("x-test-oidc-user");
    const supabaseUser = req.get("x-test-supabase-user");
    const invalidUser = req.get("x-test-invalid-user");
    if (oidcUser) req.user = { claims: { sub: oidcUser } };
    if (supabaseUser) {
      req.supabaseUser = {
        id: supabaseUser,
        claims: { sub: supabaseUser },
      };
      req.user = { claims: req.supabaseUser.claims };
    }
    if (invalidUser === "blank") req.user = { claims: { sub: "   " } };
    if (invalidUser === "number") req.user = { claims: { sub: 123 } };
    next();
  });
  requireRegistrar()(app, {
    noStore,
    publicCreateRateLimit,
    calculatorRateLimit,
    isHybridAuthenticated,
    getVerifiedPeggyUserId,
    randomUUID,
    getAccessSecret,
    createAccessToken,
    startWebConversation,
    parseCalculatorRequest,
    analyzeCalculator,
  });
  const guard = createPeggyConversationAccessGuard({
    getConversation: async (id) => conversations.get(id),
    getSecret: () => TEST_SECRET,
  });
  app.get("/api/peggy/conversations/:id", guard, (_req, res) => {
    res.json({ id: res.locals.peggyConversation.id });
  });
  // Intentionally leaks. Correct focused handlers must never reach this.
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    calls.push("downstream-error");
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
    server!.close((error) => (error ? reject(error) : resolve())),
  );
});

beforeEach(() => {
  conversations.clear();
  conversations.set(41, {
    id: 41,
    sessionId: "captured-victim-browser-id",
    userId: null,
    title: "Victim",
    contactEmail: "victim@example.test",
  });
  calls.length = 0;
  startCalls.length = 0;
  analyzeCalls.length = 0;
  nextConversationId = 100;
  nextUuid = 1;
  accessSecret = TEST_SECRET;
  rejectStart = false;
  rejectToken = false;
  rejectUuid = false;
  rejectCalculatorParser = false;
  createLimited = false;
  calculatorLimited = false;
  peggyStorage.createPeggyConversation.mockReset();
  peggyStorage.getPeggyConversations.mockReset();
});
describe("Peggy route ordering and terminal responses", () => {
  it("stops anonymous calculator work after no-store, limiter, and auth", async () => {
    const response = await post("/api/peggy/analyze-calculator", {
      calculatorType: "roi",
      inputs: {},
      results: {},
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Unauthorized" });
    expect(calls).toEqual(["no-store", "calculator-limit", "auth"]);
    expect(startCalls).toHaveLength(0);
    expect(analyzeCalls).toHaveLength(0);
  });

  it.each([
    ["create", "/api/peggy/conversations"],
    ["new", "/api/peggy/conversations/new"],
  ])("keeps terminal %s limiter no-store and inert", async (_label, path) => {
    createLimited = true;
    const response = await post(path, { context: { page: "home" } });
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "create-limit"]);
    expect(startCalls).toHaveLength(0);
  });

  it("keeps terminal calculator limiter no-store and inert", async () => {
    calculatorLimited = true;
    const response = await post("/api/peggy/analyze-calculator", {
      calculatorType: "roi",
      inputs: {},
      results: {},
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "calculator-limit"]);
  });

  it.each([null, "   "])(
    "checks missing/blank secret before UUID/storage/token (%s)",
    async (configuredSecret) => {
      accessSecret = configuredSecret;
      const response = await post("/api/peggy/conversations", {
        context: { page: "home" },
      });
      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({
        message: "Peggy conversation access is unavailable",
      });
      expect(calls).toEqual(["no-store", "create-limit", "secret"]);
      expect(startCalls).toHaveLength(0);
    },
  );

  it("catches start failure locally with generic no-store 500", async () => {
    rejectStart = true;
    const response = await post("/api/peggy/conversations", {
      context: { page: "home" },
    });
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|home|secret|token/i);
    expect(calls).toEqual([
      "no-store", "create-limit", "secret", "verified-user", "uuid", "start",
    ]);
  });

  it("catches token failure locally without leaking inserted row/capability", async () => {
    rejectToken = true;
    const response = await post("/api/peggy/conversations", {
      context: { page: "home" },
    });
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|accessToken|\"id\"|secret/i);
    expect(calls).toEqual([
      "no-store", "create-limit", "secret", "verified-user", "uuid", "start", "token",
    ]);
    expect(startCalls).toHaveLength(1);
  });

  it("catches create UUID failure locally before storage/token", async () => {
    rejectUuid = true;
    const response = await post("/api/peggy/conversations", {
      context: { page: "home" },
    });
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|uuid|secret|home/i);
    expect(calls).toEqual([
      "no-store", "create-limit", "secret", "verified-user", "uuid",
    ]);
    expect(startCalls).toHaveLength(0);
  });

  it("catches injected calculator-parser failure locally", async () => {
    rejectCalculatorParser = true;
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "roi", inputs: {}, results: {} },
      { "x-test-oidc-user": "oidc-owner" },
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|parser|body|roi/i);
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
    ]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("catches calculator UUID failure locally before analyzer", async () => {
    rejectUuid = true;
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "roi", inputs: {}, results: {} },
      { "x-test-oidc-user": "oidc-owner" },
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|uuid|secret|roi/i);
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
      "verified-user", "uuid",
    ]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("catches analyzer failure locally with generic no-store 500", async () => {
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "throw", inputs: {}, results: {} },
      { "x-test-oidc-user": "oidc-owner" },
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|throw|secret|token/i);
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
      "verified-user", "uuid", "analyze",
    ]);
  });
});

describe("fresh creation and scoped access", () => {
  it.each([
    "/api/peggy/conversations",
    "/api/peggy/conversations/new",
  ])("accepts an absent body as empty context at %s", async (path) => {
    const response = await post(path, undefined);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      id: 100,
      accessToken: expect.stringMatching(/^v1\./),
    });
    expect(startCalls).toEqual([expect.objectContaining({ context: {} })]);
  });

  it.each([
    "/api/peggy/conversations",
    "/api/peggy/conversations/new",
  ])("always starts fresh at %s and ignores only bounded legacy ID", async (path) => {
    const body = {
      sessionId: "captured-victim-browser-id",
      context: { page: "home", surface: "legacy-dock" },
    };
    const first = await post(path, body);
    const second = await post(path, body);
    const firstBody = await first.json();
    const secondBody = await second.json();
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.headers.get("cache-control")).toBe("no-store");
    expect(Object.keys(firstBody).sort()).toEqual(["accessToken", "id"]);
    expect(Object.keys(secondBody).sort()).toEqual(["accessToken", "id"]);
    expect(firstBody.id).not.toBe(secondBody.id);
    expect(firstBody.accessToken).not.toBe(secondBody.accessToken);
    expect(startCalls).toEqual([
      {
        userId: undefined,
        correlationId: "00000000-0000-4000-8000-000000000001",
        context: { page: "home", surface: "legacy-dock" },
      },
      {
        userId: undefined,
        correlationId: "00000000-0000-4000-8000-000000000002",
        context: { page: "home", surface: "legacy-dock" },
      },
    ]);
    expect(JSON.stringify(startCalls)).not.toMatch(
      /captured-victim-browser-id|attacker-controlled-express-session|forged-session-owner/,
    );
    expect(startCalls.every((call) => call.userId === undefined)).toBe(true);
  });

  it("cannot mint access to a victim row from a captured browser ID", async () => {
    const created = await post("/api/peggy/conversations", {
      sessionId: "captured-victim-browser-id",
      context: { page: "home" },
    });
    const capability = await created.json();
    const victimReplay = await fetch(`${baseUrl}/api/peggy/conversations/41`, {
      headers: { [PEGGY_CONVERSATION_ACCESS_HEADER]: capability.accessToken },
    });
    const ownRow = await fetch(
      `${baseUrl}/api/peggy/conversations/${capability.id}`,
      { headers: { [PEGGY_CONVERSATION_ACCESS_HEADER]: capability.accessToken } },
    );
    expect(victimReplay.status).toBe(404);
    expect(await victimReplay.json()).toEqual({ message: "Conversation not found" });
    expect(ownRow.status).toBe(200);
    expect(await ownRow.json()).toEqual({ id: capability.id });
  });

  it.each([
    ["OIDC create", "/api/peggy/conversations", { "x-test-oidc-user": "oidc-owner" }, "oidc-owner"],
    ["OIDC new", "/api/peggy/conversations/new", { "x-test-oidc-user": "oidc-owner" }, "oidc-owner"],
    ["Supabase create", "/api/peggy/conversations", { "x-test-supabase-user": "supabase-owner" }, "supabase-owner"],
    ["Supabase new", "/api/peggy/conversations/new", { "x-test-supabase-user": "supabase-owner" }, "supabase-owner"],
  ])("binds verified %s principal only", async (_label, path, headers, owner) => {
    const response = await post(
      path,
      {
        sessionId: "captured-victim-browser-id",
        context: { page: "home", userRole: "admin" },
      },
      headers,
    );
    expect(response.status).toBe(200);
    expect(startCalls).toEqual([
      expect.objectContaining({
        userId: owner,
        context: { page: "home", userRole: "admin" },
      }),
    ]);
  });

  it("rejects conflicting outer userId even for a verified principal", async () => {
    const response = await post(
      "/api/peggy/conversations/new",
      { userId: "body-owner", context: { page: "home" } },
      { "x-test-oidc-user": "verified-owner" },
    );
    expect(response.status).toBe(400);
    expect(calls).toEqual(["no-store", "create-limit"]);
    expect(startCalls).toHaveLength(0);
  });

  it.each(["blank", "number"])(
    "does not bind an invalid normalized %s owner",
    async (invalidUser) => {
      const response = await post(
        "/api/peggy/conversations",
        { context: { page: "home" } },
        { "x-test-invalid-user": invalidUser },
      );
      expect(response.status).toBe(200);
      expect(startCalls).toEqual([
        expect.objectContaining({ userId: undefined }),
      ]);
    },
  );

  it("falls through invalid OIDC shape to a valid normalized Supabase owner", async () => {
    const response = await post(
      "/api/peggy/conversations",
      { context: { page: "home" } },
      {
        "x-test-supabase-user": "supabase-fallback-owner",
        "x-test-invalid-user": "blank",
      },
    );
    expect(response.status).toBe(200);
    expect(startCalls).toEqual([
      expect.objectContaining({ userId: "supabase-fallback-owner" }),
    ]);
  });

  it.each([
    ["outer userId", { userId: "body-owner", context: {} }],
    ["outer conversationId", { conversationId: 41, context: {} }],
    ["outer token", { accessToken: "v1.poison", context: {} }],
    ["outer ownerId", { ownerId: "body-owner", context: {} }],
    ["outer token alias", { token: "v1.poison", context: {} }],
    ["outer authorization", { authorization: "Bearer poison", context: {} }],
    ["outer session", { session: "poison", context: {} }],
    ["outer extra", { extra: true, context: {} }],
    ["legacy session null", { sessionId: null, context: {} }],
    ["legacy session number", { sessionId: 1, context: {} }],
    ["legacy session boolean", { sessionId: true, context: {} }],
    ["legacy session array", { sessionId: [], context: {} }],
    ["legacy session object", { sessionId: { id: 41 }, context: {} }],
    ["legacy session too long", { sessionId: "x".repeat(256), context: {} }],
    ["context userId", { context: { userId: "body-owner" } }],
    ["context ownerId", { context: { ownerId: "body-owner" } }],
    ["context sessionId", { context: { sessionId: "victim" } }],
    ["context token", { context: { token: "v1.poison" } }],
    ["context accessToken", { context: { accessToken: "v1.poison" } }],
    ["context conversationId", { context: { conversationId: 41 } }],
  ])("rejects %s before secret or work", async (_label, body) => {
    const response = await post("/api/peggy/conversations", body);
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      message: "Invalid Peggy conversation context",
    });
    expect(calls).toEqual(["no-store", "create-limit"]);
    expect(startCalls).toHaveLength(0);
  });
});

describe("authenticated calculator and injected parser seam", () => {
  it.each([
    ["OIDC", { "x-test-oidc-user": "oidc-calculator" }, "oidc-calculator"],
    ["Supabase", { "x-test-supabase-user": "supabase-calculator" }, "supabase-calculator"],
  ])("uses verified %s identity and normalized parser output", async (_label, headers, owner) => {
    const response = await post(
      "/api/peggy/analyze-calculator",
      {
        calculatorType: "roi",
        inputs: { purchasePrice: 300_000 },
        results: { roi: 12.5 },
        userId: "body-attacker",
        sessionId: "captured-victim-browser-id",
        poison: "must-not-reach-analyzer",
      },
      headers,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      response: "Explained roi",
      conversationId: 100,
    });
    expect(analyzeCalls).toEqual([{
      userId: owner,
      correlationId: "00000000-0000-4000-8000-000000000001",
      calculatorType: "roi",
      inputs: { purchasePrice: 300_000 },
      results: { roi: 12.5 },
    }]);
    expect(JSON.stringify(analyzeCalls)).not.toMatch(/body-attacker|poison/);
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
      "verified-user", "uuid", "analyze",
    ]);
  });

  it("rejects parser failure after auth and before UUID/work", async () => {
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "roi", inputs: [], results: {} },
      { "x-test-oidc-user": "oidc-calculator" },
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
    ]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("defensively rejects a missing normalized principal after parsing", async () => {
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "roi", inputs: {}, results: {} },
      { "x-test-auth-pass": "1" },
    );
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Unauthorized" });
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
      "verified-user",
    ]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it.each(["blank", "number"])(
    "defensively rejects invalid normalized %s identity after parsing",
    async (invalidUser) => {
      const response = await post(
        "/api/peggy/analyze-calculator",
        { calculatorType: "roi", inputs: {}, results: {} },
        { "x-test-invalid-user": invalidUser },
      );
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(calls).toEqual([
        "no-store", "calculator-limit", "auth", "calculator-parser",
        "verified-user",
      ]);
      expect(analyzeCalls).toHaveLength(0);
    },
  );
});
function projectionContext(years = 50) {
  return {
    calculatorType: "ownvsrent",
    calculatorResults: {
      __projection: {
        series: [{
          label: "Owner equity",
          points: Array.from({ length: years }, (_, year) => ({
            year,
            ownerEquity: year * 10,
            renterEquity: year * 4,
            delta: year * 6,
          })),
        }],
      },
    },
  };
}

function aggregateKeyContext(totalKeys: number) {
  return {
    calculatorResults: Object.fromEntries(
      Array.from({ length: totalKeys - 1 }, (_, index) => [`k${index}`, index]),
    ),
  };
}

function exactByteContext(finalChunk: string) {
  return {
    calculatorResults: {
      chunks: [...Array(16).fill("x".repeat(1000)), finalChunk],
    },
  };
}

describe("parsePeggyCreateContext", () => {
  it("defaults absent body/context and ignores one bounded legacy ID", () => {
    expect(requireCreateParser()(undefined)).toEqual({ ok: true, value: {} });
    expect(requireCreateParser()({})).toEqual({ ok: true, value: {} });
    expect(requireCreateParser()({ sessionId: "x".repeat(255) })).toEqual({
      ok: true,
      value: {},
    });
  });

  it.each([null, 1, true, [], {}, "x".repeat(256)])(
    "rejects non-string/overlong legacy sessionId: %j",
    (sessionId) => {
      expect(requireCreateParser()({ sessionId })).toEqual({ ok: false });
    },
  );

  it.each([null, 1, true, [], "body"])(
    "rejects present non-plain root: %j",
    (body) => expect(requireCreateParser()(body)).toEqual({ ok: false }),
  );

  it("rejects null-prototype roots and contexts", () => {
    expect(requireCreateParser()(Object.create(null))).toEqual({ ok: false });
    expect(
      requireCreateParser()({ context: Object.create(null) }),
    ).toEqual({ ok: false });
  });

  it.each([
    ["public", { page: "home", userRole: "guest", surface: "public-peggy" }],
    ["Strategy Lab", {
      page: "strategy-lab",
      labMode: "stress",
      labAnalysis: {
        topLane: "direct-acquisition",
        inputs: { askingPrice: 400_000, holdingMonths: 9, targetUse: "rental" },
      },
      surface: "strategy-lab",
    }],
    ["BRRRR", {
      calculatorType: "brrrr",
      calculatorInputs: { purchasePrice: 250_000, rehab: 80_000 },
      calculatorResults: { cashLeftInDeal: 32_000 },
    }],
    ["Cashflow", {
      calculatorType: "cashflow",
      calculatorInputs: { rent: 3_200, piti: 2_100 },
      calculatorResults: { monthlyCashFlow: 540 },
    }],
    ["50-year Own vs Rent", projectionContext()],
  ])("accepts deployed %s context", (_label, context) => {
    expect(Buffer.byteLength(JSON.stringify(context), "utf8")).toBeLessThanOrEqual(
      16 * 1024,
    );
    expect(requireCreateParser()({ context })).toEqual({ ok: true, value: context });
  });

  it("accepts depth six and rejects a container at depth seven", () => {
    const depthSix = projectionContext(1);
    const depthSeven = projectionContext(1);
    (depthSeven.calculatorResults.__projection.series[0].points[0] as any).meta = {
      source: "depth-seven",
    };
    expect(requireCreateParser()({ context: depthSix }).ok).toBe(true);
    expect(requireCreateParser()({ context: depthSeven })).toEqual({ ok: false });
  });

  it("accepts 256 aggregate keys and rejects 257", () => {
    expect(requireCreateParser()({ context: aggregateKeyContext(256) }).ok).toBe(true);
    expect(requireCreateParser()({ context: aggregateKeyContext(257) })).toEqual({
      ok: false,
    });
  });

  it("measures exact UTF-8 context bytes at 16 KiB", () => {
    const exact = exactByteContext("x".repeat(299));
    const oneByteOver = exactByteContext("x".repeat(300));
    const multibyteOver = exactByteContext(`${"x".repeat(298)}é`);
    expect(Buffer.byteLength(JSON.stringify(exact), "utf8")).toBe(16_384);
    expect(Buffer.byteLength(JSON.stringify(oneByteOver), "utf8")).toBe(16_385);
    expect(Buffer.byteLength(JSON.stringify(multibyteOver), "utf8")).toBe(16_385);
    expect(requireCreateParser()({ context: exact }).ok).toBe(true);
    expect(requireCreateParser()({ context: oneByteOver })).toEqual({ ok: false });
    expect(requireCreateParser()({ context: multibyteOver })).toEqual({ ok: false });
  });

  it("accepts exact semantic/generic maxima in bounded fixtures", () => {
    const semantic = {
      page: "p".repeat(255),
      userRole: "r".repeat(64),
      dealId: 2_147_483_647,
      dealType: "wholesale",
      calculatorType: "c".repeat(50),
      labMode: "prepare",
      surface: "s".repeat(64),
    };
    const generic = {
      calculatorResults: {
        value: "x".repeat(1000),
        ["k".repeat(64)]: true,
        values: Array(50).fill(null),
      },
    };
    expect(requireCreateParser()({ context: semantic })).toEqual({
      ok: true,
      value: semantic,
    });
    expect(requireCreateParser()({ context: generic })).toEqual({
      ok: true,
      value: generic,
    });
  });

  it("counts string limits in UTF-16 code units while bytes remain UTF-8", () => {
    const astral = "😀";
    expect(astral.length).toBe(2);
    expect(
      requireCreateParser()({
        sessionId: astral.repeat(127) + "x",
        context: { page: astral.repeat(127) + "x" },
      }).ok,
    ).toBe(true);
    expect(
      requireCreateParser()({
        sessionId: astral.repeat(128),
        context: {},
      }),
    ).toEqual({ ok: false });
    expect(
      requireCreateParser()({ context: { page: astral.repeat(128) } }),
    ).toEqual({ ok: false });
    const genericAtMax = astral.repeat(500);
    const keyAtMax = astral.repeat(32);
    expect(genericAtMax.length).toBe(1_000);
    expect(keyAtMax.length).toBe(64);
    expect(requireCreateParser()({
      context: { calculatorResults: { [keyAtMax]: genericAtMax } },
    }).ok).toBe(true);
    expect(requireCreateParser()({
      context: {
        calculatorResults: { value: `${genericAtMax}x` },
      },
    })).toEqual({ ok: false });
    expect(requireCreateParser()({
      context: {
        calculatorResults: { [`${keyAtMax}x`]: true },
      },
    })).toEqual({ ok: false });
  });

  it.each([
    ["page 256", { page: "x".repeat(256) }],
    ["page type", { page: 1 }],
    ["userRole 65", { userRole: "x".repeat(65) }],
    ["userRole type", { userRole: 1 }],
    ["calculatorType 51", { calculatorType: "x".repeat(51) }],
    ["calculatorType type", { calculatorType: 1 }],
    ["surface 65", { surface: "x".repeat(65) }],
    ["surface type", { surface: 1 }],
    ["dealId zero", { dealId: 0 }],
    ["dealId fraction", { dealId: 1.5 }],
    ["dealId type", { dealId: "1" }],
    ["dealId over max", { dealId: 2_147_483_648 }],
    ["dealType enum", { dealType: "public-offering" }],
    ["dealType type", { dealType: 1 }],
    ["labMode enum", { labMode: "decide" }],
    ["labMode type", { labMode: 1 }],
    ["string 1001", { calculatorResults: { value: "x".repeat(1001) } }],
    ["key 65", { calculatorResults: { ["k".repeat(65)]: true } }],
    ["array 51", { calculatorResults: { values: Array(51).fill(null) } }],
    ["unexpected key", { admin: true }],
    ["calculatorInputs array", { calculatorInputs: [] }],
    ["calculatorInputs null", { calculatorInputs: null }],
    ["calculatorInputs Date", { calculatorInputs: new Date() }],
    ["calculatorResults array", { calculatorResults: [] }],
    ["calculatorResults null", { calculatorResults: null }],
    ["calculatorResults Date", { calculatorResults: new Date() }],
    ["labAnalysis array", { labAnalysis: [] }],
    ["labAnalysis null", { labAnalysis: null }],
    ["labAnalysis Date", { labAnalysis: new Date() }],
  ])("rejects %s", (_label, context) => {
    expect(requireCreateParser()({ context })).toEqual({ ok: false });
  });

  it.each([
    ["bigint", 1n],
    ["function", () => undefined],
    ["symbol", Symbol("value")],
    ["undefined", undefined],
    ["date", new Date()],
    ["positive infinity", Infinity],
    ["negative infinity", -Infinity],
    ["NaN", NaN],
  ])("rejects nested non-JSON %s", (_label, value) => {
    expect(
      requireCreateParser()({ context: { calculatorResults: { value } } }),
    ).toEqual({ ok: false });
  });

  it("rejects cycles, sparse arrays, and symbol keys", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const symbolKeyed = { normal: true } as Record<PropertyKey, unknown>;
    symbolKeyed[Symbol("hidden")] = true;
    expect(
      requireCreateParser()({ context: { calculatorResults: cyclic } }),
    ).toEqual({ ok: false });
    expect(
      requireCreateParser()({ context: { calculatorResults: { values: Array(2) } } }),
    ).toEqual({ ok: false });
    expect(
      requireCreateParser()({ context: { calculatorResults: symbolKeyed } }),
    ).toEqual({ ok: false });
  });

  it("rejects nested custom prototypes and hidden object data", () => {
    class CustomContainer { value = 1; }
    const hidden = { visible: true } as Record<string, unknown>;
    Object.defineProperty(hidden, "hidden", {
      value: "poison",
      enumerable: false,
    });
    for (const value of [
      Object.create(null),
      Object.create({ inherited: true }),
      new CustomContainer(),
      new Map([["value", 1]]),
      new Set([1]),
      new Uint8Array([1]),
      hidden,
    ]) {
      expect(
        requireCreateParser()({ context: { calculatorResults: { value } } }),
      ).toEqual({ ok: false });
    }
  });

  it("accepts only canonical dense arrays with no extra own keys", () => {
    const fixtures: unknown[][] = [];
    const named = [1];
    Object.defineProperty(named, "named", { value: true, enumerable: true });
    fixtures.push(named);
    const negative = [1];
    Object.defineProperty(negative, "-1", { value: true, enumerable: true });
    fixtures.push(negative);
    const leadingZero = [1];
    Object.defineProperty(leadingZero, "00", { value: true, enumerable: true });
    fixtures.push(leadingZero);
    const hidden = [1];
    Object.defineProperty(hidden, "hidden", { value: true, enumerable: false });
    fixtures.push(hidden);
    const symbol = [1] as unknown[] & Record<PropertyKey, unknown>;
    symbol[Symbol("hidden")] = true;
    fixtures.push(symbol);
    const customPrototype = [1];
    Object.setPrototypeOf(customPrototype, { custom: true });
    fixtures.push(customPrototype);
    const frozenLength = [1];
    Object.defineProperty(frozenLength, "length", { writable: false });
    fixtures.push(frozenLength);
    for (const values of fixtures) {
      expect(
        requireCreateParser()({ context: { calculatorResults: { values } } }),
      ).toEqual({ ok: false });
    }
  });

  it.each([
    ["named key", "evil"],
    ["symbol key", Symbol("evil")],
  ])("rejects an array proxy that substitutes a %s for index zero", (_label, substitute) => {
    let getterCalls = 0;
    const target = new Array(1);
    const values = new Proxy(target, {
      ownKeys: () => [substitute, "length"],
      getOwnPropertyDescriptor(current, key) {
        if (key === "0") {
          return {
            value: "virtual zero",
            enumerable: true,
            configurable: true,
            writable: true,
          };
        }
        return Object.getOwnPropertyDescriptor(current, key);
      },
      get() {
        getterCalls += 1;
        throw new Error("array proxy get executed");
      },
    });
    expect(() => requireCreateParser()({
      context: { calculatorResults: { values } },
    })).not.toThrow();
    expect(requireCreateParser()({
      context: { calculatorResults: { values } },
    })).toEqual({ ok: false });
    expect(getterCalls).toBe(0);
  });

  it("clones a safe own __proto__ key without prototype pollution", () => {
    const nested: Record<string, unknown> = {};
    Object.defineProperty(nested, "__proto__", {
      value: { safe: true },
      enumerable: true,
      configurable: true,
      writable: true,
    });
    const parsed = requireCreateParser()({
      context: { calculatorResults: nested },
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected safe __proto__ data key");
    expect(Object.getPrototypeOf(parsed.value)).toBe(Object.prototype);
    const results = parsed.value.calculatorResults as Record<string, unknown>;
    expect(Object.getPrototypeOf(results)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(results, "__proto__")).toBe(true);
    expect(results.__proto__).toEqual({ safe: true });
    expect(({} as Record<string, unknown>).safe).toBeUndefined();
  });

  it("returns an isolated safe clone rather than caller-owned context", () => {
    const context = {
      calculatorResults: { nested: { values: [1, 2] } },
    };
    const parsed = requireCreateParser()({ context });
    expect(parsed).toEqual({ ok: true, value: context });
    if (!parsed.ok) throw new Error("expected valid context");
    expect(parsed.value).not.toBe(context);
    expect(parsed.value.calculatorResults).not.toBe(context.calculatorResults);
    expect(Object.getPrototypeOf(parsed.value)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(parsed.value.calculatorResults)).toBe(
      Object.prototype,
    );
    expect(Object.getPrototypeOf(
      (parsed.value.calculatorResults as any).nested.values,
    )).toBe(Array.prototype);
    context.calculatorResults.nested.values[0] = 99;
    context.calculatorResults.nested.values.push(3);
    expect(parsed.value).toEqual({
      calculatorResults: { nested: { values: [1, 2] } },
    });
    (parsed.value.calculatorResults as any).nested.values[1] = 88;
    expect(context.calculatorResults.nested.values).toEqual([99, 2, 3]);
  });

  it("never invokes object, array, or root proxy get accessors", () => {
    let getterCalls = 0;
    const objectGetter = {} as Record<string, unknown>;
    Object.defineProperty(objectGetter, "value", {
      enumerable: true,
      get: () => {
        getterCalls += 1;
        throw new Error("object getter executed");
      },
    });
    const arrayGetter: unknown[] = [null];
    Object.defineProperty(arrayGetter, "0", {
      enumerable: true,
      get: () => {
        getterCalls += 1;
        throw new Error("array getter executed");
      },
    });
    expect(
      requireCreateParser()({ context: { calculatorResults: objectGetter } }),
    ).toEqual({ ok: false });
    expect(
      requireCreateParser()({
        context: { calculatorResults: { values: arrayGetter } },
      }),
    ).toEqual({ ok: false });
    const proxiedContext = new Proxy(
      { page: "home", calculatorResults: { safe: true } },
      {
        get() {
          getterCalls += 1;
          throw new Error("proxy get executed");
        },
      },
    );
    expect(requireCreateParser()({ context: proxiedContext })).toEqual({
      ok: true,
      value: { page: "home", calculatorResults: { safe: true } },
    });
    const nestedTarget = { value: { safe: true } };
    const nestedProxy = new Proxy(nestedTarget, {
      get() {
        getterCalls += 1;
        throw new Error("nested proxy get executed");
      },
    });
    const nestedParsed = requireCreateParser()({
      context: { calculatorResults: { nested: nestedProxy } },
    });
    expect(nestedParsed).toEqual({
      ok: true,
      value: {
        calculatorResults: { nested: { value: { safe: true } } },
      },
    });
    if (!nestedParsed.ok) throw new Error("expected nested proxy clone");
    expect(
      (nestedParsed.value.calculatorResults as any).nested,
    ).not.toBe(nestedTarget);
    const proxiedArray = new Proxy([1, { safe: true }], {
      get() {
        getterCalls += 1;
        throw new Error("array proxy get executed");
      },
    });
    const arrayParsed = requireCreateParser()({
      context: { calculatorResults: { values: proxiedArray } },
    });
    expect(arrayParsed).toEqual({
      ok: true,
      value: { calculatorResults: { values: [1, { safe: true }] } },
    });
    if (!arrayParsed.ok) throw new Error("expected proxied array clone");
    expect(Object.is(
      (arrayParsed.value.calculatorResults as any).values,
      proxiedArray,
    )).toBe(false);
    const rootTarget = { context: { page: "home" } };
    const proxiedRoot = new Proxy(rootTarget, {
      get() {
        getterCalls += 1;
        throw new Error("outer proxy get executed");
      },
    });
    const rootParsed = requireCreateParser()(proxiedRoot);
    expect(rootParsed).toEqual({ ok: true, value: { page: "home" } });
    if (!rootParsed.ok) throw new Error("expected proxied outer clone");
    expect(rootParsed.value).not.toBe(rootTarget.context);
    expect(getterCalls).toBe(0);
  });

  it("fails closed without throwing when proxy reflection traps throw", () => {
    for (const trap of ["ownKeys", "getOwnPropertyDescriptor"] as const) {
      const context = new Proxy(
        { page: "home" },
        { [trap]: () => { throw new Error(`${trap} executed`); } },
      );
      expect(() => requireCreateParser()({ context })).not.toThrow();
      expect(requireCreateParser()({ context })).toEqual({ ok: false });
    }
    const prototypeTrap = new Proxy(
      { page: "home" },
      { getPrototypeOf: () => { throw new Error("prototype trap executed"); } },
    );
    expect(() => requireCreateParser()({ context: prototypeTrap })).not.toThrow();
    expect(requireCreateParser()({ context: prototypeTrap })).toEqual({ ok: false });
    const revoked = Proxy.revocable({ page: "home" }, {});
    revoked.revoke();
    expect(() => requireCreateParser()({ context: revoked.proxy })).not.toThrow();
    expect(requireCreateParser()({ context: revoked.proxy })).toEqual({ ok: false });
  });
});

describe("server/peggy web conversation adapter", () => {
  async function storedConversation(
    input: Parameters<typeof peggyModule.startWebConversation>[0],
  ) {
    peggyStorage.createPeggyConversation.mockResolvedValue({
      id: 501,
      sessionId: input.correlationId,
      userId: input.userId ?? null,
    });
    return peggyModule.startWebConversation(input);
  }

  it.each([
    ["verified deal", {
      userId: "verified-owner",
      correlationId: "11111111-1111-4111-8111-111111111111",
      context: { page: "wholesale-deal", dealType: "wholesale" as const, dealId: 17 },
    }, {
      userId: "verified-owner",
      sessionId: "11111111-1111-4111-8111-111111111111",
      title: "wholesale Deal #17",
      contextType: "deal",
      contextPage: "wholesale-deal",
      contextDealType: "wholesale",
      contextDealId: 17,
      contextCalculator: undefined,
    }],
    ["anonymous ordinary page", {
      correlationId: "22222222-2222-4222-8222-222222222222",
      context: { page: "home", surface: "public-peggy" },
    }, {
      userId: undefined,
      sessionId: "22222222-2222-4222-8222-222222222222",
      title: "New Conversation",
      contextType: "page",
      contextPage: "home",
      contextDealType: undefined,
      contextDealId: undefined,
      contextCalculator: undefined,
    }],
    ["calculator page", {
      userId: "calculator-owner",
      correlationId: "33333333-3333-4333-8333-333333333333",
      context: {
        page: "calculator-brrrr",
        calculatorType: "brrrr",
        calculatorInputs: { purchasePrice: 250_000 },
        calculatorResults: { cashLeftInDeal: 32_000 },
      },
    }, {
      userId: "calculator-owner",
      sessionId: "33333333-3333-4333-8333-333333333333",
      title: "brrrr Analysis",
      contextType: "calculator",
      contextPage: "calculator-brrrr",
      contextDealType: undefined,
      contextDealId: undefined,
      contextCalculator: "brrrr",
    }],
  ])("maps %s object input to exactly one fresh insert", async (_label, input, expected) => {
    const conversation = await storedConversation(input);
    expect(conversation).toMatchObject({ id: 501 });
    expect(peggyStorage.createPeggyConversation).toHaveBeenCalledOnce();
    expect(peggyStorage.createPeggyConversation).toHaveBeenCalledWith(expected);
    expect(peggyStorage.getPeggyConversations).not.toHaveBeenCalled();
  });

  it("rejects blank correlation without storage/fallback", async () => {
    await expect(
      peggyModule.startWebConversation({ correlationId: "", context: {} }),
    ).rejects.toThrow("Peggy web correlation is required");
    expect(peggyStorage.createPeggyConversation).not.toHaveBeenCalled();
    expect(peggyStorage.getPeggyConversations).not.toHaveBeenCalled();
  });

  it("exports no optional/fallback web entrypoint", () => {
    expect(peggyModule).not.toHaveProperty("startConversation");
    expect(peggyModule).not.toHaveProperty("getOrCreateConversation");
    expect(peggyModule.default).not.toHaveProperty("startConversation");
    expect(peggyModule.default).not.toHaveProperty("getOrCreateConversation");
  });
});
```

- [ ] **Step 4: Run the complete server RED and record causal failures.**

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/peggy-route-auth.test.ts
```

Expected: FAIL with the explicit focused-registrar assertion and missing `startWebConversation`; exact-byte assertions are internally 16,384/16,385/16,385. No database/provider request occurs. Record RED in the ignored ledger before implementation.

- [ ] **Step 5: Add non-vacuous static RED for registrar composition, auth order, object APIs, and owner-list preservation.**

In `server/__tests__/launch-security-route-contract.test.ts`, change the filesystem import and add sources/helpers directly after `routesSource`:

```ts
import { existsSync, readFileSync } from "node:fs";

const peggyIdentityPath = resolve(import.meta.dirname, "../peggy-route-auth.ts");
const peggyIdentitySource = existsSync(peggyIdentityPath)
  ? readFileSync(peggyIdentityPath, "utf8")
  : "";
const peggySource = readFileSync(
  resolve(import.meta.dirname, "../peggy.ts"),
  "utf8",
);

function sliceBetweenOnce(
  source: string,
  start: string,
  end: string,
  label: string,
): string {
  const startIndex = source.indexOf(start);
  expect(startIndex, `${label}: missing start anchor`).toBeGreaterThanOrEqual(0);
  expect(source.lastIndexOf(start), `${label}: duplicate start anchor`).toBe(startIndex);
  const endIndex = source.indexOf(end, startIndex + start.length);
  expect(endIndex, `${label}: missing end anchor`).toBeGreaterThan(startIndex);
  return source.slice(startIndex, endIndex);
}
```

In `rate-limits every public buyer and Peggy write route`, replace only the two inline Peggy create assertions with:

```ts
    expect(peggyIdentitySource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/conversations",\s*dependencies\.noStore,\s*dependencies\.publicCreateRateLimit,/s,
    );
    expect(peggyIdentitySource).toMatch(
      /app\.post\(\s*"\/api\/peggy\/conversations\/new",\s*dependencies\.noStore,\s*dependencies\.publicCreateRateLimit,/s,
    );
```

Append inside the existing describe:

```ts
  it("composes the focused Peggy identity registrar exactly once", () => {
    expect(peggyIdentitySource, "Task 4A must create focused registrar").not.toBe("");
    for (const path of [
      "/api/peggy/conversations",
      "/api/peggy/conversations/new",
      "/api/peggy/analyze-calculator",
    ]) {
      expect(peggyIdentitySource.split(`"${path}"`)).toHaveLength(2);
    }
    const calculatorRoute = sliceBetweenOnce(
      peggyIdentitySource,
      'app.post(\n    "/api/peggy/analyze-calculator",',
      "\n  );\n}",
      "calculator registration",
    );
    const ordered = [
      "dependencies.noStore",
      "dependencies.calculatorRateLimit",
      "dependencies.isHybridAuthenticated",
      "async (req, res)",
    ].map((anchor) => calculatorRoute.indexOf(anchor));
    expect(ordered.every((index) => index >= 0)).toBe(true);
    expect(ordered).toEqual([...ordered].sort((a, b) => a - b));
    expect(calculatorRoute.indexOf("dependencies.parseCalculatorRequest(req.body)")).toBeLessThan(
      calculatorRoute.indexOf("dependencies.getVerifiedPeggyUserId(req)"),
    );
    expect(calculatorRoute.indexOf("dependencies.getVerifiedPeggyUserId(req)")).toBeLessThan(
      calculatorRoute.indexOf("dependencies.randomUUID()"),
    );
  });

  it("wires real auth-normalized production dependencies and replaceable parser", () => {
    expect(routesSource).toMatch(/import \{ randomUUID \} from "node:crypto";/);
    expect(routesSource).toMatch(
      /import \{\s*registerPeggyIdentityRoutes,\s*type PeggyCalculatorRequest,\s*type PeggyParseResult,\s*\} from "\.\/peggy-route-auth";/s,
    );
    const wiring = sliceBetweenOnce(
      routesSource,
      "registerPeggyIdentityRoutes(app, {",
      "\n  });",
      "Peggy registrar composition",
    );
    for (const dependency of [
      "publicCreateRateLimit: publicIntakeRateLimit",
      "calculatorRateLimit: peggyCalculatorRateLimit",
      "isHybridAuthenticated",
      "getVerifiedPeggyUserId",
      "randomUUID",
      "getAccessSecret: getPeggyConversationAccessSecret",
      "createAccessToken: createPeggyConversationAccessToken",
      "startWebConversation: peggy.startWebConversation",
      "parseCalculatorRequest: parseTransitionalPeggyCalculatorRequest",
      "analyzeCalculator: peggy.analyzeCalculatorResults",
    ]) {
      expect(wiring).toContain(dependency);
    }
    expect(routesSource).toMatch(
      /function parseTransitionalPeggyCalculatorRequest\(\s*body: unknown,/s,
    );
    const verifiedResolver = sliceBetweenOnce(
      routesSource,
      "const getVerifiedPeggyUserId =",
      "\n\nconst hasMarketflowStaffAccess",
      "narrow Peggy verified-user resolver",
    );
    expect(verifiedResolver).toMatch(/req\.user\?\.claims\?\.sub/);
    expect(verifiedResolver).toMatch(/req\.supabaseUser\?\.id/);
    expect(verifiedResolver).toMatch(/for \(const candidate of \[/);
    expect(verifiedResolver).toMatch(
      /typeof candidate === "string" && candidate\.trim\(\)/,
    );
    expect(verifiedResolver).not.toMatch(
      /req\.(?:session|body|query|headers)|req\.get\(/,
    );
    const oidcSetup = routesSource.indexOf("await setupAuth(app)");
    const supabaseSetup = routesSource.indexOf("app.use(supabaseAuthMiddleware)");
    const registrarSetup = routesSource.indexOf("registerPeggyIdentityRoutes(app, {");
    expect(oidcSetup).toBeGreaterThanOrEqual(0);
    expect(supabaseSetup).toBeGreaterThan(oidcSetup);
    expect(registrarSetup).toBeGreaterThan(supabaseSetup);
    expect(routesSource.lastIndexOf("registerPeggyIdentityRoutes(app, {")).toBe(
      registrarSetup,
    );
    expect(routesSource).not.toMatch(
      /app\.post\(\s*"\/api\/peggy\/(?:conversations(?:\/new)?|analyze-calculator)"/s,
    );
  });

  it("keeps authenticated owner history anchored and unextracted", () => {
    const ownerList = sliceBetweenOnce(
      routesSource,
      'app.get("/api/peggy/conversations", isHybridAuthenticated,',
      "// Send a message to Peggy",
      "owner history route",
    );
    expect(ownerList).toMatch(/req\.user\?\.claims\?\.sub/);
    expect(ownerList).toMatch(/storage\.getPeggyConversations\(userId\)/);
    expect(ownerList).not.toMatch(/sessionId|req\.sessionID|getOrCreate/);
    expect(peggyIdentitySource).not.toContain('app.get("/api/peggy/conversations"');
  });

  it("uses required object arguments with no browser-session fallback", () => {
    const start = sliceBetweenOnce(
      peggySource,
      "export async function startWebConversation(",
      "// Quick analysis helper",
      "web conversation adapter",
    );
    const analyze = sliceBetweenOnce(
      peggySource,
      "export async function analyzeCalculatorResults(",
      "// Task #151",
      "calculator adapter",
    );
    expect(start).toMatch(/\{\s*userId,\s*correlationId,\s*context,?\s*\}/s);
    expect(start).toContain("sessionId: correlationId");
    expect(start).not.toMatch(/Date\.now|Math\.random|getPeggyConversations/);
    expect(analyze).toMatch(
      /\{\s*userId,\s*correlationId,\s*calculatorType,\s*inputs,\s*results,?\s*\}/s,
    );
    expect(analyze).toMatch(
      /startWebConversation\(\{\s*userId,\s*correlationId,\s*context\s*\}\)/s,
    );
    expect(peggySource).not.toMatch(
      /export async function (?:startConversation|getOrCreateConversation)/,
    );
  });
```

- [ ] **Step 6: Run static RED and preserve unrelated launch assertions.**

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/launch-security-route-contract.test.ts
```

Expected: FAIL only on absent focused registrar/required object API while unrelated route-security assertions stay green. Record causal RED.

- [ ] **Step 7: Implement the total bounded parser and focused identity registrar.**

Create `server/peggy-route-auth.ts` exactly as follows:

```ts
import type { Express, Request, RequestHandler } from "express";
import type { PeggyConversation } from "@shared/schema";
import type { PeggyContext } from "./peggy";

export type PeggyParseResult<T> =
  | { ok: true; value: T }
  | { ok: false };

export type PeggyCalculatorRequest = {
  calculatorType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
};

export type PeggyIdentityRouteDependencies = {
  noStore: RequestHandler;
  publicCreateRateLimit: RequestHandler;
  calculatorRateLimit: RequestHandler;
  isHybridAuthenticated: RequestHandler;
  getVerifiedPeggyUserId(req: Request): string | null;
  randomUUID(): string;
  getAccessSecret(): string | null;
  createAccessToken(conversation: PeggyConversation, secret: string): string;
  startWebConversation(input: {
    userId?: string;
    correlationId: string;
    context: PeggyContext;
  }): Promise<PeggyConversation>;
  parseCalculatorRequest(
    body: unknown,
  ): PeggyParseResult<PeggyCalculatorRequest>;
  analyzeCalculator(input: PeggyCalculatorRequest & {
    userId: string;
    correlationId: string;
  }): Promise<{ response: string; conversationId: number }>;
};

const ALLOWED_CONTEXT_KEYS = new Set([
  "page",
  "userRole",
  "dealId",
  "dealType",
  "calculatorType",
  "calculatorInputs",
  "calculatorResults",
  "labMode",
  "labAnalysis",
  "surface",
]);
const ALLOWED_DEAL_TYPES = new Set(["capital", "wholesale", "retail"]);
const ALLOWED_LAB_MODES = new Set(["explain", "stress", "prepare"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
}

type JsonCloneResult =
  | { ok: true; value: unknown }
  | { ok: false };

function plainDataEntries(value: unknown): Array<[string, unknown]> | null {
  if (!isPlainObject(value)) return null;
  const entries: Array<[string, unknown]> = [];
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") return null;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) return null;
    entries.push([key, descriptor.value]);
  }
  return entries;
}

function cloneJsonTree(
  value: unknown,
  containerDepth: number,
  state: { keys: number; ancestors: Set<object> },
): JsonCloneResult {
  if (value === null || typeof value === "boolean") {
    return { ok: true, value };
  }
  if (typeof value === "string") {
    return value.length <= 1_000
      ? { ok: true, value }
      : { ok: false };
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? { ok: true, value } : { ok: false };
  }
  if (typeof value !== "object") return { ok: false };
  if (containerDepth > 6 || state.ancestors.has(value)) return { ok: false };

  state.ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) return { ok: false };
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
      if (
        !lengthDescriptor ||
        !("value" in lengthDescriptor) ||
        lengthDescriptor.enumerable ||
        lengthDescriptor.configurable ||
        !lengthDescriptor.writable
      ) return { ok: false };
      const length = lengthDescriptor.value;
      const ownKeys = Reflect.ownKeys(value);
      if (
        !Number.isInteger(length) ||
        length < 0 ||
        length > 50 ||
        ownKeys.length !== length + 1
      ) {
        return { ok: false };
      }
      const expectedKeys = new Set([
        "length",
        ...Array.from({ length }, (_, index) => String(index)),
      ]);
      if (
        ownKeys.some(
          (key) => typeof key !== "string" || !expectedKeys.has(key),
        )
      ) return { ok: false };
      const cloned: unknown[] = new Array(length);
      for (let index = 0; index < length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor?.enumerable || !("value" in descriptor)) return { ok: false };
        const child = cloneJsonTree(descriptor.value, containerDepth + 1, state);
        if (!child.ok) return child;
        cloned[index] = child.value;
      }
      return { ok: true, value: cloned };
    }

    const entries = plainDataEntries(value);
    if (!entries) return { ok: false };
    state.keys += entries.length;
    if (state.keys > 256) return { ok: false };
    const cloned: Record<string, unknown> = {};
    for (const [key, childValue] of entries) {
      if (key.length > 64) return { ok: false };
      const child = cloneJsonTree(childValue, containerDepth + 1, state);
      if (!child.ok) return child;
      Object.defineProperty(cloned, key, {
        value: child.value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    return { ok: true, value: cloned };
  } finally {
    state.ancestors.delete(value);
  }
}

function optionalBoundedString(value: unknown, maxLength: number): boolean {
  return value === undefined ||
    (typeof value === "string" && value.length <= maxLength);
}

function optionalPlainObject(value: unknown): boolean {
  return value === undefined || isPlainObject(value);
}

export function parsePeggyCreateContext(
  body: unknown,
): PeggyParseResult<PeggyContext> {
  try {
    const root = body === undefined ? {} : body;
    const outerEntries = plainDataEntries(root);
    if (!outerEntries) return { ok: false };
    let contextInput: unknown = {};
    for (const [key, value] of outerEntries) {
      if (key === "context") {
        contextInput = value;
      } else if (key === "sessionId") {
        if (typeof value !== "string" || value.length > 255) {
          return { ok: false };
        }
      } else {
        return { ok: false };
      }
    }

    if (!isPlainObject(contextInput)) return { ok: false };
    const cloned = cloneJsonTree(contextInput, 0, {
      keys: 0,
      ancestors: new Set(),
    });
    if (!cloned.ok || !isPlainObject(cloned.value)) return { ok: false };
    const contextValue = cloned.value;
    if (Object.keys(contextValue).some((key) => !ALLOWED_CONTEXT_KEYS.has(key))) {
      return { ok: false };
    }
    if (
      !optionalBoundedString(contextValue.page, 255) ||
      !optionalBoundedString(contextValue.userRole, 64) ||
      !optionalBoundedString(contextValue.calculatorType, 50) ||
      !optionalBoundedString(contextValue.surface, 64) ||
      !optionalPlainObject(contextValue.calculatorInputs) ||
      !optionalPlainObject(contextValue.calculatorResults) ||
      !optionalPlainObject(contextValue.labAnalysis) ||
      (contextValue.dealType !== undefined &&
        (typeof contextValue.dealType !== "string" ||
          !ALLOWED_DEAL_TYPES.has(contextValue.dealType))) ||
      (contextValue.labMode !== undefined &&
        (typeof contextValue.labMode !== "string" ||
          !ALLOWED_LAB_MODES.has(contextValue.labMode))) ||
      (contextValue.dealId !== undefined &&
        (!Number.isSafeInteger(contextValue.dealId) ||
          (contextValue.dealId as number) <= 0 ||
          (contextValue.dealId as number) > 2_147_483_647))
    ) {
      return { ok: false };
    }

    const encoded = JSON.stringify(contextValue);
    if (Buffer.byteLength(encoded, "utf8") > 16 * 1024) return { ok: false };
    return { ok: true, value: contextValue as PeggyContext };
  } catch {
    return { ok: false };
  }
}

export function registerPeggyIdentityRoutes(
  app: Pick<Express, "post">,
  dependencies: PeggyIdentityRouteDependencies,
): void {
  const createConversation: RequestHandler = async (req, res) => {
    const parsed = parsePeggyCreateContext(req.body);
    if (!parsed.ok) {
      res.status(400).json({ message: "Invalid Peggy conversation context" });
      return;
    }
    try {
      const secret = dependencies.getAccessSecret()?.trim();
      if (!secret) {
        res.status(503).json({
          message: "Peggy conversation access is unavailable",
        });
        return;
      }
      const userId = dependencies.getVerifiedPeggyUserId(req) ?? undefined;
      const correlationId = dependencies.randomUUID();
      const conversation = await dependencies.startWebConversation({
        userId,
        correlationId,
        context: parsed.value,
      });
      const accessToken = dependencies.createAccessToken(conversation, secret);
      res.json({ id: conversation.id, accessToken });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  };

  app.post(
    "/api/peggy/conversations",
    dependencies.noStore,
    dependencies.publicCreateRateLimit,
    createConversation,
  );
  app.post(
    "/api/peggy/conversations/new",
    dependencies.noStore,
    dependencies.publicCreateRateLimit,
    createConversation,
  );
  app.post(
    "/api/peggy/analyze-calculator",
    dependencies.noStore,
    dependencies.calculatorRateLimit,
    dependencies.isHybridAuthenticated,
    async (req, res) => {
      try {
        const parsed = dependencies.parseCalculatorRequest(req.body);
        if (!parsed.ok) {
          res.status(400).json({
            message: "calculatorType, inputs, and results are required",
          });
          return;
        }
        const userId = dependencies.getVerifiedPeggyUserId(req);
        if (!userId) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const response = await dependencies.analyzeCalculator({
          userId,
          correlationId: dependencies.randomUUID(),
          ...parsed.value,
        });
        res.json(response);
      } catch {
        res.status(500).json({ message: "Internal server error" });
      }
    },
  );
}
```

The parser's outer `try/catch` makes reflection traps total. It never reads caller properties normally: root fields, object values, array length, and array indices come only from own enumerable data descriptors. It constructs new plain objects/dense arrays, runs semantics and `JSON.stringify` only on that safe clone, and returns the clone. Thus getters never execute, a proxy `get` trap is irrelevant, and post-parse mutation cannot alter the accepted value.

- [ ] **Step 8: Replace Peggy's optional web session API with required object inputs and fresh storage.**

In `server/peggy.ts`, replace `PeggyContext` and add the two input interfaces immediately after it:

```ts
export interface PeggyContext {
  page?: string;
  userRole?: string;
  dealId?: number;
  dealType?: 'capital' | 'wholesale' | 'retail';
  calculatorType?: string;
  calculatorInputs?: Record<string, unknown>;
  calculatorResults?: Record<string, unknown>;
  surface?: string;
  // Strategy Lab (Task #85)
  labMode?: 'explain' | 'stress' | 'prepare';
  labAnalysis?: {
    address?: string | null;
    topLane?: string | null;
    topLaneLabel?: string | null;
    topLaneVerdict?: string | null;
    confidenceScore?: number | null;
    memoParagraph?: string | null;
    memoNextStep?: string | null;
    laneSummary?: Array<{
      lane: string;
      label: string;
      verdict: string;
      headline: string;
    }>;
    primaryMetric?: { label: string; value: string } | null;
    risks?: Array<{ severity: string; title: string; detail?: string }>;
    inputs?: {
      askingPrice?: number;
      rehabBudget?: number;
      arvEstimate?: number;
      marketRent?: number;
      condition?: string;
      occupancyStatus?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface StartWebConversationInput {
  userId?: string;
  correlationId: string;
  context: PeggyContext;
}

export interface AuthenticatedCalculatorInput {
  userId: string;
  correlationId: string;
  calculatorType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
}
```

`surface` is prompt-only; do not add storage/schema fields. The Lab input index preserves deployed fields such as `holdingMonths`/`targetUse` without weakening known prompt fields.

Replace the complete block from `// Start a new conversation` through `analyzeCalculatorResults` with:

```ts
// Start a fresh web conversation with a server-supplied correlation.
export async function startWebConversation({
  userId,
  correlationId,
  context,
}: StartWebConversationInput): Promise<PeggyConversation> {
  if (!correlationId.trim()) {
    throw new Error("Peggy web correlation is required");
  }

  let title = 'New Conversation';
  if (context.page) {
    if (context.page.startsWith('calculator-')) {
      title = `${context.calculatorType || 'Calculator'} Analysis`;
    } else if (context.page === 'dealflow-deals') {
      title = 'Deal Discovery';
    } else if (context.dealType && context.dealId) {
      title = `${context.dealType} Deal #${context.dealId}`;
    }
  }

  return storage.createPeggyConversation({
    userId,
    sessionId: correlationId,
    title,
    contextType: context.calculatorType ? 'calculator' : context.dealType ? 'deal' : 'page',
    contextPage: context.page,
    contextDealType: context.dealType,
    contextDealId: context.dealId,
    contextCalculator: context.calculatorType
  });
}

// Quick analysis helper - for calculator "Ask Peggy" button
export async function analyzeCalculatorResults({
  userId,
  correlationId,
  calculatorType,
  inputs,
  results,
}: AuthenticatedCalculatorInput): Promise<{
  response: string;
  conversationId: number;
}> {
  const context: PeggyContext = {
    page: `calculator-${calculatorType}`,
    calculatorType,
    calculatorInputs: inputs,
    calculatorResults: results
  };

  const conversation = await startWebConversation({
    userId,
    correlationId,
    context
  });

  const analysisPrompt = `I just ran the ${calculatorType.toUpperCase()} calculator with these results. Please analyze this deal and give me your honest assessment. Is this a good opportunity? What should I be aware of?`;
  const result = await chat(analysisPrompt, conversation.id, context);

  return {
    response: result.response,
    conversationId: conversation.id
  };
}
```

Do not edit `analysisPrompt`; its wording is Task 4C. Replace the default export exactly:

```ts
export default {
  chat,
  startWebConversation,
  getSuggestions,
  analyzeCalculatorResults,
  detectRefusalTrigger,
  applyPostOutputGuard,
  extractIntake,
};
```

No alias may retain `startConversation` or `getOrCreateConversation`. Preserve phone functions and all other Peggy behavior.

- [ ] **Step 9: Compose the focused routes after both production auth normalizers.**

In `server/routes.ts`, add the Node import before the existing Express import and the registrar import beside the other focused route registrars:

```ts
import { randomUUID } from "node:crypto";
```

Add `type RequestHandler` to the existing Express import because the no-store middleware below is explicitly typed:

```ts
import express, { type Express, type Request, type RequestHandler, type Response, type NextFunction } from "express";
```

```ts
import {
  registerPeggyIdentityRoutes,
  type PeggyCalculatorRequest,
  type PeggyParseResult,
} from "./peggy-route-auth";
```

Immediately before `export async function registerRoutes`, add the deliberately transitional parser. It owns only the current required root/object shape; Task 4C replaces this injection with the shared strict parser.

```ts
function isTransitionalPeggyObject(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype,
  );
}

function parseTransitionalPeggyCalculatorRequest(
  body: unknown,
): PeggyParseResult<PeggyCalculatorRequest> {
  if (!isTransitionalPeggyObject(body)) return { ok: false };
  const { calculatorType, inputs, results } = body;
  if (
    typeof calculatorType !== "string" ||
    calculatorType.trim().length === 0 ||
    !isTransitionalPeggyObject(inputs) ||
    !isTransitionalPeggyObject(results)
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    value: { calculatorType, inputs, results },
  };
}
```

Immediately after the existing broader `getAuthUserId` declaration (which remains byte-for-byte for unrelated routes), add this focused resolver:

```ts
const getVerifiedPeggyUserId = (req: any): string | null => {
  for (const candidate of [
    req.user?.claims?.sub,
    req.supabaseUser?.id,
  ]) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
};
```

It consumes only identity already normalized by production auth middleware. It deliberately excludes `req.session?.user`, request body/query, and raw headers.

Within the Peggy section, preserve `requirePeggyConversationAccess` exactly. Delete `sendPeggyConversationWithAccess`, both inline create/new registrations, and their comments. In that exact location, before `// Get conversation history`, insert:

```ts
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
```

Delete only the later inline `// Analyze calculator results (Ask Peggy button)` registration through its closing `});`. Do not move or edit owner list, chat, suggestions, finish, feedback, admin, phone, or access-guard routes. The global `await setupAuth(app)` and `app.use(supabaseAuthMiddleware)` remain earlier than this registration, so anonymous create can consume an already-normalized optional verified principal while calculator adds its explicit hybrid gate.

Update the Step 5 wiring slice end to the stable unique anchor and make both anchors singular:

```ts
function sliceBetweenOnce(
  source: string,
  start: string,
  end: string,
  label: string,
): string {
  const startIndex = source.indexOf(start);
  expect(startIndex, `${label}: missing start anchor`).toBeGreaterThanOrEqual(0);
  expect(source.lastIndexOf(start), `${label}: duplicate start anchor`).toBe(startIndex);
  const endIndex = source.indexOf(end, startIndex + start.length);
  expect(endIndex, `${label}: missing end anchor`).toBeGreaterThan(startIndex);
  expect(source.lastIndexOf(end), `${label}: duplicate end anchor`).toBe(endIndex);
  return source.slice(startIndex, endIndex);
}
```

For the production wiring call, use this unique end:

```ts
    const wiring = sliceBetweenOnce(
      routesSource,
      "registerPeggyIdentityRoutes(app, {",
      "\n  // Get conversation history",
      "Peggy registrar composition",
    );
```

Also add exact singular import checks before extracting `wiring`:

```ts
    expect(
      routesSource.match(/import \{ randomUUID \} from "node:crypto";/g),
    ).toHaveLength(1);
    expect(
      routesSource.match(
        /import \{\s*registerPeggyIdentityRoutes,\s*type PeggyCalculatorRequest,\s*type PeggyParseResult,\s*\} from "\.\/peggy-route-auth";/gs,
      ),
    ).toHaveLength(1);
```

- [ ] **Step 10: Prove server GREEN, types, and unchanged neighboring seams.**

Run in order:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/peggy-route-auth.test.ts
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/launch-security-route-contract.test.ts
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check
git diff --check -- server/peggy-route-auth.ts server/peggy.ts server/routes.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts
git diff --exit-code HEAD -- server/peggy-access.ts shared/peggy-access.ts server/storage.ts shared/schema.ts server/peggy-phone.ts package.json package-lock.json
```

Expected: both focused suites pass; typecheck passes; no whitespace errors; access/storage/schema/phone/dependencies are byte-for-byte unchanged. Update the ignored ledger with RED and GREEN command/output summaries before client work.

- [ ] **Step 11: Create rendered client RED for storage cleanup, single-flight creation, dormant transport, and canonical page-memory life.**
Create `client/src/__tests__/peggy-client-session-boundary.test.tsx` with this complete file:

```tsx
import React, { StrictMode, useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const boundary = vi.hoisted(() => ({
  context: null as any,
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: true,
    isAdmin: false,
    isDreamscaper: false,
    isInvestor: true,
    isWholesaler: false,
    isBuyer: false,
  }),
}));

import {
  default as PeggyContext,
  PeggyProvider,
  usePeggyContext,
  type PeggyContextData,
} from "@/contexts/peggy-context";
import PeggyDock from "@/components/peggy-dock";
import PeggyChatBubble, { AskPeggyButton } from "@/components/peggy-chat";
import { Peggy } from "@/pegasus/peggy";
import { PEGGY_CONVERSATION_ACCESS_HEADER } from "@shared/peggy-access";

type Deferred<T> = {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function jsonResponse(value: unknown, status = 200): Response {
  const body = JSON.stringify(value);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Injected failure",
    json: async () => value,
    text: async () => body,
  } as Response;
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const memory = memoryLocation({ path: "/calculator/roi" });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Router hook={memory.hook}>{children}</Router>
    </QueryClientProvider>
  );
  return { ...render(ui, { wrapper: Wrapper }), queryClient };
}

function fakeContext(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, any> {
  const result: Record<string, any> = {
    context: { page: "home", userRole: "member" },
    isOpen: false,
    pendingPrompt: null,
    openChat: vi.fn(),
    closeChat: vi.fn(),
    toggleChat: vi.fn(),
    updateContext: vi.fn(),
    setCalculatorData: vi.fn(),
    setDealContext: vi.fn(),
    setPendingPrompt: vi.fn(),
    consumePendingPrompt: vi.fn(() => {
      const prompt = boundary.context.pendingPrompt;
      boundary.context = { ...boundary.context, pendingPrompt: null };
      return prompt;
    }),
    clearContext: vi.fn(),
    ...overrides,
  };
  boundary.context = result;
  return result;
}

function fakePeggyTree(ui: React.ReactElement) {
  return (
    <PeggyContext.Provider value={boundary.context}>
      {ui}
    </PeggyContext.Provider>
  );
}

let fetchMock: ReturnType<typeof vi.fn>;

function callsFor(url: string) {
  return fetchMock.mock.calls.filter(([input]) => String(input) === url);
}

function capturedRequest(url: string, index = 0) {
  const call = callsFor(url)[index];
  if (!call) throw new Error(`Missing captured request ${url} #${index}`);
  const init = (call[1] ?? {}) as RequestInit;
  return {
    method: init.method,
    credentials: init.credentials,
    headers: new Headers(init.headers),
    body: init.body === undefined ? undefined : JSON.parse(String(init.body)),
  };
}

function storedKeys(): Array<string | null> {
  return Array.from(
    { length: window.localStorage.length },
    (_, index) => window.localStorage.key(index),
  );
}

let consoleError: ReturnType<typeof vi.spyOn>;
let unhandled: unknown[];
let onUnhandled: (event: PromiseRejectionEvent) => void;

beforeEach(() => {
  boundary.context = null;
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined;
  }
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  unhandled = [];
  onUnhandled = (event) => {
    unhandled.push(event.reason);
    event.preventDefault();
  };
  window.addEventListener("unhandledrejection", onUnhandled);
});

afterEach(async () => {
  await Promise.resolve();
  expect(unhandled).toEqual([]);
  expect(consoleError).not.toHaveBeenCalled();
  window.removeEventListener("unhandledrejection", onUnhandled);
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PeggyProvider legacy identity cleanup", () => {
  function Probe() {
    const value = usePeggyContext() as unknown as Record<string, unknown>;
    return <output data-testid="context-keys">{Object.keys(value).sort().join(",")}</output>;
  }

  it("purges only the obsolete key once per real StrictMode mount", async () => {
    localStorage.setItem("peggy_session_id", "captured-browser-id");
    localStorage.setItem("pegasus.lab.sessionId", "keep-lab-session");
    localStorage.setItem("pegasus.strategy-lab.v3", "keep-lab-draft");
    localStorage.setItem("pg:saved:chats", "[]");
    localStorage.setItem("peggy_dock_position", "{\"x\":1,\"y\":2}");
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const removeItem = vi.spyOn(Storage.prototype, "removeItem");

    const view = renderWithClient(
      <StrictMode>
        <PeggyProvider><Probe /></PeggyProvider>
      </StrictMode>,
    );
    view.rerender(
      <StrictMode>
        <PeggyProvider><Probe /></PeggyProvider>
      </StrictMode>,
    );

    await waitFor(() =>
      expect(removeItem).toHaveBeenCalledWith("peggy_session_id"),
    );
    expect(
      removeItem.mock.calls.filter(([key]) => key === "peggy_session_id"),
    ).toHaveLength(1);
    expect(storedKeys()).not.toContain("peggy_session_id");
    expect(storedKeys()).toEqual(expect.arrayContaining([
      "pegasus.lab.sessionId",
      "pegasus.strategy-lab.v3",
      "pg:saved:chats",
      "peggy_dock_position",
    ]));
    expect(
      getItem.mock.calls.filter(([key]) => key === "peggy_session_id"),
    ).toHaveLength(0);
    expect(
      setItem.mock.calls.filter(([key]) => key === "peggy_session_id"),
    ).toHaveLength(0);
    expect(screen.getByTestId("context-keys").textContent).not.toMatch(/sessionId/);
  });

  it("still renders when browser storage removal throws", async () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    renderWithClient(<PeggyProvider><Probe /></PeggyProvider>);
    expect(await screen.findByTestId("context-keys")).toBeVisible();
  });
});

function PeggyController() {
  const {
    context,
    isOpen,
    pendingPrompt,
    openChat,
    closeChat,
    updateContext,
    setCalculatorData,
    setPendingPrompt,
  } = usePeggyContext();

  return (
    <div>
      <button
        type="button"
        data-testid="controller-stage-latest-and-open"
        onClick={() => {
          setCalculatorData(
            "roi",
            { purchasePrice: 300_000 },
            { roi: 12.5 },
          );
          updateContext({ surface: "latest-calculator-snapshot" });
          setPendingPrompt("Analyze this pending result");
          openChat();
        }}
      >
        Stage latest and open
      </button>
      <button type="button" data-testid="controller-open" onClick={openChat}>
        Open
      </button>
      <button type="button" data-testid="controller-close" onClick={closeChat}>
        Close
      </button>
      <output data-testid="controller-state">
        {JSON.stringify({ context, isOpen, pendingPrompt })}
      </output>
    </div>
  );
}

function readControllerState(): {
  context: PeggyContextData;
  isOpen: boolean;
  pendingPrompt: string | null;
} {
  return JSON.parse(screen.getByTestId("controller-state").textContent || "{}");
}

function realProviderDock() {
  return (
    <PeggyProvider>
      <PeggyController />
      <PeggyDock />
    </PeggyProvider>
  );
}

describe("PeggyDock real-provider single-flight integration", () => {
  beforeEach(() => {
    boundary.context = null;
  });

  it("coalesces real latest-context, prompt, open, and close/reopen transitions", async () => {
    const create = deferred<Response>();
    fetchMock.mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") return create.promise;
        if (url === "/api/peggy/chat") {
          return Promise.resolve(jsonResponse({
            messageId: 71,
            response: "Pending prompt reply",
          }));
        }
        throw new Error(`Unexpected URL ${url}`);
      },
    );
    const view = renderWithClient(realProviderDock());
    await waitFor(() => expect(readControllerState()).toEqual({
      context: { page: "calculator-roi", userRole: "investor" },
      isOpen: false,
      pendingPrompt: null,
    }));

    act(() => {
      fireEvent.click(screen.getByTestId("controller-stage-latest-and-open"));
    });
    const latestContext = {
      page: "calculator-roi",
      userRole: "investor",
      calculatorType: "roi",
      calculatorInputs: { purchasePrice: 300_000 },
      calculatorResults: { roi: 12.5 },
      surface: "latest-calculator-snapshot",
    };
    await waitFor(() => expect(readControllerState()).toEqual({
      context: latestContext,
      isOpen: true,
      pendingPrompt: "Analyze this pending result",
    }));
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(1),
    );
    const createRequest = capturedRequest("/api/peggy/conversations");
    expect(createRequest.method).toBe("POST");
    expect(createRequest.credentials).toBe("include");
    expect(createRequest.headers.get("content-type")).toBe("application/json");
    expect(createRequest.headers.get("authorization")).toBeNull();
    expect(createRequest.body).toEqual({ context: latestContext });
    expect(callsFor("/api/peggy/chat")).toHaveLength(0);

    fireEvent.click(screen.getByTestId("controller-close"));
    await waitFor(() => expect(readControllerState()).toEqual({
      context: latestContext,
      isOpen: false,
      pendingPrompt: "Analyze this pending result",
    }));
    fireEvent.click(screen.getByTestId("controller-open"));
    await waitFor(() => expect(readControllerState()).toEqual({
      context: latestContext,
      isOpen: true,
      pendingPrompt: "Analyze this pending result",
    }));
    expect(callsFor("/api/peggy/conversations")).toHaveLength(1);

    await act(async () => {
      create.resolve(jsonResponse({ id: 71, accessToken: "v1.pending-token" }));
      await create.promise;
    });
    await waitFor(() => expect(callsFor("/api/peggy/chat")).toHaveLength(1));
    const promptRequest = capturedRequest("/api/peggy/chat");
    expect(promptRequest.method).toBe("POST");
    expect(promptRequest.credentials).toBe("include");
    expect(promptRequest.headers.get("content-type")).toBe("application/json");
    expect(promptRequest.headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe(
      "v1.pending-token",
    );
    expect(promptRequest.headers.get("authorization")).toBeNull();
    expect(promptRequest.body).toEqual({
        conversationId: 71,
        message: "Analyze this pending result",
        context: latestContext,
    });
    await waitFor(() => expect(readControllerState()).toEqual({
      context: latestContext,
      isOpen: true,
      pendingPrompt: null,
    }));
    view.rerender(realProviderDock());
    await act(async () => {
      await Promise.resolve();
    });
    expect(callsFor("/api/peggy/conversations")).toHaveLength(1);
    expect(callsFor("/api/peggy/chat")).toHaveLength(1);
  });

  it("resets the real provider boundary after rejection so close/open retries once", async () => {
    const first = deferred<Response>();
    const retry = deferred<Response>();
    let createCount = 0;
    fetchMock.mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/conversations") {
          createCount += 1;
          return createCount === 1 ? first.promise : retry.promise;
        }
        throw new Error(`Unexpected URL ${url}`);
      },
    );
    renderWithClient(realProviderDock());
    await waitFor(() => expect(readControllerState()).toEqual({
      context: { page: "calculator-roi", userRole: "investor" },
      isOpen: false,
      pendingPrompt: null,
    }));
    fireEvent.click(screen.getByTestId("controller-open"));
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(1),
    );

    await act(async () => {
      first.resolve(jsonResponse(
        { message: "injected create rejection" },
        500,
      ));
      await first.promise;
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(callsFor("/api/peggy/conversations")).toHaveLength(1);
    expect(readControllerState().isOpen).toBe(true);
    fireEvent.click(screen.getByTestId("controller-close"));
    await waitFor(() => expect(readControllerState().isOpen).toBe(false));
    fireEvent.click(screen.getByTestId("controller-open"));
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(2),
    );
    for (const index of [0, 1]) {
      const request = capturedRequest("/api/peggy/conversations", index);
      expect(request.method).toBe("POST");
      expect(request.credentials).toBe("include");
      expect(request.body).toEqual({
        context: { page: "calculator-roi", userRole: "investor" },
      });
    }
    await act(async () => {
      retry.resolve(jsonResponse({ id: 81, accessToken: "v1.retry-token" }));
      await retry.promise;
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(callsFor("/api/peggy/conversations")).toHaveLength(2);
  });
});

describe("PeggyDock focused control boundary", () => {
  it("serializes double New, blocks same-stack old-token chat, then scopes chat to token two", async () => {
    const replacement = deferred<Response>();
    const chat = deferred<Response>();
    let createCount = 0;
    fetchMock.mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") {
          createCount += 1;
          return createCount === 1
            ? Promise.resolve(jsonResponse({ id: 91, accessToken: "v1.token-one" }))
            : replacement.promise;
        }
        if (url === "/api/peggy/chat") return chat.promise;
        throw new Error(`Unexpected URL ${url}`);
      },
    );
    fakeContext({
      isOpen: true,
      context: { page: "home", surface: "legacy-dock" },
    });
    renderWithClient(fakePeggyTree(<PeggyDock />));
    await waitFor(() => expect(callsFor("/api/peggy/conversations")).toHaveLength(1));
    fireEvent.click(screen.getByTestId("button-peggy-dock"));
    const input = await screen.findByTestId("input-peggy-message");
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "must not use token one" } });
    const newButton = screen.getByTestId("button-peggy-new");
    expect(newButton).toBeEnabled();
    const form = input.closest("form");
    expect(form).not.toBeNull();
    act(() => {
      fireEvent.click(newButton);
      fireEvent.click(newButton);
      fireEvent.submit(form!);
    });
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(2),
    );
    const replacementRequest = capturedRequest("/api/peggy/conversations", 1);
    expect(replacementRequest.method).toBe("POST");
    expect(replacementRequest.credentials).toBe("include");
    expect(replacementRequest.body).toEqual({
      context: { page: "home", surface: "legacy-dock" },
    });
    expect(callsFor("/api/peggy/chat")).toHaveLength(0);
    expect(screen.getByTestId("button-peggy-new")).toBeDisabled();
    expect(screen.getByTestId("input-peggy-message")).toBeDisabled();

    await act(async () => {
      replacement.resolve(jsonResponse({ id: 92, accessToken: "v1.token-two" }));
      await replacement.promise;
    });
    await waitFor(() => expect(screen.getByTestId("input-peggy-message")).toBeEnabled());
    fireEvent.change(screen.getByTestId("input-peggy-message"), {
      target: { value: "use the replacement only" },
    });
    fireEvent.click(screen.getByTestId("button-peggy-send"));
    await waitFor(() => expect(callsFor("/api/peggy/chat")).toHaveLength(1));
    const chatRequest = capturedRequest("/api/peggy/chat");
    expect(chatRequest.method).toBe("POST");
    expect(chatRequest.credentials).toBe("include");
    expect(chatRequest.headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe(
      "v1.token-two",
    );
    expect(chatRequest.body).toEqual({
        conversationId: 92,
        message: "use the replacement only",
        context: { page: "home", surface: "legacy-dock" },
    });
    expect(screen.getByTestId("button-peggy-new")).toBeDisabled();
    await act(async () => {
      chat.resolve(jsonResponse({ messageId: 93, response: "Replacement reply" }));
      await chat.promise;
    });
    await waitFor(() => expect(screen.getByTestId("button-peggy-new")).toBeEnabled());
  });
});
describe("compiled dormant Peggy transport", () => {
  it("retries rejected create and serializes dormant double New", async () => {
    const replacement = deferred<Response>();
    const chat = deferred<Response>();
    let createCount = 0;
    fetchMock.mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/peggy/suggestions") {
          return Promise.resolve(jsonResponse({ suggestions: [] }));
        }
        if (url === "/api/peggy/conversations") {
          createCount += 1;
          if (createCount === 1) {
            return Promise.reject(new Error("dormant create rejection"));
          }
          if (createCount === 2) {
            return Promise.resolve(jsonResponse({ id: 101, accessToken: "v1.dormant-one" }));
          }
          return replacement.promise;
        }
        if (url === "/api/peggy/chat") return chat.promise;
        throw new Error(`Unexpected URL ${url}`);
      },
    );
    fakeContext({
      isOpen: true,
      context: { page: "home", surface: "dormant-bubble" },
    });
    const view = renderWithClient(fakePeggyTree(<PeggyChatBubble />));
    await waitFor(() => expect(callsFor("/api/peggy/conversations")).toHaveLength(1));
    boundary.context = { ...boundary.context, isOpen: false };
    view.rerender(fakePeggyTree(<PeggyChatBubble />));
    boundary.context = { ...boundary.context, isOpen: true };
    view.rerender(fakePeggyTree(<PeggyChatBubble />));
    await waitFor(() => expect(callsFor("/api/peggy/conversations")).toHaveLength(2));
    await waitFor(() => expect(screen.getByTestId("input-peggy-message")).toBeEnabled());

    const input = screen.getByTestId("input-peggy-message");
    fireEvent.change(input, { target: { value: "block the old token" } });
    const form = input.closest("form");
    expect(screen.getByTestId("button-peggy-new")).toBeEnabled();
    act(() => {
      fireEvent.click(screen.getByTestId("button-peggy-new"));
      fireEvent.click(screen.getByTestId("button-peggy-new"));
      fireEvent.submit(form!);
    });
    await waitFor(() =>
      expect(callsFor("/api/peggy/conversations")).toHaveLength(3),
    );
    const replacementRequest = capturedRequest("/api/peggy/conversations", 2);
    expect(replacementRequest.method).toBe("POST");
    expect(replacementRequest.credentials).toBe("include");
    expect(replacementRequest.body).toEqual({
      context: { page: "home", surface: "dormant-bubble" },
    });
    expect(callsFor("/api/peggy/chat")).toHaveLength(0);
    expect(screen.getByTestId("button-peggy-new")).toBeDisabled();

    await act(async () => {
      replacement.resolve(jsonResponse({ id: 102, accessToken: "v1.dormant-two" }));
      await replacement.promise;
    });
    await waitFor(() => expect(screen.getByTestId("input-peggy-message")).toBeEnabled());
    fireEvent.change(screen.getByTestId("input-peggy-message"), {
      target: { value: "dormant replacement" },
    });
    fireEvent.click(screen.getByTestId("button-peggy-send"));
    await waitFor(() => expect(callsFor("/api/peggy/chat")).toHaveLength(1));
    const chatRequest = capturedRequest("/api/peggy/chat");
    expect(chatRequest.method).toBe("POST");
    expect(chatRequest.credentials).toBe("include");
    expect(chatRequest.headers.get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe(
      "v1.dormant-two",
    );
    expect(chatRequest.body).toEqual({
        conversationId: 102,
        message: "dormant replacement",
        context: { page: "home", surface: "dormant-bubble" },
    });
    expect(screen.getByTestId("button-peggy-new")).toBeDisabled();
    await act(async () => {
      chat.resolve(jsonResponse({ messageId: 103, response: "Dormant reply" }));
      await chat.promise;
    });
    await waitFor(() => expect(screen.getByTestId("button-peggy-new")).toBeEnabled());
  });

  it("posts calculator data without browser identity", async () => {
    const setCalculatorData = vi.fn();
    fakeContext({ setCalculatorData });
    fetchMock.mockResolvedValue(jsonResponse({
      response: "Calculator reply",
      conversationId: 111,
    }));
    renderWithClient(fakePeggyTree(
      <AskPeggyButton
        calculatorType="roi"
        inputs={{ purchasePrice: 300_000 }}
        results={{ roi: 12.5 }}
      />,
    ));
    fireEvent.click(screen.getByTestId("button-ask-peggy"));
    await screen.findByText("Calculator reply");
    expect(setCalculatorData).toHaveBeenCalledWith(
      "roi",
      { purchasePrice: 300_000 },
      { roi: 12.5 },
    );
    expect(callsFor("/api/peggy/analyze-calculator")).toHaveLength(1);
    const calculatorRequest = capturedRequest("/api/peggy/analyze-calculator");
    expect(calculatorRequest.method).toBe("POST");
    expect(calculatorRequest.credentials).toBe("include");
    expect(calculatorRequest.headers.get("content-type")).toBe("application/json");
    expect(calculatorRequest.body).toEqual({
      calculatorType: "roi",
      inputs: { purchasePrice: 300_000 },
      results: { roi: 12.5 },
    });
  });
});

function CanonicalHarness() {
  const [open, setOpen] = useState(true);
  return (
    <Peggy
      open={open}
      setOpen={setOpen}
      toStrategyLab={() => undefined}
      onHandoffToReview={() => undefined}
      go={() => undefined}
      toSubmit={() => undefined}
    />
  );
}

async function sendCanonical(message: string, expectedReply: string) {
  const input = screen.getByLabelText("Talk to Peggy");
  fireEvent.change(input, { target: { value: message } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText(expectedReply);
}

describe("canonical PublicApp Peggy page-memory contract", () => {
  it("continues only while mounted, saves transcript-only, refreshes after remount, and aborts", async () => {
    localStorage.setItem("peggy_session_id", "captured-stale-key");
    let createCount = 0;
    let chatCount = 0;
    let deferChat = false;
    const hangingChat = deferred<Response>();
    const chatSignals: AbortSignal[] = [];
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/peggy/conversations") {
        createCount += 1;
        return Promise.resolve(jsonResponse({
          id: createCount * 100,
          accessToken: `v1.canonical-${createCount}`,
        }));
      }
      if (url === "/api/peggy/chat") {
        chatCount += 1;
        if (init?.signal) chatSignals.push(init.signal);
        if (deferChat) return hangingChat.promise;
        return Promise.resolve(jsonResponse({
          response: `Canonical reply ${chatCount}`,
        }));
      }
      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const firstMount = renderWithClient(<CanonicalHarness />);
    await sendCanonical("first mounted turn", "Canonical reply 1");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", {
      name: /Talk to Peggy, the Pegasus intake concierge/,
    }));
    await sendCanonical("same mounted page", "Canonical reply 2");
    expect(fetchMock.mock.calls.filter(([url]) =>
      String(url) === "/api/peggy/conversations")).toHaveLength(1);

    const createInit = fetchMock.mock.calls.find(([url]) =>
      String(url) === "/api/peggy/conversations")?.[1] as RequestInit;
    expect(createInit.method).toBe("POST");
    expect(JSON.parse(String(createInit.body))).toEqual({
      context: { surface: "public-peggy" },
    });
    const chatInits = fetchMock.mock.calls
      .filter(([url]) => String(url) === "/api/peggy/chat")
      .map((call) => call[1] as RequestInit);
    expect(JSON.parse(String(chatInits[0].body))).toEqual({
      conversationId: 100,
      message: "first mounted turn",
      context: { surface: "public-peggy" },
    });
    expect(new Headers(chatInits[0].headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("v1.canonical-1");

    fireEvent.click(screen.getByRole("button", {
      name: "Save this conversation",
    }));
    const saved = localStorage.getItem("pg:saved:chats");
    expect(saved).toMatch(/first mounted turn|same mounted page/);
    expect(saved).not.toMatch(/accessToken|conversationId|v1\.canonical/);
    expect(localStorage.getItem("peggy_session_id")).toBe("captured-stale-key");

    firstMount.unmount();
    const secondMount = renderWithClient(<CanonicalHarness />);
    await sendCanonical("fresh after remount", "Canonical reply 3");
    expect(fetchMock.mock.calls.filter(([url]) =>
      String(url) === "/api/peggy/conversations")).toHaveLength(2);
    const lastChat = fetchMock.mock.calls
      .filter(([url]) => String(url) === "/api/peggy/chat")
      .at(-1)?.[1] as RequestInit;
    expect(JSON.parse(String(lastChat.body))).toEqual({
      conversationId: 200,
      message: "fresh after remount",
      context: { surface: "public-peggy" },
    });
    expect(new Headers(lastChat.headers).get(
      PEGGY_CONVERSATION_ACCESS_HEADER,
    )).toBe("v1.canonical-2");

    deferChat = true;
    const input = screen.getByLabelText("Talk to Peggy");
    fireEvent.change(input, { target: { value: "abort this turn" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(chatSignals).toHaveLength(4));
    expect(chatSignals.at(-1)?.aborted).toBe(false);
    secondMount.unmount();
    expect(chatSignals.at(-1)?.aborted).toBe(true);
  });
});
```

- [ ] **Step 12: Run the new client RED and record the causal failures.**

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/peggy-client-session-boundary.test.tsx
```

Expected: FAIL because provider still exposes/generates `sessionId`, Dock/Chat send it, creation lacks synchronous serialization/disabled guards, and Ask Peggy sends it. The real canonical lifecycle assertions already pass and pin its intentional unchanged anonymous scoped flow. No React warning or unhandled rejection is tolerated.

- [ ] **Step 13: Remove browser pseudo-identity and add a selective once-per-mount purge.**

In `client/src/contexts/peggy-context.tsx`, add `useRef` to the React import and add the server-supported prompt field to `PeggyContextData`:

```ts
  surface?: string;
```

Delete `sessionId: string` from `PeggyContextValue`. Delete the entire `generateSessionId` function and the provider's `const [sessionId] = useState(generateSessionId);`. Immediately after the provider's `pendingPrompt` state, add:

```ts
  const legacyPeggySessionPurgedRef = useRef(false);

  useEffect(() => {
    if (legacyPeggySessionPurgedRef.current) return;
    legacyPeggySessionPurgedRef.current = true;
    try {
      window.localStorage.removeItem("peggy_session_id");
    } catch {
      // Storage may be disabled; Peggy no longer depends on this key.
    }
  }, []);
```

Delete `sessionId,` from the provided `value`. Do not read or write the old key anywhere, and do not touch Strategy Lab, saved-chat, dock, theme, consent, or session-storage keys. The ref is set before storage access, so StrictMode's effect replay and throwing storage still perform at most one attempted purge per real mount.

- [ ] **Step 14: Make live Dock creation synchronous-single-flight and context-only.**

In `client/src/components/peggy-dock.tsx`, add beside the other refs:

```ts
  const createConversationInFlightRef = useRef(false);
```

Remove `sessionId` from the `usePeggyContext()` destructure. Replace the complete `createConversationMutation` with:

```ts
  const createConversationMutation = useMutation({
    mutationFn: async (newContext: PeggyContextData) => {
      const response = await apiRequest(
        'POST',
        '/api/peggy/conversations',
        { context: newContext },
      );
      return response.json() as Promise<PeggyConversationAccessResponse>;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      setConversationAccessToken(data.accessToken);
    },
    onSettled: () => {
      createConversationInFlightRef.current = false;
    },
  });
```

Immediately after `chatMutation`, add the single entrypoint used by automatic and manual creation:

```ts
  const startFreshConversation = useCallback(
    (newContext: PeggyContextData) => {
      if (createConversationInFlightRef.current) return;
      createConversationInFlightRef.current = true;
      setConversationId(null);
      setConversationAccessToken(null);
      createConversationMutation.mutate(newContext);
    },
    [createConversationMutation.mutate],
  );
```

Replace the open/prompt expansion effect with:

```ts
  useEffect(() => {
    if (isOpen && !conversationId) {
      startFreshConversation(context);
    }
    if (isOpen && pendingPrompt && !isExpanded) {
      setIsExpanded(true);
    }
  }, [
    isOpen,
    pendingPrompt,
    conversationId,
    context,
    isExpanded,
    startFreshConversation,
  ]);
```

Replace the pending-prompt effect with:

```ts
  useEffect(() => {
    if (
      !conversationId ||
      !conversationAccessToken ||
      !pendingPrompt ||
      createConversationInFlightRef.current ||
      createConversationMutation.isPending ||
      chatMutation.isPending
    ) return;
    const prompt = consumePendingPrompt();
    if (!prompt) return;
    setShowQuickPrompts(false);
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: prompt,
    }]);
    chatMutation.mutate(prompt);
  }, [
    conversationId,
    conversationAccessToken,
    pendingPrompt,
    createConversationMutation.isPending,
    chatMutation.isPending,
    consumePendingPrompt,
  ]);
```

Replace the first line of `handleSend` with this full structural gate:

```ts
    if (
      !inputValue.trim() ||
      !conversationId ||
      !conversationAccessToken ||
      createConversationInFlightRef.current ||
      createConversationMutation.isPending ||
      chatMutation.isPending
    ) return;
```

Replace `handleNewConversation` with:

```ts
  const handleNewConversation = () => {
    if (
      createConversationInFlightRef.current ||
      createConversationMutation.isPending ||
      chatMutation.isPending
    ) return;
    setMessages([]);
    setShowQuickPrompts(true);
    startFreshConversation(context);
  };
```

On `button-peggy-new`, add:

```tsx
                    disabled={
                      createConversationInFlightRef.current ||
                      createConversationMutation.isPending ||
                      chatMutation.isPending
                    }
```

Replace the input and send disabled expressions, respectively, with:

```tsx
                    disabled={
                      createConversationInFlightRef.current ||
                      createConversationMutation.isPending ||
                      chatMutation.isPending ||
                      !conversationId ||
                      !conversationAccessToken
                    }
```

```tsx
                    disabled={
                      !inputValue.trim() ||
                      createConversationInFlightRef.current ||
                      createConversationMutation.isPending ||
                      chatMutation.isPending ||
                      !conversationId ||
                      !conversationAccessToken
                    }
```

The ref, not render state, closes synchronous double-click and same-stack send races. `onSettled` permits an explicit later close/open retry after rejection. Do not add persistent IDs, generations, abort controllers, or automatic retry.

- [ ] **Step 15: Apply the same fresh boundary to compiled dormant Chat and remove calculator browser identity.**

In `client/src/components/peggy-chat.tsx`, add `useCallback` to the React import, then add beside the other refs:

```ts
import { useState, useRef, useEffect, useCallback } from "react";
```

The existing `queryClient` named import is already unused; remove only that name while touching this import so TypeScript remains clean:

```ts
import { apiRequest } from "@/lib/queryClient";
```

```ts
  const createConversationInFlightRef = useRef(false);
```

Remove `sessionId` from both context destructures. Replace `createConversationMutation` with:

```ts
  const createConversationMutation = useMutation({
    mutationFn: async (newContext: PeggyContextData) => {
      const response = await apiRequest(
        'POST',
        '/api/peggy/conversations',
        { context: newContext },
      );
      return response.json() as Promise<PeggyConversationAccessResponse>;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      setConversationAccessToken(data.accessToken);
    },
    onSettled: () => {
      createConversationInFlightRef.current = false;
    },
  });
```

Immediately after `chatMutation`, add:

```ts
  const startFreshConversation = useCallback(
    (newContext: PeggyContextData) => {
      if (createConversationInFlightRef.current) return;
      createConversationInFlightRef.current = true;
      setConversationId(null);
      setConversationAccessToken(null);
      createConversationMutation.mutate(newContext);
    },
    [createConversationMutation.mutate],
  );
```

Replace the open effect with:

```ts
  useEffect(() => {
    if (isOpen && !conversationId) {
      startFreshConversation(context);
    }
  }, [isOpen, conversationId, context, startFreshConversation]);
```

Replace the first line of `handleSend` with:

```ts
    if (
      !inputValue.trim() ||
      !conversationId ||
      !conversationAccessToken ||
      createConversationInFlightRef.current ||
      createConversationMutation.isPending ||
      chatMutation.isPending
    ) return;
```

Replace `handleNewConversation` with:

```ts
  const handleNewConversation = () => {
    if (
      createConversationInFlightRef.current ||
      createConversationMutation.isPending ||
      chatMutation.isPending
    ) return;
    setMessages([]);
    startFreshConversation(context);
  };
```

On `button-peggy-new`, add:

```tsx
                    disabled={
                      createConversationInFlightRef.current ||
                      createConversationMutation.isPending ||
                      chatMutation.isPending
                    }
```

Replace the input and send disabled expressions, respectively, with:

```tsx
                    disabled={
                      createConversationInFlightRef.current ||
                      createConversationMutation.isPending ||
                      chatMutation.isPending ||
                      !conversationId ||
                      !conversationAccessToken
                    }
```

```tsx
                    disabled={
                      !inputValue.trim() ||
                      createConversationInFlightRef.current ||
                      createConversationMutation.isPending ||
                      chatMutation.isPending ||
                      !conversationId ||
                      !conversationAccessToken
                    }
```

This component is compiled even when the dock is the current live surface, so do not leave a parallel unsafe transport.

In `AskPeggyButton`, destructure only `setCalculatorData` and replace the analysis body with exactly:

```ts
      const response = await apiRequest('POST', '/api/peggy/analyze-calculator', {
        calculatorType,
        inputs,
        results
      });
```

Do not change the canonical `client/src/pegasus/peggy.tsx`: its component refs already keep ID/capability only for the mounted page, retain the access header, and abort the active request on unmount.

- [ ] **Step 16: Prove client GREEN and scan the identity slices.**

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/peggy-client-session-boundary.test.tsx
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check
git diff --check -- client/src/contexts/peggy-context.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --input-type=module <<'NODE'
import { readFileSync } from "node:fs";

const provider = readFileSync("client/src/contexts/peggy-context.tsx", "utf8");
const dock = readFileSync("client/src/components/peggy-dock.tsx", "utf8");
const chat = readFileSync("client/src/components/peggy-chat.tsx", "utf8");
const remove = 'window.localStorage.removeItem("peggy_session_id")';
if (provider.split(remove).length !== 2) throw new Error("expected one legacy purge");
for (const [name, source] of [["provider", provider], ["dock", dock], ["chat", chat]]) {
  const withoutCleanupKey = source.replaceAll('"peggy_session_id"', '""');
  if (/getItem\(["']peggy_session_id|setItem\(["']peggy_session_id/.test(source)) {
    throw new Error(`${name} reads/writes legacy key`);
  }
  if (/generateSessionId|session_[`'\"]|\bsessionId\b/.test(withoutCleanupKey)) {
    throw new Error(`${name} retains browser-session identity`);
  }
}
if (!dock.includes("{ context: newContext }") || !chat.includes("{ context: newContext }")) {
  throw new Error("create bodies must contain context only");
}
console.log("Peggy client identity-source boundary OK");
NODE
! rg -n "Date\.now\(\).*Math\.random|Math\.random\(\).*Date\.now" client/src/contexts/peggy-context.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx
git diff --exit-code HEAD -- client/src/pegasus/peggy.tsx
```

Expected: focused suite and typecheck pass with zero React warnings/unhandled rejections; no legacy Peggy identity token/generator remains in these three slices; optimistic message timestamps are allowed and are not identity; canonical Peggy is byte-for-byte unchanged.

- [ ] **Step 17: Correct public privacy truth and prove both relevant sections.**

In `client/src/pages/privacy.tsx`, replace only the Peggy paragraph in `what-we-collect` with:

```tsx
              <p>
                When you chat with Peggy, we collect the conversation content you send and associate it with a server-created conversation record.
              </p>
```

Replace only the Peggy paragraph in `cookies` with:

```tsx
              <p>
                Peggy's active server conversation ID and access credential stay only in page memory, not in local browser storage. Closing and reopening Peggy on the same loaded page may continue that conversation. Reloading or closing the page ends that browser view. If you explicitly choose Save chat, Pegasus writes a separate transcript copy to local browser storage so you can revisit that saved copy.
              </p>
```

Do not change Strategy Lab, analytics, sign-in, phone, rights, security, retention, or provider copy. This describes browser access only; it makes no server/provider deletion claim.

In `client/src/__tests__/peggy-public-truth.test.tsx`, add `within` to the Testing Library import. In the first test, remove the three old Peggy identifier/continuation expectations and add this scoped rendering and assertions after `disclosuresText` is computed:

```tsx
    const memory = memoryLocation({ path: "/privacy" });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Router hook={memory.hook}><Privacy /></Router>
      </QueryClientProvider>,
    );
    const whatWeCollect = within(container)
      .getByTestId("section-privacy-what-we-collect")
      .textContent || "";
    const cookies = within(container)
      .getByTestId("section-privacy-cookies")
      .textContent || "";

    expect(whatWeCollect).toMatch(
      /associate it with a server-created conversation record/i,
    );
    expect(whatWeCollect).not.toMatch(
      /first-party conversation identifier.*connected to this browser/i,
    );
    expect(cookies).toMatch(
      /active server conversation ID and access credential stay only in page memory, not in local browser storage/i,
    );
    expect(cookies).toMatch(
      /closing and reopening Peggy on the same loaded page may continue/i,
    );
    expect(cookies).toMatch(
      /reloading or closing the page ends that browser view/i,
    );
    expect(cookies).toMatch(
      /explicitly choose Save chat.*separate transcript copy to local browser storage/i,
    );
    expect(cookies).not.toMatch(
      /Peggy keeps a random first-party conversation identifier in local browser storage/i,
    );
```

Retain the existing Strategy Lab, provider, phone, casing, and fingerprinting assertions. Run:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/peggy-public-truth.test.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx client/src/__tests__/peggy-handoff.test.tsx
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check
git diff --check -- client/src/pages/privacy.tsx client/src/__tests__/peggy-public-truth.test.tsx
```

Expected: all pass. The canonical handoff suite confirms Task 4A did not regress its unchanged component while the new lifecycle test proves the stronger page-memory behavior.

- [ ] **Step 18: Run focused/full quality gates, build/bundle, and mutation-oriented self-review.**

Run each command separately under pinned Node 22:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/__tests__/peggy-client-session-boundary.test.tsx client/src/__tests__/peggy-public-truth.test.tsx client/src/__tests__/peggy-handoff.test.tsx
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/peggy-access.test.ts server/__tests__/peggy-refusals.test.ts client/src/__tests__/peggy-cta-routing.test.tsx client/src/__tests__/peggy-quick-prompts.test.ts client/src/__tests__/query-client-auth.test.ts
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm test
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run build
```

Expected: focused and full Vitest exit 0 with no skipped/failed file, unhandled rejection, React warning, or unexpected network call; typecheck exits 0; production build and included bundle budget pass. Do not stage `dist/`. If and only if the managed sandbox rejects the `tsx` CLI before repository code at a numbered `/tmp/tsx-*` IPC pipe with `EPERM`, record that exact environment error and run the same entrypoint plus bundle gate without the listener:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --import tsx script/build.ts
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check:bundle
```

Do not alter scripts/dependencies for the sandbox. Then inspect every hunk and run hygiene:

```bash
git diff --check
git diff --stat
git status --short --untracked-files=all
git diff -- server/peggy-route-auth.ts server/peggy.ts server/routes.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/contexts/peggy-context.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx client/src/pages/privacy.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx client/src/__tests__/peggy-public-truth.test.tsx
! rg -n "TODO|FIXME|TBD|PLACEHOLDER" server/peggy-route-auth.ts server/__tests__/peggy-route-auth.test.ts client/src/__tests__/peggy-client-session-boundary.test.tsx
```

Confirm these mutation survivors are killed, not merely covered by source matching:

1. Any use of outer/body/context identity, `req.sessionID`, old web fallback, or prefixed/date/random correlation fails a live identity/order assertion.
2. Reordering parse/secret/UUID/storage/token/auth/limiters or delegating exceptions to the leaky global handler fails exact call-ledger/status/body/no-store assertions.
3. Changing 16,384/depth 6/keys 256/key 64/array 50/string 1,000 or any semantic max/type fails direct exact-boundary cases, including 50-year projection and UTF-8 overage.
4. Reading a caller property, returning caller-owned context, permitting a getter/null prototype/reflection failure, accepting a substituted/symbol array own key, or traversing an array index normally fails exact-key/zero-get/mutation-isolation tests at outer, context, nested-object, and array depths.
5. Dropping verified identity, passing calculator poison/raw body, or moving parser into the registrar fails live OIDC/Supabase/analyzer and static replacement-seam assertions.
6. Removing the synchronous client ref, its `onSettled`, token clear, pending/send guard, or disabled state—or breaking real provider context/prompt/open/close/consume propagation or real request-helper serialization—fails the real-provider/fetch pending/reopen/rejection regressions plus supplemental double-New/old-token regressions on live and dormant components.
7. Persisting canonical ID/token, reusing it after remount, omitting scoped access, saving credentials, or failing to abort fails the real canonical lifecycle test.
8. Restoring the old privacy claim or weakening the explicit page-memory/local-storage distinction fails section-scoped truth assertions.

Do not weaken assertions, add sleeps, increase timeouts, or classify a failure as unrelated without reproducing it at the implementation base. Record exact command/file/test counts and any environment-only build ruling in the ignored ledger.

- [ ] **Step 19: Prove exact eleven-path scope, protected boundaries, and the complete unstaged manifest.**

First inspect full status because `git diff --name-only` omits the three new untracked paths:

```bash
git status --short --untracked-files=all
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --input-type=module <<'NODE'
import { execFileSync } from "node:child_process";

const expected = [
  "client/src/__tests__/peggy-client-session-boundary.test.tsx",
  "client/src/__tests__/peggy-public-truth.test.tsx",
  "client/src/components/peggy-chat.tsx",
  "client/src/components/peggy-dock.tsx",
  "client/src/contexts/peggy-context.tsx",
  "client/src/pages/privacy.tsx",
  "server/__tests__/launch-security-route-contract.test.ts",
  "server/__tests__/peggy-route-auth.test.ts",
  "server/peggy-route-auth.ts",
  "server/peggy.ts",
  "server/routes.ts",
].sort();
const status = execFileSync(
  "git",
  ["status", "--porcelain=v1", "--untracked-files=all"],
  { encoding: "utf8" },
);
const actual = status
  .split("\n")
  .filter(Boolean)
  .map((line) => line.slice(3))
  .filter((path) => !path.startsWith(".recovery/"))
  .sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  console.error({ expected, actual });
  process.exit(1);
}
console.log(`Task 4A scope OK: ${actual.length} paths`);
NODE
```

Then prove protected and later-task surfaces unchanged:

```bash
git diff --exit-code HEAD -- client/src/pegasus/peggy.tsx client/src/__tests__/peggy-handoff.test.tsx server/peggy-access.ts shared/peggy-access.ts server/storage.ts shared/schema.ts server/peggy-phone.ts package.json package-lock.json
git diff --exit-code HEAD -- docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md docs/qa/security-launch-recovery-ledger.md
git diff --check -- server/peggy-route-auth.ts server/peggy.ts server/routes.ts server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/contexts/peggy-context.tsx client/src/components/peggy-dock.tsx client/src/components/peggy-chat.tsx client/src/pages/privacy.tsx client/src/__tests__/peggy-client-session-boundary.test.tsx client/src/__tests__/peggy-public-truth.test.tsx
```

Expected: the Node assertion reports exactly 11 implementation paths after excluding untracked recovery evidence; every protected diff exits 0; no whitespace error. Do not claim `git diff --name-only` alone proved new-file scope.

- [ ] **Step 20: Create the one primary commit, then run controller-only specification, quality, and exact-range security reviews.**

Stage exactly the authorized manifest:

```bash
git add -- client/src/__tests__/peggy-client-session-boundary.test.tsx client/src/__tests__/peggy-public-truth.test.tsx client/src/components/peggy-chat.tsx client/src/components/peggy-dock.tsx client/src/contexts/peggy-context.tsx client/src/pages/privacy.tsx server/__tests__/launch-security-route-contract.test.ts server/__tests__/peggy-route-auth.test.ts server/peggy-route-auth.ts server/peggy.ts server/routes.ts
git diff --cached --name-only | LC_ALL=C sort
git diff --cached --check
test "$(git diff --cached --name-only | wc -l | tr -d ' ')" = "11"
git diff --cached | rg -n -i "access[_-]?token=|authorization: bearer [a-z0-9._-]{20,}|api[_-]?key=|password=|secret=" && exit 1 || true
```

The cached manifest must be exactly:

```text
client/src/__tests__/peggy-client-session-boundary.test.tsx
client/src/__tests__/peggy-public-truth.test.tsx
client/src/components/peggy-chat.tsx
client/src/components/peggy-dock.tsx
client/src/contexts/peggy-context.tsx
client/src/pages/privacy.tsx
server/__tests__/launch-security-route-contract.test.ts
server/__tests__/peggy-route-auth.test.ts
server/peggy-route-auth.ts
server/peggy.ts
server/routes.ts
```

Inspect the cached diff, commit, and verify its parent/base and paths:

```bash
git diff --cached --stat
git diff --cached
git commit -m "fix: bind Peggy creation to server identity"
test "$(git rev-parse HEAD^)" = "$(cat .superpowers/sdd/2026-08-13-pegasus-peggy-server-identity/implementation-base.sha)"
git show --stat --oneline HEAD
git show --format= --name-only HEAD | sed '/^$/d' | LC_ALL=C sort
test "$(git show --format= --name-only HEAD | sed '/^$/d' | wc -l | tr -d ' ')" = "11"
git status --short --untracked-files=no
```

Expected: primary commit has the exact required subject and 11 paths; its parent is the reviewed docs checkpoint; tracked worktree is clean. Never amend or squash it.

**Controller-only review checkpoint — the implementer does not self-approve.** The controller now dispatches three fresh read-only reviewers in this order, recording full reports under the ignored SDD workspace and making no tracked edits:

1. **Specification review:** compare `$(cat implementation-base.sha)..HEAD` with this complete plan, Program Task 4A, global constraints, adjacent 4B/4C/5, and all recon/audit reports. Inspect every changed line and run focused commands as needed. Report Blocker/Major/Minor with file/evidence; explicitly verify all frozen contracts and exact 11-path scope.
2. **Code-quality review:** after specification has zero unresolved Blocker/Major, freshly inspect the same full range for correctness, totality, race behavior, TypeScript/React/Express quality, non-vacuous tests, and maintainability. Report Critical/Important/Minor with evidence; do not rely on the specification report.
3. **Security diff review:** after specification and quality are clear, invoke `codex-security:security-diff-scan` on the fresh exact range `$(cat implementation-base.sha)..HEAD`. Treat F02/F03/F11 identity/cost boundaries as security-sensitive. Validate and triage every candidate against live/static tests and production composition; acceptance requires no confirmed unresolved finding at any severity.

**Additive review-fix protocol:**

- Any specification Blocker/Major, quality Critical/Important, or confirmed security finding returns to the same implementer with exact evidence. Every Minor is explicitly accepted or returned by the controller; silence is not adjudication.
- The implementer writes/strengthens a failing focused test first where behavior changes, applies the smallest in-scope fix, repeats Steps 18–19, stages only the exact 11-path manifest, and creates an additive commit. Use, as applicable, `fix: address Peggy identity specification review`, `fix: address Peggy identity quality review`, or `fix: address Peggy identity security review`. Never amend the primary commit.
- After any fix, discard stale approvals: run a fresh specification review of the complete range, then a fresh quality review, then a fresh `security-diff-scan`. Reviewers make no tracked edits. Continue until required severities are zero, every Minor/candidate is adjudicated, and full gates pass.
- Record reviewer identity, range/head SHA, findings, controller adjudication, fix SHA, and rerun evidence in ignored `progress.md` plus separate ignored review reports. Do not stage orchestration evidence.

- [ ] **Step 21: Run the final controller acceptance checkpoint and hand back exact evidence.**

Only after fresh reviews approve the final head, rerun final acceptance from a clean tracked tree:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/peggy-route-auth.test.ts server/__tests__/launch-security-route-contract.test.ts client/src/__tests__/peggy-client-session-boundary.test.tsx client/src/__tests__/peggy-public-truth.test.tsx client/src/__tests__/peggy-handoff.test.tsx
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/peggy-access.test.ts server/__tests__/peggy-refusals.test.ts client/src/__tests__/peggy-cta-routing.test.tsx client/src/__tests__/peggy-quick-prompts.test.ts client/src/__tests__/query-client-auth.test.ts
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm test
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run build
git diff --check
git status --short --untracked-files=no
```

The same exact IPC-only fallback from Step 18 is permitted; otherwise any failure blocks acceptance. Verify final history/range:

```bash
task4a_base="$(cat .superpowers/sdd/2026-08-13-pegasus-peggy-server-identity/implementation-base.sha)"
git log --oneline --decorate "${task4a_base}..HEAD"
test "$(git log --format=%s "${task4a_base}..HEAD" | grep -Fxc "fix: bind Peggy creation to server identity")" = "1"
git diff --name-only "${task4a_base}..HEAD" | LC_ALL=C sort
test "$(git diff --name-only "${task4a_base}..HEAD" | wc -l | tr -d ' ')" = "11"
git diff --exit-code "${task4a_base}" HEAD -- client/src/pegasus/peggy.tsx server/peggy-access.ts shared/peggy-access.ts server/storage.ts shared/schema.ts server/peggy-phone.ts package.json package-lock.json
git status --short --untracked-files=all
```

Expected: one primary commit plus only additive reviewed fixes; complete range remains the exact 11 paths; protected surfaces unchanged; tracked tree clean; full status shows only intentional untracked recovery evidence (ignored SDD evidence may be shown only with `--ignored`). Report final head/range, all focused/full/type/build/bundle counts, build wrapper/fallback ruling, review report verdicts, and exact path manifest to the controller. The controller, not the child implementer, updates global acceptance bookkeeping and decides whether Task 4B may start. Do not push or deploy.
