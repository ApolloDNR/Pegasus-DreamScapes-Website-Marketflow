import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import MarketplaceResources from "@/pages/marketplace-resources";
import type { Article } from "@shared/schema";

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const ARTICLES: Article[] = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  slug: `article-${index + 1}`,
  title: `Article ${index + 1}`,
  excerpt: `A complete article fixture ${index + 1}.`,
  content: `Article body ${index + 1}.`,
  category: "Strategy",
  author: "Pegasus",
  imageUrl: null,
  published: true,
  publishedAt: new Date("2026-01-01T00:00:00.000Z"),
  featuredInLibrary: false,
  libraryCategoryKey: null,
  libraryOrder: index,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
}));

afterEach(() => cleanup());

describe("authenticated MarketFlow resource destinations", () => {
  it("routes article cards and View All to the owned Strategy Lab surface", () => {
    const memory = memoryLocation({ path: "/marketflow/resources", static: true });
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: Infinity },
        mutations: { retry: false },
      },
    });
    client.setQueryData(["/api/articles"], ARTICLES);

    render(
      <QueryClientProvider client={client}>
        <Router hook={memory.hook}>
          <MarketplaceResources />
        </Router>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
      "href",
      "/strategy-lab",
    );
    for (const card of screen.getAllByTestId(/^article-card-/)) {
      expect(card.closest("a")).toHaveAttribute("href", "/strategy-lab");
    }
  });
});
