import fs from "node:fs";
import path from "node:path";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

type QueryState = {
  data?: unknown;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  refetch?: ReturnType<typeof vi.fn>;
};

const queryStates: Record<string, QueryState> = {};

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );
  return {
    ...actual,
    useQuery: (options: { queryKey?: unknown[]; enabled?: boolean }) => {
      const key = String(options.queryKey?.[0] ?? "");
      const state = queryStates[key] ?? {};
      return {
        data: state.data,
        isLoading: state.isLoading ?? false,
        isPending: state.isLoading ?? false,
        isFetching: false,
        isRefetching: false,
        isError: state.isError ?? false,
        error: state.error ?? null,
        refetch: state.refetch ?? vi.fn(),
      };
    },
    useMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    }),
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    user: { id: "private-surface-user", email: "operator@example.com" },
    isAuthenticated: true,
    isAdmin: true,
    isLoading: false,
  }),
}));

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/hooks/use-seo", () => ({ useSEO: () => {} }));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function failQuery(key: string) {
  queryStates[key] = {
    isError: true,
    error: new Error("network unavailable"),
    refetch: vi.fn(),
  };
}

beforeEach(() => {
  for (const key of Object.keys(queryStates)) delete queryStates[key];
});

afterEach(() => cleanup());

describe("private analytics and admin surfaces fail closed", () => {
  it("does not convert an admin analytics failure into a zero dashboard", async () => {
    failQuery("/api/admin/analytics/dashboard");
    const { default: AnalyticsPage } = await import("@/pages/analytics");

    render(<AnalyticsPage />);

    expect(screen.getByTestId("state-admin-analytics-error")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.queryByTestId("analytics-dashboard")).not.toBeInTheDocument();
  });

  it("does not label an HQ request failure as an empty or down queue", async () => {
    failQuery("/api/admin/hq-outbox");
    const { default: AdminHqOutbox } = await import("@/pages/admin-hq-outbox");

    render(<AdminHqOutbox />);

    expect(screen.getByTestId("state-hq-outbox-error")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.queryByText("No outbox rows.")).not.toBeInTheDocument();
    expect(screen.queryByText("Down — queueing to outbox")).not.toBeInTheDocument();
  });

  it("does not misreport a Strategy Lab API failure as wrong credentials", async () => {
    failQuery("/api/admin/strategy-lab");
    const { default: AdminStrategyLabPage } = await import(
      "@/pages/admin-strategy-lab"
    );

    render(<AdminStrategyLabPage />);

    expect(screen.getByTestId("state-strategy-admin-error")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.queryByText("Admin access required.")).not.toBeInTheDocument();
  });

  it("keeps failed personal deal queries distinct from valid empty states", async () => {
    failQuery("/api/portal/wholesaler/my-deals");
    failQuery("/api/portal/my-capital-projects");
    failQuery("/api/portal/my-listings");
    const { default: MyDealsPage } = await import("@/pages/my-deals");

    render(<MyDealsPage />);

    expect(screen.getByTestId("state-wholesale-deals-error")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.queryByText("No wholesale deals yet")).not.toBeInTheDocument();
    expect(screen.getByTestId("stat-total-deals")).toHaveTextContent("—");
  });

  it("does not show personal analytics zeros when the stats request failed", async () => {
    failQuery("/api/analytics/dashboard");
    const { DealAnalyticsDashboard } = await import(
      "@/components/deal-analytics-dashboard"
    );

    render(<DealAnalyticsDashboard userId="private-surface-user" />);

    expect(screen.getByTestId("state-deal-analytics-error")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.queryByText("Deals Viewed")).not.toBeInTheDocument();
  });

  it("does not show negotiation zeros when the stats request failed", async () => {
    failQuery("/api/analytics/negotiations");
    const { NegotiationAnalytics } = await import(
      "@/components/negotiation-analytics"
    );

    render(<NegotiationAnalytics userId="private-surface-user" />);

    expect(screen.getByTestId("state-negotiation-analytics-error")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.queryByText("Success Rate")).not.toBeInTheDocument();
  });
});

describe("unfinished private tools state their actual capability", () => {
  it("removes shared-watchlist creation instead of calling its permanent 501", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/components/collaborative-watchlist.tsx"),
      "utf8",
    );

    expect(source).not.toContain('apiRequest("POST", "/api/watchlists/shared"');
    expect(source).not.toContain("button-confirm-create");
    expect(source).toContain("Shared watchlists are not available");
  });

  it("does not mount unfinished recommendations or collaboration as live analytics tabs", () => {
    const pageSource = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/pages/my-analytics.tsx"),
      "utf8",
    );
    const curationSource = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/components/ai-deal-curation.tsx"),
      "utf8",
    );

    expect(pageSource).not.toContain('value="ai-picks"');
    expect(pageSource).not.toContain('value="watchlists"');
    expect(curationSource).not.toContain("/api/ai/curation-feedback");
    expect(curationSource).toContain("Curated recommendations are not available");
  });

  it("keeps personal capital records relationship-only", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/pages/my-deals.tsx"),
      "utf8",
    );

    expect(source).toContain("Relationship record");
    expect(source).toContain("not an investment offering, capital commitment, approval, or funding-progress report");
    expect(source).not.toContain("button-edit-capital");
    expect(source).not.toContain("Projected Return");
    expect(source).not.toContain("Minimum Investment");
    expect(source).not.toContain("Progress:");
  });

  it("starts scenario planning blank and labels its math as deterministic", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/components/portfolio-scenario.tsx"),
      "utf8",
    );

    expect(source).not.toMatch(/purchasePrice:\s*150000/);
    expect(source).not.toMatch(/financingType:\s*"hard_money"/);
    expect(source).not.toContain("AI Analysis");
    expect(source).not.toContain(">Best<");
    expect(source).not.toContain(">Safest<");
    expect(source).not.toContain("riskScore");
    expect(source).toContain("Enter your assumptions");
    expect(source).toContain("Deterministic estimate");
    expect(source).toContain("not investment, lending, tax, or legal advice");
  });

  it("renders every scenario assumption blank before the user supplies facts", async () => {
    const { PortfolioScenarioPlanner } = await import(
      "@/components/portfolio-scenario"
    );

    render(<PortfolioScenarioPlanner />);

    expect(screen.getByLabelText("Purchase price")).toHaveValue(null);
    expect(screen.getByLabelText("Repair costs")).toHaveValue(null);
    expect(screen.getByLabelText("Holding period (months)")).toHaveValue(null);
    expect(screen.getByLabelText("Exit or modeled property value")).toHaveValue(null);
    expect(screen.getByTestId("state-scenario-incomplete")).toBeInTheDocument();
    expect(screen.queryByTestId("scenario-results")).not.toBeInTheDocument();
  });
});
