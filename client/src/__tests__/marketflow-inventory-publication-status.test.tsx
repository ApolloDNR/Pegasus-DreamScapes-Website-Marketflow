import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import MarketflowDeals from "@/pages/marketflow-deals";

let approvedOperator = false;

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: approvedOperator,
    isGuestMode: false,
    guestRole: null,
    exitGuestMode: vi.fn(),
    profile: approvedOperator
      ? { primary_role: "pegasus_wholesaler", is_pegasus_badged: true }
      : null,
    userRole: approvedOperator ? "pegasus_wholesaler" : null,
    isAdmin: false,
    isDreamscaper: false,
    isInvestor: false,
  }),
}));

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/animations", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerChildren: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HoverLift: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-supabase-marketplace", () => ({
  useSupabaseMarketplace: () => ({
    isItemSaved: () => false,
    toggleSaveItem: vi.fn(),
    isSaving: false,
  }),
}));

vi.mock("@/contexts/deal-action-context", () => ({
  useDealAction: () => ({ openDealAction: vi.fn() }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

function renderDeals(isApproved: boolean) {
  approvedOperator = isApproved;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  client.setQueryData(["/api/wholesale-deals"], []);
  client.setQueryData(["/api/capital-projects"], []);
  client.setQueryData(["/api/listings"], []);
  const { hook } = memoryLocation({ path: "/marketflow/deals", static: true });

  return render(
    <QueryClientProvider client={client}>
      <Router hook={hook}>
        <MarketflowDeals />
      </Router>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  approvedOperator = false;
});

describe("MarketFlow inventory publication status", () => {
  it.each([
    ["public hold", false],
    ["approved workspace", true],
  ])("shows the current no-inventory status on the %s", (_surface, isApproved) => {
    renderDeals(isApproved);

    expect(
      screen.getAllByText("No reviewed live inventory is published.").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/view live opportunities backed by real review data/i)).not.toBeInTheDocument();
  });
});
