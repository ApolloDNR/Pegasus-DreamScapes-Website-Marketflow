# Pegasus Wholesale Offer Terms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require every reachable wholesale offer path to show, validate, acknowledge where applicable, and submit one authoritative total assignment price together with an editable required closing date.

**Architecture:** Keep the existing Offer Studio and shared deal-action provider as the only UI owners. Each path derives one canonical six-field financial-terms object, validates the exact displayed total against the server's numeric bounds, blocks and focuses a missing date before mutation, and wraps the terms in an exact request allowlist. The existing strict server parser remains authoritative for real calendar/range validation; Task 3 adds characterization coverage without changing it, while Task 9 retains outer-route strictness, status, expiry, transaction, notification, and alias cleanup.

**Tech Stack:** React 18, TypeScript 5.6, TanStack Query, Wouter, Radix Dialog, Vitest, Testing Library, Zod 3, Node 22.23.2.

## Global Constraints

- Work only on successor branch `codex/launch-recovery-v2`. The accepted local/remote predecessor is exactly `7636b2841262c16b9a650100b9616d7048fc4c79` (`docs: record Task 2 and capital boundary acceptance`); do not rewrite or amend it.
- Before dispatch, an independent plan reviewer must compare this complete draft with accepted HEAD, Program Task 3, both Task 3 reconnaissance reports, and every named source/test path, then report zero blocker and zero major findings.
- After plan review, the controller promotes this draft byte-for-byte to `docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md` and creates exactly one docs-only checkpoint, `docs: add wholesale offer terms plan`. Implementation dispatch starts only from that committed checkpoint.
- Execute with `superpowers:subagent-driven-development`: one fresh implementer for this one parent-task boundary, then fresh specification and code-quality reviews. Record orchestration evidence in `.superpowers/sdd/2026-08-13-pegasus-wholesale-offer-terms/progress.md`; that ignored ledger must not enter a tracked commit.
- Use Node `22.23.2`. Every Node/npm/npx command below includes the absolute runtime prefix because separate tool calls may start fresh shells.
- Public brand casing is exactly **Pegasus Dreamscapes**.
- MarketFlow is private beta and reviewed access only; authentication alone is never approval.
- Do not mutate production, `main`, Render, the live database, DNS, payment systems, or submit any live/staging request. Do not push, force-update, deploy, or write to an external service during implementation or review.
- Add no dependency, migration, shared contract file, route module, or schema change. Use `apply_patch` for every tracked source/test edit.
- Authorized production/test scope is exactly: modify `client/src/pages/marketflow/offer-studio.tsx`; modify only Wholesale Accept/Counter code in `client/src/contexts/deal-action-context.tsx`; modify `client/src/__tests__/marketflow-offer-studio.test.tsx`; create `client/src/__tests__/wholesale-offer-terms.test.tsx`; modify `server/__tests__/marketflow-offer-payload.test.ts`. No additional path is justified for Task 3.
- Offer Studio's authoritative submitted amount is its visible, editable `composer.offerPrice`. Only the WHOLESALE lane relabels that control to exact text `Total assignment price`; CAPITAL and LISTING retain `Offer Price`.
- Wholesale Accept's authoritative total is exactly `Number(deal.contractPrice) + Number(deal.assignmentFee)`. Wholesale Counter's authoritative total is exactly `Number(deal.contractPrice) + Number(counterAssignmentFee)`. Reject missing, blank, nonnumeric, nonfinite, or negative authoritative components before summing; then require the sum to be a safe integer from `1_000` through `10_000_000_000`, inclusive.
- Compute each modal total once per render. Display that same value as `Total assignment price`; Accept acknowledges that same value; the explicit six-field body sends that same value unchanged as `payload.offerPrice`. `deal.askingPrice` never overrides a submitted value. Offer Studio may retain its visible asking-price seed because the edited composer value remains the sole send-time authority.
- All three client paths expose a visible editable required `type="date"` control. A missing/sanitized-empty date renders exact text `Closing date is required.` in a `role="alert"`, sets `aria-invalid` and `aria-describedby`, focuses the date control, and performs zero POSTs. Keep the missing-date submit control actionable so the handler can explain and focus the error; Accept may still require acknowledgement first.
- Normalize Accept and Counter's fetched `deal.closingDate` exactly once, lexically, from a date-only string or ISO timestamp to its `YYYY-MM-DD` prefix. Never round-trip through `Date`, and never overwrite a user's edit on a query rerender.
- The browser validates date-input syntax; the strict server parser remains authoritative for real-calendar and UTC range rules. Server tests lock blank/whitespace rejection and the inclusive current-UTC-day through five-UTC-years rule. These parser tests are already GREEN characterization; the required Task RED must come from genuine client behavior.
- Keep raw user numeric strings until validation. Do not use `parseInt`, `parseFloat`, or `||` fallbacks in the changed offer submission paths: they truncate fractions, rewrite legitimate zeroes, and coerce missing input into plausible terms. If earnest money or inspection values are parsed while building the canonical body, require server-aligned safe integers (`earnestMoney` from `0` through the total and through `10_000_000_000`; `inspectionPeriod` from `0` through `365`).
- Successful create bodies equal exactly `{ lane, dealId, offerKind, payload: { offerPrice, earnestMoney, closeDate, inspectionPeriod, fundingType, notes } }`. Successful Offer Studio counters equal exactly `{ action: "counter", counterPayload: { offerPrice, earnestMoney, closeDate, inspectionPeriod, fundingType, notes } }` at `/api/marketflow/offers/:offerId/respond`.
- The allowlists omit outer `expiresAt`; recipient, owner, poster, counterparty, and other participant IDs; counts; status; `parentOfferId`; `type`; `isCounter`; `assignmentFee`; `askingPrice`; `emdAmount`; `closingDate`; `message`; and every other UI/money alias. Required routing `dealId` and the `offerId` in the response URL are not participant IDs and remain required.
- Keep Wholesale Counter on the current create endpoint. Task 9 owns counter endpoint semantics, persisted `sent` support, outer `expiresAt`/unknown-key enforcement, seven-day expiry, transaction/notification/count work, and `transformOffer`/money/authority alias removal. Do not pull those concerns into Task 3.
- Preserve approved copy, styling, routing, auth gates, toast behavior, and all non-wholesale sections of `deal-action-context.tsx` except the minimum accessible labels/errors and exact `Total assignment price` copy required here.
- Create one primary implementation commit named `fix: require complete wholesale offer terms`. The same implementer must fix every Blocker/Major specification finding and every Critical/Important code-quality finding in a new focused review-fix commit within the same five-path scope, rerun the covering focused gate plus affected full gates, and return it for scoped re-review. Never amend or squash the primary/fix commits. Reviewers and the controller must explicitly adjudicate and track every Minor finding; deferral requires a written scope/risk disposition rather than silence. The docs-only plan checkpoint and later controller acceptance checkpoint are separate commits and are not implementation commits.
- Never stage `.recovery/`, `.superpowers/`, generated `dist/`, the committed child plan, parent program/ledger bookkeeping, Task 9 paths, or unrelated user changes.

---

## Controller-only pre-dispatch plan checkpoint

After the independent plan reviewer reports no blocker or major finding, the controller performs this boundary before assigning implementation:

```bash
cmp -s .recovery/task3-wholesale-offer-terms-draft.md docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md
sha256sum .recovery/task3-wholesale-offer-terms-draft.md docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md
git diff --check -- docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md
git add -- docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md
git diff --cached --name-only
test "$(git diff --cached --name-only | wc -l | tr -d ' ')" = "1"
git commit -m "docs: add wholesale offer terms plan"
test "$(git rev-parse HEAD^)" = "7636b2841262c16b9a650100b9616d7048fc4c79"
git show --format= --name-only HEAD | sed '/^$/d'
```

Expected: both SHA-256 values match; the cached and committed manifest contains only `docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md`; the plan commit has accepted checkpoint `7636b2841262c16b9a650100b9616d7048fc4c79` as its parent. Never stage `.recovery/`. The implementation worker starts only after this checkpoint and never amends it.

## File Map

- Modify `client/src/__tests__/marketflow-offer-studio.test.tsx`: prove missing-date/invalid-total blocking, exact wholesale create and respond envelopes, lane-specific total labeling, and one authoritative composer amount.
- Create `client/src/__tests__/wholesale-offer-terms.test.tsx`: exercise real reachable Accept/Counter dialogs through `DealActionProvider`, including ISO initialization, error focus, component/total validity, display/acknowledgement, and exact requests.
- Modify `server/__tests__/marketflow-offer-payload.test.ts`: characterize existing blank/whitespace rejection and inclusive UTC date bounds.
- Modify `client/src/pages/marketflow/offer-studio.tsx`: retain raw numeric input, validate the wholesale total/date, and construct one typed explicit six-field terms object for create or respond.
- Modify only `WholesaleAcceptTermsModal`, `WholesaleCounterOfferModal`, their local types, and their local helper functions in `client/src/contexts/deal-action-context.tsx`: normalize dates once, derive/validate components and totals, display/acknowledge the total, and submit typed allowlists.
- Verify unchanged `server/marketflow-offer-payload.ts`: its strict parser already enforces the authoritative numeric/date/field contract.

### Task 3: Require complete wholesale offer terms

**Files:**
- Modify: `client/src/pages/marketflow/offer-studio.tsx`
- Modify: `client/src/contexts/deal-action-context.tsx` (Wholesale Accept/Counter regions and their immediately adjacent local types/helpers only)
- Modify: `client/src/__tests__/marketflow-offer-studio.test.tsx`
- Create: `client/src/__tests__/wholesale-offer-terms.test.tsx`
- Modify: `server/__tests__/marketflow-offer-payload.test.ts`
- Verify unchanged: `server/marketflow-offer-payload.ts`

**Interfaces:**
- Consumes: accepted Task 2/Capital checkpoint `7636b2841262c16b9a650100b9616d7048fc4c79`; current `DealActionProvider`; current create and respond HTTP endpoints; current strict `parseMarketflowOfferPayload`; the existing Offer Studio query/fetch harness; the proven real-provider modal harness from `listing-inquiry-contract.test.tsx`.
- Produces locally in Offer Studio: `FundingType`, `MarketflowFinancialTerms`, `parseBoundedWholeNumber`, `isFundingType`, raw-string composer numeric state, `composerOfferPriceError`, `composerCloseDateError`, and `closeDateInputRef`.
- Produces locally in the deal-action context: `WholesaleOfferTerms`, `toDateInputValue`, `readNonNegativeComponent`, `calculateTotalAssignmentPrice`, and `parseBoundedWholeNumber`; no new export or cross-layer file.
- Canonical inner type: `{ offerPrice: number; earnestMoney: number; closeDate: string; inspectionPeriod: number; fundingType: "cash" | "cash_reserves" | "hard_money" | "conventional" | "private_lender" | "self_directed_ira" | "other"; notes: string }`. The modal-local subtype fixes `fundingType` to `"cash"`.
- Numeric boundary: each authoritative component is present, finite, and nonnegative; the total is a safe integer in `[1_000, 10_000_000_000]`. Earnest money is a safe integer in `[0, total]`; inspection period is a safe integer in `[0, 365]`.
- Date boundary: the client prevents an empty/syntax-sanitized date from reaching mutation; the server accepts real `YYYY-MM-DD` from injected UTC `now` through exactly five UTC years later, inclusive, and rejects blank, whitespace, impossible, past, and later values.
- Request boundary: the three create paths use the exact outer four-key object; Offer Studio's pending-incoming counter uses the exact two-key respond object. Required `dealId` and response-URL `offerId` remain; all participant IDs, ownership fields, expiry, counts, status, and aliases remain absent.

- [x] **Step 1: Confirm the independently reviewed plan checkpoint, accepted base, runtime, and ignored workspace.**

Run:

```bash
git status --short --untracked-files=no
git status --short
git branch --show-current
git log -4 --oneline
test "$(git rev-parse HEAD^)" = "7636b2841262c16b9a650100b9616d7048fc4c79"
git ls-files --error-unmatch docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md
git diff --exit-code HEAD -- docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --version
```

Expected: clean tracked worktree; full status may show only `?? .recovery/`; branch `codex/launch-recovery-v2`; HEAD is the independently reviewed docs-only child-plan checkpoint whose parent is exactly `7636b2841262c16b9a650100b9616d7048fc4c79`; the tracked plan is unchanged; Node prints `v22.23.2`. Stop on any mismatch rather than mixing another task or user change into Task 3.

- [x] **Step 2: Initialize the plan-scoped SDD ledger and record the exact implementation base.**

From the `superpowers:subagent-driven-development` skill directory, resolve this plan's workspace and task brief:

```bash
/root/.codex/plugins/cache/openai-curated-remote/superpowers/6.2.0/skills/subagent-driven-development/scripts/sdd-workspace docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md
/root/.codex/plugins/cache/openai-curated-remote/superpowers/6.2.0/skills/subagent-driven-development/scripts/task-brief docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md 3
git rev-parse HEAD > .superpowers/sdd/2026-08-13-pegasus-wholesale-offer-terms/implementation-base.sha
sed -n '1p' .superpowers/sdd/2026-08-13-pegasus-wholesale-offer-terms/implementation-base.sha
```

Expected: the workspace is `.superpowers/sdd/2026-08-13-pegasus-wholesale-offer-terms/`. Its `progress.md` first line is exactly `# SDD ledger — plan: docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md`; `implementation-base.sha` contains the full docs-only plan-checkpoint SHA. Record that same value in the ledger. The base file, brief/report/review-package files, and ledger remain ignored and never enter staging.

- [x] **Step 3: Extend the existing Offer Studio test harness for exact create/respond recording.**

In `client/src/__tests__/marketflow-offer-studio.test.tsx`, add this member to `FetchState` immediately after `postedOffers`:

```ts
  postedResponses: Array<{ url: string; body: Record<string, unknown> }>;
```

Add its reset value immediately after `postedOffers: []`:

```ts
    postedResponses: [],
```

Insert this handler after the existing `POST /api/marketflow/offers` handler and before the default 404. It records the real respond envelope without replacing any query behavior:

```ts
    const responseMatch = url.match(
      /^\/api\/marketflow\/offers\/(\d+)\/respond$/,
    );
    if (method === "POST" && responseMatch) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      fetchState.postedResponses.push({ url, body });
      return jsonResponse({
        offer: fetchState.offers.find(
          (offer) => offer.id === Number(responseMatch[1]),
        ),
        negotiation: fetchState.negotiation,
      });
    }
```

Extend the deal fixture GET immediately after the wholesale-deal branch so the shared composer can be reached through both preserved non-wholesale lanes:

```ts
    if (
      method === "GET" &&
      (url.startsWith("/api/capital-projects/") ||
        url.startsWith("/api/retail-listings/"))
    ) {
      return jsonResponse(fetchState.deal);
    }
```

Change the render helper signature and Router opening tag so the test supplies Wouter's search source separately from its in-memory path source:

```tsx
async function renderOfferStudio(
  path = `/marketflow/offer-studio/${DEAL_ID}`,
  search = "",
) {
```

```tsx
        <Router hook={hook} searchHook={() => search}>
```

Insert these helpers immediately after `seedExistingNegotiation` and before `afterEach`. The UTC-relative dates make the browser tests remain future-dated without sharing production date logic:

```ts
function dateFromToday(days: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function change(testId: string, value: string) {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
}

function postCalls() {
  return fetchMock.mock.calls.filter(([, init]) =>
    ((init as RequestInit | undefined)?.method || "GET").toUpperCase() ===
    "POST",
  );
}

function seedIncomingOffer(userId: string) {
  seedExistingNegotiation(userId);
  fetchState.offers.push({
    id: 7100,
    status: "pending",
    createdBy: COUNTERPARTY_ID,
    createdAt: new Date().toISOString(),
    payload: {
      offerPrice: 165_432,
      earnestMoney: 4_321,
      closeDate: dateFromToday(30),
      inspectionPeriod: 9,
      fundingType: "cash",
      notes: "Incoming terms",
    },
  });
}
```

These helpers assert the real component boundary: GETs remain real through the existing mock server, while only external HTTP writes are recorded. No assertion is made on a fake component or mock-only element.

- [x] **Step 4: Replace Offer Studio's blank-date success test with exact valid create coverage.**

Replace the complete current parameterized test beginning `it.each<[AuthRole, string]>` and ending just before the disallowed-role test with this code:

```tsx
  it.each<[AuthRole, string]>([
    ["wholesaler", "u-wholesaler"],
    ["dreamscaper", "u-dreamscaper"],
    ["buyer", "u-buyer"],
  ])(
    "lets a %s send the displayed wholesale total in one exact create body",
    async (role, userId) => {
      setAuthState(role);
      seedExistingNegotiation(userId);
      await renderOfferStudio();

      expect(
        await screen.findByTestId("page-offer-studio"),
      ).toBeInTheDocument();
      expect(await screen.findByTestId("text-deal-address")).toHaveTextContent(
        "123 Test St",
      );
      expect(await screen.findByTestId("badge-offer-count")).toHaveTextContent(
        "0 offers",
      );
      expect(screen.queryByTestId("list-offer-history")).toBeNull();

      const closeDate = dateFromToday(45);
      const totalInput = screen.getByLabelText(
        "Total assignment price",
      ) as HTMLInputElement;
      fireEvent.change(totalInput, { target: { value: "176543" } });
      change("input-earnest-money", "7654");
      change("input-close-date", closeDate);
      change("input-inspection-period", "13");
      change("select-funding-type", "hard_money");
      change("input-notes", "Distinctive studio terms");
      expect(totalInput).toHaveValue(176543);

      fireEvent.click(screen.getByTestId("button-send-offer"));

      await waitFor(() => expect(fetchState.postedOffers).toHaveLength(1));
      expect(fetchState.postedOffers[0]).toEqual({
        url: "/api/marketflow/offers",
        body: {
          lane: "WHOLESALE",
          dealId: 9001,
          offerKind: "WHOLESALE_ASSIGNMENT",
          payload: {
            offerPrice: 176_543,
            earnestMoney: 7_654,
            closeDate,
            inspectionPeriod: 13,
            fundingType: "hard_money",
            notes: "Distinctive studio terms",
          },
        },
      });
      expect(fetchState.postedResponses).toEqual([]);

      const ladder = await screen.findByTestId(
        "list-offer-history",
        {},
        { timeout: 5000 },
      );
      expect(ladder).toBeInTheDocument();
      const offerRows = await screen.findAllByTestId(
        /^offer-row-/,
        {},
        { timeout: 5000 },
      );
      expect(offerRows).toHaveLength(1);
      expect(offerRows[0]).toHaveTextContent("You");
      expect(offerRows[0]).toHaveTextContent("$176,543");
      expect(await screen.findByTestId("badge-offer-count")).toHaveTextContent(
        "1 offer",
      );
    },
  );
```

The literal amount `176_543` is independently checked and appears in the accessible field, exact body, and ladder. Exact object equality fails if any expiry, participant ID, ownership field, status/count, or UI/money alias leaks into the request.

- [x] **Step 5: Add genuine Offer Studio RED cases for date focus, total bounds, and exact respond allowlisting.**

Insert these tests immediately before the existing disallowed-role test:

```tsx
  it.each(["CAPITAL", "LISTING"])(
    "keeps the %s composer labeled Offer Price",
    async (lane) => {
      setAuthState("buyer");
      await renderOfferStudio(
        `/marketflow/offer-studio/${DEAL_ID}`,
        `?lane=${lane}`,
      );

      expect(await screen.findByLabelText("Offer Price")).toBeInTheDocument();
      expect(screen.queryByLabelText("Total assignment price")).toBeNull();
    },
  );

  it("blocks, explains, and focuses an empty wholesale closing date without POSTing", async () => {
    setAuthState("buyer");
    seedExistingNegotiation("u-buyer");
    await renderOfferStudio();
    await screen.findByTestId("page-offer-studio");

    change("input-offer-price", "176543");
    const date = screen.getByLabelText("Close Date") as HTMLInputElement;
    expect(date).toBeRequired();
    const submit = screen.getByTestId("button-send-offer");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    const error = await screen.findByTestId("error-offer-close-date");
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Closing date is required.");
    expect(date).toHaveAttribute("aria-invalid", "true");
    expect(date).toHaveAttribute("aria-describedby", error.id);
    await waitFor(() => expect(date).toHaveFocus());
    expect(postCalls()).toHaveLength(0);
    expect(fetchState.postedOffers).toEqual([]);
    expect(fetchState.postedResponses).toEqual([]);

    change("input-close-date", dateFromToday(45));
    await waitFor(() => {
      expect(screen.queryByTestId("error-offer-close-date")).toBeNull();
    });
    expect(date).not.toHaveAttribute("aria-invalid");
    expect(date).not.toHaveAttribute("aria-describedby");
    expect(postCalls()).toHaveLength(0);
  });

  it.each([
    ["blank", ""],
    ["fractional", "176543.5"],
    ["below the server minimum", "999"],
    ["above the server maximum", "10000000001"],
  ])("blocks a wholesale total %s before any POST", async (_label, value) => {
    setAuthState("buyer");
    seedExistingNegotiation("u-buyer");
    await renderOfferStudio();
    await screen.findByTestId("page-offer-studio");

    change("input-offer-price", value);
    change("input-close-date", dateFromToday(45));
    fireEvent.click(screen.getByTestId("button-send-offer"));

    const error = await screen.findByTestId(
      "error-offer-total-assignment-price",
    );
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Total assignment price is invalid.");
    expect(postCalls()).toHaveLength(0);
  });

  it.each([
    ["blank earnest money", "input-earnest-money", ""],
    ["negative earnest money", "input-earnest-money", "-1"],
    ["fractional earnest money", "input-earnest-money", "1.5"],
    ["earnest money above the total", "input-earnest-money", "176544"],
    ["blank inspection", "input-inspection-period", ""],
    ["negative inspection", "input-inspection-period", "-1"],
    ["fractional inspection", "input-inspection-period", "1.5"],
    ["inspection above 365 days", "input-inspection-period", "366"],
  ])("blocks invalid %s with every other term valid", async (_label, testId, value) => {
    setAuthState("buyer");
    seedExistingNegotiation("u-buyer");
    await renderOfferStudio();
    await screen.findByTestId("page-offer-studio");

    change("input-offer-price", "176543");
    change("input-close-date", dateFromToday(45));
    change(testId, value);
    const submit = screen.getByTestId("button-send-offer");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(postCalls()).toHaveLength(0);
    expect(fetchState.postedOffers).toEqual([]);
    expect(fetchState.postedResponses).toEqual([]);
  });

  it("sends the displayed wholesale total in one exact respond body", async () => {
    setAuthState("buyer");
    seedIncomingOffer("u-buyer");
    await renderOfferStudio();
    await screen.findByTestId("page-offer-studio");

    const closeDate = dateFromToday(60);
    const totalInput = screen.getByLabelText(
      "Total assignment price",
    ) as HTMLInputElement;
    await waitFor(() => expect(totalInput).toHaveValue(165432));
    fireEvent.change(totalInput, { target: { value: "181234" } });
    change("input-earnest-money", "0");
    change("input-close-date", closeDate);
    change("input-inspection-period", "0");
    change("select-funding-type", "private_lender");
    change("input-notes", "Distinctive response terms");
    expect(totalInput).toHaveValue(181234);

    fireEvent.click(screen.getByTestId("button-send-offer"));

    await waitFor(() => expect(fetchState.postedResponses).toHaveLength(1));
    expect(fetchState.postedResponses[0]).toEqual({
      url: "/api/marketflow/offers/7100/respond",
      body: {
        action: "counter",
        counterPayload: {
          offerPrice: 181_234,
          earnestMoney: 0,
          closeDate,
          inspectionPeriod: 0,
          fundingType: "private_lender",
          notes: "Distinctive response terms",
        },
      },
    });
    expect(fetchState.postedOffers).toEqual([]);
  });
```

The missing-date case makes every other prerequisite valid, so zero POSTs cannot pass because another guard fired. The total table proves both inclusive amount bounds; the secondary-term table proves the new earnest-money and inspection guards with a valid total and date. The respond case covers the second real Offer Studio envelope and retains the required URL `offerId` without adding a participant ID to the body.

- [x] **Step 6: Create the real-provider wholesale modal test harness and Accept regressions.**

Create `client/src/__tests__/wholesale-offer-terms.test.tsx` with this complete content through the closing Accept `describe`. The auth, toast, and external `apiRequest` boundaries are mocked; `DealActionProvider`, its canonical action router, TanStack Query cache, Wouter router, Radix dialog, and rendered form behavior remain real:

```tsx
import React, { useEffect } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
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
import { TooltipProvider } from "@/components/ui/tooltip";

const boundary = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: "buyer-terms-1", email: "buyer@example.com" },
    profile: { primary_role: "buyer_investment" },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: boundary.toast }),
  toast: boundary.toast,
}));

vi.mock("@/lib/queryClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queryClient")>(
    "@/lib/queryClient",
  );
  return { ...actual, apiRequest: boundary.apiRequest };
});

import {
  DealActionProvider,
  type DealActionType,
  useDealAction,
} from "@/contexts/deal-action-context";

const DEAL_ID = 9001;
const ACCEPT_TOTAL = 329_888;
const COUNTER_TOTAL = 333_468;

function dateFromToday(days: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const INITIAL_CLOSE_DATE = dateFromToday(45);
const ACCEPT_CLOSE_DATE = dateFromToday(60);
const COUNTER_CLOSE_DATE = dateFromToday(75);
const USER_EDITED_CLOSE_DATE = dateFromToday(80);
const REFRESHED_CLOSE_DATE = dateFromToday(90);

const wholesaleDeal = {
  id: String(DEAL_ID),
  propertyAddress: "9001 Contract Ln",
  city: "Oakland",
  state: "CA",
  askingPrice: 999_999,
  contractPrice: 321_123,
  assignmentFee: 8_765,
  arv: 515_151,
  estimatedRepairs: 21_212,
  closingDate: `${INITIAL_CLOSE_DATE}T00:00:00.000Z`,
};

function jsonResponse(body: unknown, status = 201) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function ModalLauncher({ action }: { action: DealActionType }) {
  const { openDealAction } = useDealAction();
  useEffect(() => {
    openDealAction(DEAL_ID, action);
  }, [action, openDealAction]);
  return null;
}

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

function renderWholesaleModal(
  action: Extract<
    DealActionType,
    "wholesale_accept" | "wholesale_counter"
  >,
  overrides: Record<string, unknown> = {},
) {
  const client = makeClient();
  client.setQueryData(
    ["/api/wholesale-deals", String(DEAL_ID)],
    { ...wholesaleDeal, ...overrides },
  );
  const { hook } = memoryLocation({ path: "/marketflow", static: true });
  const view = render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Router hook={hook}>
          <DealActionProvider>
            <ModalLauncher action={action} />
          </DealActionProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
  return { client, ...view };
}

function setValue(testId: string, value: string) {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
}

async function initializedDate(
  label: RegExp,
  testId: string,
) {
  const input = (await screen.findByLabelText(label)) as HTMLInputElement;
  expect(screen.getByTestId(testId)).toBe(input);
  await waitFor(() => expect(input).toHaveValue(INITIAL_CLOSE_DATE));
  return input;
}

beforeEach(() => {
  boundary.toast.mockReset();
  boundary.apiRequest.mockReset().mockResolvedValue(
    jsonResponse({ offer: { id: 901 }, negotiation: { id: 902 } }),
  );
});

afterEach(() => cleanup());

describe("reachable Wholesale Accept terms", () => {
  it("initializes an editable required ISO date and blocks/focuses it when blank", async () => {
    renderWholesaleModal("wholesale_accept");
    await screen.findByTestId("dialog-title-wholesale-accept");

    const date = await initializedDate(
      /closing date/i,
      "input-accept-closing-date",
    );
    expect(date).toBeRequired();
    fireEvent.change(date, { target: { value: "" } });
    fireEvent.click(
      screen.getByRole("checkbox", { name: /total assignment price/i }),
    );
    const submit = screen.getByTestId("button-submit-wholesale-accept");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    const error = await screen.findByTestId("error-accept-closing-date");
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Closing date is required.");
    expect(date).toHaveAttribute("aria-invalid", "true");
    expect(date).toHaveAttribute("aria-describedby", error.id);
    await waitFor(() => expect(date).toHaveFocus());
    expect(boundary.apiRequest).not.toHaveBeenCalled();

    fireEvent.change(date, { target: { value: ACCEPT_CLOSE_DATE } });
    await waitFor(() => {
      expect(screen.queryByTestId("error-accept-closing-date")).toBeNull();
    });
    expect(date).not.toHaveAttribute("aria-invalid");
    expect(date).not.toHaveAttribute("aria-describedby");
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it("uses one exact Accept total for display, acknowledgement, and payload", async () => {
    renderWholesaleModal("wholesale_accept");
    await screen.findByTestId("dialog-title-wholesale-accept");

    const date = await initializedDate(
      /closing date/i,
      "input-accept-closing-date",
    );
    const total = screen.getByTestId("text-accept-total-assignment-price");
    expect(total).toHaveTextContent("Total assignment price");
    expect(total).toHaveTextContent("$329,888");
    expect(total).not.toHaveTextContent("$999,999");
    const acknowledgement = screen.getByRole("checkbox", {
      name: /total assignment price of \$329,888/i,
    });

    fireEvent.change(date, { target: { value: ACCEPT_CLOSE_DATE } });
    setValue("input-accept-earnest-money", "0");
    setValue("input-accept-message", "Accept distinctive terms");
    fireEvent.click(acknowledgement);
    fireEvent.click(screen.getByTestId("button-submit-wholesale-accept"));

    await waitFor(() => expect(boundary.apiRequest).toHaveBeenCalledTimes(1));
    expect(boundary.apiRequest.mock.calls[0]).toEqual([
      "POST",
      "/api/marketflow/offers",
      {
        lane: "WHOLESALE",
        dealId: 9001,
        offerKind: "WHOLESALE_ASSIGNMENT",
        payload: {
          offerPrice: ACCEPT_TOTAL,
          earnestMoney: 0,
          closeDate: ACCEPT_CLOSE_DATE,
          inspectionPeriod: 0,
          fundingType: "cash",
          notes: "Accept distinctive terms",
        },
      },
    ]);
  });

  it.each([
    ["missing contract price", { contractPrice: undefined }],
    ["blank assignment fee", { assignmentFee: " " }],
    ["nonnumeric contract price", { contractPrice: "not-a-number" }],
    ["nonfinite contract price", { contractPrice: Number.POSITIVE_INFINITY }],
    ["fractional contract price", { contractPrice: 321_123.5 }],
    ["negative assignment fee offset", { assignmentFee: -1 }],
    ["summed total below the server minimum", { contractPrice: 500, assignmentFee: 499 }],
    ["over-maximum component", { assignmentFee: 10_000_000_001 }],
    [
      "unsafe contract-price component",
      { contractPrice: Number.MAX_SAFE_INTEGER, assignmentFee: 1 },
    ],
  ])("blocks an invalid Accept total: %s", async (_label, overrides) => {
    renderWholesaleModal("wholesale_accept", overrides);
    await screen.findByTestId("dialog-title-wholesale-accept");

    const error = await screen.findByTestId(
      "error-accept-total-assignment-price",
    );
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Total assignment price is invalid.");
    expect(screen.getByTestId("checkbox-acknowledge-terms")).toBeDisabled();
    expect(
      screen.getByTestId("button-submit-wholesale-accept"),
    ).toBeDisabled();
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it.each([
    ["blank", ""],
    ["negative", "-1"],
    ["fractional", "2345.5"],
    ["above the total", String(ACCEPT_TOTAL + 1)],
  ])("blocks %s Accept earnest money without a request", async (_label, value) => {
    renderWholesaleModal("wholesale_accept");
    await screen.findByTestId("dialog-title-wholesale-accept");
    await initializedDate(/closing date/i, "input-accept-closing-date");

    setValue("input-accept-closing-date", ACCEPT_CLOSE_DATE);
    setValue("input-accept-earnest-money", value);
    fireEvent.click(
      screen.getByRole("checkbox", { name: /total assignment price/i }),
    );
    const submit = screen.getByTestId("button-submit-wholesale-accept");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });
});
```

The component-change mutations these tests catch are concrete: removing ISO-prefix normalization leaves the input empty; restoring `askingPrice` posts `999_999`; recomputing in the mutation can diverge from `$329,888`; removing component/total guards enables an invalid acknowledgement or request; disabling submission solely because the date is blank prevents the required visible/focused application error.

- [x] **Step 7: Append Counter date, authoritative-total, exact-body, and invalid-component regressions.**

Append this complete block to `client/src/__tests__/wholesale-offer-terms.test.tsx`:

```tsx
describe("reachable Wholesale Counter terms", () => {
  it("blocks and focuses the required initialized date when blank", async () => {
    renderWholesaleModal("wholesale_counter");
    await screen.findByTestId("dialog-title-wholesale-counter");

    const date = await initializedDate(
      /closing date/i,
      "input-counter-closing-date",
    );
    expect(date).toBeRequired();
    fireEvent.change(date, { target: { value: "" } });
    const submit = screen.getByTestId("button-submit-wholesale-counter");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    const error = await screen.findByTestId("error-counter-closing-date");
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Closing date is required.");
    expect(date).toHaveAttribute("aria-invalid", "true");
    expect(date).toHaveAttribute("aria-describedby", error.id);
    await waitFor(() => expect(date).toHaveFocus());
    expect(boundary.apiRequest).not.toHaveBeenCalled();

    fireEvent.change(date, { target: { value: COUNTER_CLOSE_DATE } });
    await waitFor(() => {
      expect(screen.queryByTestId("error-counter-closing-date")).toBeNull();
    });
    expect(date).not.toHaveAttribute("aria-invalid");
    expect(date).not.toHaveAttribute("aria-describedby");
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it("uses one exact Counter total for display and payload", async () => {
    renderWholesaleModal("wholesale_counter");
    await screen.findByTestId("dialog-title-wholesale-counter");
    await initializedDate(/closing date/i, "input-counter-closing-date");

    setValue("input-counter-assignment-fee", "12345");
    await waitFor(() => {
      expect(
        screen.getByTestId("text-counter-total-assignment-price"),
      ).toHaveTextContent("$333,468");
    });
    expect(
      screen.getByTestId("text-counter-total-assignment-price"),
    ).toHaveTextContent("Total assignment price");
    setValue("input-counter-earnest-money", "0");
    setValue("input-counter-closing-date", COUNTER_CLOSE_DATE);
    setValue("input-counter-inspection-period", "0");
    setValue("input-counter-message", "Counter distinctive terms");
    fireEvent.click(screen.getByTestId("button-submit-wholesale-counter"));

    await waitFor(() => expect(boundary.apiRequest).toHaveBeenCalledTimes(1));
    expect(boundary.apiRequest.mock.calls[0]).toEqual([
      "POST",
      "/api/marketflow/offers",
      {
        lane: "WHOLESALE",
        dealId: 9001,
        offerKind: "WHOLESALE_ASSIGNMENT",
        payload: {
          offerPrice: COUNTER_TOTAL,
          earnestMoney: 0,
          closeDate: COUNTER_CLOSE_DATE,
          inspectionPeriod: 0,
          fundingType: "cash",
          notes: "Counter distinctive terms",
        },
      },
    ]);
  });

  it.each([
    ["blank fee", {}, ""],
    ["nonnumeric fee", {}, "not-a-number"],
    ["negative fee that would leave a plausible sum", {}, "-1"],
    ["fractional summed total", {}, "12345.5"],
    ["summed total below the server minimum", { contractPrice: 500 }, "499"],
    ["total above the server maximum", {}, "10000000000"],
  ])("blocks an invalid Counter total: %s", async (_label, overrides, fee) => {
    renderWholesaleModal("wholesale_counter", overrides);
    await screen.findByTestId("dialog-title-wholesale-counter");
    await initializedDate(/closing date/i, "input-counter-closing-date");

    setValue("input-counter-assignment-fee", fee);

    const error = await screen.findByTestId(
      "error-counter-total-assignment-price",
    );
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Total assignment price is invalid.");
    expect(
      screen.getByTestId("button-submit-wholesale-counter"),
    ).toBeDisabled();
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it.each([
    ["blank earnest money", "input-counter-earnest-money", ""],
    ["negative earnest money", "input-counter-earnest-money", "-1"],
    ["fractional earnest money", "input-counter-earnest-money", "1.5"],
    [
      "earnest money above the total",
      "input-counter-earnest-money",
      String(COUNTER_TOTAL + 1),
    ],
    ["blank inspection", "input-counter-inspection-period", ""],
    ["negative inspection", "input-counter-inspection-period", "-1"],
    ["fractional inspection", "input-counter-inspection-period", "1.5"],
    ["inspection above 365 days", "input-counter-inspection-period", "366"],
  ])("blocks invalid Counter %s with all other terms valid", async (_label, testId, value) => {
    renderWholesaleModal("wholesale_counter");
    await screen.findByTestId("dialog-title-wholesale-counter");
    await initializedDate(/closing date/i, "input-counter-closing-date");

    setValue("input-counter-assignment-fee", "12345");
    setValue("input-counter-closing-date", COUNTER_CLOSE_DATE);
    setValue(testId, value);
    await waitFor(() => {
      expect(
        screen.getByTestId("text-counter-total-assignment-price"),
      ).toHaveTextContent("$333,468");
    });
    const submit = screen.getByTestId("button-submit-wholesale-counter");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });
});

describe("wholesale date initialization", () => {
  it.each([
    ["date-only", "wholesale_accept", /closing date/i, "input-accept-closing-date", INITIAL_CLOSE_DATE, INITIAL_CLOSE_DATE],
    ["valid ISO", "wholesale_accept", /closing date/i, "input-accept-closing-date", `${INITIAL_CLOSE_DATE}T12:34:56.789-07:00`, INITIAL_CLOSE_DATE],
    ["corrupt-suffix", "wholesale_accept", /closing date/i, "input-accept-closing-date", `${INITIAL_CLOSE_DATE}Tgarbage`, ""],
    ["date-only", "wholesale_counter", /closing date/i, "input-counter-closing-date", INITIAL_CLOSE_DATE, INITIAL_CLOSE_DATE],
    ["valid ISO", "wholesale_counter", /closing date/i, "input-counter-closing-date", `${INITIAL_CLOSE_DATE}T12:34:56Z`, INITIAL_CLOSE_DATE],
    ["corrupt-suffix", "wholesale_counter", /closing date/i, "input-counter-closing-date", `${INITIAL_CLOSE_DATE}Tgarbage`, ""],
  ] as const)(
    "normalizes a %s closing date for %s without laundering its suffix",
    async (_shape, action, label, testId, source, expected) => {
      renderWholesaleModal(action, { closingDate: source });
      const date = (await screen.findByLabelText(label)) as HTMLInputElement;
      expect(screen.getByTestId(testId)).toBe(date);
      await waitFor(() => expect(date).toHaveValue(expected));
      expect(boundary.apiRequest).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["wholesale_accept", /closing date/i, "input-accept-closing-date"],
    ["wholesale_counter", /closing date/i, "input-counter-closing-date"],
  ] as const)(
    "does not overwrite a user-edited date after a %s query refresh",
    async (action, label, testId) => {
      const { client } = renderWholesaleModal(action);
      const date = await initializedDate(label, testId);
      fireEvent.change(date, { target: { value: USER_EDITED_CLOSE_DATE } });
      expect(date).toHaveValue(USER_EDITED_CLOSE_DATE);

      act(() => {
        client.setQueryData(
          ["/api/wholesale-deals", String(DEAL_ID)],
          {
            ...wholesaleDeal,
            city: "Berkeley",
            closingDate: `${REFRESHED_CLOSE_DATE}T00:00:00.000Z`,
          },
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Berkeley/)).toBeInTheDocument();
      });
      await waitFor(() => expect(date).toHaveValue(USER_EDITED_CLOSE_DATE));
      expect(date).not.toHaveValue(REFRESHED_CLOSE_DATE);
      expect(boundary.apiRequest).not.toHaveBeenCalled();
    },
  );
});
```

The negative-fee case is intentionally `-1`: the arithmetic sum would still be a plausible `$321,122`, so it proves validation happens on each authoritative component before the total. The `500 + 499` case locks the lower total bound. The secondary-term cases keep total/date valid while independently exercising EMD and inspection guards. The date table distinguishes date-only and real ISO timestamps from a corrupt suffix. The disabled invalid-total button is paired with an already-visible alert; the separate blank-date case leaves the valid-total button actionable and proves the handler focus/zero-POST branch.

- [x] **Step 8: Add already-GREEN strict-server date characterizations without changing the parser.**

In `server/__tests__/marketflow-offer-payload.test.ts`, insert these tests immediately after `rejects malformed, past, and unreasonably distant close dates`:

```ts
  it.each(["", "   ", "\t\n"])(
    "rejects an empty or whitespace-only wholesale close date (%j)",
    (closeDate) => {
      expect(
        parseMarketflowOfferPayload(
          "WHOLESALE_ASSIGNMENT",
          { ...financialTerms, closeDate },
          now,
        ),
      ).toEqual({ success: false, reason: "invalid_payload" });
    },
  );

  it.each(["2026-07-30", "2031-07-30"])(
    "accepts a wholesale close date on the inclusive UTC boundary (%s)",
    (closeDate) => {
      expect(
        parseMarketflowOfferPayload(
          "WHOLESALE_ASSIGNMENT",
          { ...financialTerms, closeDate },
          now,
        ).success,
      ).toBe(true);
    },
  );
```

The injected `now` is `2026-07-30T18:00:00.000Z`, so `2026-07-30` is the current UTC day and `2031-07-30` is exactly five UTC years later. Existing cases already reject `2026-07-29`, the impossible `2026-02-30`, and the later `2032-01-01`. These new assertions must pass before production work: they characterize current authority and are not represented as a server RED.

- [x] **Step 9: Run the complete Task 3 RED and record per-assertion causality.**

Run:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/marketflow-offer-studio.test.tsx client/src/__tests__/wholesale-offer-terms.test.tsx server/__tests__/marketflow-offer-payload.test.ts
```

Expected: FAIL because the real clients lack the required behavior, not because of transform/import/setup errors:

- Offer Studio's current blank date is not required, has no alert/focus, and performs a POST; its label remains `Offer Price`; its over-maximum total posts; and a successful counter is not locked by an exact recorded respond assertion.
- Accept has no editable initialized date or total row, acknowledges only `$8,765`, prefers decoy `askingPrice: 999_999`, and does not block invalid authoritative components.
- Counter posts an empty date, has no error/focus or total row, and accepts lossy/invalid fee input.
- The new server blank/whitespace and inclusive-boundary cases PASS against unchanged `server/marketflow-offer-payload.ts`.

If the command errors before assertions, repair only the test typo/harness and rerun until it fails for the named missing production behaviors. Record the command, failing test names, causal messages, and the already-GREEN server cases in `.superpowers/sdd/2026-08-13-pegasus-wholesale-offer-terms/progress.md`. Do not write production code until this causal RED has been observed.

- [x] **Step 10: Add typed Offer Studio financial terms and lossless input helpers.**

In `client/src/pages/marketflow/offer-studio.tsx`, insert this exact block after `type OfferStatus = "pending" | "accepted" | "rejected" | "countered";` and before `interface LadderOffer`:

```ts
const MIN_OFFER_AMOUNT = 1_000;
const MAX_OFFER_AMOUNT = 10_000_000_000;
const MAX_INSPECTION_DAYS = 365;

const FUNDING_TYPES = [
  "cash",
  "cash_reserves",
  "hard_money",
  "conventional",
  "private_lender",
  "self_directed_ira",
  "other",
] as const;

type FundingType = (typeof FUNDING_TYPES)[number];

interface MarketflowFinancialTerms {
  offerPrice: number;
  earnestMoney: number;
  closeDate: string;
  inspectionPeriod: number;
  fundingType: FundingType;
  notes: string;
}

function isFundingType(value: string): value is FundingType {
  return FUNDING_TYPES.some((fundingType) => fundingType === value);
}

function parseBoundedWholeNumber(
  value: string,
  minimum: number,
  maximum: number,
): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}
```

Replace the complete current composer state declaration with raw strings and add the error/ref hooks immediately after it:

```ts
  const [composer, setComposer] = useState<{
    offerPrice: string;
    earnestMoney: string;
    closeDate: string;
    inspectionPeriod: string;
    fundingType: FundingType;
    notes: string;
  }>({
    offerPrice: "",
    earnestMoney: "5000",
    closeDate: "",
    inspectionPeriod: "10",
    fundingType: "cash",
    notes: "",
  });
  const [composerOfferPriceError, setComposerOfferPriceError] = useState(false);
  const [composerCloseDateError, setComposerCloseDateError] = useState(false);
  const closeDateInputRef = useRef<HTMLInputElement>(null);
```

All three hooks remain before the component's authentication/loading/not-found returns. Never add a hook below those returns.

Replace the complete composer-seeding effect with this raw-string, typed version:

```ts
  useEffect(() => {
    if (!latestOffer) {
      if (deal?.askingPrice && composer.offerPrice === "") {
        setComposer((current) => ({
          ...current,
          offerPrice: String(Math.round(Number(deal.askingPrice) * 0.92)),
        }));
      }
      return;
    }
    if (latestOffer.side === "them") {
      setComposer({
        offerPrice: String(latestOffer.terms.offerPrice),
        earnestMoney: String(latestOffer.terms.earnestMoney ?? 5000),
        closeDate: latestOffer.terms.closeDate || "",
        inspectionPeriod: String(latestOffer.terms.inspectionPeriod ?? 10),
        fundingType: isFundingType(latestOffer.terms.fundingType)
          ? latestOffer.terms.fundingType
          : "cash",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestOffer?.id, deal?.askingPrice]);
```

This retains the existing visible asking-price seed but removes all send-time fallback authority. Raw strings ensure `176543.5`, blank input, and zero are distinguishable until validation.

- [x] **Step 11: Type both Offer Studio mutation envelopes and build the canonical terms once.**

Change only the create mutation variable type from:

```ts
    mutationFn: async (payload: Record<string, unknown>) => {
```

to:

```ts
    mutationFn: async (payload: MarketflowFinancialTerms) => {
```

In the respond mutation's inline variable type, change only:

```ts
      counterPayload?: Record<string, unknown>;
```

to:

```ts
      counterPayload?: MarketflowFinancialTerms;
```

Replace `handleSendComposer` completely with this handler:

```ts
  const handleSendComposer = () => {
    const offerPrice = parseBoundedWholeNumber(
      composer.offerPrice,
      MIN_OFFER_AMOUNT,
      MAX_OFFER_AMOUNT,
    );
    if (offerPrice === null) {
      setComposerOfferPriceError(true);
      return;
    }
    setComposerOfferPriceError(false);

    const closeDateInput = closeDateInputRef.current;
    if (
      !composer.closeDate ||
      !closeDateInput?.value ||
      !closeDateInput.validity.valid
    ) {
      setComposerCloseDateError(true);
      closeDateInput?.focus();
      return;
    }
    setComposerCloseDateError(false);

    const earnestMoney = parseBoundedWholeNumber(
      composer.earnestMoney,
      0,
      MAX_OFFER_AMOUNT,
    );
    const inspectionPeriod = parseBoundedWholeNumber(
      composer.inspectionPeriod,
      0,
      MAX_INSPECTION_DAYS,
    );
    if (earnestMoney === null || earnestMoney > offerPrice) {
      toast({
        title: "Valid earnest money required",
        description: "Enter a whole-dollar amount from $0 through the total.",
        variant: "destructive",
      });
      return;
    }
    if (inspectionPeriod === null) {
      toast({
        title: "Valid inspection period required",
        description: "Enter a whole number from 0 through 365 days.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      offerPrice,
      earnestMoney,
      closeDate: composer.closeDate,
      inspectionPeriod,
      fundingType: composer.fundingType,
      notes: composer.notes,
    } satisfies MarketflowFinancialTerms;

    if (
      latestOffer &&
      latestOffer.side === "them" &&
      latestOffer.status === "pending"
    ) {
      respondMutation.mutate({
        offerId: parseInt(latestOffer.id, 10),
        action: "counter",
        counterPayload: payload,
      });
    } else {
      createOfferMutation.mutate(payload);
    }
  };
```

The six-field `payload` literal is constructed once and passed unchanged to either exact wrapper. The handler never reads `deal.askingPrice`, spreads component state, or passes a UI alias. `parseInt` remains only for the required response-URL identifier, not for a financial value.

- [x] **Step 12: Make the Offer Studio total/date fields accessible, lossless, and lane-specific.**

Replace the complete `offer-price` field wrapper—the `div.space-y-1.5` that contains `Label htmlFor="offer-price"` and `Input id="offer-price"`—with:

```tsx
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="offer-price"
                      className="text-xs uppercase tracking-wider"
                    >
                      {lane === "WHOLESALE"
                        ? "Total assignment price"
                        : "Offer Price"}
                    </Label>
                    <Input
                      id="offer-price"
                      type="number"
                      step="1"
                      value={composer.offerPrice}
                      onChange={(event) => {
                        const value = event.target.value;
                        setComposer((current) => ({
                          ...current,
                          offerPrice: value,
                        }));
                        if (
                          parseBoundedWholeNumber(
                            value,
                            MIN_OFFER_AMOUNT,
                            MAX_OFFER_AMOUNT,
                          ) !== null
                        ) {
                          setComposerOfferPriceError(false);
                        }
                      }}
                      placeholder="0"
                      aria-invalid={composerOfferPriceError ? "true" : undefined}
                      aria-describedby={
                        composerOfferPriceError
                          ? "offer-total-assignment-price-error"
                          : undefined
                      }
                      data-testid="input-offer-price"
                    />
                    {composerOfferPriceError && (
                      <p
                        id="offer-total-assignment-price-error"
                        role="alert"
                        className="text-xs text-destructive"
                        data-testid="error-offer-total-assignment-price"
                      >
                        {lane === "WHOLESALE"
                          ? "Total assignment price is invalid."
                          : "Offer price is invalid."}
                      </p>
                    )}
                  </div>
```

Replace only the `value` and `onChange` of `input-earnest-money` with:

```tsx
                      value={composer.earnestMoney}
                      onChange={(event) =>
                        setComposer((current) => ({
                          ...current,
                          earnestMoney: event.target.value,
                        }))
                      }
```

Replace the complete `close-date` field wrapper—the `div.space-y-1.5` that contains `Label htmlFor="close-date"` and `Input id="close-date"`—with:

```tsx
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="close-date"
                      className="text-xs uppercase tracking-wider"
                    >
                      Close Date
                    </Label>
                    <Input
                      ref={closeDateInputRef}
                      id="close-date"
                      type="date"
                      required
                      value={composer.closeDate}
                      onChange={(event) => {
                        const value = event.target.value;
                        setComposer((current) => ({
                          ...current,
                          closeDate: value,
                        }));
                        if (value) setComposerCloseDateError(false);
                      }}
                      aria-invalid={composerCloseDateError ? "true" : undefined}
                      aria-describedby={
                        composerCloseDateError ? "offer-close-date-error" : undefined
                      }
                      data-testid="input-close-date"
                    />
                    {composerCloseDateError && (
                      <p
                        id="offer-close-date-error"
                        role="alert"
                        className="text-xs text-destructive"
                        data-testid="error-offer-close-date"
                      >
                        Closing date is required.
                      </p>
                    )}
                  </div>
```

Replace only the `value` and `onChange` of `input-inspection-period` with:

```tsx
                      value={composer.inspectionPeriod}
                      onChange={(event) =>
                        setComposer((current) => ({
                          ...current,
                          inspectionPeriod: event.target.value,
                        }))
                      }
```

Replace only the funding `<select>` `onChange` with this narrowing guard:

```tsx
                    onChange={(event) => {
                      const value = event.target.value;
                      if (isFundingType(value)) {
                        setComposer((current) => ({
                          ...current,
                          fundingType: value,
                        }));
                      }
                    }}
```

Do not disable the send button for a missing date: the handler must render/focus the application error. The lane conditional is deliberate; CAPITAL and LISTING semantics are not renamed by this wholesale fix.

- [x] **Step 13: Run the Offer Studio GREEN slice before changing the modal provider.**

Run:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/marketflow-offer-studio.test.tsx
```

Expected: PASS. The three role cases send exact create envelopes; blank date and out-of-range total make zero POSTs; the incoming-offer case sends the exact respond envelope; the existing disallowed-role guard remains green. If any assertion fails, fix the Offer Studio implementation rather than weakening its exact object/focus/accessibility assertion.

- [x] **Step 14: Add modal-local canonical terms, date normalization, component validity, and numeric parsing.**

In `client/src/contexts/deal-action-context.tsx`, add `useRef` to the existing React import so it becomes:

```ts
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
```

Insert this exact block immediately after `interface WholesaleDeal` and before `interface CapitalProject`:

```ts
const MIN_WHOLESALE_OFFER_AMOUNT = 1_000;
const MAX_WHOLESALE_OFFER_AMOUNT = 10_000_000_000;
const MAX_WHOLESALE_INSPECTION_DAYS = 365;

interface WholesaleOfferTerms {
  offerPrice: number;
  earnestMoney: number;
  closeDate: string;
  inspectionPeriod: number;
  fundingType: "cash";
  notes: string;
}

function toDateInputValue(value: unknown): string {
  if (typeof value !== "string") return "";
  const match = value
    .trim()
    .match(
      /^(\d{4}-\d{2}-\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:(?:0\d|1[0-3]):[0-5]\d|14:00)))?$/,
    );
  return match?.[1] ?? "";
}

function readNonNegativeComponent(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const parsed = Number(value);
  return (
    Number.isSafeInteger(parsed) &&
    parsed >= 0 &&
    parsed <= MAX_WHOLESALE_OFFER_AMOUNT
  )
    ? parsed
    : null;
}

function calculateTotalAssignmentPrice(
  contractPriceValue: unknown,
  assignmentFeeValue: unknown,
): number | null {
  const contractPrice = readNonNegativeComponent(contractPriceValue);
  const assignmentFee = readNonNegativeComponent(assignmentFeeValue);
  if (contractPrice === null || assignmentFee === null) return null;

  const total = contractPrice + assignmentFee;
  return (
    Number.isSafeInteger(total) &&
    total >= MIN_WHOLESALE_OFFER_AMOUNT &&
    total <= MAX_WHOLESALE_OFFER_AMOUNT
  )
    ? total
    : null;
}

function parseBoundedWholeNumber(
  value: string,
  minimum: number,
  maximum: number,
): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}
```

The date helper accepts only a date-only value or a complete RFC 3339-style timestamp with a valid lexical time and `Z`/numeric offset; it rejects corrupt suffixes and never timezone-shifts. Real-calendar/range authority remains on the server. `calculateTotalAssignmentPrice` rejects blank/missing/nonnumeric/nonfinite/negative/fractional/unsafe/over-maximum components before arithmetic and validates the one transmitted total against the exact server offer bounds.

- [x] **Step 15: Replace Wholesale Accept with a once-initialized date and one canonical total/body.**

Replace the complete current `WholesaleAcceptTermsModal` function, from its declaration through its closing brace immediately before `interface WholesaleCounterFormProps`, with this code:

```tsx
function WholesaleAcceptTermsModal({ dealId, onClose }: WholesaleAcceptFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [earnestMoney, setEarnestMoney] = useState("1000");
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [closingDateInitialized, setClosingDateInitialized] = useState(false);
  const [closingDateError, setClosingDateError] = useState(false);
  const closingDateInputRef = useRef<HTMLInputElement>(null);

  const { data: deal, isLoading: dealLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: !!dealId,
  });

  useEffect(() => {
    if (deal && !closingDateInitialized) {
      setClosingDate(toDateInputValue(deal.closingDate));
      setClosingDateInitialized(true);
    }
  }, [deal, closingDateInitialized]);

  const totalAssignmentPrice = calculateTotalAssignmentPrice(
    deal?.contractPrice,
    deal?.assignmentFee,
  );

  const submitMutation = useMutation({
    mutationFn: async (payload: WholesaleOfferTerms) => {
      const res = await apiRequest("POST", "/api/marketflow/offers", {
        lane: "WHOLESALE",
        dealId: Number(dealId),
        offerKind: "WHOLESALE_ASSIGNMENT",
        payload,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Offer sent",
        description: "Your offer is now awaiting the wholesaler's response.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/negotiations"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit acceptance",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to accept this deal.",
      });
      return;
    }
    if (totalAssignmentPrice === null) {
      toast({ title: "Valid total assignment price required", variant: "destructive" });
      return;
    }
    if (!acknowledged) {
      toast({
        title: "Acknowledgement required",
        description: "Please acknowledge the terms.",
        variant: "destructive",
      });
      return;
    }

    const closingDateInput = closingDateInputRef.current;
    if (
      !closingDate ||
      !closingDateInput?.value ||
      !closingDateInput.validity.valid
    ) {
      setClosingDateError(true);
      closingDateInput?.focus();
      return;
    }
    setClosingDateError(false);

    const parsedEarnestMoney = parseBoundedWholeNumber(
      earnestMoney,
      0,
      MAX_WHOLESALE_OFFER_AMOUNT,
    );
    if (
      parsedEarnestMoney === null ||
      parsedEarnestMoney > totalAssignmentPrice
    ) {
      toast({
        title: "Valid earnest money required",
        description: "Enter a whole-dollar amount from $0 through the total.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      offerPrice: totalAssignmentPrice,
      earnestMoney: parsedEarnestMoney,
      closeDate: closingDate,
      inspectionPeriod: 0,
      fundingType: "cash",
      notes: message,
    } satisfies WholesaleOfferTerms;
    submitMutation.mutate(payload);
  };

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || !Number.isFinite(amount)) {
      return "—";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-wholesale-accept">
          Wholesale Accept Terms
        </DialogTitle>
        <DialogDescription>Accept the assignment as posted</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="text-lg font-semibold">
            {deal?.propertyAddress || deal?.address}
          </div>
          {deal?.city && deal?.state && (
            <div className="text-sm text-muted-foreground">
              {deal.city}, {deal.state}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <span className="text-muted-foreground">Contract Price:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(deal?.contractPrice)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Assignment Fee:</span>
              <span className="ml-2 font-medium text-primary">
                {formatCurrency(deal?.assignmentFee)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">ARV:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(deal?.arv)}
              </span>
            </div>
            <div
              className="col-span-2"
              data-testid="text-accept-total-assignment-price"
            >
              <span className="text-muted-foreground">
                Total assignment price:
              </span>
              <span className="ml-2 font-semibold text-primary">
                {formatCurrency(totalAssignmentPrice)}
              </span>
            </div>
          </div>
          {totalAssignmentPrice === null && (
            <p
              id="accept-total-assignment-price-error"
              role="alert"
              className="text-sm text-destructive"
              data-testid="error-accept-total-assignment-price"
            >
              Total assignment price is invalid.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="accept-closing-date"
              className="text-sm font-medium"
            >
              Closing Date *
            </label>
            <input
              ref={closingDateInputRef}
              id="accept-closing-date"
              type="date"
              required
              value={closingDate}
              onChange={(event) => {
                const value = event.target.value;
                setClosingDate(value);
                if (value) setClosingDateError(false);
              }}
              aria-invalid={closingDateError ? "true" : undefined}
              aria-describedby={
                closingDateError ? "accept-closing-date-error" : undefined
              }
              className="w-full px-3 py-2 border rounded-md mt-1"
              data-testid="input-accept-closing-date"
            />
            {closingDateError && (
              <p
                id="accept-closing-date-error"
                role="alert"
                className="text-sm text-destructive mt-1"
                data-testid="error-accept-closing-date"
              >
                Closing date is required.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Earnest Money Deposit</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="1"
                value={earnestMoney}
                onChange={(event) => setEarnestMoney(event.target.value)}
                placeholder="1000"
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-accept-earnest-money"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message (optional)</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Any notes for the wholesaler..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[60px]"
              data-testid="input-accept-message"
            />
          </div>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              disabled={totalAssignmentPrice === null}
              className="mt-0.5 rounded"
              data-testid="checkbox-acknowledge-terms"
            />
            <span className="text-sm">
              I acknowledge and accept the assignment terms as posted. I
              understand I am agreeing to pay the total assignment price of{" "}
              {formatCurrency(totalAssignmentPrice)}.
            </span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel-accept"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitMutation.isPending ||
              !acknowledged ||
              totalAssignmentPrice === null
            }
            className="flex-1"
            data-testid="button-submit-wholesale-accept"
          >
            {submitMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Accept Terms
          </Button>
        </div>
      </div>
    </>
  );
}
```

Every hook is declared before the loading return. The one-time effect normalizes the fetched timestamp but does not overwrite a later edit after query cache refresh. A valid total and checked acknowledgement leave a blank-date submission actionable, so the handler produces the focus/error behavior. An invalid total already displays an alert before disabling acknowledgement/submission.

- [x] **Step 16: Replace Wholesale Counter with one raw fee, normalized date, derived total, and canonical body.**

Replace the complete current `WholesaleCounterOfferModal` function, from its declaration through its closing brace immediately before `interface WholesaleJVFormProps`, with this code:

```tsx
function WholesaleCounterOfferModal({
  dealId,
  onClose,
}: WholesaleCounterFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const [counterAssignmentFee, setCounterAssignmentFee] = useState("");
  const [earnestMoney, setEarnestMoney] = useState("1000");
  const [closingDate, setClosingDate] = useState("");
  const [inspectionPeriod, setInspectionPeriod] = useState("10");
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [closingDateError, setClosingDateError] = useState(false);
  const closingDateInputRef = useRef<HTMLInputElement>(null);

  const { data: deal, isLoading: dealLoading } = useQuery<WholesaleDeal>({
    queryKey: ["/api/wholesale-deals", dealId],
    enabled: !!dealId,
  });

  useEffect(() => {
    if (deal && !initialized) {
      setCounterAssignmentFee(
        deal.assignmentFee === undefined || deal.assignmentFee === null
          ? ""
          : String(deal.assignmentFee),
      );
      setClosingDate(toDateInputValue(deal.closingDate));
      setInitialized(true);
    }
  }, [deal, initialized]);

  const totalAssignmentPrice = initialized
    ? calculateTotalAssignmentPrice(
        deal?.contractPrice,
        counterAssignmentFee,
      )
    : null;
  const hasInvalidTotalAssignmentPrice =
    initialized && totalAssignmentPrice === null;

  const submitMutation = useMutation({
    mutationFn: async (payload: WholesaleOfferTerms) => {
      const res = await apiRequest("POST", "/api/marketflow/offers", {
        lane: "WHOLESALE",
        dealId: Number(dealId),
        offerKind: "WHOLESALE_ASSIGNMENT",
        payload,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Counter-Offer Sent",
        description: "Your counter-offer has been sent for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketflow/negotiations"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit counter-offer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a counter-offer.",
      });
      return;
    }
    if (!initialized || totalAssignmentPrice === null) {
      toast({ title: "Valid total assignment price required", variant: "destructive" });
      return;
    }

    const closingDateInput = closingDateInputRef.current;
    if (
      !closingDate ||
      !closingDateInput?.value ||
      !closingDateInput.validity.valid
    ) {
      setClosingDateError(true);
      closingDateInput?.focus();
      return;
    }
    setClosingDateError(false);

    const parsedEarnestMoney = parseBoundedWholeNumber(
      earnestMoney,
      0,
      MAX_WHOLESALE_OFFER_AMOUNT,
    );
    const parsedInspectionPeriod = parseBoundedWholeNumber(
      inspectionPeriod,
      0,
      MAX_WHOLESALE_INSPECTION_DAYS,
    );
    if (
      parsedEarnestMoney === null ||
      parsedEarnestMoney > totalAssignmentPrice
    ) {
      toast({
        title: "Valid earnest money required",
        description: "Enter a whole-dollar amount from $0 through the total.",
        variant: "destructive",
      });
      return;
    }
    if (parsedInspectionPeriod === null) {
      toast({
        title: "Valid inspection period required",
        description: "Enter a whole number from 0 through 365 days.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      offerPrice: totalAssignmentPrice,
      earnestMoney: parsedEarnestMoney,
      closeDate: closingDate,
      inspectionPeriod: parsedInspectionPeriod,
      fundingType: "cash",
      notes: message,
    } satisfies WholesaleOfferTerms;
    submitMutation.mutate(payload);
  };

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || !Number.isFinite(amount)) {
      return "—";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-wholesale-counter">
          Wholesale Counter Offer
        </DialogTitle>
        <DialogDescription>
          {deal?.propertyAddress || deal?.address || "Property"}
          {deal?.city && deal?.state && ` - ${deal.city}, ${deal.state}`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">Contract Price:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(deal?.contractPrice)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Listed Assignment:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(deal?.assignmentFee)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">ARV:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(deal?.arv)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Repairs:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(deal?.repairEstimate || deal?.estimatedRepairs)}
            </span>
          </div>
          <div
            className="col-span-2"
            data-testid="text-counter-total-assignment-price"
          >
            <span className="text-muted-foreground">
              Total assignment price:
            </span>
            <span className="ml-2 font-semibold text-primary">
              {formatCurrency(totalAssignmentPrice)}
            </span>
          </div>
        </div>
        {hasInvalidTotalAssignmentPrice && (
          <p
            id="counter-total-assignment-price-error"
            role="alert"
            className="text-sm text-destructive"
            data-testid="error-counter-total-assignment-price"
          >
            Total assignment price is invalid.
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label
              htmlFor="counter-assignment-fee"
              className="text-sm font-medium"
            >
              Your Assignment Fee Offer *
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                id="counter-assignment-fee"
                type="number"
                step="1"
                value={counterAssignmentFee}
                onChange={(event) =>
                  setCounterAssignmentFee(event.target.value)
                }
                placeholder={String(deal?.assignmentFee ?? 5000)}
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-counter-assignment-fee"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Earnest Money Deposit</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="1"
                value={earnestMoney}
                onChange={(event) => setEarnestMoney(event.target.value)}
                placeholder="1000"
                className="w-full pl-7 pr-3 py-2 border rounded-md"
                data-testid="input-counter-earnest-money"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="counter-closing-date"
                className="text-sm font-medium"
              >
                Closing Date *
              </label>
              <input
                ref={closingDateInputRef}
                id="counter-closing-date"
                type="date"
                required
                value={closingDate}
                onChange={(event) => {
                  const value = event.target.value;
                  setClosingDate(value);
                  if (value) setClosingDateError(false);
                }}
                aria-invalid={closingDateError ? "true" : undefined}
                aria-describedby={
                  closingDateError ? "counter-closing-date-error" : undefined
                }
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-counter-closing-date"
              />
              {closingDateError && (
                <p
                  id="counter-closing-date-error"
                  role="alert"
                  className="text-sm text-destructive mt-1"
                  data-testid="error-counter-closing-date"
                >
                  Closing date is required.
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Inspection Period (days)
              </label>
              <input
                type="number"
                step="1"
                value={inspectionPeriod}
                onChange={(event) => setInspectionPeriod(event.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 border rounded-md mt-1"
                data-testid="input-counter-inspection-period"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message to Wholesaler</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Explain your counter-offer terms..."
              className="w-full px-3 py-2 border rounded-md mt-1 min-h-[80px]"
              data-testid="input-counter-message"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel-counter"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitMutation.isPending ||
              !initialized ||
              totalAssignmentPrice === null
            }
            className="flex-1"
            data-testid="button-submit-wholesale-counter"
          >
            {submitMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Send Counter-Offer
          </Button>
        </div>
      </div>
    </>
  );
}
```

The total is derived once per render from `Number(deal.contractPrice) + Number(counterAssignmentFee)` only after each component has passed its pre-sum validity rule. The typed mutation only wraps the already-built six fields. `existingOfferId` remains accepted by `WholesaleCounterFormProps` and the action router for compatibility, but no `parentOfferId` or other UI alias crosses the request boundary; endpoint redesign stays deferred to Task 9.

- [x] **Step 17: Run the real Wholesale Accept/Counter GREEN slice.**

Run:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/wholesale-offer-terms.test.tsx
```

Expected: PASS. Both ISO dates initialize, user edits survive query-data refresh, blank dates render/focus and clear their linked alerts without a POST, Accept's `$329,888` beats the `$999,999` decoy in display/acknowledgement/request, Counter's `$333,468` matches display/request, and all invalid component/total tables remain at zero API calls.

- [x] **Step 18: Run the complete focused GREEN with client and server authority together.**

Run the same command used for RED:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/marketflow-offer-studio.test.tsx client/src/__tests__/wholesale-offer-terms.test.tsx server/__tests__/marketflow-offer-payload.test.ts
```

Expected: all three files PASS. Confirm output contains no unhandled rejection, React hook-order error, `act` warning, Radix accessibility warning, or unexpected network 404. Record the command and exact file/test counts in the plan-scoped SDD ledger. Do not infer a pass from the exit status alone if output contains an unhandled error.

- [x] **Step 19: Run the full repository test and TypeScript gates under exact Node 22.23.2.**

Run:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm test
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check
```

Expected: the full Vitest suite exits 0 with no failed file and TypeScript exits 0. If a failure is unrelated, reproduce it at the accepted implementation base before classifying it; do not weaken, skip, or increase a timeout. If the base does not reproduce it, the Task 3 implementation owns the regression and must fix it before review.

- [x] **Step 20: Run the production build/bundle gate with the environment-only IPC fallback.**

Run the repository command first:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run build
```

Expected: build and bundle budget exit 0; generated `dist/` remains unstaged. If and only if the managed sandbox rejects the `tsx` CLI's Unix IPC listener before repository build code runs (the known signature is `EPERM` on a numbered pipe path below `/tmp/tsx-*`), run the exact same TypeScript entrypoint without the listener and then the same bundle gate:

```bash
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --import tsx script/build.ts
env PATH="/tmp/pegasus-recovery-node22-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check:bundle
```

Record whether the normal wrapper passed or the environment-only fallback was necessary, including the exact IPC error if used. Do not edit `package.json`, scripts, dependencies, or lockfiles to accommodate the sandbox.

- [x] **Step 21: Inspect the entire Task 3 diff, run mutation-oriented self-review, and prove exact scope.**

First run hygiene and status:

```bash
git diff --check
git diff --stat
git status --short --untracked-files=all
git diff -- client/src/pages/marketflow/offer-studio.tsx client/src/contexts/deal-action-context.tsx client/src/__tests__/marketflow-offer-studio.test.tsx server/__tests__/marketflow-offer-payload.test.ts
sed -n '1,420p' client/src/__tests__/wholesale-offer-terms.test.tsx
```

Expected: four modified tracked paths plus the one untracked new test path; `.recovery/` and ignored `.superpowers/` are not implementation scope. Review every hunk against these concrete mutations:

1. Replacing any displayed/acknowledged total with `askingPrice`, recomputing it in a mutation, or changing one arithmetic component must fail an exact literal/display/request assertion.
2. Removing any date guard, `required`, alert link, focus, or clear-on-change behavior must fail a behavior assertion that has every other prerequisite valid.
3. Adding any outer/body key, participant ID, expiry, count, status, or alias must fail exact object equality for create or respond.
4. Allowing blank, nonnumeric, nonfinite, negative, fractional, unsafe, below-minimum, or above-maximum authoritative values must fail at least one zero-call/disabled-state test.
5. Restoring `parseInt`, `parseFloat`, `||` numeric defaults, or a state spread in a changed submission path must be removed before staging.
6. Re-running a query with a new ISO date must leave each user-edited modal date unchanged.
7. Server blank/whitespace/date-boundary tests must exercise the real parser with literal hand-derived dates; they must not compute expectations through production helpers.

Then prove protected files and later-task boundaries are untouched:

```bash
git diff --exit-code HEAD -- package.json package-lock.json shared/schema.ts server/routes.ts server/storage.ts server/marketflow-offer-payload.ts server/marketflow-financial-integrity.ts client/src/pages/marketflow-negotiate.tsx
git diff --exit-code HEAD -- docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md docs/qa/security-launch-recovery-ledger.md
```

Expected: both commands exit 0. Confirm `deal-action-context.tsx` changes are confined to its React import, the local wholesale type/helpers, and the Accept/Counter functions; no Listing, Capital, JV, provider-routing, or call-site behavior changed. Confirm `offer-studio.tsx` does not change `OfferStatus`, `transformOffer`, persisted-status handling, expiry, negotiation counts, or notification behavior.

- [x] **Step 22: Stage the exact five-path implementation manifest and create the primary Task 3 commit.**

Stage only the authorized paths:

```bash
git add -- client/src/pages/marketflow/offer-studio.tsx client/src/contexts/deal-action-context.tsx client/src/__tests__/marketflow-offer-studio.test.tsx client/src/__tests__/wholesale-offer-terms.test.tsx server/__tests__/marketflow-offer-payload.test.ts
git diff --cached --name-only | LC_ALL=C sort
git diff --cached --check
test "$(git diff --cached --name-only | wc -l | tr -d ' ')" = "5"
```

The sorted cached manifest must be exactly:

```text
client/src/__tests__/marketflow-offer-studio.test.tsx
client/src/__tests__/wholesale-offer-terms.test.tsx
client/src/contexts/deal-action-context.tsx
client/src/pages/marketflow/offer-studio.tsx
server/__tests__/marketflow-offer-payload.test.ts
```

Inspect the cached diff rather than trusting the working diff:

```bash
git diff --cached --stat
git diff --cached -- client/src/pages/marketflow/offer-studio.tsx client/src/contexts/deal-action-context.tsx client/src/__tests__/marketflow-offer-studio.test.tsx client/src/__tests__/wholesale-offer-terms.test.tsx server/__tests__/marketflow-offer-payload.test.ts
```

Create the primary commit and verify the result:

```bash
git commit -m "fix: require complete wholesale offer terms"
git show --stat --oneline HEAD
git show --format= --name-only HEAD | sed '/^$/d' | LC_ALL=C sort
test "$(git show --format= --name-only HEAD | sed '/^$/d' | wc -l | tr -d ' ')" = "5"
git status --short --untracked-files=no
git status --short
```

Expected: the primary implementation commit is named `fix: require complete wholesale offer terms`; its parent is the docs-only plan checkpoint; it contains exactly the five paths above; tracked worktree is clean; full status may show only the intentionally untracked `.recovery/` and ignored SDD workspace. Never stage either. Do not amend accepted predecessor commits, push, update the parent plan/ledger, or create acceptance bookkeeping. Later focused review-fix commits are required for Blocker/Major specification findings or Critical/Important quality findings and remain inside this manifest; every Minor finding is explicitly adjudicated and recorded.

- [x] **Step 23: Write the implementation report and return the exact commit for fresh reviews.**

Write the full implementation report to the report path paired with the Step 2 task brief. It must include:

- status `DONE` or `DONE_WITH_CONCERNS`;
- BASE and implementation HEAD SHAs;
- the causal focused RED output, explicitly separating failing client behavior from already-GREEN server characterizations;
- focused Offer Studio GREEN, modal GREEN, complete three-file GREEN, full `npm test`, `npm run check`, and build/bundle command plus outcome;
- exact five-path committed manifest and `git diff --check` result;
- a self-review mapping every mutation in Step 21 to a named test;
- concerns limited to genuine residual risk, including the intentional Task 9 deferrals.

Return only status, commit SHA, a one-line verification summary, and concerns to the SDD controller. The controller generates the task review package from the BASE recorded in Step 2 through implementation HEAD; it never uses `HEAD~1` as a substitute for the recorded BASE.

---

## Controller-only review and acceptance checkpoint

After the implementation worker reports completion:

1. Generate a review package with:

   ```bash
   task3_base_sha="$(tr -d '\r\n' < .superpowers/sdd/2026-08-13-pegasus-wholesale-offer-terms/implementation-base.sha)"
   task3_head_sha="$(git rev-parse HEAD)"
   /root/.codex/plugins/cache/openai-curated-remote/superpowers/6.2.0/skills/subagent-driven-development/scripts/review-package docs/superpowers/plans/2026-08-13-pegasus-wholesale-offer-terms.md "$task3_base_sha" "$task3_head_sha"
   ```

2. Dispatch a fresh specification reviewer with the Task 3 brief, implementation report, review package, and this plan's complete Global Constraints. Require an explicit `SPEC APPROVED` verdict with no blocker/major gap. Resolve every `Cannot verify from diff` item against the exact tree before accepting it.
3. After specification approval, dispatch a different fresh code-quality reviewer with the same artifacts. Require `QUALITY APPROVED` with no Critical or Important finding. The reviewer checks hook order, accessible error/focus behavior, non-vacuous zero-call assertions, raw numeric handling, component-before-total validity, exact allowlists, query-refresh preservation, and Task 9 scope boundaries.
4. If the specification reviewer raises a Blocker or Major finding, or the code-quality reviewer raises a Critical or Important finding, resume the same implementer for review-fix rounds under the SDD cap. Each round creates a new focused commit—never amend or squash—touches only the same five-path manifest, reruns the covering focused command and every affected full gate, appends evidence to the same implementation report/ledger, and receives a scoped re-review package from the prior reviewed HEAD through the new fix HEAD. Record every fix SHA and reviewer disposition. Explicitly adjudicate every Minor finding from either taxonomy and record whether it was fixed or deferred with a concrete scope/risk reason.
5. When both reviews approve, append the RED/GREEN/build evidence, primary implementation SHA, every review-fix SHA, reviewer verdicts, and the disposition of every Minor finding to `.superpowers/sdd/2026-08-13-pegasus-wholesale-offer-terms/progress.md`.
6. The controller—not the implementation worker—updates this child plan checkbox state, Program Task 3, and `docs/qa/security-launch-recovery-ledger.md` in a separate docs-only commit named `docs: record Task 3 acceptance`. That record names the primary and every review-fix SHA. Only after that exact-head checkpoint passes the parent closure gate may the controller fast-forward `codex/launch-recovery-v2` without force and verify the remote contains it.

**Accepted 2026-08-13:** canonical primary `9240e365a108aba28f9a41e88ee43ef78d780bdf` and review fix `ab289e6900524361467a1132c7eb16cecf6af61f`. Fresh full and scoped reviews returned `SPEC APPROVED` and `QUALITY APPROVED` with no remaining finding. The quality review's one Important refreshed-total acknowledgement finding was fixed in the additive commit by binding consent to the exact amount; its test went causal RED 39/40, then GREEN 40/40. Final verification passed focused 3 files / 73 tests, full 114 files / 1,338 tests, TypeScript, the plan-authorized listener-free production build, bundle budget, exact scope, and diff hygiene. No Minor finding was deferred.

Task 3 is not complete merely because the implementation commit exists. Durable completion requires both fresh approvals, exact-head verification, the separate tracked acceptance checkpoint, and remote containment under the parent program's closure protocol.
