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
