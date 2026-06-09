import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  HomePage,
  CategoryPage,
  DealArchitecturePage,
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
import { CTABand } from "@/pegasus/blocks";
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
const parallaxRef = React.createRef<HTMLDivElement>();

// The valid `go(...)` destinations: exactly the keys ROUTE_TO_URL knows about.
const VALID_ROUTES = new Set<string>(Object.keys(ROUTE_TO_URL));

// Real surfaces a page *body* link may legitimately deep-link to that are not
// part of the Pegasus prototype's own route map (standalone functional pages).
const KNOWN_EXTRA_PATHS = ["/faq"];
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
    render: (go) => (
      <HomePage go={go} theme="light" parallaxRef={parallaxRef} openPeggy={noop} />
    ),
  },
  { name: "Sellers", route: "/sellers", render: (go) => <CategoryPage cat={CATEGORIES.sellers} go={go} openPeggy={noop} /> },
  { name: "Buyers", route: "/buyers", render: (go) => <CategoryPage cat={CATEGORIES.buyers} go={go} openPeggy={noop} /> },
  { name: "Deal finders", route: "/dealfinders", render: (go) => <CategoryPage cat={CATEGORIES.dealfinders} go={go} openPeggy={noop} /> },
  { name: "Capital", route: "/capital", render: (go) => <CategoryPage cat={CATEGORIES.capital} go={go} openPeggy={noop} /> },
  { name: "Operators", route: "/operators", render: (go) => <CategoryPage cat={CATEGORIES.operators} go={go} openPeggy={noop} /> },
  { name: "Referral", route: "/referral", render: (go) => <CategoryPage cat={CATEGORIES.referral} go={go} openPeggy={noop} /> },
  { name: "Deal Architecture", route: "/deal-architecture", render: (go) => <DealArchitecturePage go={go} openPeggy={noop} /> },
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
      <HomePage go={go} theme="light" parallaxRef={parallaxRef} openPeggy={noop} />,
      "/",
    );
    clickAll(container);

    expect(calls.length, "Home triggered no go() navigations").toBeGreaterThan(3);
    expect(calls, "Home hero must offer Submit a Property").toContain("submit");
    expect(calls, "Home must offer the Strategy Lab").toContain("strategylab");
    for (const r of calls) {
      expect(VALID_ROUTES.has(r), `Home routed to unknown key '${r}'`).toBe(true);
    }
  });
});

describe("CTABand primaryAction always resolves to a real route (Task #201)", () => {
  const SUPPORTED: Route[] = [
    "contact",
    "strategylab",
    "submit",
    "apollo",
    "marketflow",
    "dealarchitecture",
  ];

  it("default primaryAction navigates to a real route", () => {
    const { go, calls } = makeGo();
    const { container } = renderPage(
      <CTABand go={go} openPeggy={noop} title="t" text="x" />,
    );
    const primary = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => (b.textContent || "").trim().startsWith("Start a Property Review"));
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
