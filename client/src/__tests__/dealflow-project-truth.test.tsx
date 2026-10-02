import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import DealflowProject from "@/pages/dealflow-project";
import { TooltipProvider } from "@/components/ui/tooltip";

const boundary = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  toast: vi.fn(),
  clipboardWrite: vi.fn(),
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: { id: "viewer-1", email: "viewer@example.test" },
    isAuthenticated: true,
    isAdmin: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: boundary.toast }),
}));

vi.mock("@/lib/queryClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/queryClient")>();
  return { ...actual, apiRequest: boundary.apiRequest };
});

vi.mock("@/components/dealflow-layout", () => ({
  DealflowLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/deal-transparency", () => ({
  CapitalStackBreakdown: () => null,
  DealLevelTransparency: () => null,
  InvestorReturnCalculator: () => null,
  ScenarioCalculator: () => null,
  InvestorBreakdownTable: () => null,
  RepaymentTimeline: () => null,
}));

vi.mock("@/components/deal-chat", () => ({ DealChat: () => null }));
vi.mock("@/components/ask-peggy-button", () => ({ AskPeggyButton: () => null }));

const project = {
  id: 7,
  title: "Walnut Creek project record",
  description: "Recorded scope for controlled-pilot review.",
  location: "Walnut Creek, CA",
  fundingGoal: 500000,
  amountRaised: 0,
  minInvestment: 50000,
  structure: "debt",
  projectedReturn: "18%",
  holdPeriod: "18 months",
  status: "active",
  riskLevel: "medium",
  designAppeal: 5,
  roiPotential: 5,
  marketDemand: 5,
  investorCount: 12,
  isFeatured: true,
  isHot: true,
};

function renderProject() {
  const { hook } = memoryLocation({ path: "/dealflow/project/7", static: true });
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  client.setQueryData(["/api/capital-projects", 7], project);
  client.setQueryData(["/api/capital-projects/7/milestones"], []);
  client.setQueryData(["/api/capital-projects/7/commitments"], []);
  client.setQueryData(["/api/negotiations", "capital_project", 7], []);
  client.setQueryData(["/api/deals/saved"], []);

  return render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Router hook={hook}>
          <Route path="/dealflow/project/:id">
            <DealflowProject />
          </Route>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("legacy project record truth and actions", () => {
  beforeEach(() => {
    boundary.apiRequest.mockReset().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    boundary.toast.mockReset();
    boundary.clipboardWrite.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: boundary.clipboardWrite },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the record without inventing a personal match, operator certification, or success metrics", () => {
    renderProject();

    expect(screen.getByRole("heading", { name: project.title })).toBeInTheDocument();
    expect(screen.getByText(/recorded assumptions/i)).toBeInTheDocument();
    expect(screen.queryByText(/match score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/investment chemistry/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/based on your investment profile/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/certified dreamscaper/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/success rate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^98%$/)).not.toBeInTheDocument();
  });

  it("persists Save, copies the protected link, and routes Contact to a real intake page", async () => {
    renderProject();

    fireEvent.click(screen.getByRole("button", { name: /save project/i }));
    await waitFor(() => {
      expect(boundary.apiRequest).toHaveBeenCalledWith("POST", "/api/deals/action", {
        dealType: "capital_project",
        dealId: 7,
        action: "save",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: /copy protected link/i }));
    await waitFor(() => expect(boundary.clipboardWrite).toHaveBeenCalledTimes(1));

    expect(screen.getByRole("link", { name: /contact pegasus/i })).toHaveAttribute(
      "href",
      "/contact?intent=marketflow",
    );
  });
});
