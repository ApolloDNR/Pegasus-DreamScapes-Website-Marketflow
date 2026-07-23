import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { ThemeProvider } from "@/components/theme-provider";
import { Landing } from "@/pegasus/Landing";

vi.mock("@/lib/analytics", () => ({
  initAnalytics: () => () => {},
  trackEvent: () => {},
  trackCtaClick: () => {},
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
  (
    globalThis as unknown as {
      IntersectionObserver: typeof NoopIntersectionObserver;
    }
  ).IntersectionObserver = NoopIntersectionObserver;
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (typeof window !== "undefined") {
  // Landing resets scroll after route changes; jsdom's implementation throws.
  (window as unknown as { scrollTo: () => void }).scrollTo = vi.fn();
}

function renderLanding(routePath: string) {
  const memory = memoryLocation({ path: routePath, record: true });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router hook={memory.hook}>
          <Landing />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>,
  );

  return { ...result, history: memory.history as string[] };
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

type SignatureRoute = {
  path: string;
  pageHeading: RegExp;
  groupName: string;
  initialChoice: string;
  nextChoice: string;
  outputSelector: string;
  nextOutput: RegExp;
};

const SIGNATURE_ROUTES: SignatureRoute[] = [
  {
    path: "/how-we-operate",
    pageHeading: /Complex opportunities fail when the pieces are fragmented/i,
    groupName: "The five operating stages",
    initialChoice: "Originate",
    nextChoice: "Structure",
    outputSelector: ".hwo-stage",
    nextOutput: /Set the role, the strategy, and the terms/i,
  },
  {
    path: "/property-owners",
    pageHeading: /A difficult property does not always need a conventional solution/i,
    groupName: "Common owner situations",
    initialChoice: "Significant repairs",
    nextChoice: "Inherited property",
    outputSelector: ".po-path",
    nextOutput: /Probate timing, siblings, and an old house at once/i,
  },
  {
    path: "/deal-partners",
    pageHeading: /You found the opportunity\. We help make it executable/i,
    groupName: "What the deal is missing",
    initialChoice: "Seller access or negotiation",
    nextChoice: "Underwriting",
    outputSelector: ".dp-answer",
    nextOutput: /Our own numbers on the deal/i,
  },
];

describe("Pegasus v6 Landing-shell choice controls", () => {
  for (const route of SIGNATURE_ROUTES) {
    it(`${route.path} uses button-group semantics and announces the current output`, async () => {
      const { container } = renderLanding(route.path);

      await screen.findByRole("heading", { name: route.pageHeading });
      const main = container.querySelector("main");
      expect(main, `${route.path} must render inside the live Landing main`).toBeTruthy();

      const group = within(main!).getByRole("group", { name: route.groupName });
      expect(group.querySelector('[role="tab"]')).toBeNull();
      expect(main!.querySelector('[role="tablist"]')).toBeNull();

      const initial = within(group).getByRole("button", {
        // HWO renders its ordinal inside the button, so match the visible
        // choice label at the end of the accessible name ("01Originate").
        name: new RegExp(`${route.initialChoice}$`, "i"),
      });
      const next = within(group).getByRole("button", {
        name: new RegExp(`${route.nextChoice}$`, "i"),
      });
      expect(initial).toHaveAttribute("aria-pressed", "true");
      expect(next).toHaveAttribute("aria-pressed", "false");

      fireEvent.click(next);

      await waitFor(() => {
        expect(initial).toHaveAttribute("aria-pressed", "false");
        expect(next).toHaveAttribute("aria-pressed", "true");
        const output = main!.querySelector(route.outputSelector);
        expect(output).toHaveAttribute("aria-live", "polite");
        expect(output).toHaveTextContent(route.nextOutput);
      });
    });
  }
});

describe("Pegasus v6 live About routing", () => {
  it("uses real canonical links for both Bring an Opportunity actions", async () => {
    const { container } = renderLanding("/about");

    await screen.findByRole("heading", {
      name: /A single, accountable point of view/i,
    });
    const main = container.querySelector("main");
    expect(main).toBeTruthy();

    const links = within(main!).getAllByRole("link", {
      name: /Bring an Opportunity/i,
    });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/bring-an-opportunity");
    }

    expect(
      within(main!).queryByRole("button", { name: /Bring an Opportunity/i }),
    ).not.toBeInTheDocument();
  });
});
