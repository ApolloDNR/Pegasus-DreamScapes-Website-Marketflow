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
  authenticatedJsonRequest: vi.fn(),
  apiRequest: vi.fn(),
  openDealAction: vi.fn(),
  requestedUrls: [] as string[],
  toast: vi.fn(),
}));

const authState = vi.hoisted(() => ({
  accessToken: "buyer-token" as string | null,
  userId: "buyer-1" as string | null,
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: Boolean(authState.userId),
    isLoading: false,
    isGuestMode: false,
    guestRole: null,
    userRole: "buyer_investment",
    user: authState.userId
      ? { id: authState.userId, email: "buyer@example.com" }
      : null,
    session: authState.accessToken && authState.userId
      ? {
          access_token: authState.accessToken,
          user: { id: authState.userId },
        }
      : null,
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
  return {
    ...actual,
    apiRequest: boundary.apiRequest,
    authenticatedJsonRequest: boundary.authenticatedJsonRequest,
  };
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
  client.setQueryData([
    "/api/supabase/listings",
    UUID,
    { authenticatedSubject: "buyer-1" },
  ], {
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

function renderLegacyPage() {
  const fixture = {
    id: 72,
    propertyAddress: "72 Correct Route Ave",
    city: "Oakland",
    state: "CA",
    zipCode: "94610",
    propertyType: "Single Family",
    listingType: "on_market",
    listPrice: 825_000,
    bedrooms: 3,
    bathrooms: "2.5",
    sqft: 1_725,
    lotSize: "5,100 sqft",
    yearBuilt: 1968,
    description: "Reviewed legacy inventory fixture.",
    images: [],
    highlights: ["Updated kitchen"],
    status: "active",
  };
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        queryFn: async ({ queryKey }) => {
          const url = queryKey.join("/");
          boundary.requestedUrls.push(url);
          if (url === "/api/listings/72") return fixture;
          throw new Error(`Unexpected listing request: ${url}`);
        },
      },
      mutations: { retry: false },
    },
  });
  boundary.authenticatedJsonRequest.mockImplementation(async (url: string) => {
    boundary.requestedUrls.push(url);
    if (url === "/api/listings/72") return fixture;
    throw new Error(`Unexpected authenticated listing request: ${url}`);
  });
  const { hook } = memoryLocation({
    path: "/marketflow/listings/72",
    static: true,
  });

  render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Router hook={hook}>
          <MarketplacePropertyDetailPage inventorySource="legacy" />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  authState.accessToken = "buyer-token";
  authState.userId = "buyer-1";
  boundary.authenticatedJsonRequest.mockReset();
  boundary.apiRequest.mockReset().mockResolvedValue(
    new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  boundary.openDealAction.mockReset();
  boundary.requestedUrls.length = 0;
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

  it("does not render a prior viewer's cached UUID listing to a later identity", async () => {
    const privateAddress = "900 Private UUID Lane";
    const priorListing = {
      id: UUID,
      propertyAddress: privateAddress,
      city: "Oakland",
      state: "CA",
      propertyType: "single_family",
      listingType: "retail",
      listPrice: 900_000,
      images: [],
      status: "active",
    };
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 120_000,
          gcTime: 600_000,
        },
      },
    });
    client.setQueryData(["/api/supabase/listings", UUID], priorListing);
    client.setQueryData(
      [
        "/api/supabase/listings",
        UUID,
        { authenticatedSubject: "approved-user" },
      ],
      priorListing,
    );
    authState.userId = "later-user";
    authState.accessToken = "later-user-token";
    boundary.authenticatedJsonRequest.mockRejectedValue(
      new Error("403 Forbidden"),
    );
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

    expect(await screen.findByText("Property Not Found")).toBeInTheDocument();
    expect(screen.queryByText(privateAddress)).not.toBeInTheDocument();
    expect(boundary.authenticatedJsonRequest).toHaveBeenCalledWith(
      `/api/supabase/listings/${UUID}`,
      "later-user-token",
    );
  });
});

describe("reviewed legacy listing detail", () => {
  it("loads the same inventory source as the listing card and keeps actions on the listing workflow", async () => {
    renderLegacyPage();

    expect(
      await screen.findByText("72 Correct Route Ave"),
    ).toBeInTheDocument();
    expect(boundary.requestedUrls).toContain("/api/listings/72");
    expect(boundary.requestedUrls).not.toContain(
      "/api/supabase/listings/72",
    );
    expect(screen.getByText("Updated kitchen")).toBeInTheDocument();
    expect(screen.getByTestId("button-back")).toHaveTextContent(
      "Back to MarketFlow",
    );
    expect(screen.queryByTestId("button-make-offer")).not.toBeInTheDocument();

    screen.getByTestId("button-request-info").click();
    expect(boundary.openDealAction).toHaveBeenLastCalledWith(
      "72",
      "listing_request_info",
    );

    screen.getByTestId("button-schedule-showing").click();
    expect(boundary.openDealAction).toHaveBeenLastCalledWith(
      "72",
      "listing_schedule_tour",
    );

    screen.getByTestId("button-contact").click();
    expect(boundary.openDealAction).toHaveBeenLastCalledWith(
      "72",
      "listing_request_info",
    );
  });

  it("does not render a prior viewer's cached listing to a later identity", async () => {
    const privateAddress = "72 Private Cache Ave";
    const priorListing = {
      id: 72,
      propertyAddress: privateAddress,
      city: "Oakland",
      state: "CA",
      propertyType: "Single Family",
      listingType: "on_market",
      listPrice: 825_000,
      images: [],
      status: "active",
    };
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 120_000,
          gcTime: 600_000,
          queryFn: vi.fn().mockRejectedValue(new Error("403 Forbidden")),
        },
      },
    });
    client.setQueryData(["/api/listings", "72"], priorListing);
    client.setQueryData(
      ["/api/listings", "72", { authenticatedSubject: "approved-user" }],
      priorListing,
    );
    authState.userId = "later-user";
    authState.accessToken = "later-user-token";
    boundary.authenticatedJsonRequest.mockRejectedValue(
      new Error("403 Forbidden"),
    );
    const { hook } = memoryLocation({
      path: "/marketflow/listings/72",
      static: true,
    });

    render(
      <QueryClientProvider client={client}>
        <TooltipProvider>
          <Router hook={hook}>
            <MarketplacePropertyDetailPage inventorySource="legacy" />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Property Not Found")).toBeInTheDocument();
    expect(screen.queryByText(privateAddress)).not.toBeInTheDocument();
    expect(boundary.authenticatedJsonRequest).toHaveBeenCalledWith(
      "/api/listings/72",
      "later-user-token",
    );
  });

  it("does not request or reveal reviewed inventory without a real user", async () => {
    const privateAddress = "72 Guest Cache Ave";
    const priorListing = {
      id: 72,
      propertyAddress: privateAddress,
      city: "Oakland",
      state: "CA",
      propertyType: "Single Family",
      listingType: "on_market",
      listPrice: 825_000,
      images: [],
      status: "active",
    };
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 120_000,
          gcTime: 600_000,
        },
      },
    });
    client.setQueryData(["/api/listings", "72"], priorListing);
    client.setQueryData(
      ["/api/listings", "72", { authenticatedSubject: "approved-user" }],
      priorListing,
    );
    authState.userId = null;
    authState.accessToken = null;
    const { hook } = memoryLocation({
      path: "/marketflow/listings/72",
      static: true,
    });

    render(
      <QueryClientProvider client={client}>
        <TooltipProvider>
          <Router hook={hook}>
            <MarketplacePropertyDetailPage inventorySource="legacy" />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Property Not Found")).toBeInTheDocument();
    expect(screen.queryByText(privateAddress)).not.toBeInTheDocument();
    expect(boundary.authenticatedJsonRequest).not.toHaveBeenCalled();
  });
});
