import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

const queryBoundary = vi.hoisted(() => ({
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: () => ({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      refetch: queryBoundary.refetch,
    }),
  };
});

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/animations", () => ({
  HoverLift: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerChildren: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/hooks/use-supabase-marketplace", () => ({
  useSupabaseMarketplace: () => ({
    isItemSaved: () => false,
    toggleSaveItem: vi.fn(),
    isSaving: false,
  }),
}));

import MarketplaceCapital from "@/pages/marketplace-capital";

afterEach(() => {
  cleanup();
  queryBoundary.refetch.mockReset();
});

describe("private capital registry failure state", () => {
  it("does not infer empty inventory or zero counts and offers a retry", () => {
    const { hook } = memoryLocation({ path: "/marketflow/capital", static: true });

    render(
      <Router hook={hook}>
        <MarketplaceCapital />
      </Router>,
    );

    expect(screen.getByTestId("state-capital-projects-unavailable")).toHaveTextContent(
      /no empty project list or record count is being inferred/i,
    );
    expect(screen.queryByText("No private project records available")).not.toBeInTheDocument();
    expect(screen.queryByText(/showing 0 of 0 private project records/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-retry-capital-projects"));
    expect(queryBoundary.refetch).toHaveBeenCalledTimes(1);
  });
});
