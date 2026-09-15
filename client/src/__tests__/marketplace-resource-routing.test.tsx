import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import MarketplaceResources from "@/pages/marketplace-resources";

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("authenticated MarketFlow resource destinations", () => {
  it("offers only live resource tools without querying the retired article feed", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const memory = memoryLocation({ path: "/marketflow/resources", static: true });
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: Infinity },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={client}>
        <Router hook={memory.hook}>
          <MarketplaceResources />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/no separate article library is published/i)).toBeVisible();
    expect(screen.queryByRole("heading", { name: /latest articles/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view all/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId(/^article-card-/)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/^guide-card-/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /deal calculators/i })).toHaveAttribute(
      "href",
      "/strategy-lab?tool=calculators",
    );
    expect(screen.getByRole("link", { name: /property workspace/i })).toHaveAttribute(
      "href",
      "/saved",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
