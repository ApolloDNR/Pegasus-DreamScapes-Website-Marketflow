import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: true,
    isWholesaler: true,
    isAdmin: false,
    isDreamscaper: false,
    isInvestor: false,
    isBuyer: false,
  }),
}));

vi.mock("@/contexts/deal-action-context", () => ({
  useDealAction: () => ({ openDealAction: vi.fn() }),
}));

vi.mock("@/hooks/use-analytics", () => ({
  useAnalytics: () => ({ trackDealView: vi.fn() }),
}));

vi.mock("@/hooks/use-seo", () => ({ useSEO: () => {} }));
vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/animations", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/property-map", () => ({ PropertyMap: () => null }));
vi.mock("@/components/share-buttons", () => ({ ShareButtons: () => null }));
vi.mock("@/components/ask-peggy-button", () => ({ AskPeggyButton: () => null }));
vi.mock("@/components/under-construction", () => ({
  UnderConstructionBadge: () => null,
  UnderConstructionCard: () => null,
}));

import MarketplaceDealDetail from "@/pages/marketplace-deal-detail";

function renderDeal(canRequestJv: boolean) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: 0 },
    },
  });
  client.setQueryData(["/api/wholesale-deals", "11"], {
    id: 11,
    propertyAddress: "11 Truthful Way",
    city: "Oakland",
    state: "CA",
    status: "listed",
    askingPrice: 320_000,
    contractPrice: 300_000,
    assignmentFee: 20_000,
    arv: 500_000,
    estimatedRepairs: 80_000,
    images: [],
    canRequestJv,
  });
  const { hook } = memoryLocation({
    path: "/marketflow/deals/11",
    static: true,
  });

  return render(
    <QueryClientProvider client={client}>
      <Router hook={hook}>
        <Route path="/marketflow/deals/:id">
          <MarketplaceDealDetail />
        </Route>
      </Router>
    </QueryClientProvider>,
  );
}

afterEach(() => cleanup());

describe("wholesale detail JV authorization", () => {
  it("hides Request JV when the server marks the viewer as the owner", async () => {
    renderDeal(false);

    expect(await screen.findByTestId("text-deal-title")).toHaveTextContent(
      "11 Truthful Way",
    );
    expect(screen.queryByTestId("button-request-jv")).toBeNull();
  });

  it("shows Request JV to an eligible non-owner", async () => {
    renderDeal(true);

    expect(await screen.findByTestId("text-deal-title")).toHaveTextContent(
      "11 Truthful Way",
    );
    expect(screen.getByTestId("button-request-jv")).toBeInTheDocument();
  });
});
