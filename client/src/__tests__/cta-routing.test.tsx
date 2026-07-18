import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  CategoryPage,
  CapitalPage,
  InvestmentsPage,
  DevelopmentPage,
  StrategyLabPage,
  MarketFlowPage,
  WorkWithApolloPage,
  EcosystemPage,
  AboutPage,
  ContactPage,
  PeggyPage,
} from "@/pegasus/pages";
import { HomePageV51 } from "@/pegasus/home-v51";
import { OurWorkPage } from "@/pegasus/our-work";
import { HowWeOperatePage } from "@/pegasus/how-we-operate";
import { PropertyOwnersPage } from "@/pegasus/property-owners";
import { DealPartnersPage } from "@/pegasus/deal-partners";
import { CTABand } from "@/pegasus/blocks";
import { StrategyTierStrip } from "@/pegasus/forms";
import { CATEGORIES } from "@/pegasus/data";
import { ROUTE_TO_URL } from "@/pegasus/routes";
import type { Route } from "@/pegasus/theme";

// CTA dead-end net (Task #201).
//
// Task #195's sibling spec (cta-labels.test.tsx) catches generic/off-script
// CTA *labels* — but it never checks where a CTA goes. replit.md's "CTA
// routing table" requires every interior CTA to route to a real surface
// (a known route, the Peggy widget, an on-page anchor, a real path) with no
// dead ends. Nothing verified the destination, so a future edit could wire a
// correct-looking CTA to a route key that doesn't exist or to a blank shell.
//
// This suite renders every public Pegasus marketing page, clicks every CTA in
// the page body, and captures every navigation. It asserts:
//   1. Every `go(route)` call (CTABand `primaryAction`, the data-driven
//      LaneCards/Pillars/Ecosystem/NextStep/SplitPaths wiring, the
//      DoorsBlock/ProductLadder `run(...)` mapping, etc.) resolves to a known
//      key in ROUTE_TO_URL that maps to a non-empty URL.
//   2. Every rendered `<a href>` CTA points at a real surface: a known route
//      URL, an in-page anchor whose target element exists, /faq, a
//      mailto:/tel:/http link — never a dead path or a missing anchor.
//
// A regression that points a CTA at an unmapped route key, or at an in-page
// anchor that no longer exists, fails here.

const noop = () => {};

// The valid `go(...)` destinations: exactly the keys ROUTE_TO_URL knows about.
const VALID_ROUTES = new Set<string>(Object.keys(ROUTE_TO_URL));

// Real surfaces a page *body* link may legitimately deep-link to that are not
// part of the Pegasus prototype's own route map (standalone functional pages).
// Public Website v1 (issue #22): the standalone PRD surfaces the prototype
// chrome and pages deep-link to.
const KNOWN_EXTRA_PATHS = [
  "/faq",
  // v5.1 §31: the canonical intake desk URL (primary public action).
  "/bring-an-opportunity",
  "/submit-property",
  "/pegasus-standard",
  "/departments",
  "/case-study",
  "/projects/nelson-dr",
];
const KNOWN_PATHS = new Set<string>([
  ...Object.values(ROUTE_TO_URL),
  ...KNOWN_EXTRA_PATHS,
]);

function renderPage(ui: React.ReactElement, routePath = "/") {
  const { hook } = memoryLocation({ path: routePath, static: true });
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={qc}>
      <Router hook={hook}>{ui}</Router>
    </QueryClientProvider>,
  );
}

// A `go` spy that records every route key it is asked to navigate to.
function makeGo() {
  const calls: string[] = [];
  const go = ((r: Route) => {
    calls.push(String(r));
  }) as (r: Route) => void;
  return { go, calls };
}

// Click every enabled clickable in the page body. Handlers that have nothing
// to do with navigation (FAQ accordions, the strategy console, form submits)
// are harmless and any thrown side effect is swallowed — we only care that the
// navigation handlers we *do* trigger resolve to a real destination.
function clickAll(container: HTMLElement) {
  const els = Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [role="button"]',
    ),
  );
  for (const el of els) {
    try {
      fireEvent.click(el);
    } catch {
      /* ignore non-navigation side effects */
    }
  }
}

// Returns the href of every `<a>` CTA that points nowhere real.
function deadAnchors(container: HTMLElement): string[] {
  const bad: string[] = [];
  for (const a of Array.from(
    container.querySelectorAll<HTMLAnchorElement>("a[href]"),
  )) {
    const href = a.getAttribute("href") || "";
    if (
      !href ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("http")
    ) {
      continue;
    }
    if (href.startsWith("#")) {
      const id = href.slice(1);
      // An in-page anchor must have a matching target in the rendered page.
      if (id && !container.querySelector(`[id="${id}"]`)) bad.push(href);
      continue;
    }
    const path = href.split(/[?#]/)[0];
    if (!KNOWN_PATHS.has(path)) bad.push(href);
  }
  return bad;
}

type PageSpec = {
  name: string;
  route: string;
  render: (go: (r: Route) => void) => React.ReactElement;
};

const PAGES: PageSpec[] = [
  {
    name: "Home",
    route: "/",
    render: (go) => <HomePageV51 go={go} openPeggy={noop} />,
  },
  { name: "Property Owners", route: "/property-owners", render: (go) => <PropertyOwnersPage go={go} /> },
  { name: "Buyers", route: "/buyers", render: (go) => <CategoryPage cat={CATEGORIES.buyers} go={go} openPeggy={noop} /> },
  { name: "Deal Partners", route: "/deal-partners", render: (go) => <DealPartnersPage go={go} /> },
  { name: "Capital", route: "/capital", render: (go) => <CapitalPage go={go} /> },
  { name: "Operators", route: "/operators", render: (go) => <CategoryPage cat={CATEGORIES.operators} go={go} openPeggy={noop} /> },
  { name: "Referral", route: "/referral", render: (go) => <CategoryPage cat={CATEGORIES.referral} go={go} openPeggy={noop} /> },
  { name: "How We Operate", route: "/how-we-operate", render: (go) => <HowWeOperatePage go={go} /> },
  { name: "Our Work", route: "/our-work", render: (go) => <OurWorkPage go={go} /> },
  { name: "Investments", route: "/investments", render: (go) => <InvestmentsPage go={go} openPeggy={noop} /> },
  { name: "Development", route: "/development", render: (go) => <DevelopmentPage go={go} /> },
  { name: "Strategy Lab", route: "/strategy-lab", render: (go) => <StrategyLabPage go={go} openPeggy={noop} /> },
  { name: "MarketFlow", route: "/marketflow", render: (go) => <MarketFlowPage go={go} /> },
  { name: "Work with Apollo", route: "/work-with-apollo", render: (go) => <WorkWithApolloPage go={go} /> },
  { name: "Ecosystem", route: "/ecosystem", render: (go) => <EcosystemPage go={go} openPeggy={noop} /> },
  { name: "About", route: "/about", render: (go) => <AboutPage go={go} openPeggy={noop} /> },
  { name: "Contact", route: "/contact", render: () => <ContactPage /> },
  { name: "Peggy", route: "/peggy", render: (go) => <PeggyPage go={go} openPeggy={noop} /> },
];

afterEach(() => cleanup());

describe("Public Pegasus CTAs never point at a dead destination (Task #201)", () => {
  for (const spec of PAGES) {
    it(`${spec.name}: every CTA resolves to a known route or real surface`, () => {
      const { go, calls } = makeGo();
      const { container } = renderPage(spec.render(go), spec.route);
      clickAll(container);

      const unknownRoutes = Array.from(new Set(calls)).filter(
        (r) => !VALID_ROUTES.has(r),
      );
      expect(
        unknownRoutes,
        `${spec.name} navigates to unknown route key(s): ${unknownRoutes.join(", ")}`,
      ).toEqual([]);

      // Every captured route must map to a non-empty URL (no blank shell).
      for (const r of calls) {
        expect(
          ROUTE_TO_URL[r as Route],
          `${spec.name}: route '${r}' has no URL in ROUTE_TO_URL`,
        ).toBeTruthy();
      }

      const dead = deadAnchors(container);
      expect(
        dead,
        `${spec.name} has dead-end link(s): ${dead.join(", ")}`,
      ).toEqual([]);
    });
  }
});

describe("Click harness actually exercises navigation (Task #201)", () => {
  // Guards against a vacuous pass: if the harness stopped triggering the
  // page's onClick wiring, this asserts Home still produces real navigations.
  it("Home routes its CTAs through go() to real destinations", () => {
    const { go, calls } = makeGo();
    const { container } = renderPage(
      <HomePageV51 go={go} openPeggy={noop} />,
      "/",
    );
    clickAll(container);

    expect(calls.length, "Home triggered no go() navigations").toBeGreaterThan(2);
    // v5.1: the Visitor Router + Proof movements must route to real pages.
    expect(calls, "Home router must offer the owner lane").toContain("sellers");
    expect(calls, "Home proof must route to Our Work").toContain("ourwork");
    for (const r of calls) {
      expect(VALID_ROUTES.has(r), `Home routed to unknown key '${r}'`).toBe(true);
    }
    // §31: the primary CTA is a real link to the canonical intake URL.
    const primary = Array.from(container.querySelectorAll("a")).find((a) =>
      a.textContent?.includes("Bring an Opportunity"),
    );
    expect(primary?.getAttribute("href")).toBe("/bring-an-opportunity");
  });
});

describe("CTABand primaryAction always resolves to a real route (Task #201)", () => {
  const SUPPORTED: Route[] = [
    "contact",
    "strategylab",
    "submit",
    "apollo",
    "marketflow",
    "dealstrategy",
  ];

  it("default primaryAction navigates to a real route", () => {
    const { go, calls } = makeGo();
    const { container } = renderPage(
      <CTABand go={go} openPeggy={noop} title="t" text="x" />,
    );
    const primary = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => (b.textContent || "").trim().startsWith("Request a Property Review"));
    expect(primary, "CTABand did not render its default primary CTA").toBeTruthy();
    fireEvent.click(primary!);
    expect(calls).toEqual(["contact"]);
    expect(VALID_ROUTES.has("contact")).toBe(true);
  });

  for (const action of SUPPORTED) {
    it(`primaryAction='${action}' navigates there and the route is mapped`, () => {
      const { go, calls } = makeGo();
      const { container } = renderPage(
        <CTABand
          go={go}
          openPeggy={noop}
          title="t"
          text="x"
          primaryAction={action}
          primaryLabel="Take the next step"
        />,
      );
      const primary = Array.from(
        container.querySelectorAll<HTMLButtonElement>("button"),
      ).find((b) => (b.textContent || "").trim().startsWith("Take the next step"));
      expect(primary, "primary CTA not found").toBeTruthy();
      fireEvent.click(primary!);
      expect(calls).toEqual([action]);
      expect(
        ROUTE_TO_URL[action],
        `CTABand primaryAction '${action}' is not a mapped route`,
      ).toBeTruthy();
    });
  }
});

// Programmatic CTA net (Task #210).
//
// The dead-end net above (Task #201) only sees CTAs wired through `go(route)`
// (captured by the go spy) or a rendered `<a href>`. But several CTAs navigate
// *programmatically* via wouter's `setLocation(path)` instead — so they never
// touch the go spy and render no anchor, and were previously unchecked:
//
//   - WorkWithApolloPage's "What brings you here?" ApolloSelector
//     (setLocation('/submit?intent=property') / '/submit?intent=deal-jv')
//   - StrategyTierStrip's tier buttons
//     (setLocation('/submit') / '/submit?intent=blueprint')
//
// A future edit could point one of these at a route that doesn't exist, or pass
// an `?intent=` value the canonical /submit intake doesn't recognize, and the
// only signal would be a 404 / silently-ignored prefill at runtime. This suite
// renders those surfaces, drives each programmatic CTA, captures the real
// wouter navigation, and asserts the destination path is a known app route and
// any intent is one /submit actually accepts.

// The exact set of `?intent=` values the canonical /submit intake recognizes.
// Mirrors the zod enum + allow-list in client/src/pages/submit.tsx; a drift
// there (renamed/removed intent) without updating a CTA fails here.
const VALID_INTENTS = new Set<string>([
  "sell",
  "property",
  "adu",
  "deal-jv",
  "explore",
  "blueprint",
]);

// Real app routes a programmatic CTA may legitimately land on: the same set the
// anchor net uses (Pegasus route map + standalone functional pages like /faq).
const KNOWN_NAV_PATHS = KNOWN_PATHS;

// jsdom has no scrollIntoView; the form-mode selector CTAs call it. Stub it so
// clicks don't throw (we only assert on the navigations, not the scroll).
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

// Render inside a *real* (non-static) in-memory router that records its history,
// so a `setLocation(path)` actually updates the location and we can read it.
function renderWithHistory(ui: React.ReactElement, routePath = "/") {
  const mem = memoryLocation({ path: routePath, record: true });
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const utils = render(
    <QueryClientProvider client={qc}>
      <Router hook={mem.hook}>{ui}</Router>
    </QueryClientProvider>,
  );
  return { ...utils, history: mem.history as string[] };
}

// Assert a captured navigation target points at a real route + valid intent.
function expectValidNavTarget(target: string, ctx: string) {
  const path = target.split(/[?#]/)[0];
  expect(
    KNOWN_NAV_PATHS.has(path),
    `${ctx} navigates to unknown path: ${target}`,
  ).toBe(true);
  const query = target.includes("?") ? target.split("?")[1] : "";
  const intent = new URLSearchParams(query).get("intent");
  if (intent !== null) {
    expect(
      VALID_INTENTS.has(intent),
      `${ctx} uses an ?intent= value /submit does not recognize: ${intent}`,
    ).toBe(true);
  }
}

describe("Programmatic setLocation CTAs resolve to a real route + valid intent (Task #210)", () => {
  it("ApolloSelector link CTAs navigate to /submit with a recognized intent", () => {
    const { container, history } = renderWithHistory(
      <WorkWithApolloPage go={noop as unknown as (r: Route) => void} />,
      "/work-with-apollo",
    );

    const tabs = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        '[data-testid^="apollo-selector-"]',
      ),
    );
    expect(tabs.length, "ApolloSelector rendered no option tabs").toBeGreaterThan(0);

    const navTargets: string[] = [];
    for (const tab of tabs) {
      fireEvent.click(tab);
      const cta = container.querySelector<HTMLButtonElement>(
        '[data-testid="button-apollo-selector-cta"]',
      );
      expect(cta, "ApolloSelector CTA button not found").toBeTruthy();
      const before = history.length;
      fireEvent.click(cta!);
      // A link-mode option pushes a navigation; a form-mode option only scrolls.
      if (history.length > before) navTargets.push(history[history.length - 1]);
    }

    // Non-vacuous: the two link-mode options must have produced real navigations.
    expect(navTargets).toContain("/submit?intent=property");
    expect(navTargets).toContain("/submit?intent=deal-jv");

    for (const target of navTargets) {
      expectValidNavTarget(target, "ApolloSelector");
    }
  });

  it("StrategyTierStrip tier CTAs navigate to /submit with a recognized intent", () => {
    const { container, history } = renderWithHistory(
      <StrategyTierStrip />,
      "/strategy-lab",
    );

    const tierButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        '[data-testid^="button-tier-"]',
      ),
    );
    expect(
      tierButtons.length,
      "StrategyTierStrip rendered no actionable tier buttons",
    ).toBeGreaterThan(0);

    const navTargets: string[] = [];
    for (const btn of tierButtons) {
      const before = history.length;
      fireEvent.click(btn);
      if (history.length > before) navTargets.push(history[history.length - 1]);
    }

    // Non-vacuous: the snapshot + blueprint tiers route to canonical /submit.
    expect(navTargets).toContain("/submit");
    expect(navTargets).toContain("/submit?intent=blueprint");

    for (const target of navTargets) {
      expectValidNavTarget(target, "StrategyTierStrip");
    }
  });
});
