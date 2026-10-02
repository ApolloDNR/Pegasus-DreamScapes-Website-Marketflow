import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Router, Route } from "wouter";
import { memoryLocation } from "wouter/memory-location";

const boundary = vi.hoisted(() => ({
  deal: {} as Record<string, unknown>,
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: { id: "buyer-1" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/hooks/use-seo", () => ({ useSEO: () => {} }));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/offer-studio", () => ({
  OfferStudio: () => null,
}));
vi.mock("@/components/quick-counter-offer", () => ({
  QuickCounterOffer: () => null,
}));
vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(),
  queryClient: { invalidateQueries: vi.fn() },
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: unknown[] }) => {
    const [path] = queryKey;
    if (path === "/api/wholesale-deals") {
      return { data: boundary.deal, isLoading: false };
    }
    if (path === "/api/marketflow/negotiations/deal") {
      return { data: [], isLoading: false };
    }
    return { data: undefined, isLoading: false, refetch: vi.fn() };
  },
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import MarketflowNegotiate from "@/pages/marketflow-negotiate";

function renderRoute() {
  const { hook } = memoryLocation({
    path: "/marketflow/negotiate/WHOLESALE/9001",
    static: true,
  });
  return render(
    <Router hook={hook}>
      <Route path="/marketflow/negotiate/:lane/:id">
        <MarketflowNegotiate />
      </Route>
    </Router>,
  );
}

beforeEach(() => {
  boundary.deal = {
    id: 9001,
    propertyAddress: "9001 Truth Way",
    city: "Oakland",
    state: "CA",
    propertyType: "Single Family",
    submittedBy: "seller-1",
  };
});

afterEach(() => cleanup());

describe("MarketFlow negotiation financial truth", () => {
  it("shows missing record values explicitly and withholds financial actions", () => {
    renderRoute();
    expect(screen.queryByTestId("button-new-offer")).toBeNull();
    expect(screen.getByTestId("state-negotiation-financials-incomplete")).toHaveTextContent(
      /price, ARV, and repairs/i,
    );
    fireEvent.click(screen.getByTestId("tab-terms"));

    for (const testId of [
      "text-terms-asking-price",
      "text-terms-contract-price",
      "text-terms-assignment-fee",
      "text-terms-arv",
      "text-terms-repairs",
    ]) {
      expect(screen.getByTestId(testId)).toHaveTextContent("Not provided");
    }
  });

  it("keeps financial actions available for a complete reviewed record", () => {
    boundary.deal = {
      ...boundary.deal,
      askingPrice: 200_000,
      contractPrice: 180_000,
      assignmentFee: 10_000,
      arv: 300_000,
      estimatedRepairs: 50_000,
    };

    renderRoute();
    expect(screen.getByTestId("button-new-offer")).toBeInTheDocument();
    expect(screen.queryByTestId("state-negotiation-financials-incomplete")).toBeNull();
    fireEvent.click(screen.getByTestId("tab-terms"));

    expect(screen.getByTestId("text-terms-asking-price")).toHaveTextContent("$200,000");
    expect(screen.getByTestId("text-terms-repairs")).toHaveTextContent("$50,000");
  });
});
