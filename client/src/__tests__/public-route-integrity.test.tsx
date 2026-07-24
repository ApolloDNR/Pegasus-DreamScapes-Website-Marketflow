import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import Projects from "@/pages/projects";
import MarketflowBuyboxes from "@/pages/marketflow-buyboxes";
import { StrategyLabPage } from "@/pegasus/pages";
import { BUYBOXES } from "@/config/buyboxes";
import { seoFor } from "@shared/seo-routes";

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
      await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" }));
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });
});

describe("MarketFlow controlled-pilot public truth", () => {
  const publicBuyboxCount = BUYBOXES.filter((buybox) => buybox.publicReady !== false).length;

  it("matches the public card count and controlled-pilot status on the Buyboxes page", () => {
    renderRoute(<MarketflowBuyboxes />, { path: "/marketflow/buyboxes" });

    expect(screen.getAllByTestId(/^buybox-card-/)).toHaveLength(publicBuyboxCount);
    expect(
      screen.getByText(new RegExp(`${publicBuyboxCount} public buybox profiles are available in MarketFlow's controlled pilot`, "i")),
    ).toBeInTheDocument();
    expect(screen.getByText(/Controlled pilot · reviewed access/i)).toBeInTheDocument();
    expect(screen.queryByText(/Four named buyboxes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Private beta · invite only/i)).not.toBeInTheDocument();
  });

  it("keeps MarketFlow SEO aligned with controlled-pilot status and the public count", () => {
    const marketflowDescription = seoFor("/marketflow").description;
    const buyboxDescription = seoFor("/marketflow/buyboxes").description;

    expect(marketflowDescription).toMatch(/controlled pilot/i);
    expect(marketflowDescription).not.toMatch(/verified end to end/i);
    expect(buyboxDescription).toContain(`${publicBuyboxCount} public buybox profiles`);
    expect(buyboxDescription).toMatch(/controlled pilot/i);
    expect(buyboxDescription).not.toMatch(/Four named/i);
  });
});
