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
import userEvent from "@testing-library/user-event";
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

describe("Pegasus public-shell navigation accessibility", () => {
  it("places the single content main after the Pegasus navigation", async () => {
    const { container } = renderLanding("/");

    await screen.findByRole("heading", {
      name: /Complex real estate, made executable/i,
    });

    const nav = container.querySelector("nav");
    const mains = container.querySelectorAll("main");
    const main = container.querySelector("main#main-content");
    expect(nav).toBeTruthy();
    expect(mains).toHaveLength(1);
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(
      nav!.compareDocumentPosition(main!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps Strategy Lab and MarketFlow visible and exposes the complete More directory", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderLanding("/");
    const nav = container.querySelector("nav");
    expect(nav).toBeTruthy();

    expect(within(nav!).getByRole("button", { name: /Strategy Lab/i })).toBeInTheDocument();
    expect(within(nav!).getByRole("button", { name: /MarketFlow/i })).toBeInTheDocument();

    const more = within(nav!).getByRole("button", { name: /More/i });
    await user.click(more);

    const directory = screen.getByRole("menu", { name: /More Pegasus pages/i });
    expect(within(directory).getByRole("menuitem", { name: /Our Work/i })).toBeInTheDocument();
    expect(within(directory).getByRole("menuitem", { name: /Investments/i })).toBeInTheDocument();
    expect(within(directory).getByRole("menuitem", { name: /Pegasus Ecosystem/i })).toBeInTheDocument();
  });

  it("makes the full-screen menu modal, traps focus, closes on Escape, and restores focus", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderLanding("/");

    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);

    const menu = screen.getByRole("dialog", { name: "Primary navigation" });
    expect(menu).toHaveAttribute("aria-modal", "true");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector("nav")).toHaveAttribute("inert");

    const initial = within(menu).getByRole("button", {
      name: /Bring an Opportunity/i,
    });
    const first = within(menu).getByRole("button", { name: "Close menu" });
    const last = within(menu).getByRole("button", { name: "About" });
    await waitFor(() => expect(initial).toHaveFocus());

    last.focus();
    await user.tab();
    expect(first).toHaveFocus();

    await user.tab({ shift: true });
    expect(last).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveFocus();
    });
    expect(container.querySelector("nav")).not.toHaveAttribute("inert");
    expect(menu).toHaveAttribute("aria-hidden", "true");
    expect(menu).not.toHaveAttribute("aria-modal");
  });
});

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

describe("Pegasus Strategy Lab workspace accessibility", () => {
  it("opens on the real decision desk, advances steps, and moves focus to the current workspace heading", async () => {
    const { container } = renderLanding("/strategy-lab");

    await screen.findByRole("heading", {
      name: /Turn one property into a decision you can defend/i,
    });
    const main = container.querySelector("main");
    expect(main).toBeTruthy();

    const basisStep = within(main!).getByRole("button", { name: /02\s*Basis/i });
    fireEvent.click(basisStep);

    const heading = await within(main!).findByRole("heading", {
      name: /Strategy Lab Basis step/i,
    });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(within(main!).getByRole("heading", { name: /Put the assumptions in one place/i })).toBeInTheDocument();
    expect(basisStep).toHaveAttribute("aria-current", "step");
  });
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
