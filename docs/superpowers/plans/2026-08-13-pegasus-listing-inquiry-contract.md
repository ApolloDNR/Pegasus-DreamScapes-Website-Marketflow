# Pegasus Listing Inquiry Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the reachable numeric-listing inquiry modals, strict API contract, PostgreSQL persistence, and reviewed-access public context while removing UUID-to-numeric actions that cannot work truthfully.

**Architecture:** A shared strict Zod request schema is the only client/server wire contract. Pure client builders translate the two live modal states into that contract, while dependency-injected Express handlers validate before reviewed-access or storage work, persist an explicit allowlist, and return a deliberately small listing-context projection. The separate Supabase/UUID property page gets direct email contact links instead of pretending its UUID belongs to the legacy numeric inquiry store.

**Tech Stack:** React 18, TypeScript 5.6, TanStack Query, Wouter, Express 4, Zod 3, Drizzle/PostgreSQL, Vitest, Testing Library.

## Global Constraints

- Work only on successor branch `codex/launch-recovery-v2` from the accepted Task 1 checkpoint; do not edit `main` or rewrite accepted commits.
- Use Node `22.23.2`; use `npx vitest run <paths>` for every focused test command.
- Public brand casing is exactly **Pegasus Dreamscapes**.
- MarketFlow is private beta and reviewed access only; authentication alone is never approval.
- Unauthorized and nonexistent private objects use indistinguishable responses with `Cache-Control: no-store`.
- Do not mutate production, Render production, the live database, DNS, payment systems, or submit a live/staging test lead.
- Add no dependency and no database migration: `listing_inquiries.email` is already `varchar(255) NOT NULL`, so the request maximum is exactly 255 characters.
- Do not create a Supabase inquiry table or simulate a UUID inquiry success; retain the UUID property page's working offer, save, email, and phone paths. Remove its numeric-only Peggy button until that contract supports string listing IDs.
- Preserve the locked visual system and existing modal copy except for required-field markers, truthful direct-contact links, and canonical time inputs.
- Implement this entire child plan as one reviewable parent Task 2 and one implementation commit, `fix: align listing inquiry contracts`.
- Stage only the exact Task 2 paths listed in Step 22; acceptance-ledger and plan-checkbox updates remain the controller's later acceptance commit.

---

## File Map

- Create `shared/listing-inquiry-contract.ts`: strict canonical request schema and inferred request type.
- Create `client/src/lib/listing-inquiry.ts`: pure info/tour request builders, date/time zipper, validation-message adapter, and UUID property mailto builder.
- Modify `client/src/contexts/deal-action-context.tsx`: route both live numeric-listing modals through the builders, require valid email, use real `HH:mm` controls, and delete the dead legacy form.
- Modify `client/src/pages/marketplace-property-detail.tsx`: use the actual Supabase listing DTO, remove UUID numeric coercions, and replace three broken modal launches with explicit direct-contact mailto links.
- Create `server/listing-inquiry-routes.ts`: dependency-injected validation, context, and persistence handlers.
- Modify `server/routes.ts`: instantiate the tested handlers, keep the literal inquiry registration marker, and delegate only the LISTING context branch.
- Create `client/src/__tests__/listing-inquiry-contract.test.tsx`: exercise both real live modals through the real provider.
- Create `client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx`: exercise the UUID-backed page and its retained/direct contact paths.
- Create `server/__tests__/listing-inquiry-contract.test.ts`: mount the production handlers on live ephemeral Express and prove parsing, storage mapping, reviewed access, projection, and anti-enumeration.
- Modify `server/__tests__/public-data-route-contract.test.ts`: prove the behavior-tested handlers are composed into the production registrar in the required middleware order.
- Verify unchanged `server/__tests__/owner-update-route-contract.test.ts`: its listing PATCH slice ends at the literal `app.post("/api/listing-inquiries"` marker that this plan preserves.

### Task 2: Align listing inquiry UI, API, database, and source-specific actions

**Files:**
- Create: `shared/listing-inquiry-contract.ts`
- Create: `client/src/lib/listing-inquiry.ts`
- Modify: `client/src/contexts/deal-action-context.tsx`
- Modify: `client/src/pages/marketplace-property-detail.tsx`
- Create: `server/listing-inquiry-routes.ts`
- Modify: `server/routes.ts`
- Create: `client/src/__tests__/listing-inquiry-contract.test.tsx`
- Create: `client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx`
- Create: `server/__tests__/listing-inquiry-contract.test.ts`
- Test: `server/__tests__/public-data-route-contract.test.ts`
- Verify unchanged: `server/__tests__/owner-update-route-contract.test.ts`

**Interfaces:**
- Consumes: accepted Task 1 HEAD, `listing_inquiries`/`InsertListingInquiry` in `shared/schema.ts`, `storage.getListing`, `storage.createListingInquiry`, `isPublicListing`, `resolveLegacyDealAccess`, `canInitiateLegacyDealInteraction`, hybrid authentication, and `res.locals.canAccessReviewedMarketflowInventory`.
- Produces: `listingInquiryRequestSchema`, `ListingInquiryRequest`, `buildListingInfoRequest`, `buildListingTourRequest`, `zipPreferredShowingDates`, `listingInquiryValidationMessage`, `buildMarketplaceListingMailto`, and `createListingInquiryRouteHandlers` with `validateInquiry`, `getContext`, and `postInquiry` handlers.
- Wire request: strict positive safe-integer `listingId`; `inquiryType` exactly `info | tour | offer`; trimmed `fullName` 1–255; required trimmed valid `email` 1–255; optional present trimmed `phone` 1–50; optional present trimmed `message` 1–4,000; zero to three present trimmed `preferredShowingDates`, each 1–100; optional boolean `preApproved`. Unknown keys fail; they are not stripped and accepted.
- Live modal rule: valid email is mandatory even when phone is present or preferred; phone is optional in the canonical request, but Request Info additionally requires it when the user explicitly selects Phone as the preferred contact. UI `name` becomes wire `fullName`.
- Info message formula, in exact order: `Preferred contact: <Email|Phone|Either>`; one `Question: <checked label>` line per checked question in UI order; optional `Additional question: <custom text>`; optional `Timeframe: <text>`. Lines join with `\n`, so no entered control is discarded.
- Tour rule: each nonblank date is paired only with the same-index nonblank `HH:mm` time as `YYYY-MM-DD HH:mm`, or remains the date alone. A time with no same-index date is a validation error and performs zero POSTs. `false` is a meaningful `preApproved` value and must persist.
- Context rule: an authenticated caller with reviewed inventory access may make first contact with an active/coming-soon numeric listing without an existing inquiry. The handler loads no inquiries and returns only `dealType`, `dealId`, the listed `deal` fields, `listingTerms`, and `status`; it returns no showing/lockbox/occupancy data, contacts, owner IDs, inquiry rows/counts, staff notes, or audit timestamps.
- Privacy rule: unreviewed active, private, malformed-ID, and nonexistent contexts all return `{ message: "Listing not found" }`, status 404, and `Cache-Control: no-store`. An inaccessible inquiry POST uses that same response. Authentication failure remains 401 before the Task 2 handlers.
- Source rule: `/marketflow/properties/:id` consumes the Supabase public DTO with string UUID `id`. It never calls `Number`, `parseInt`, numeric listing modals, numeric listing analytics, or numeric Peggy deal context for that UUID. Its inquiry/showing CTAs are mailto links containing the intent, address, and exact UUID; offer/save/generic email/phone remain reachable, and the UUID page's `AskPeggyButton` is removed until Peggy accepts string listing IDs.

- [ ] **Step 1: Confirm the accepted boundary and clean scope.**

Run:

```bash
git status --short --untracked-files=no
git status --short
git branch --show-current
git log -3 --oneline
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --version
```

Expected: the absolute PATH prefix selects the already-provisioned exact Node runtime for that command; every later Node/npm/npx command repeats the same self-contained prefix because agent tool calls may use fresh shells. No tracked changes from the first status command; the full status may show only `?? .recovery/`, which is local planning evidence and must never be staged; branch `codex/launch-recovery-v2`; the controller-recorded Task 2 child-plan checkpoint at HEAD with accepted Task 1 immediately below it; Node `v22.23.2`. Reconcile the exact dispatch SHAs and stop on any other mismatch instead of mixing recovery or unrelated paths into Task 2.

- [ ] **Step 2: Add a self-contained strict shared-contract RED.**

Create `server/__tests__/listing-inquiry-contract.test.ts` with this complete initial content. The conditional import makes the absent schema an intentional assertion failure rather than a transform failure:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ZodType } from "zod";

const modulePath = path.join(
  process.cwd(),
  "shared/listing-inquiry-contract.ts",
);
const contractModule = fs.existsSync(modulePath)
  ? await import(/* @vite-ignore */ "../../shared/listing-inquiry-contract")
  : {};
const requestSchema = (
  contractModule as { listingInquiryRequestSchema?: unknown }
).listingInquiryRequestSchema;

function requireSchema(): ZodType {
  expect(
    requestSchema,
    "listing inquiries need one strict shared request schema",
  ).toBeDefined();
  if (!requestSchema) throw new Error("Listing inquiry schema is missing");
  return requestSchema as ZodType;
}

describe("listing inquiry shared request contract", () => {
  it("trims and accepts only the canonical persisted fields", () => {
    expect(requireSchema().parse({
      listingId: 42,
      inquiryType: "tour",
      fullName: "  Taylor Buyer  ",
      email: "  taylor@example.com  ",
      phone: "  510-555-0142  ",
      message: "  Please confirm by email.  ",
      preferredShowingDates: ["  2026-08-20 09:00  "],
      preApproved: false,
    })).toEqual({
      listingId: 42,
      inquiryType: "tour",
      fullName: "Taylor Buyer",
      email: "taylor@example.com",
      phone: "510-555-0142",
      message: "Please confirm by email.",
      preferredShowingDates: ["2026-08-20 09:00"],
      preApproved: false,
    });
  });

  it.each([
    {
      label: "legacy aliases and missing required identity",
      body: {
        listingId: 42,
        inquiryType: "tour",
        name: "Taylor Buyer",
        phone: "510-555-0142",
        preferredDates: ["2026-08-20"],
        preferredTimes: ["morning"],
        isPreApproved: true,
      },
    },
    {
      label: "one obsolete alias on an otherwise valid request",
      body: {
        listingId: 42,
        inquiryType: "info",
        fullName: "Taylor Buyer",
        email: "taylor@example.com",
        preferredDate: "2026-08-20",
      },
    },
    {
      label: "unsafe listing id",
      body: {
        listingId: Number.MAX_SAFE_INTEGER + 1,
        inquiryType: "info",
        fullName: "Taylor Buyer",
        email: "taylor@example.com",
      },
    },
    {
      label: "email wider than varchar(255)",
      body: {
        listingId: 42,
        inquiryType: "info",
        fullName: "Taylor Buyer",
        email: `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(63)}`,
      },
    },
  ])("rejects $label", ({ body }) => {
    expect(requireSchema().safeParse(body).success).toBe(false);
  });
});
```

- [ ] **Step 3: Run the shared/server seam RED.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/listing-inquiry-contract.test.ts -t "rejects"
```

Expected: FAIL with `listing inquiries need one strict shared request schema: expected undefined not to be undefined`; the production schema does not exist yet.

- [ ] **Step 4: Create the strict shared schema.**

Create `shared/listing-inquiry-contract.ts` exactly as follows:

```ts
import { z } from "zod";

const presentTrimmed = (max: number) =>
  z.string().trim().min(1).max(max);

export const listingInquiryRequestSchema = z
  .object({
    listingId: z.number().int().safe().positive(),
    inquiryType: z.enum(["info", "tour", "offer"]),
    fullName: presentTrimmed(255),
    email: presentTrimmed(255).email(),
    phone: presentTrimmed(50).optional(),
    message: presentTrimmed(4_000).optional(),
    preferredShowingDates: z
      .array(presentTrimmed(100))
      .max(3)
      .optional(),
    preApproved: z.boolean().optional(),
  })
  .strict();

export type ListingInquiryRequest = z.infer<
  typeof listingInquiryRequestSchema
>;
```

Do not widen email to 320 and do not add a migration: the existing non-null PostgreSQL column is 255 characters.

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/listing-inquiry-contract.test.ts
```

Expected: PASS, 5 tests. This is the schema GREEN before any route or UI consumes it.

- [ ] **Step 5: Create the pure client builders and direct-contact encoder.**

Create `client/src/lib/listing-inquiry.ts` exactly as follows:

```ts
import { ZodError } from "zod";
import {
  listingInquiryRequestSchema,
  type ListingInquiryRequest,
} from "@shared/listing-inquiry-contract";

export type PreferredContact = "email" | "phone" | "either";

export interface ListingInfoDraft {
  listingId: number;
  name: string;
  email: string;
  phone?: string;
  preferredContact: PreferredContact;
  questions: readonly string[];
  customQuestion?: string;
  timeframe?: string;
}

export interface ListingTourDraft {
  listingId: number;
  name: string;
  email: string;
  phone?: string;
  preferredDates: readonly string[];
  preferredTimes: readonly string[];
  preApproved: boolean | null;
  message?: string;
}

export interface MarketplaceListingContact {
  listingId: string;
  propertyAddress: string;
  intent: "info" | "showing";
}

const contactLabels: Record<PreferredContact, string> = {
  email: "Email",
  phone: "Phone",
  either: "Either",
};

const optional = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export function buildListingInfoRequest(
  draft: ListingInfoDraft,
): ListingInquiryRequest {
  const lines = [
    `Preferred contact: ${contactLabels[draft.preferredContact]}`,
  ];
  for (const question of draft.questions) {
    const value = question.trim();
    if (value) lines.push(`Question: ${value}`);
  }
  const customQuestion = optional(draft.customQuestion);
  if (customQuestion) lines.push(`Additional question: ${customQuestion}`);
  const timeframe = optional(draft.timeframe);
  if (timeframe) lines.push(`Timeframe: ${timeframe}`);
  const phone = optional(draft.phone);

  return listingInquiryRequestSchema.parse({
    listingId: draft.listingId,
    inquiryType: "info",
    fullName: draft.name,
    email: draft.email,
    message: lines.join("\n"),
    ...(phone !== undefined ? { phone } : {}),
  });
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function zipPreferredShowingDates(
  dates: readonly string[],
  times: readonly string[],
): string[] {
  if (dates.length > 3 || times.length > 3) {
    throw new Error("Choose at most three preferred showing times.");
  }

  return Array.from(
    { length: Math.max(dates.length, times.length) },
    (_, index) => {
      const date = dates[index]?.trim() ?? "";
      const time = times[index]?.trim() ?? "";
      if (time && !date) {
        throw new Error("Choose a date for each preferred time.");
      }
      if (date && !datePattern.test(date)) {
        throw new Error("Choose a valid preferred date.");
      }
      if (time && !timePattern.test(time)) {
        throw new Error("Choose a valid preferred time.");
      }
      return date ? `${date}${time ? ` ${time}` : ""}` : "";
    },
  ).filter(Boolean);
}

export function buildListingTourRequest(
  draft: ListingTourDraft,
): ListingInquiryRequest {
  const preferredShowingDates = zipPreferredShowingDates(
    draft.preferredDates,
    draft.preferredTimes,
  );

  const phone = optional(draft.phone);
  const message = optional(draft.message);

  return listingInquiryRequestSchema.parse({
    listingId: draft.listingId,
    inquiryType: "tour",
    fullName: draft.name,
    email: draft.email,
    preferredShowingDates,
    ...(phone !== undefined ? { phone } : {}),
    ...(message !== undefined ? { message } : {}),
    ...(draft.preApproved !== null
      ? { preApproved: draft.preApproved }
      : {}),
  });
}

export function listingInquiryValidationMessage(error: unknown): string {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    if (first?.path[0] === "email") return "Enter a valid email address.";
    if (first?.path[0] === "fullName") return "Enter your full name.";
    if (first?.path[0] === "phone") return "Phone must be 50 characters or fewer.";
    if (first?.path[0] === "message") return "Inquiry details must be 4,000 characters or fewer.";
    return "Check the inquiry fields and try again.";
  }
  return error instanceof Error
    ? error.message
    : "Check the inquiry fields and try again.";
}

export function buildMarketplaceListingMailto({
  listingId,
  propertyAddress,
  intent,
}: MarketplaceListingContact): string {
  const subject = intent === "showing"
    ? `Showing request — ${propertyAddress}`
    : `Property information request — ${propertyAddress}`;
  const request = intent === "showing"
    ? "I would like to arrange a showing."
    : "I would like more information about this property.";
  const body = [
    request,
    `Property: ${propertyAddress}`,
    `Listing ID: ${listingId}`,
  ].join("\n");

  return `mailto:apollo@pegasusdreamscapes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
```

The builder, not either component, owns alias translation and same-index pairing. Do not filter dates and times independently.

- [ ] **Step 6: Write the real-modal client RED tests.**

Create `client/src/__tests__/listing-inquiry-contract.test.tsx` with this complete fixture. It mocks only identity, toast, and the network boundary; it opens the production modals through the real `DealActionProvider` and exercises the real DOM.

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
    user: { id: "buyer-1", email: "profile@example.com" },
    profile: {
      display_name: "Profile Buyer",
      primary_role: "buyer_investment",
    },
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

const LISTING_ID = 42;
const publicContext = {
  dealType: "LISTING",
  dealId: LISTING_ID,
  deal: {
    id: LISTING_ID,
    propertyAddress: "42 Canonical Way",
    city: "Oakland",
    state: "CA",
    zipCode: "94610",
    propertyType: "single_family",
    bedrooms: 3,
    bathrooms: "2",
    sqft: 1450,
    yearBuilt: 1958,
    images: [],
  },
  listingTerms: {
    listPrice: 825000,
    pricePerSqft: 569,
    listingType: "on_market",
    condition: "move_in_ready",
    hoa: 0,
    amenities: ["Garage"],
  },
  status: "active",
};

function response(body: unknown, status = 201) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function ModalLauncher({ action }: { action: DealActionType }) {
  const { openDealAction } = useDealAction();
  useEffect(() => {
    openDealAction(LISTING_ID, action);
  }, [action, openDealAction]);
  return null;
}

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function renderModal(action: DealActionType) {
  const client = makeClient();
  client.setQueryData(
    [`/api/deals/LISTING/${LISTING_ID}/context`],
    publicContext,
  );
  const { hook } = memoryLocation({
    path: `/marketflow/listings/${LISTING_ID}`,
    static: true,
  });
  render(
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
}

function setValue(testId: string, value: string) {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
}

function selectQuestion(label: string) {
  const checkbox = screen
    .getByText(label)
    .closest("label")
    ?.querySelector("input[type=checkbox]");
  if (!checkbox) throw new Error(`Missing checkbox for ${label}`);
  fireEvent.click(checkbox);
}

beforeEach(() => {
  boundary.toast.mockReset();
  boundary.apiRequest.mockReset().mockResolvedValue(
    response({ id: 901, status: "pending" }),
  );
});

afterEach(() => cleanup());

describe("reachable numeric listing inquiry modals", () => {
  it("Request Info requires a valid email even when phone is preferred", async () => {
    renderModal("listing_request_info");
    await screen.findByTestId("dialog-title-listing-request-info");

    setValue("input-info-name", "Taylor Buyer");
    setValue("input-info-email", "not-an-email");
    setValue("input-info-phone", "510-555-0142");
    fireEvent.click(screen.getByTestId("button-contact-phone"));
    fireEvent.click(screen.getByTestId("button-submit-listing-info"));

    await waitFor(() => expect(boundary.toast).toHaveBeenCalled());
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it("Request Info requires phone only when Phone is explicitly preferred", async () => {
    renderModal("listing_request_info");
    await screen.findByTestId("dialog-title-listing-request-info");

    setValue("input-info-name", "Taylor Buyer");
    setValue("input-info-email", "taylor@example.com");
    fireEvent.click(screen.getByTestId("button-contact-phone"));
    fireEvent.click(screen.getByTestId("button-submit-listing-info"));

    await waitFor(() => expect(boundary.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Phone required" }),
    ));
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it("Request Info maps name and preserves every entered detail", async () => {
    renderModal("listing_request_info");
    await screen.findByTestId("dialog-title-listing-request-info");

    setValue("input-info-name", "  Taylor Buyer  ");
    setValue("input-info-email", "  taylor@example.com  ");
    setValue("input-info-phone", "  510-555-0142  ");
    fireEvent.click(screen.getByTestId("button-contact-phone"));
    selectQuestion("HOA fees and restrictions");
    selectQuestion("Property condition and recent updates");
    setValue(
      "input-info-custom-question",
      "  Has the roof been replaced?  ",
    );
    setValue("input-info-timeframe", "  Within 60 days  ");
    fireEvent.click(screen.getByTestId("button-submit-listing-info"));

    await waitFor(() => expect(boundary.apiRequest).toHaveBeenCalledTimes(1));
    expect(boundary.apiRequest).toHaveBeenCalledWith(
      "POST",
      "/api/listing-inquiries",
      {
        listingId: 42,
        inquiryType: "info",
        fullName: "Taylor Buyer",
        email: "taylor@example.com",
        phone: "510-555-0142",
        message: [
          "Preferred contact: Phone",
          "Question: Property condition and recent updates",
          "Question: HOA fees and restrictions",
          "Additional question: Has the roof been replaced?",
          "Timeframe: Within 60 days",
        ].join("\n"),
      },
    );
  });

  it("Schedule Showing requires valid email even with a phone", async () => {
    renderModal("listing_schedule_tour");
    await screen.findByTestId("dialog-title-listing-schedule-tour");

    setValue("input-tour-name", "Taylor Buyer");
    setValue("input-tour-email", "invalid");
    setValue("input-tour-phone", "510-555-0142");
    setValue("input-tour-date-0", "2026-08-20");
    fireEvent.click(screen.getByTestId("button-submit-listing-tour"));

    await waitFor(() => expect(boundary.toast).toHaveBeenCalled());
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it("Schedule Showing preserves indexed date/time pairs and false", async () => {
    renderModal("listing_schedule_tour");
    await screen.findByTestId("dialog-title-listing-schedule-tour");

    setValue("input-tour-name", "  Taylor Buyer  ");
    setValue("input-tour-email", "  taylor@example.com  ");
    setValue("input-tour-date-0", "2026-08-20");
    setValue("input-tour-time-0", "09:00");
    setValue("input-tour-date-1", "2026-08-21");
    setValue("input-tour-date-2", "2026-08-22");
    setValue("input-tour-time-2", "17:30");
    fireEvent.click(screen.getByTestId("button-preapproved-no"));
    setValue("input-tour-notes", "  Please confirm by email.  ");
    fireEvent.click(screen.getByTestId("button-submit-listing-tour"));

    await waitFor(() => expect(boundary.apiRequest).toHaveBeenCalledTimes(1));
    expect(boundary.apiRequest).toHaveBeenCalledWith(
      "POST",
      "/api/listing-inquiries",
      {
        listingId: 42,
        inquiryType: "tour",
        fullName: "Taylor Buyer",
        email: "taylor@example.com",
        message: "Please confirm by email.",
        preferredShowingDates: [
          "2026-08-20 09:00",
          "2026-08-21",
          "2026-08-22 17:30",
        ],
        preApproved: false,
      },
    );
  });

  it("blocks a time choice that has no same-index date", async () => {
    renderModal("listing_schedule_tour");
    await screen.findByTestId("dialog-title-listing-schedule-tour");

    setValue("input-tour-name", "Taylor Buyer");
    setValue("input-tour-email", "taylor@example.com");
    setValue("input-tour-date-0", "2026-08-20");
    setValue("input-tour-time-0", "09:00");
    setValue("input-tour-time-1", "12:00");
    fireEvent.click(screen.getByTestId("button-submit-listing-tour"));

    await waitFor(() => expect(boundary.toast).toHaveBeenCalled());
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 7: Run the two modal RED slices.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/listing-inquiry-contract.test.tsx -t "Request Info"
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/listing-inquiry-contract.test.tsx -t "Schedule Showing|time choice"
```

Expected Request Info RED: the blank preferred-phone case is already a GREEN regression lock, while malformed email still posts when Phone is preferred and the success body contains `name` plus UI-only keys instead of the exact canonical body. Expected Schedule Showing RED: malformed email plus phone posts, `input-tour-time-*` does not exist, and old aliases cannot produce the same-index canonical array.

- [ ] **Step 8: Wire both live modals to the builders and delete the dead form.**

In `client/src/contexts/deal-action-context.tsx`, add these imports:

```ts
import type { ListingInquiryRequest } from "@shared/listing-inquiry-contract";
import {
  buildListingInfoRequest,
  buildListingTourRequest,
  listingInquiryValidationMessage,
} from "@/lib/listing-inquiry";
```

Change both listing mutations from `data: any` to the canonical type:

```ts
mutationFn: async (data: ListingInquiryRequest) => {
  const res = await apiRequest("POST", "/api/listing-inquiries", data);
  return res.json();
},
```

Replace `ListingRequestInfoModal`'s submit function with:

```ts
const handleSubmit = () => {
  if (!isAuthenticated) {
    toast({
      title: "Sign in required",
      description: "Please sign in to submit an inquiry.",
    });
    return;
  }
  if (preferredContact === "phone" && !phone.trim()) {
    toast({ title: "Phone required", variant: "destructive" });
    return;
  }

  try {
    submitMutation.mutate(buildListingInfoRequest({
      listingId,
      name,
      email,
      phone,
      preferredContact,
      questions: questionOptions.filter((option) =>
        questions.includes(option),
      ),
      customQuestion,
      timeframe,
    }));
  } catch (error) {
    toast({
      title: "Check your inquiry",
      description: listingInquiryValidationMessage(error),
      variant: "destructive",
    });
  }
};
```

Change its label to the truthful required marker:

```tsx
<label className="text-sm font-medium">Email *</label>
```

Replace `ListingScheduleShowingModal`'s submit function with:

```ts
const handleSubmit = () => {
  if (!isAuthenticated) {
    toast({
      title: "Sign in required",
      description: "Please sign in to schedule a tour.",
    });
    return;
  }
  if (!preferredDates[0]?.trim()) {
    toast({ title: "Preferred date required", variant: "destructive" });
    return;
  }

  try {
    submitMutation.mutate(buildListingTourRequest({
      listingId,
      name,
      email,
      phone,
      preferredDates,
      preferredTimes,
      preApproved: isPreApproved,
      message: notes,
    }));
  } catch (error) {
    toast({
      title: "Check your tour request",
      description: listingInquiryValidationMessage(error),
      variant: "destructive",
    });
  }
};
```

Change its email label to `Email *`. Replace each old bucket `<select>` with this actual `HH:mm` input; retain the existing `updatePreferredTime` function:

```tsx
<input
  type="time"
  value={preferredTimes[index]}
  onChange={(event) => updatePreferredTime(index, event.target.value)}
  className="px-3 py-2 border rounded-md"
  aria-label={`Preferred time ${index + 1}`}
  data-testid={`input-tour-time-${index}`}
/>
```

Delete the entire unreachable block beginning with `// Legacy LISTING form - kept for backward compatibility`, including `ListingInquiryFormProps` and `ListingInquiryForm`, through the current end of file. After deletion, the closing brace of `ListingScheduleShowingModal` is the file's final production declaration. Do not leave the obsolete `preferredDate`, `preferredTime`, or no-identity POST caller behind.

- [ ] **Step 9: Run the live-modal GREEN.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/listing-inquiry-contract.test.tsx
```

Expected: PASS, 6 tests. Both validation paths make zero POSTs; the successful info and tour bodies match the literals exactly.

- [ ] **Step 10: Expand the server fixture into a live production-handler RED.**

Replace `server/__tests__/listing-inquiry-contract.test.ts` with this complete final file. The production handler factory remains conditionally loaded so the next command fails on a named missing seam; the shared schema is now a normal import because Step 4 made that boundary GREEN.

```ts
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import fs from "node:fs";
import path from "node:path";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { listingInquiryRequestSchema } from "@shared/listing-inquiry-contract";

type HandlerFactory = (dependencies: {
  getAuthUserId(req: Request): string | null;
  hasReviewedInventoryAccess(res: Response): boolean;
  getListing(id: number): Promise<Record<string, unknown> | undefined>;
  canInitiateInquiry(
    req: Request,
    res: Response,
    userId: string,
    listingId: number,
  ): Promise<boolean>;
  createListingInquiry(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
}) => {
  validateInquiry: RequestHandler;
  getContext: RequestHandler;
  postInquiry: RequestHandler;
};

const modulePath = path.join(
  process.cwd(),
  "server/listing-inquiry-routes.ts",
);
const routeModule = fs.existsSync(modulePath)
  ? await import(/* @vite-ignore */ "../listing-inquiry-routes")
  : {};
const createHandlers = (
  routeModule as { createListingInquiryRouteHandlers?: unknown }
).createListingInquiryRouteHandlers;

function requireFactory(): HandlerFactory {
  expect(
    createHandlers,
    "listing inquiries need dependency-injected production route handlers",
  ).toBeTypeOf("function");
  if (typeof createHandlers !== "function") {
    throw new Error("Listing inquiry handlers are not implemented");
  }
  return createHandlers as HandlerFactory;
}

const ACTIVE = {
  id: 42,
  submittedBy: "seller-1",
  propertyAddress: "42 Canonical Way",
  city: "Oakland",
  state: "CA",
  zipCode: "94610",
  county: "Alameda",
  propertyType: "single_family",
  bedrooms: 3,
  bathrooms: "2",
  sqft: 1450,
  yearBuilt: 1958,
  images: ["front.webp"],
  listingType: "on_market",
  listPrice: 825000,
  pricePerSqft: 569,
  condition: "move_in_ready",
  hoa: 0,
  amenities: ["Garage"],
  status: "active",
  showingInstructions: "Call tenant before entry",
  lockboxCode: "9911",
  occupancyStatus: "tenant_occupied",
  availableDate: new Date("2026-08-20T17:00:00.000Z"),
  agentName: "Private Agent",
  agentPhone: "510-555-0199",
  agentEmail: "private-agent@example.com",
  inquiryCount: 7,
  viewCount: 99,
  listedAt: new Date("2026-08-01T00:00:00.000Z"),
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-13T00:00:00.000Z"),
};
const PRIVATE = { ...ACTIVE, id: 43, status: "off_market" };
const COMING_SOON = { ...ACTIVE, id: 44, status: "coming_soon" };

const getListing = vi.fn();
const canInitiateInquiry = vi.fn();
const createListingInquiry = vi.fn();
const loadReviewedAccess = vi.fn();
let listings = new Map<number, Record<string, unknown>>();
let server: Server | undefined;
let baseUrl = "";

const authenticate: RequestHandler = (req: any, res, next) => {
  const userId = req.get("x-test-user");
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  req.user = { claims: { sub: userId } };
  next();
};

beforeAll(async () => {
  if (typeof createHandlers !== "function") return;

  const handlers = requireFactory()({
    getAuthUserId: (req: any) => req.user?.claims?.sub ?? null,
    hasReviewedInventoryAccess: (res) =>
      res.locals.canAccessReviewedMarketflowInventory === true,
    getListing,
    canInitiateInquiry,
    createListingInquiry,
  });
  const app = express();
  app.use(express.json());
  app.get(
    "/api/deals/LISTING/:id/context",
    authenticate,
    loadReviewedAccess,
    handlers.getContext,
  );
  app.post(
    "/api/listing-inquiries",
    authenticate,
    handlers.validateInquiry,
    loadReviewedAccess,
    handlers.postInquiry,
  );

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server!.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  listings = new Map([
    [42, ACTIVE],
    [43, PRIVATE],
    [44, COMING_SOON],
  ]);
  getListing.mockReset().mockImplementation(async (id: number) =>
    listings.get(id),
  );
  canInitiateInquiry.mockReset().mockImplementation(
    async (_req: Request, res: Response, userId: string, listingId: number) =>
      res.locals.canAccessReviewedMarketflowInventory === true &&
      listingId === 42 &&
      userId !== ACTIVE.submittedBy,
  );
  createListingInquiry.mockReset().mockImplementation(async (input) => ({
    id: 901,
    status: "pending",
    ...input,
  }));
  loadReviewedAccess.mockReset().mockImplementation(
    (req: Request, res: Response, next: NextFunction) => {
      res.locals.canAccessReviewedMarketflowInventory =
        req.get("x-test-reviewed") === "true";
      next();
    },
  );
});

function headers(reviewed = true) {
  return {
    "content-type": "application/json",
    "x-test-user": "buyer-1",
    "x-test-reviewed": String(reviewed),
  };
}

async function post(body: unknown, reviewed = true) {
  requireFactory();
  return fetch(`${baseUrl}/api/listing-inquiries`, {
    method: "POST",
    headers: headers(reviewed),
    body: JSON.stringify(body),
  });
}

async function getContext(id: number | string, reviewed = true) {
  requireFactory();
  return fetch(`${baseUrl}/api/deals/LISTING/${id}/context`, {
    headers: headers(reviewed),
  });
}

const validInfo = {
  listingId: 42,
  inquiryType: "info",
  fullName: "Taylor Buyer",
  email: "taylor@example.com",
  message: "Preferred contact: Email",
};

describe("listing inquiry shared request contract", () => {
  it("trims canonical fields and preserves false", () => {
    expect(listingInquiryRequestSchema.parse({
      listingId: 42,
      inquiryType: "tour",
      fullName: "  Taylor Buyer  ",
      email: "  taylor@example.com  ",
      preferredShowingDates: ["  2026-08-20 09:00  "],
      preApproved: false,
    })).toEqual({
      listingId: 42,
      inquiryType: "tour",
      fullName: "Taylor Buyer",
      email: "taylor@example.com",
      preferredShowingDates: ["2026-08-20 09:00"],
      preApproved: false,
    });
  });

  it("accepts a syntactically valid email at the 255-character boundary", () => {
    const email = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(62)}`;
    expect(email).toHaveLength(255);
    expect(listingInquiryRequestSchema.safeParse({
      listingId: 42,
      inquiryType: "info",
      fullName: "Taylor Buyer",
      email,
    }).success).toBe(true);
  });
});

describe("POST /api/listing-inquiries", () => {
  it.each([
    {
      label: "name-only and phone-only legacy request",
      body: {
        listingId: 42,
        inquiryType: "tour",
        name: "Taylor Buyer",
        phone: "510-555-0142",
        preferredDates: ["2026-08-20"],
        preferredTimes: ["morning"],
        isPreApproved: true,
      },
    },
    {
      label: "otherwise valid request with an obsolete alias",
      body: { ...validInfo, preferredDate: "2026-08-20" },
    },
    {
      label: "unsafe listing id",
      body: { ...validInfo, listingId: Number.MAX_SAFE_INTEGER + 1 },
    },
    {
      label: "email wider than varchar(255)",
      body: {
        ...validInfo,
        email: `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(63)}`,
      },
    },
  ])("rejects $label before reviewed access or storage", async ({ body }) => {
    const response = await post(body);

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(loadReviewedAccess).not.toHaveBeenCalled();
    expect(canInitiateInquiry).not.toHaveBeenCalled();
    expect(getListing).not.toHaveBeenCalled();
    expect(createListingInquiry).not.toHaveBeenCalled();
  });

  it("persists only parsed canonical tour fields", async () => {
    const response = await post({
      listingId: 42,
      inquiryType: "tour",
      fullName: "  Taylor Buyer  ",
      email: "  taylor@example.com  ",
      phone: "  510-555-0142  ",
      message: "  Please confirm by email.  ",
      preferredShowingDates: [
        "  2026-08-20 09:00  ",
        "2026-08-21",
        "2026-08-22 17:30",
      ],
      preApproved: false,
    });

    expect(response.status).toBe(201);
    expect(loadReviewedAccess).toHaveBeenCalledTimes(1);
    expect(canInitiateInquiry).toHaveBeenCalledTimes(1);
    expect(createListingInquiry).toHaveBeenCalledWith({
      listingId: 42,
      userId: "buyer-1",
      fullName: "Taylor Buyer",
      email: "taylor@example.com",
      phone: "510-555-0142",
      interestType: "tour",
      message: "Please confirm by email.",
      preferredShowingDates: [
        "2026-08-20 09:00",
        "2026-08-21",
        "2026-08-22 17:30",
      ],
      preApproved: false,
    });
  });

  it("allows reviewed first contact and persists canonical info", async () => {
    const response = await post({
      ...validInfo,
      fullName: "  Taylor Buyer  ",
      email: "  taylor@example.com  ",
      message: "  Preferred contact: Email  ",
    });

    expect(response.status).toBe(201);
    expect(loadReviewedAccess).toHaveBeenCalledTimes(1);
    expect(canInitiateInquiry).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "buyer-1",
      42,
    );
    expect(createListingInquiry).toHaveBeenCalledWith({
      listingId: 42,
      userId: "buyer-1",
      fullName: "Taylor Buyer",
      email: "taylor@example.com",
      interestType: "info",
      message: "Preferred contact: Email",
    });
  });

  it("uses one no-store 404 for an inaccessible listing", async () => {
    const response = await post({ ...validInfo, listingId: 43 });

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Listing not found" });
    expect(createListingInquiry).not.toHaveBeenCalled();
  });
});

describe("GET /api/deals/LISTING/:id/context", () => {
  it("returns a reviewed first-time buyer only the public projection", async () => {
    const response = await getContext(42, true);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      dealType: "LISTING",
      dealId: 42,
      deal: {
        id: 42,
        propertyAddress: "42 Canonical Way",
        city: "Oakland",
        state: "CA",
        zipCode: "94610",
        propertyType: "single_family",
        bedrooms: 3,
        bathrooms: "2",
        sqft: 1450,
        yearBuilt: 1958,
        images: ["front.webp"],
      },
      listingTerms: {
        listPrice: 825000,
        pricePerSqft: 569,
        listingType: "on_market",
        condition: "move_in_ready",
        hoa: 0,
        amenities: ["Garage"],
      },
      status: "active",
    });
    expect(canInitiateInquiry).not.toHaveBeenCalled();
    expect(createListingInquiry).not.toHaveBeenCalled();
  });

  it("admits a reviewed coming-soon listing to the same projection", async () => {
    const response = await getContext(44, true);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.objectContaining({ dealId: 44, status: "coming_soon" }),
    );
  });

  it("makes unreviewed, private, malformed, and missing responses identical", async () => {
    const responses = await Promise.all([
      getContext(42, false),
      getContext(43, true),
      getContext("not-a-number", true),
      getContext(999, true),
    ]);
    const observed = await Promise.all(responses.map(async (response) => ({
      status: response.status,
      cacheControl: response.headers.get("cache-control"),
      body: await response.json(),
    })));
    const hidden = {
      status: 404,
      cacheControl: "no-store",
      body: { message: "Listing not found" },
    };

    expect(observed).toEqual([hidden, hidden, hidden, hidden]);
  });
});
```

- [ ] **Step 11: Run the production-handler RED.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/listing-inquiry-contract.test.ts -t "POST|context"
```

Expected: FAIL with `listing inquiries need dependency-injected production route handlers: expected undefined to be type of function`. The shared-schema case remains GREEN; the missing seam, not a network or transform error, causes RED.

- [ ] **Step 12: Implement the focused validation, persistence, and context handlers.**

Create `server/listing-inquiry-routes.ts` exactly as follows:

```ts
import type {
  Request,
  RequestHandler,
  Response,
} from "express";
import type {
  InsertListingInquiry,
  Listing,
  ListingInquiry,
} from "@shared/schema";
import {
  listingInquiryRequestSchema,
  type ListingInquiryRequest,
} from "@shared/listing-inquiry-contract";
import { isPublicListing } from "./public-marketplace";

export interface ListingInquiryRouteDependencies {
  getAuthUserId(req: Request): string | null;
  hasReviewedInventoryAccess(res: Response): boolean;
  getListing(id: number): Promise<Listing | undefined>;
  canInitiateInquiry(
    req: Request,
    res: Response,
    userId: string,
    listingId: number,
  ): Promise<boolean>;
  createListingInquiry(
    input: InsertListingInquiry,
  ): Promise<ListingInquiry>;
}

export interface ListingInquiryRouteHandlers {
  validateInquiry: RequestHandler;
  getContext: RequestHandler;
  postInquiry: RequestHandler;
}

const setNoStore = (res: Response) => {
  res.setHeader("Cache-Control", "no-store");
};

const listingNotFound = (res: Response) => {
  setNoStore(res);
  return res.status(404).json({ message: "Listing not found" });
};

const publicListingContext = (listing: Listing) => ({
  dealType: "LISTING" as const,
  dealId: listing.id,
  deal: {
    id: listing.id,
    propertyAddress: listing.propertyAddress,
    city: listing.city,
    state: listing.state,
    zipCode: listing.zipCode,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    yearBuilt: listing.yearBuilt,
    images: listing.images,
  },
  listingTerms: {
    listPrice: listing.listPrice,
    pricePerSqft: listing.pricePerSqft,
    listingType: listing.listingType,
    condition: listing.condition,
    hoa: listing.hoa,
    amenities: listing.amenities,
  },
  status: listing.status,
});

export function createListingInquiryRouteHandlers(
  dependencies: ListingInquiryRouteDependencies,
): ListingInquiryRouteHandlers {
  const validateInquiry: RequestHandler = (req, res, next) => {
    setNoStore(res);
    const result = listingInquiryRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid listing inquiry" });
    }
    res.locals.listingInquiryRequest = result.data;
    next();
  };

  const getContext: RequestHandler = async (req, res) => {
    setNoStore(res);
    try {
      const userId = dependencies.getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!dependencies.hasReviewedInventoryAccess(res)) {
        return listingNotFound(res);
      }

      const listingId = Number(req.params.id);
      if (!Number.isSafeInteger(listingId) || listingId <= 0) {
        return listingNotFound(res);
      }
      const listing = await dependencies.getListing(listingId);
      if (!listing || !isPublicListing(listing)) {
        return listingNotFound(res);
      }

      return res.json(publicListingContext(listing));
    } catch (error) {
      console.error("Error fetching listing inquiry context:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const postInquiry: RequestHandler = async (req, res) => {
    setNoStore(res);
    try {
      const parsed = res.locals.listingInquiryRequest as
        | ListingInquiryRequest
        | undefined;
      if (!parsed) {
        return res.status(400).json({ message: "Invalid listing inquiry" });
      }
      const userId = dependencies.getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const allowed = await dependencies.canInitiateInquiry(
        req,
        res,
        userId,
        parsed.listingId,
      );
      if (!allowed) return listingNotFound(res);

      const inquiry = await dependencies.createListingInquiry({
        listingId: parsed.listingId,
        userId,
        fullName: parsed.fullName,
        email: parsed.email,
        interestType: parsed.inquiryType,
        ...(parsed.phone !== undefined ? { phone: parsed.phone } : {}),
        ...(parsed.message !== undefined ? { message: parsed.message } : {}),
        ...(parsed.preferredShowingDates !== undefined
          ? { preferredShowingDates: parsed.preferredShowingDates }
          : {}),
        ...(parsed.preApproved !== undefined
          ? { preApproved: parsed.preApproved }
          : {}),
      });
      return res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating listing inquiry:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  return { validateInquiry, getContext, postInquiry };
}
```

`validateInquiry` is a separate production handler intentionally: the production and test registrations place it before `loadMarketflowInventoryAccessContext`, making “parse before any reviewed-access/storage call” non-vacuous. The context dependency has no inquiry-reader function, so the first-contact path cannot accidentally load private inquiry rows.

- [ ] **Step 13: Run the focused handler GREEN before application wiring.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/listing-inquiry-contract.test.ts
```

Expected: PASS. The invalid table proves the reviewed-access middleware and every dependency remain untouched; reviewed first-contact info, canonical tour persistence including `preApproved: false`, and all four indistinguishable context responses pass over live HTTP.

- [ ] **Step 14: Add the production-composition RED to the structural route test.**

In `server/__tests__/public-data-route-contract.test.ts`, remove only `"/api/listing-inquiries"` from the existing `initiationRoutes` array because that generic assertion requires `auth -> load` adjacency and would forbid validation-first ordering. Leave every other route in that array unchanged.

Then add these complete tests inside the existing top-level `describe`:

```ts
it("parses listing inquiries before reviewed access and storage", () => {
  expect(routesSource).toMatch(
    /app\.post\(\s*"\/api\/listing-inquiries",\s*isHybridAuthenticated,\s*listingInquiryHandlers\.validateInquiry,\s*loadMarketflowInventoryAccessContext,\s*listingInquiryHandlers\.postInquiry,?\s*\)/s,
  );
});

it("wires the behavior-tested listing handlers into the application", () => {
  const factoryStart = routesSource.indexOf(
    "const listingInquiryHandlers = createListingInquiryRouteHandlers({",
  );
  expect(factoryStart).toBeGreaterThanOrEqual(0);
  const factoryTail = routesSource.slice(factoryStart);
  const factoryEndMatch = factoryTail.match(/\n\s*\}\);/);
  expect(factoryEndMatch?.index).toBeDefined();
  if (factoryEndMatch?.index === undefined) {
    throw new Error("listing inquiry handler factory is unterminated");
  }
  const factory = factoryTail.slice(
    0,
    factoryEndMatch.index + factoryEndMatch[0].length,
  );

  expect(factory).toContain("getAuthUserId,");
  expect(factory).toMatch(
    /hasReviewedInventoryAccess:\s*\(res\) =>\s*res\.locals\.canAccessReviewedMarketflowInventory === true/s,
  );
  expect(factory).toMatch(
    /getListing:\s*\(listingId\) => storage\.getListing\(listingId\)/,
  );
  expect(factory).toMatch(
    /canInitiateInquiry:\s*async \(req, res, userId, listingId\) => \{[\s\S]*?resolveLegacyDealAccess\(\s*req,\s*userId,\s*"listing",\s*listingId,?\s*\)[\s\S]*?access && canInitiateLegacyDealInteraction\(access, res\)/s,
  );
  expect(factory).toMatch(
    /createListingInquiry:\s*\(inquiry\) =>\s*storage\.createListingInquiry\(inquiry\)/s,
  );
  expect(routesSource).toMatch(
    /app\.get\(\s*"\/api\/deals\/LISTING\/:id\/context",\s*isHybridAuthenticated,\s*loadMarketflowInventoryAccessContext,\s*listingInquiryHandlers\.getContext,?\s*\)/s,
  );
  const focusedContextIndex = routesSource.search(
    /app\.get\(\s*"\/api\/deals\/LISTING\/:id\/context"/s,
  );
  const genericContextIndex = routesSource.indexOf(
    "app.get('/api/deals/:dealType/:id/context'",
  );
  expect(focusedContextIndex).toBeGreaterThanOrEqual(0);
  expect(genericContextIndex).toBeGreaterThanOrEqual(0);
  expect(focusedContextIndex).toBeLessThan(genericContextIndex);
  expect(routesSource).toMatch(
    /app\.get\(\s*'\/api\/deals\/:dealType\/:id\/context',\s*isHybridAuthenticated,\s*async/s,
  );
  const genericContextEnd = routesSource.indexOf(
    "// --- Buyer Offers (Supabase) ---",
    genericContextIndex,
  );
  expect(genericContextEnd).toBeGreaterThan(genericContextIndex);
  const genericContext = routesSource.slice(
    genericContextIndex,
    genericContextEnd,
  );
  expect(genericContext).not.toMatch(/dealType === ['"]LISTING['"]/);
  expect(genericContext).not.toContain("getListingInquiries");
  expect(genericContext).not.toContain("showingInfo:");
  expect(genericContext).not.toContain(
    "submittedBy: listing.submittedBy",
  );
});
```

This file remains structural only for composition and middleware order. The live Express suite owns all behavioral assertions.

- [ ] **Step 15: Run the production-composition RED.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/public-data-route-contract.test.ts
```

Expected: FAIL in the two new cases because the focused context route and validation-first POST composition are absent.

- [ ] **Step 16: Compose the tested handlers into `server/routes.ts`.**

Add the import:

```ts
import { createListingInquiryRouteHandlers } from "./listing-inquiry-routes";
```

Immediately after the existing `canInitiateLegacyDealInteraction` declaration, instantiate the handlers with the existing production access policy and storage methods:

```ts
const listingInquiryHandlers = createListingInquiryRouteHandlers({
  getAuthUserId,
  hasReviewedInventoryAccess: (res) =>
    res.locals.canAccessReviewedMarketflowInventory === true,
  getListing: (listingId) => storage.getListing(listingId),
  canInitiateInquiry: async (req, res, userId, listingId) => {
    const access = await resolveLegacyDealAccess(
      req,
      userId,
      "listing",
      listingId,
    );
    return Boolean(
      access && canInitiateLegacyDealInteraction(access, res),
    );
  },
  createListingInquiry: (inquiry) =>
    storage.createListingInquiry(inquiry),
});
```

Immediately before the unchanged generic unified-context registration, add this focused route. Express routing is case-insensitive by default, so the uppercase literal serves both `/LISTING/42/context` and `/listing/42/context`; the live handler fixture covers the uppercase production caller and the structural test locks registration precedence.

```ts
app.get(
  "/api/deals/LISTING/:id/context",
  isHybridAuthenticated,
  loadMarketflowInventoryAccessContext,
  listingInquiryHandlers.getContext,
);
```

Leave the existing generic `app.get('/api/deals/:dealType/:id/context', isHybridAuthenticated, async ...)` registration and its WHOLESALE_ASSIGNMENT/wholesale and CAPITAL_RAISE/capital branches otherwise unchanged; do not add the reviewed-access loader to that generic route. Delete only its old `else if (dealType === 'LISTING' || dealType === 'listing')` branch, including its inquiry lookup, private showing/contact projection, owner ID, and permissions. Change the final invalid-type response to:

```ts
return res.status(400).json({
  message:
    "Invalid dealType. Must be WHOLESALE_ASSIGNMENT or CAPITAL_RAISE",
});
```

At the existing listing-inquiry registration below the listing owner PATCH, replace the raw callback. The opening marker must remain on one physical line exactly as shown because `owner-update-route-contract.test.ts` uses the literal `app.post("/api/listing-inquiries"` as the listing PATCH slice terminator:

```ts
app.post("/api/listing-inquiries",
  isHybridAuthenticated,
  listingInquiryHandlers.validateInquiry,
  loadMarketflowInventoryAccessContext,
  listingInquiryHandlers.postInquiry,
);
```

The exact order is security-significant: hybrid authentication establishes identity, strict validation rejects aliases and bounds without profile/storage work, reviewed access is then resolved, and only then may the persistence handler resolve listing interaction access.

- [ ] **Step 17: Run server wiring and governance GREEN.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run server/__tests__/listing-inquiry-contract.test.ts server/__tests__/public-data-route-contract.test.ts server/__tests__/owner-update-route-contract.test.ts
```

Expected: PASS. The unchanged owner-update test proves the literal POST marker still bounds the listing PATCH slice; the live handler test and structural registrar test prove behavior and composition separately.

- [ ] **Step 18: Write the UUID property-page behavioral RED.**

Create `client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx` exactly as follows. It mounts the production page, supplies the real public Supabase DTO shape, and keeps the old deal-action hook available solely so the pre-fix page reaches an assertion instead of crashing.

```tsx
import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
  render,
  screen,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { TooltipProvider } from "@/components/ui/tooltip";

const boundary = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  openDealAction: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: "buyer-1", email: "buyer@example.com" },
    profile: { primary_role: "buyer_investment" },
  }),
}));

vi.mock("@/contexts/deal-action-context", () => ({
  useDealAction: () => ({ openDealAction: boundary.openDealAction }),
}));

vi.mock("@/contexts/peggy-context", () => ({
  usePeggyContext: () => ({
    setDealContext: vi.fn(),
    setPendingPrompt: vi.fn(),
    openChat: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: boundary.toast }),
}));

vi.mock("@/lib/queryClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queryClient")>(
    "@/lib/queryClient",
  );
  return { ...actual, apiRequest: boundary.apiRequest };
});

import MarketplacePropertyDetailPage from "@/pages/marketplace-property-detail";

const UUID = "c0ffee00-e29b-41d4-a716-446655440000";
const ADDRESS = "900 UUID Lane";

function expectedMailto(intent: "info" | "showing") {
  const subject = intent === "showing"
    ? `Showing request — ${ADDRESS}`
    : `Property information request — ${ADDRESS}`;
  const request = intent === "showing"
    ? "I would like to arrange a showing."
    : "I would like more information about this property.";
  const body = [
    request,
    `Property: ${ADDRESS}`,
    `Listing ID: ${UUID}`,
  ].join("\n");
  return `mailto:apollo@pegasusdreamscapes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  client.setQueryData(["/api/supabase/listings", UUID], {
    id: UUID,
    title: "UUID listing",
    propertyAddress: ADDRESS,
    city: "Oakland",
    state: "CA",
    zipCode: "94610",
    propertyType: "single_family",
    listingType: "retail",
    listPrice: 900000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    lotSize: "4,500 sqft",
    yearBuilt: 1962,
    description: "Reviewed inventory fixture.",
    images: [],
    features: ["Garage"],
    status: "active",
  });
  const { hook } = memoryLocation({
    path: `/marketflow/properties/${UUID}`,
    static: true,
  });

  render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Router hook={hook}>
          <MarketplacePropertyDetailPage />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  boundary.apiRequest.mockReset().mockResolvedValue(
    new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  boundary.openDealAction.mockReset();
  boundary.toast.mockReset();
});

afterEach(() => cleanup());

describe("UUID-backed Supabase property detail", () => {
  it("contains no UUID-to-number coercion", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "client/src/pages/marketplace-property-detail.tsx",
      ),
      "utf8",
    );

    expect(source).not.toMatch(
      /(?:Number|parseInt)\s*\(\s*(?:propertyId|listing\.id)/,
    );
  });

  it("uses truthful direct contact without numeric listing actions", async () => {
    renderPage();
    expect(await screen.findByText(ADDRESS)).toBeInTheDocument();

    const infoHref = expectedMailto("info");
    expect(screen.getByTestId("button-request-info")).toHaveAttribute(
      "href",
      infoHref,
    );
    expect(screen.getByTestId("button-request-info")).toHaveTextContent(
      "Request Info",
    );
    expect(screen.getByTestId("button-schedule-showing")).toHaveAttribute(
      "href",
      expectedMailto("showing"),
    );
    expect(screen.getByTestId("button-schedule-showing")).toHaveTextContent(
      "Schedule Showing",
    );
    expect(screen.getByTestId("button-contact")).toHaveAttribute(
      "href",
      infoHref,
    );
    expect(screen.getByTestId("button-contact")).toHaveTextContent(
      "Request Info",
    );

    expect(screen.getByTestId("button-make-offer")).toBeInTheDocument();
    expect(screen.getByTestId("button-save-listing")).toBeInTheDocument();
    expect(screen.queryByTestId("button-ask-peggy-retail")).not.toBeInTheDocument();
    expect(screen.getByTestId("link-property-email")).toHaveAttribute(
      "href",
      "mailto:apollo@pegasusdreamscapes.com",
    );
    expect(screen.getByTestId("link-property-phone")).toHaveAttribute(
      "href",
      "tel:+19257448525",
    );
    expect(boundary.openDealAction).not.toHaveBeenCalled();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const analyticsPosts = boundary.apiRequest.mock.calls.filter(
      ([method, url]) => method === "POST" && url === "/api/analytics/track",
    );
    expect(analyticsPosts).toEqual([]);
  });
});
```

- [ ] **Step 19: Run the UUID page RED.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx
```

Expected: FAIL in both tests: the narrow source invariant finds `Number(propertyId)` and `parseInt(listing.id)`, while the behavior case finds buttons without mailto `href` values, a numeric analytics POST, and the numeric-only Peggy action. The offer, save, generic email, and phone assertions describe the paths that must remain.

- [ ] **Step 20: Make the Supabase/UUID page source-truthful.**

In `client/src/pages/marketplace-property-detail.tsx`:

1. Change `useState, useEffect` to `useState`; remove `useAnalytics`, `useDealAction`, `AskPeggyButton`, and the unused `RetailListing, InsertBuyerOffer` type import.
2. Add `buildMarketplaceListingMailto` from `@/lib/listing-inquiry`.
3. Add this endpoint DTO next to the imports and use it for the query and `OfferModalProps`:

```ts
interface SupabaseListingDetail {
  id: string;
  title: string;
  propertyAddress: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  listingType: "retail" | "investment" | "wholesale";
  listPrice: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  description?: string;
  features?: string[];
  images?: string[];
  status: string;
}
```

Use the endpoint type:

```ts
const { data: listing, isLoading, error } =
  useQuery<SupabaseListingDetail>({
    queryKey: ["/api/supabase/listings", propertyId],
    enabled: !!propertyId,
  });
```

Delete `const { openDealAction } = useDealAction()`, `const { trackListingView } = useAnalytics()`, and the entire `useEffect` that parses `listing.id`. Also delete the `listing.featured` badge conditional because the public Supabase listing DTO does not expose that field.

After `canMakeOffer`, construct the two source-aware direct links:

```ts
const requestInfoHref = buildMarketplaceListingMailto({
  listingId: listing.id,
  propertyAddress: listing.propertyAddress,
  intent: "info",
});
const scheduleShowingHref = buildMarketplaceListingMailto({
  listingId: listing.id,
  propertyAddress: listing.propertyAddress,
  intent: "showing",
});
```

Replace the main Request Info and Schedule Showing buttons with these exact anchors. The test IDs and labels remain stable; `Mail` communicates that Request Info opens email:

```tsx
<Button variant="outline" className="w-full" asChild>
  <a href={requestInfoHref} data-testid="button-request-info">
    <Mail className="h-4 w-4 mr-2" />
    Request Info
  </a>
</Button>
<Button variant="outline" className="w-full" asChild>
  <a
    href={scheduleShowingHref}
    data-testid="button-schedule-showing"
  >
    <Calendar className="h-4 w-4 mr-2" />
    Schedule Showing
  </a>
</Button>
```

Replace the contact-card action with the same information href and stable label/test ID:

```tsx
<Button
  variant="outline"
  className="w-full justify-start"
  asChild
>
  <a href={requestInfoHref} data-testid="button-contact">
    <Mail className="h-4 w-4 mr-2" />
    Request Info
  </a>
</Button>
```

Keep the separate generic `link-property-email` exactly `mailto:apollo@pegasusdreamscapes.com` and `link-property-phone` exactly `tel:+19257448525`; those are visible general-contact alternatives, while the three button-style links carry listing context. Keep Make an Offer and both save controls unchanged. Delete the UUID page's `AskPeggyButton`: that component parses string IDs into numeric deal context, so it cannot truthfully represent a UUID listing until Peggy's contract supports strings.

Delete this complete production block together with its import:

```tsx
{propertyId && (
  <AskPeggyButton
    dealType="retail"
    dealId={propertyId}
    dealLabel={listing.propertyAddress}
    fullWidth
  />
)}
```

Finally change both `OfferModalProps.listing` and the `OfferModal` parameter's inferred value to `SupabaseListingDetail`. This removes the false numeric `RetailListing.id` assumption without changing the working Supabase offer payload, which already uses `String(listing.id)`.

- [ ] **Step 21: Run Task 2 verification from focused to broad.**

Run the UUID page GREEN:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx
```

Expected: PASS, 2 tests, with no UUID-to-number source coercion, zero numeric listing-modal calls, zero analytics POSTs on mount, and no numeric-only Peggy action.

Run the complete focused Task 2 gate:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/listing-inquiry-contract.test.tsx client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx server/__tests__/listing-inquiry-contract.test.ts server/__tests__/public-data-route-contract.test.ts server/__tests__/owner-update-route-contract.test.ts
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check
git diff --check
```

Expected: all five files PASS; TypeScript exits 0 and proves the UUID DTO, handler dependencies, and request types agree; diff check exits 0.

Then run the repository regression gate required before review:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm test
```

Expected: PASS with no failed files. If a failure is unrelated but reproducible at accepted Task 1 HEAD, stop and record exact before/after evidence; do not weaken or skip it. No production build is needed because Task 2 changes no build configuration or route chunk boundary.

- [ ] **Step 22: Inspect the exact diff, stage only Task 2, and create the one implementation commit.**

First inspect scope and hygiene:

```bash
git status --short --untracked-files=no
git status --short
git diff --stat
git diff -- shared/listing-inquiry-contract.ts client/src/lib/listing-inquiry.ts client/src/contexts/deal-action-context.tsx client/src/pages/marketplace-property-detail.tsx server/listing-inquiry-routes.ts server/routes.ts client/src/__tests__/listing-inquiry-contract.test.tsx client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx server/__tests__/listing-inquiry-contract.test.ts server/__tests__/public-data-route-contract.test.ts
```

Expected: the tracked-only status and diff contain only the ten named Task 2 paths; the full status may additionally show only `?? .recovery/`, which must not be staged. No migration, dependency lockfile, ledger, parent plan, generated artifact, or unrelated tracked file is present.

Stage the exact manifest and nothing else:

```bash
git add -- shared/listing-inquiry-contract.ts client/src/lib/listing-inquiry.ts client/src/contexts/deal-action-context.tsx client/src/pages/marketplace-property-detail.tsx server/listing-inquiry-routes.ts server/routes.ts client/src/__tests__/listing-inquiry-contract.test.tsx client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx server/__tests__/listing-inquiry-contract.test.ts server/__tests__/public-data-route-contract.test.ts
git diff --cached --name-only
```

Expected exact sorted path set (10 paths):

```text
client/src/__tests__/listing-inquiry-contract.test.tsx
client/src/__tests__/marketplace-property-detail-listing-actions.test.tsx
client/src/contexts/deal-action-context.tsx
client/src/lib/listing-inquiry.ts
client/src/pages/marketplace-property-detail.tsx
server/__tests__/listing-inquiry-contract.test.ts
server/__tests__/public-data-route-contract.test.ts
server/listing-inquiry-routes.ts
server/routes.ts
shared/listing-inquiry-contract.ts
```

Commit once:

```bash
git commit -m "fix: align listing inquiry contracts"
git status --short --untracked-files=no
git status --short
git show --stat --oneline --decorate HEAD
```

Expected: one implementation commit named exactly `fix: align listing inquiry contracts`; clean tracked worktree; full status may show only the intentionally untracked `.recovery/`; the commit contains exactly the ten paths above. Never stage `.recovery/`. Do not amend Task 1 or include controller acceptance bookkeeping. Return the commit SHA plus every RED/GREEN command and outcome for specification review, then code-quality review, under the parent program's closure protocol.
