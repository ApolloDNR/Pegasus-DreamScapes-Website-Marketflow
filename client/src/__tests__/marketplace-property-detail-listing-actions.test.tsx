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
