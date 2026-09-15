import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { DealflowLayout } from "@/components/dealflow-layout";
import { TooltipProvider } from "@/components/ui/tooltip";

vi.mock("@/contexts/supabase-auth-context", () => ({
  getRoleDashboardPath: () => "/marketflow",
  useSupabaseAuth: () => ({
    user: { id: "viewer-1", email: "viewer@example.test" },
    profile: {
      display_name: "Morgan Viewer",
      avatar_url: null,
      primary_role: "investor",
    },
    userRole: "investor",
    isLoading: false,
    isAuthenticated: true,
    isAdmin: false,
    isInvestor: true,
    isWholesaler: false,
    isBuyer: false,
    isDreamscaper: false,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/contexts/peggy-context", () => ({
  usePeggyContext: () => ({ openChat: vi.fn() }),
}));

vi.mock("@/components/notification-bell", () => ({
  NotificationBell: () => null,
}));

vi.mock("@/components/notification-dropdown", () => ({
  NotificationDropdown: () => null,
}));

vi.mock("@/components/command-palette", () => ({
  CommandPalette: () => null,
  CommandTrigger: () => null,
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(cleanup);

describe("legacy Dealflow shell truth", () => {
  it("uses canonical MarketFlow navigation without invented live status or badge counts", () => {
    const { hook } = memoryLocation({ path: "/dealflow/project/7", static: true });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    render(
      <QueryClientProvider client={client}>
        <TooltipProvider>
          <Router hook={hook}>
            <DealflowLayout>
              <p>Project record</p>
            </DealflowLayout>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Project record")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /deal flow/i })).toHaveAttribute(
      "href",
      "/marketflow/deals",
    );
    expect(screen.getByRole("link", { name: /messages/i })).toHaveAttribute(
      "href",
      "/marketflow/messages",
    );

    const body = within(document.body);
    expect(body.queryByText(/live updates active/i)).not.toBeInTheDocument();
    expect(body.queryByText(/all systems operational/i)).not.toBeInTheDocument();
    expect(body.queryByText(/^online$/i)).not.toBeInTheDocument();
    expect(body.queryByText(/ai-powered/i)).not.toBeInTheDocument();
    expect(body.queryByText(/^12$/)).not.toBeInTheDocument();
    expect(body.queryByText(/^3$/)).not.toBeInTheDocument();
  });
});
