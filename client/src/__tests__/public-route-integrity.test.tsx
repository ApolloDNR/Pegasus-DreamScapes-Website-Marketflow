import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import Projects from "@/pages/projects";
import MarketflowBuyboxes from "@/pages/marketflow-buyboxes";
import { StrategyLabPage } from "@/pegasus/pages";
import { PUBLIC_BUYBOXES } from "@/config/buyboxes";
import { seoFor } from "@shared/seo-routes";

vi.mock("@/components/strategy-lab/calculator-tools-panel", () => ({
  CalculatorToolsPanel: ({ defaultTab }: { defaultTab?: string }) => (
    <div data-testid="calculator-tools-panel-stub">{defaultTab ?? "arv"}</div>
  ),
}));

class NoopIntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds: number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  (globalThis as unknown as { IntersectionObserver: typeof NoopIntersectionObserver })
    .IntersectionObserver = NoopIntersectionObserver;
}

const noop = () => {};

function renderRoute(
  ui: React.ReactElement,
  {
    path = "/",
    search = "",
    seed,
  }: { path?: string; search?: string; seed?: (client: QueryClient) => void } = {},
) {
  const { hook } = memoryLocation({ path, static: true });
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  seed?.(client);

  return render(
    <QueryClientProvider client={client}>
      <Router hook={hook} searchHook={() => search}>
        {ui}
      </Router>
    </QueryClientProvider>,
  );
}

afterEach(() => cleanup());

describe("Projects public fallback truth", () => {
  it("presents Nelson Drive as one completed, available case study when the API list is empty", () => {
    renderRoute(<Projects />, {
      path: "/projects",
      seed: (client) => {
        client.setQueryData<unknown[]>(["/api/projects"], []);
      },
    });

    expect(screen.getByText("1 documented case study")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Nelson Drive is available now.")).toBeInTheDocument();
    expect(screen.getByText(/completed East Bay residential transformation/i)).toBeInTheDocument();
    expect(screen.getByText("View case study")).toBeInTheDocument();
    expect(screen.queryByText("In Progress")).not.toBeInTheDocument();
    expect(screen.queryByText("First case study coming soon.")).not.toBeInTheDocument();
    expect(screen.queryByText(/final economics are signed off/i)).not.toBeInTheDocument();
  });
});

describe("Strategy Lab documented calculator deep link", () => {
  it("opens the premium desk on its Basis step for ?tool=calculators", async () => {
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      renderRoute(<StrategyLabPage go={noop} openPeggy={noop} />, {
        path: "/strategy-lab",
        search: "?tool=calculators",
      });

      const basisStep = screen.getByRole("button", { name: /02\s*Basis/i });
      expect(basisStep).toHaveAttribute("aria-current", "step");
      expect(screen.getByLabelText("Acquisition or current basis")).toBeInTheDocument();
      expect(screen.getByTestId("strategy-lab-workspace")).toBeInTheDocument();
      expect(screen.getByTestId("text-strategy-disclaimer")).toBeInTheDocument();
      expect(await screen.findByTestId("calculator-tools-panel-stub")).toBeInTheDocument();
      await waitFor(() =>
        expect(scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "auto" }),
      );
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });
});

describe("MarketFlow controlled-pilot public truth", () => {
  it("fails closed while no buybox profile or notification program is published", () => {
    renderRoute(<MarketflowBuyboxes />, { path: "/marketflow/buyboxes" });

    expect(PUBLIC_BUYBOXES).toHaveLength(0);
    expect(screen.queryAllByTestId(/^buybox-card-/)).toHaveLength(0);
    expect(screen.getByText(/No public buybox profiles are active today/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications have not been activated/i)).toBeInTheDocument();
    expect(screen.getByText(/Controlled pilot · reviewed access/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Request pilot access/i })).toHaveAttribute(
      "href",
      "/marketflow/access",
    );
    expect(screen.queryByRole("button", { name: /Request Notification/i })).not.toBeInTheDocument();
  });

  it("keeps MarketFlow SEO aligned with the unpublished state", () => {
    const marketflowDescription = seoFor("/marketflow").description;
    const buyboxSeo = seoFor("/marketflow/buyboxes");

    expect(marketflowDescription).toMatch(/controlled pilot/i);
    expect(marketflowDescription).not.toMatch(/verified end to end/i);
    expect(buyboxSeo.description).toMatch(/No public Buybox profiles/i);
    expect(buyboxSeo.description).not.toMatch(/are available|subscribe to|request notification/i);
    expect(buyboxSeo.noIndex).toBe(true);
  });
});
