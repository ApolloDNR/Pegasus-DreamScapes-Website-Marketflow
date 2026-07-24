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
  window.history.replaceState({}, "", "/");
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

    expect(within(nav!).getByRole("link", { name: /Strategy Lab/i })).toHaveAttribute(
      "href",
      "/strategy-lab",
    );
    expect(within(nav!).getByRole("link", { name: /MarketFlow/i })).toHaveAttribute(
      "href",
      "/marketflow",
    );

    const more = within(nav!).getByRole("button", { name: /More/i });
    await user.click(more);

    const directory = screen.getByRole("region", { name: /More Pegasus pages/i });
    expect(within(directory).getByRole("link", { name: /Our Work/i })).toHaveAttribute(
      "href",
      "/our-work",
    );
    expect(within(directory).getByRole("link", { name: /Investments/i })).toBeInTheDocument();
    expect(within(directory).getByRole("link", { name: /Pegasus Ecosystem/i })).toBeInTheDocument();
    expect(more).not.toHaveAttribute("aria-haspopup");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("region", { name: /More Pegasus pages/i })).not.toBeInTheDocument();
    expect(more).toHaveFocus();
  });

  it("keeps product navigation active throughout its public child journeys", () => {
    const marketflow = renderLanding("/marketflow/access");
    expect(
      within(marketflow.container.querySelector("nav")!).getByRole("link", {
        name: /MarketFlow/i,
      }),
    ).toHaveAttribute("aria-current", "page");
    cleanup();

    const lab = renderLanding("/strategy-lab/classic");
    expect(
      within(lab.container.querySelector("nav")!).getByRole("link", {
        name: /Strategy Lab/i,
      }),
    ).toHaveAttribute("aria-current", "page");
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

    const initial = within(menu).getByRole("link", {
      name: /Bring an Opportunity/i,
    });
    const first = within(menu).getByRole("button", { name: "Close menu" });
    const last = within(menu).getByRole("link", { name: /^Peggy/i });
    expect(within(menu).getByRole("heading", { name: "Core pages" })).toBeInTheDocument();
    expect(within(menu).getByRole("heading", { name: "Company & proof" })).toBeInTheDocument();
    expect(within(menu).getByRole("heading", { name: "Operating lanes" })).toBeInTheDocument();
    expect(within(menu).getByRole("heading", { name: "Network & resources" })).toBeInTheDocument();
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
  it("uses pressed-button semantics for the MarketFlow relationship brief", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderLanding("/marketflow");
    const main = container.querySelector("main")!;
    const group = await within(main).findByRole("group", {
      name: "MarketFlow relationship roles",
    });
    expect(main.querySelector('[role="tablist"]')).toBeNull();

    const source = within(group).getByRole("button", { name: "Deal source" });
    const buyer = within(group).getByRole("button", { name: "Buyer" });
    expect(source).toHaveAttribute("aria-pressed", "true");
    expect(buyer).toHaveAttribute("aria-pressed", "false");

    await user.click(buyer);
    expect(source).toHaveAttribute("aria-pressed", "false");
    expect(buyer).toHaveAttribute("aria-pressed", "true");
    expect(within(main).getByText(/See only what fits your mandate/i)).toBeInTheDocument();
  });

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
    expect(
      within(main!).getByRole("heading", {
        name: /Make every material assumption visible/i,
      }),
    ).toBeInTheDocument();
    expect(basisStep).toHaveAttribute("aria-current", "step");
  });

  it("holds conclusions and intake handoff until the numeric basis is valid", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderLanding("/strategy-lab");
    const main = container.querySelector("main")!;

    await user.click(within(main).getByRole("button", { name: /02\s*Basis/i }));
    const acquisition = within(main).getByRole("textbox", {
      name: /Acquisition or current basis/i,
    });
    const exitValue = within(main).getByRole("textbox", {
      name: /Projected exit value/i,
    });
    const ltv = within(main).getByRole("textbox", {
      name: /Modeled loan-to-value/i,
    });
    await user.clear(acquisition);
    await user.type(acquisition, "600000");
    await user.clear(exitValue);
    await user.type(exitValue, "840000");
    await user.clear(ltv);
    await user.type(ltv, "150");

    expect(ltv).toHaveAttribute("aria-invalid", "true");
    expect(within(main).getByText(/Use a percentage from 0 to 100/i)).toBeInTheDocument();
    expect(within(main).getAllByText("—").length).toBeGreaterThan(0);

    await user.click(within(main).getByRole("button", { name: /03\s*Paths/i }));
    expect(
      within(main).getByRole("status", { name: /More inputs required/i }),
    ).toHaveTextContent(/Decision brief not generated/i);
    expect(within(main).queryByText(/View all nine paths/i)).not.toBeInTheDocument();
    expect(
      within(main).getByRole("button", { name: /Carry this brief into intake/i }),
    ).toBeDisabled();

    await user.click(within(main).getByRole("button", { name: /04\s*Brief/i }));
    expect(
      within(main).getByRole("status", { name: /Decision brief unavailable/i }),
    ).toHaveTextContent(/needs valid inputs/i);
    expect(within(main).queryByText(/Read the full engine rationale/i)).not.toBeInTheDocument();
  });

  it("opens calculator deep links at the instrument library and keeps the detail open when switching", async () => {
    const user = userEvent.setup({ delay: null });
    window.history.replaceState({}, "", "/strategy-lab?tool=calculators&tab=roi");
    const { container } = renderLanding("/strategy-lab");
    const main = container.querySelector("main")!;

    const group = await within(main).findByRole("group", {
      name: /Underwriting instruments/i,
    });
    const roi = within(group).getByRole("button", { name: /Return frame/i });
    const cashFlow = within(group).getByRole("button", { name: /Cash flow/i });
    expect(roi).toHaveAttribute("aria-pressed", "true");
    expect(cashFlow).toHaveAttribute("aria-pressed", "false");
    expect(main.querySelector(".px-lab-instrument-detail")).toBeInTheDocument();

    await user.click(cashFlow);
    expect(roi).toHaveAttribute("aria-pressed", "false");
    expect(cashFlow).toHaveAttribute("aria-pressed", "true");
    expect(main.querySelector(".px-lab-instrument-detail")).toBeInTheDocument();
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
