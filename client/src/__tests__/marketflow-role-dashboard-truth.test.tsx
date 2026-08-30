import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

type QueryResult = {
  data?: unknown;
  isLoading: boolean;
  isError: boolean;
  isFetching?: boolean;
  refetch?: () => Promise<unknown>;
};

const authenticatedResults = vi.hoisted(() => new Map<string, QueryResult>());
const plainResults = vi.hoisted(() => new Map<string, QueryResult>());
const authState = vi.hoisted(() => ({
  isAuthenticated: true,
  isGuestMode: false,
  userRole: "buyer_investment",
  profile: { is_pegasus_badged: false },
}));

const ready = (data: unknown): QueryResult => ({
  data,
  isLoading: false,
  isError: false,
  isFetching: false,
  refetch: vi.fn().mockResolvedValue(undefined),
});

const unavailable = (): QueryResult => ({
  data: undefined,
  isLoading: false,
  isError: true,
  isFetching: false,
  refetch: vi.fn().mockResolvedValue(undefined),
});

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: ({ queryKey }: { queryKey: unknown[] }) =>
      plainResults.get(queryKey.map(String).join("/")) ?? ready([]),
    useMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  };
});

vi.mock("@/hooks/use-authenticated-query", () => ({
  useAuthenticatedQuery: (queryKey: unknown[]) =>
    authenticatedResults.get(queryKey.map(String).join("/")) ?? ready([]),
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: { id: "member-1", email: "member@example.com" },
    session: { user: { id: "member-1" }, access_token: "test-token" },
    ...authState,
  }),
}));

vi.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/guest-preview-banner", () => ({
  GuestPreviewBanner: () => null,
}));

import MarketplaceWholesaler from "@/pages/marketplace-wholesaler";
import MarketplaceDreamscaper from "@/pages/marketplace-dreamscaper";
import MarketplaceBuyer from "@/pages/marketplace-buyer";
import MarketplaceProperties from "@/pages/marketplace-properties";

function renderAt(path: string, node: React.ReactNode) {
  const { hook } = memoryLocation({ path, static: true });
  return render(<Router hook={hook}>{node}</Router>);
}

function setAuthenticatedResult(key: string, result: QueryResult) {
  authenticatedResults.set(key, result);
}

beforeEach(() => {
  authenticatedResults.clear();
  plainResults.clear();
  authState.isAuthenticated = true;
  authState.isGuestMode = false;
  authState.userRole = "buyer_investment";
  authState.profile = { is_pegasus_badged: false };
});

afterEach(() => {
  cleanup();
});

describe("MarketFlow role dashboards fail closed and describe the controlled pilot truthfully", () => {
  it("does not turn wholesaler API failures into zero metrics or empty inboxes", () => {
    setAuthenticatedResult("/api/supabase/marketplace/wholesaler/stats", unavailable());
    setAuthenticatedResult("/api/supabase/wholesale-deals/my", unavailable());
    setAuthenticatedResult("/api/marketplace/wholesaler/jv-requests", unavailable());

    renderAt("/marketflow/wholesaler", <MarketplaceWholesaler />);

    expect(screen.getAllByText("Unavailable")).toHaveLength(4);
    expect(screen.getByTestId("state-wholesaler-deals-unavailable")).toHaveTextContent(
      "No empty deal history is being inferred",
    );
    expect(screen.getByTestId("state-wholesaler-jv-unavailable")).toHaveTextContent(
      "No empty request inbox is being inferred",
    );
    expect(screen.queryByText("No deals yet")).not.toBeInTheDocument();
    expect(screen.queryByText("No pending requests")).not.toBeInTheDocument();
  });

  it("keeps real wholesaler actions and removes an inert profile control", () => {
    setAuthenticatedResult(
      "/api/supabase/marketplace/wholesaler/stats",
      ready({ active: 1, pending: 0, sold: 0, totalVolume: 0 }),
    );
    setAuthenticatedResult("/api/supabase/wholesale-deals/my", ready([]));
    setAuthenticatedResult(
      "/api/marketplace/wholesaler/jv-requests",
      ready([
        {
          id: 7,
          dealId: 42,
          dreamscaperId: "dreamscaper-1",
          wholesalerId: "member-1",
          message: "Interested in discussing this project.",
          intendedStrategy: "renovation",
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    );

    renderAt("/marketflow/wholesaler", <MarketplaceWholesaler />);

    expect(screen.getByRole("button", { name: "Accept" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Decline" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "View Profile" })).not.toBeInTheDocument();
    expect(screen.getByTestId("button-apply-pegasus").closest("a")).toHaveAttribute(
      "href",
      "/marketflow/access",
    );
  });

  it("does not present DreamScaper funding outcomes as website-verified activity", () => {
    setAuthenticatedResult(
      "/api/supabase/marketplace/dreamscaper/stats",
      ready({
        activeProjects: 1,
        totalRaised: 900_000,
        totalFundingGoal: 1_000_000,
        projectsCompleted: 2,
      }),
    );
    setAuthenticatedResult(
      "/api/supabase/capital-projects/my",
      ready([
        {
          id: 9,
          title: "Example private project",
          location: "Contra Costa County, CA",
          status: "FUNDING",
          amountRaised: 900_000,
          fundingGoal: 1_000_000,
        },
      ]),
    );

    renderAt("/marketflow/dreamscaper", <MarketplaceDreamscaper />);

    expect(screen.queryByText("Capital Raised")).not.toBeInTheDocument();
    expect(screen.queryByText("Funding Progress")).not.toBeInTheDocument();
    expect(screen.queryByText("$900K / $1000K")).not.toBeInTheDocument();
    expect(screen.getByTestId("notice-capital-coordination-boundary")).toHaveTextContent(
      "does not verify funds raised, commitments, or completed financing",
    );
  });

  it("does not turn DreamScaper API failures into zero projects", () => {
    setAuthenticatedResult("/api/supabase/marketplace/dreamscaper/stats", unavailable());
    setAuthenticatedResult("/api/supabase/capital-projects/my", unavailable());

    renderAt("/marketflow/dreamscaper", <MarketplaceDreamscaper />);

    expect(screen.getAllByText("Unavailable")).toHaveLength(2);
    expect(screen.getByTestId("state-dreamscaper-projects-unavailable")).toHaveTextContent(
      "No empty project history is being inferred",
    );
    expect(screen.queryByText("No projects yet")).not.toBeInTheDocument();
  });

  it("shows explicit buyer data failures on the dashboard and dedicated workspaces", () => {
    setAuthenticatedResult("/api/supabase/marketplace/buyer/stats", unavailable());
    setAuthenticatedResult("/api/supabase/saved-items", unavailable());
    setAuthenticatedResult("/api/supabase/buyer-offers", unavailable());

    const dashboard = renderAt("/marketflow/buyer", <MarketplaceBuyer />);
    expect(screen.getAllByText("Unavailable")).toHaveLength(4);
    expect(screen.getByTestId("state-buyer-saved-unavailable")).toBeInTheDocument();
    expect(screen.getByTestId("state-buyer-offers-unavailable")).toBeInTheDocument();
    expect(screen.queryByText("No saved properties yet")).not.toBeInTheDocument();
    expect(screen.queryByText("No offers submitted yet")).not.toBeInTheDocument();
    dashboard.unmount();

    const saved = renderAt("/marketflow/buyer/saved", <MarketplaceBuyer />);
    expect(screen.getByTestId("state-buyer-saved-unavailable")).toHaveTextContent(
      "No empty saved list is being inferred",
    );
    saved.unmount();

    renderAt("/marketflow/buyer/offers", <MarketplaceBuyer />);
    expect(screen.getByTestId("state-buyer-offers-unavailable")).toHaveTextContent(
      "No empty offer history is being inferred",
    );
  });

  it("distinguishes unavailable property data from an empty controlled-pilot registry", () => {
    setAuthenticatedResult("/api/supabase/listings", unavailable());
    const failed = renderAt("/marketflow/properties", <MarketplaceProperties />);

    expect(screen.getByTestId("state-property-records-unavailable")).toHaveTextContent(
      "No empty inventory is being inferred",
    );
    expect(screen.queryByText("Check back soon for new listings")).not.toBeInTheDocument();
    failed.unmount();

    setAuthenticatedResult("/api/supabase/listings", ready([]));
    renderAt("/marketflow/properties", <MarketplaceProperties />);

    expect(screen.getByRole("heading", { name: "No reviewed property records" })).toBeInTheDocument();
    expect(screen.getByText(/controlled pilot/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grid view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "List view" })).toBeInTheDocument();
  });

  it("does not present guest preview or account creation as property-record access", () => {
    authState.isAuthenticated = false;
    authState.isGuestMode = true;
    setAuthenticatedResult("/api/supabase/listings", ready([]));

    renderAt("/marketflow/properties", <MarketplaceProperties />);

    expect(screen.getByTestId("state-property-access-required")).toHaveTextContent(
      "Guest preview and account creation do not grant access",
    );
    expect(screen.queryByRole("heading", { name: "No reviewed property records" })).not.toBeInTheDocument();
  });
});
