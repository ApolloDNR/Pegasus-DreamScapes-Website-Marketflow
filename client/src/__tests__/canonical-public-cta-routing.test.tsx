import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import ConnectPage from "@/pages/connect";
import NelsonDrPage from "@/pages/project-nelson-dr";
import ProjectsPage from "@/pages/projects";

vi.mock("@/lib/analytics", () => ({
  trackCtaClick: vi.fn(),
  trackEvent: vi.fn(),
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

function renderPage(
  path: string,
  page: React.ReactElement,
  seed?: (client: QueryClient) => void,
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
      <Router hook={hook}>{page}</Router>
    </QueryClientProvider>,
  );
}

function linkForTestId(testId: string): HTMLAnchorElement {
  const element = screen.getByTestId(testId);
  const link = element.matches("a") ? element : element.closest("a");
  expect(link, `${testId} must be rendered within a link`).toBeTruthy();
  return link as HTMLAnchorElement;
}

afterEach(() => cleanup());

describe("mounted public CTAs use the canonical opportunity route", () => {
  it("routes both Connect property entry points directly to the canonical intake", () => {
    renderPage("/connect", <ConnectPage />);

    expect(linkForTestId("link-connect-submit")).toHaveAttribute(
      "href",
      "/bring-an-opportunity?intent=property",
    );
    expect(linkForTestId("link-connect-active-property-situation")).toHaveAttribute(
      "href",
      "/bring-an-opportunity?intent=property",
    );
  });

  it("routes the Projects fallback CTA directly to the canonical intake", () => {
    renderPage("/projects", <ProjectsPage />, (client) => {
      client.setQueryData(["/api/projects"], []);
    });

    expect(linkForTestId("link-projects-strategy-review")).toHaveAttribute(
      "href",
      "/bring-an-opportunity",
    );
  });

  it("routes the Nelson case-study CTA directly to the canonical intake", () => {
    renderPage("/projects/nelson-dr", <NelsonDrPage />);

    expect(linkForTestId("button-nelson-review")).toHaveAttribute(
      "href",
      "/bring-an-opportunity",
    );
  });
});
