import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: { id: 17, title: "Private project", fundingGoal: 500_000, minInvestment: 25_000 },
    isLoading: false,
  }),
}));
vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({ profile: { id: "member-1" } }),
}));
vi.mock("@/contexts/peggy-context", () => ({
  usePeggyContext: () => ({ setDealContext: vi.fn() }),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
vi.mock("@/components/offer-studio", () => ({
  OfferStudio: () => <div data-testid="legacy-capital-offer-form">Capital offer form</div>,
}));

import OfferStudioPage from "@/pages/offer-studio";

afterEach(cleanup);

describe("legacy capital Offer Studio route", () => {
  it("is a relationship-only retirement page with no commitment form", () => {
    const { hook } = memoryLocation({
      path: "/offer-studio/capital/17",
      static: true,
    });

    render(
      <Router hook={hook}>
        <Route path="/offer-studio/:dealType/:dealId">
          <OfferStudioPage />
        </Route>
      </Router>,
    );

    expect(screen.getByTestId("card-capital-offer-retired")).toHaveTextContent(
      /relationship information only/i,
    );
    expect(screen.getByTestId("button-capital-relationship-info").closest("a")).toHaveAttribute(
      "href",
      "/capital#capital-introduction",
    );
    expect(screen.queryByTestId("legacy-capital-offer-form")).not.toBeInTheDocument();
    expect(screen.queryByText(/minimum/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /submit|commit|invest/i })).not.toBeInTheDocument();
  });
});
