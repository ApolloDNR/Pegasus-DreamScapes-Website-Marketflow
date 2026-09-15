import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

const queryKeys = vi.hoisted(() => [] as string[]);

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: ({ queryKey }: { queryKey: string[] }) => {
      queryKeys.push(queryKey[0]);
      return { data: [], isLoading: false };
    },
    useMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  };
});

vi.mock("@/hooks/use-authenticated-query", () => ({
  useAuthenticatedQuery: (queryKey: string[]) => {
    queryKeys.push(queryKey[0]);
    return {
      data: queryKey.includes("stats") ? undefined : [],
      isLoading: false,
    };
  },
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: { id: "member-1", email: "member@example.com" },
    profile: { is_pegasus_badged: false },
    userRole: "buyer_investment",
    isGuestMode: false,
    exitGuestMode: vi.fn(),
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
import MarketplaceInvestor from "@/pages/marketplace-investor";
import MarketplaceBuyer from "@/pages/marketplace-buyer";

function renderAt(path: string, node: React.ReactNode) {
  const { hook } = memoryLocation({ path, static: true });
  return render(<Router hook={hook}>{node}</Router>);
}

function linkFor(testId: string) {
  return screen.getByTestId(testId).closest("a");
}

beforeEach(() => {
  queryKeys.length = 0;
});

afterEach(() => {
  cleanup();
});

describe("MarketFlow role navigation only advertises working destinations", () => {
  it("routes wholesaler actions to the real submit and deal-management surfaces", () => {
    renderAt("/marketflow/wholesaler", <MarketplaceWholesaler />);

    expect(linkFor("button-submit-deal")).toHaveAttribute("href", "/marketflow/submit");
    expect(screen.getByTestId("button-deal-registry-pilot")).toBeDisabled();
    expect(screen.getByTestId("action-browse-buyers-pilot")).toBeDisabled();
    expect(queryKeys).toContain("/api/supabase/marketplace/wholesaler/deals");
    expect(queryKeys).not.toContain("/api/supabase/wholesale-deals/my");
  });

  it("routes DreamScaper actions to real intake and project-management surfaces", () => {
    renderAt("/marketflow/dreamscaper", <MarketplaceDreamscaper />);

    expect(linkFor("button-new-project")).toHaveAttribute("href", "/marketflow/submit");
    expect(screen.getByTestId("button-project-registry-pilot")).toBeDisabled();
    expect(screen.getByTestId("action-raise-capital-pilot")).toBeDisabled();
    expect(queryKeys).toContain("/api/supabase/marketplace/dreamscaper/projects");
    expect(queryKeys).not.toContain("/api/supabase/capital-projects/my");
  });

  it("keeps investor portfolio and saved workspaces truthful while the pilot is controlled", () => {
    renderAt("/marketflow/investor", <MarketplaceInvestor />);

    expect(screen.getByTestId("button-portfolio-pilot")).toBeDisabled();
    expect(screen.getByTestId("action-saved-pilot")).toBeDisabled();
    expect(linkFor("action-discover")).toHaveAttribute("href", "/marketflow/deals");
    expect(linkFor("action-analyze")).toHaveAttribute("href", "/marketflow/calculators");
  });

  it("renders distinct buyer saved and offers workspaces against registered APIs", () => {
    const saved = renderAt("/marketflow/buyer/saved", <MarketplaceBuyer />);
    expect(screen.getByRole("heading", { name: "Saved Properties" })).toBeInTheDocument();
    expect(queryKeys).toContain("/api/supabase/saved-items");
    saved.unmount();
    queryKeys.length = 0;

    renderAt("/marketflow/buyer/offers", <MarketplaceBuyer />);
    expect(screen.getByRole("heading", { name: "My Offers" })).toBeInTheDocument();
    expect(queryKeys).toContain("/api/supabase/buyer-offers");
  });
});
