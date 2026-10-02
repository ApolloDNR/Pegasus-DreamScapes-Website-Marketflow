import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

const project = {
  id: 17,
  title: "Oakland infill record",
  description: "A private project record supplied by its source.",
  location: "Oakland, CA",
  status: "ACTIVE",
  structure: "HYBRID",
  propertyType: "multifamily",
  fundingGoal: 500_000,
  amountRaised: 125_000,
  minInvestment: 25_000,
  maxInvestmentPerInvestor: 100_000,
  projectedReturn: "15-20%",
  holdPeriod: "12-18 months",
  askingInterestRate: "10%",
  askingLoanDuration: "18 months",
  askingPoints: "2",
  askingEquityPercent: 30,
  askingProfitSplit: "70/30",
  askingPreferredReturn: "8%",
  purchasePrice: 300_000,
  rehabBudget: 75_000,
  projectedARV: 550_000,
};

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: () => ({ data: project, isLoading: false, error: null }),
  };
});

vi.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/animations", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/property-map", () => ({ PropertyMap: () => null }));
vi.mock("@/components/share-buttons", () => ({ ShareButtons: () => null }));
vi.mock("@/components/ask-peggy-button", () => ({ AskPeggyButton: () => null }));
vi.mock("@/hooks/use-analytics", () => ({ useAnalytics: () => ({ trackProjectView: vi.fn() }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({ user: { id: "member-1" } }),
}));

import MarketplaceCapitalDetail from "@/pages/marketplace-capital-detail";

afterEach(cleanup);

describe("private capital project detail", () => {
  it("is relationship information only and offers one honest next step", () => {
    const { hook } = memoryLocation({
      path: "/marketflow/capital/17",
      static: true,
    });

    render(
      <Router hook={hook}>
        <Route path="/marketflow/capital/:id">
          <MarketplaceCapitalDetail />
        </Route>
      </Router>,
    );

    expect(screen.getByTestId("card-capital-relationship-only")).toHaveTextContent(
      /relationship information only/i,
    );
    expect(screen.getByTestId("button-capital-relationship-info").closest("a")).toHaveAttribute(
      "href",
      "/capital#capital-introduction",
    );

    expect(screen.queryByText(/express interest/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/minimum capital/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/projected return/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /investment terms/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/funding progress/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("button-commit-capital")).not.toBeInTheDocument();
    expect(screen.queryByTestId("button-save-project")).not.toBeInTheDocument();
    expect(screen.queryByTestId("button-download-pitch")).not.toBeInTheDocument();
    expect(screen.queryByTestId("button-download-proforma")).not.toBeInTheDocument();
    expect(screen.queryByTestId("button-download-agreement")).not.toBeInTheDocument();
  });
});
