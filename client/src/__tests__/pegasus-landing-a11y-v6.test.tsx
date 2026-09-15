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
import { PeggyProvider } from "@/contexts/peggy-context";
import { Landing } from "@/pegasus/Landing";

vi.mock("@/lib/analytics", () => ({
  initAnalytics: () => () => {},
  trackEvent: () => {},
  trackCtaClick: () => {},
}));

vi.mock("@/contexts/supabase-auth-context", async () => {
  const actual = await vi.importActual<typeof import("@/contexts/supabase-auth-context")>(
    "@/contexts/supabase-auth-context",
  );
  return {
    ...actual,
    useSupabaseAuth: () => ({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      isGuestMode: false,
      guestRole: null,
      userRole: null,
      isAdmin: false,
      isWholesaler: false,
      isDreamscaper: false,
      isInvestor: false,
      isBuyer: false,
      isPegasus: false,
      hasPermission: () => false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
      enterGuestMode: vi.fn(),
      exitGuestMode: vi.fn(),
    }),
  };
});

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

class NoopResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    const contentRect = {
      x: 0,
      y: 0,
      width: 1024,
      height: 768,
      top: 0,
      right: 1024,
      bottom: 768,
      left: 0,
      toJSON: () => ({}),
    } as DOMRectReadOnly;
    this.callback(
      [{
        target,
        contentRect,
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      }],
      this as unknown as ResizeObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  (
    globalThis as unknown as {
      IntersectionObserver: typeof NoopIntersectionObserver;
    }
  ).IntersectionObserver = NoopIntersectionObserver;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  (globalThis as unknown as { ResizeObserver: typeof NoopResizeObserver })
    .ResizeObserver = NoopResizeObserver;
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
          <PeggyProvider>
            <Landing />
          </PeggyProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>,
  );

  return { ...result, history: memory.history as string[] };
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
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
    pageHeading: /From property to plan to execution/i,
    groupName: "The five operating stages",
    initialChoice: "Originate",
    nextChoice: "Structure",
    outputSelector: "#operating-stage",
    nextOutput: /Compare possible roles, strategies, and required terms/i,
  },
  {
    path: "/property-owners",
    pageHeading: /A clear next step for your property/i,
    groupName: "Common owner situations",
    initialChoice: "Significant repairs",
    nextChoice: "Inherited property",
    outputSelector: "#owner-path",
    nextOutput: /Record the known ownership, probate or trust status, decision-makers, and timing/i,
  },
  {
    path: "/deal-partners",
    pageHeading: /Bring the deal. Define the role/i,
    groupName: "What the deal is missing",
    initialChoice: "Seller access or negotiation",
    nextChoice: "Underwriting",
    outputSelector: "#partner-answer",
    nextOutput: /Separate supported property facts from visitor-entered scope/i,
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

  it("keeps four navigation destinations with direct tool access and one primary action", () => {
    const { container } = renderLanding("/");
    const nav = within(container.querySelector('nav')!);
    expect(nav.getAllByRole('link').map(link=>link.getAttribute('href'))).toEqual(['/','/our-work','/tools','/about','/bring-an-opportunity']);
    expect(nav.getByRole('button', {name:'Real Estate'})).toHaveAttribute('aria-expanded','false');
    expect(nav.queryByRole('link', {name:/MarketFlow/})).not.toBeInTheDocument();
    expect(container.querySelector('footer a[href="/marketflow"]')).toHaveTextContent('MarketFlow');
    expect(within(container.querySelector('[data-hv="plan"]')!).getByRole('link',{name:'Open Strategy Lab'})).toHaveAttribute('href','/strategy-lab');
  });

  it("marks the approved public spine active on its destinations", () => {
    const work = renderLanding("/our-work");
    expect(
      within(work.container.querySelector("nav")!).getByRole("link", {
        name: /Our Work/i,
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

    const initial = within(menu).getByRole("button", { name: "Close menu" });
    const first = within(menu).getByRole("button", { name: "Close menu" });
    expect(within(menu).getByText('Real Estate').closest('details')).not.toHaveAttribute('open');
    expect(within(menu).getByRole('link', {name:'Tools'})).toHaveAttribute('href','/tools');
    expect(container.querySelector('main')).toHaveAttribute('inert');
    await waitFor(() => expect(initial).toHaveFocus());

    first.focus();
    await user.tab({ shift: true });
    const last = document.activeElement;
    expect(last).not.toBe(first);
    expect(menu.contains(last)).toBe(true);

    await user.tab();
    expect(first).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveFocus();
    });
    expect(container.querySelector("nav")).not.toHaveAttribute("inert");
    expect(menu).not.toBeInTheDocument();
    expect(container.querySelector("main")).not.toHaveAttribute("inert");
  });

  it("keeps mobile core-page parity and follows a real first-level route", async () => {
    const user = userEvent.setup({ delay: null });
    const { history } = renderLanding("/");

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Primary navigation" });
    const coreSection = menu.querySelector<HTMLElement>('.site-mobile-body')!;
    const coreLinks = Array.from(menu.querySelectorAll<HTMLAnchorElement>('.site-mobile-link'));
    expect(coreLinks.map(link=>link.getAttribute('href'))).toEqual(['/our-work','/tools','/about']);
    expect(within(menu).getByRole('link',{name:'Bring an Opportunity'})).toHaveAttribute('href','/bring-an-opportunity');
    expect(menu.querySelector('a[href="/marketflow"]')).not.toBeInTheDocument();

    await user.click(within(coreSection!).getByRole("link", { name: "Our Work" }));
    await waitFor(() => {
      expect(history.at(-1)).toBe("/our-work");
      expect(menu).not.toBeInTheDocument();
    });
  });

  it("opens the Peggy dialog from the mobile menu entry", async () => {
    const user = userEvent.setup({ delay: null });
    renderLanding("/");

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Primary navigation" });
    await user.click(within(menu).getByRole("button", { name: "Talk to Peggy" }));

    expect(menu).not.toBeInTheDocument();
    expect(
      screen.getByRole("dialog", {
        name: "Peggy, the Pegasus intake concierge",
      }),
    ).toHaveAttribute("aria-hidden", "false");
  });

  it("carries the /peggy page prompt into the live Peggy composer", async () => {
    const user = userEvent.setup({ delay: null });
    renderLanding("/peggy");

    const pagePrompt = await screen.findByRole("textbox", {
      name: "Describe your deal",
    });
    await user.type(pagePrompt, "I inherited a duplex that needs major repairs");
    await user.click(
      within(pagePrompt.closest("form")!).getByRole("button", { name: "Open Peggy" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Peggy, the Pegasus intake concierge",
    });
    expect(dialog).toHaveAttribute("aria-hidden", "false");
    expect(within(dialog).getByRole("textbox", { name: "Talk to Peggy" })).toHaveValue(
      "I inherited a duplex that needs major repairs",
    );
  });
});

describe("Pegasus v6 Landing-shell choice controls", () => {
  it("uses pressed-button semantics for the MarketFlow relationship brief", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderLanding("/marketflow");
    const main = container.querySelector("main")!;
    const group = await within(main).findByRole("group", {
      name: "MarketFlow relationship roles",
    }, { timeout: 5000 });
    expect(main.querySelector('[role="tablist"]')).toBeNull();

    const source = within(group).getByRole("button", { name: "Deal source" });
    const buyer = within(group).getByRole("button", { name: "Buyer" });
    expect(source).toHaveAttribute("aria-pressed", "true");
    expect(buyer).toHaveAttribute("aria-pressed", "false");

    await user.click(buyer);
    expect(source).toHaveAttribute("aria-pressed", "false");
    expect(buyer).toHaveAttribute("aria-pressed", "true");
    expect(within(main).getByText(/Define the buyer mandate/i)).toBeInTheDocument();
  });

  for (const route of SIGNATURE_ROUTES) {
    it(`${route.path} uses button-group semantics and announces the current output`, async () => {
      const { container } = renderLanding(route.path);

      await screen.findByRole(
        "heading",
        { name: route.pageHeading },
        { timeout: 5000 },
      );
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
  it("keeps the mounted entry concise and carries the full operating boundary", async () => {
    const { container } = renderLanding("/strategy-lab");
    const main = container.querySelector("main")!;

    await within(main).findByRole("heading", {
      name: /Strategy Lab\./i,
    });

    expect(
      within(main).getByText(/Explore a property’s costs, assumptions, and possible next steps/),
    ).toBeInTheDocument();
    expect(
      within(main).queryByLabelText(/Strategy Lab operating record/i),
    ).not.toBeInTheDocument();
    expect(
      within(main).queryByLabelText(/Strategy Lab principles/i),
    ).not.toBeInTheDocument();

    const boundary = within(main).getByTestId("text-strategy-disclaimer");
    expect(boundary).toHaveTextContent(
      "Strategy Lab outputs come from visitor-entered, unverified assumptions and an automated model. They are preliminary and directional, not legal, tax, lending, accounting, appraisal, engineering, securities, construction, or investment advice. Carrying a brief into intake does not guarantee review, response, routing, an offer, or a timeline.",
    );
  });

  it("opens on the real decision desk, advances steps, and moves focus to the current workspace heading", async () => {
    const { container } = renderLanding("/strategy-lab");

    await screen.findByRole("heading", {
      name: /Strategy Lab\./i,
    });
    const main = container.querySelector("main");
    expect(main).toBeTruthy();

    const basisStep = within(main!).getByRole("button", { name: /02\s*Assumptions/i });
    fireEvent.click(basisStep);

    const heading = await within(main!).findByRole("heading", {
      name: /Strategy Lab Assumptions step/i,
    });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(
      within(main!).getByRole("heading", {
        name: /Set the assumptions/i,
      }),
    ).toBeInTheDocument();
    expect(basisStep).toHaveAttribute("aria-current", "step");
  });

  it("holds conclusions and intake handoff until the numeric basis is valid", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderLanding("/strategy-lab");
    const main = container.querySelector("main")!;

    await user.click(within(main).getByRole("button", { name: /02\s*Assumptions/i }));
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
    expect(within(main).getAllByText("Not entered").length).toBeGreaterThan(0);

    await user.click(within(main).getByRole("button", { name: /03\s*Compare/i }));
    expect(
      within(main).getByRole("status", { name: /More inputs required/i }),
    ).toHaveTextContent(/Decision brief not generated/i);
    expect(within(main).queryByText(/View all nine paths/i)).not.toBeInTheDocument();
    expect(
      within(main).getByRole("button", { name: /Carry this brief into intake/i }),
    ).toBeDisabled();

    await user.click(within(main).getByRole("button", { name: /04\s*Summary/i }));
    expect(
      within(main).getByRole("status", { name: /Decision brief unavailable/i }),
    ).toHaveTextContent(/needs valid inputs/i);
    expect(within(main).queryByText(/Read the full engine rationale/i)).not.toBeInTheDocument();
  });

  it("carries one valid basis through live paths, the brief, and the intake handoff", async () => {
    const user = userEvent.setup({ delay: null });
    const { container, history } = renderLanding("/strategy-lab");
    const main = container.querySelector("main")!;

    await user.type(
      within(main).getByRole("textbox", { name: /Property address or city/i }),
      "19 Bay View Ave, Walnut Creek",
    );
    await user.click(within(main).getByRole("button", { name: /02\s*Assumptions/i }));
    expect(within(main).queryByText(/02 · Basis ledger/i)).not.toBeInTheDocument();

    const acquisition = within(main).getByRole("textbox", {
      name: /Acquisition or current basis/i,
    });
    const scope = within(main).getByRole("textbox", {
      name: /Scope \/ improvement budget/i,
    });
    const exitValue = within(main).getByRole("textbox", {
      name: /Projected exit value/i,
    });
    const marketRent = within(main).getByRole("textbox", {
      name: /Projected monthly market rent/i,
    });
    await user.type(acquisition, "600000");
    await user.type(scope, "105000");
    await user.type(exitValue, "840000");
    await user.type(marketRent, "4500");

    await user.click(within(main).getByRole("button", { name: /03\s*Compare/i }));
    expect(
      within(main).getByRole("heading", { name: /Compare the possible paths/i }),
    ).toBeInTheDocument();
    expect(within(main).getByText(/View all nine paths/i)).toBeInTheDocument();
    expect(
      within(main).getByRole("button", { name: /Carry this brief into intake/i }),
    ).toBeEnabled();

    await user.click(within(main).getByRole("button", { name: /04\s*Summary/i }));
    expect(
      within(main).getByRole("region", { name: /Decision brief/i }),
    ).toBeInTheDocument();
    const intake = within(main).getByRole("button", {
      name: /Carry this brief into intake/i,
    });
    expect(intake).toBeEnabled();
    await user.click(intake);

    await waitFor(() => {
      expect(history).toContain(
        "/bring-an-opportunity?intent=property&ref=strategy-lab",
      );
    });
    expect(window.sessionStorage.length).toBeGreaterThan(0);
  });

  it("opens the real calculator selection model directly and focuses it", async () => {
    const user = userEvent.setup({ delay: null });
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      const { container } = renderLanding("/strategy-lab");
      const main = container.querySelector("main")!;
      await user.click(
        within(main).getByRole("button", { name: /Open calculators/i }),
      );

      const panel = await within(main).findByRole("region", {
        name: /Decision calculators/i,
      });
      await within(panel).findByRole("tablist", undefined, { timeout: 5000 });
      expect(within(main).getAllByRole("tablist")).toHaveLength(1);
      expect(
        within(main).queryByRole("group", { name: /Underwriting instruments/i }),
      ).not.toBeInTheDocument();
      expect(within(main).queryByText(/Selected worksheet/i)).not.toBeInTheDocument();
      expect(
        within(main).queryByRole("button", { name: /Open detailed worksheet/i }),
      ).not.toBeInTheDocument();
      await waitFor(() => expect(panel).toHaveFocus());
      expect(scrollIntoView).toHaveBeenCalledWith({
        block: "start",
        behavior: "smooth",
      });
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });

  it("uses non-animated calculator focus when reduced motion is preferred", async () => {
    const user = userEvent.setup({ delay: null });
    const originalMatchMedia = window.matchMedia;
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      const { container } = renderLanding("/strategy-lab");
      const main = container.querySelector("main")!;
      await user.click(
        within(main).getByRole("button", { name: /Open calculators/i }),
      );

      const panel = await within(main).findByRole("region", {
        name: /Decision calculators/i,
      });
      await waitFor(() => expect(panel).toHaveFocus());
      expect(scrollIntoView).toHaveBeenCalledWith({
        block: "start",
        behavior: "auto",
      });
      expect(scrollIntoView).not.toHaveBeenCalledWith({
        block: "start",
        behavior: "smooth",
      });
    } finally {
      window.matchMedia = originalMatchMedia;
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });

  it("opens calculator deep links at the single real selector and keeps the selected tab in the URL", async () => {
    const user = userEvent.setup({ delay: null });
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState({}, "", "/strategy-lab?tool=calculators&tab=roi");
    try {
      const { container } = renderLanding("/strategy-lab");
      const main = container.querySelector("main")!;

      const panel = await within(main).findByRole("region", {
        name: /Decision calculators/i,
      });
      await within(panel).findByRole("tablist");
      expect(within(main).getAllByRole("tablist")).toHaveLength(1);
      const roi = within(panel).getByRole("tab", { name: /^ROI$/i });
      const cashFlow = within(panel).getByRole("tab", { name: /Cash Flow/i });
      expect(roi).toHaveAttribute("aria-selected", "true");
      expect(cashFlow).toHaveAttribute("aria-selected", "false");
      await waitFor(() => expect(panel).toHaveFocus());
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "auto" });

      await user.click(cashFlow);
      expect(roi).toHaveAttribute("aria-selected", "false");
      expect(cashFlow).toHaveAttribute("aria-selected", "true");
      expect(window.location.search).toContain("tool=calculators");
      expect(window.location.search).toContain("tab=cashflow");
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });
});

describe("Pegasus v6 live About routing", () => {
  it("uses real canonical links for both Bring an Opportunity actions", async () => {
    const { container } = renderLanding("/about");

    await screen.findByRole("heading", {
      name: /Apollo Duran/i,
    });
    const main = container.querySelector("main");
    expect(main).toBeTruthy();

    const links = within(main!).getAllByRole("link", {
      name: /Start a conversation|Contact Apollo/i,
    });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/contact");
    }

    expect(
      within(main!).queryByRole("button", { name: /Bring an Opportunity/i }),
    ).not.toBeInTheDocument();
  });
});
