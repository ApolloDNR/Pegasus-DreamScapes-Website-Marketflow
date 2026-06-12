import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
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

// CTA label drift net (Task #195).
//
// replit.md's Website Director Standard documents a strict CTA contract:
// interior-page CTAs must be specific (verb + outcome the page earns) and
// must never fall back to the generic labels "Learn more", "Click here",
// or "Get started". A bare "Submit" is banned, and the global primary CTA
// "Submit a Property" belongs in the nav chrome, not interior page bodies.
//
// The old anti-drift tripwires were retired, so nothing enforced this — the
// next edit could silently reintroduce a generic CTA. This suite renders
// every public Pegasus marketing page (without the nav chrome) and asserts
// no CTA in the page *body* uses a banned generic label. It also exercises
// the shared CTABand's per-page `primaryLabel` override so a regression to
// the generic default on a page that customized it is caught.
//
// Sanctioned exception: the Home hero echoes the global primary CTA
// ("Submit a Property" -> /submit) because the home page's one job is to
// orient + route. That single surface is allowed to surface it; every other
// interior body must speak to its own job.

const noop = () => {};

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

// Every clickable label rendered into the page body.
function ctaLabels(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('button, a[href], [role="button"]'),
  )
    .map((el) => (el.textContent || "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

// Substring matches: these are generic no matter what surrounds them.
const BANNED_SUBSTRINGS = ["learn more", "click here", "get started"];

function bannedOffenders(
  labels: string[],
  { allowSubmitProperty = false }: { allowSubmitProperty?: boolean } = {},
): string[] {
  const offenders: string[] = [];
  for (const label of labels) {
    const lower = label.toLowerCase();
    if (BANNED_SUBSTRINGS.some((g) => lower.includes(g))) {
      offenders.push(label);
      continue;
    }
    // Bare "Submit" with no outcome ("Submit a Deal" / "Submit a Referral"
    // are fine; a lone "Submit" is not).
    if (lower === "submit") {
      offenders.push(label);
      continue;
    }
    if (!allowSubmitProperty && lower.includes("submit a property")) {
      offenders.push(label);
    }
  }
  return offenders;
}

type PageSpec = {
  name: string;
  route: string;
  element: React.ReactElement;
  allowSubmitProperty?: boolean;
};

const homeParallaxRef = React.createRef<HTMLDivElement>();

const PAGES: PageSpec[] = [
  {
    name: "Home",
    route: "/",
    // Home's job is orient + route, so it is allowed to echo the global
    // primary CTA ("Submit a Property") in its hero.
    allowSubmitProperty: true,
    element: (
      <HomePage go={noop} theme="light" parallaxRef={homeParallaxRef} openPeggy={noop} />
    ),
  },
  { name: "Sellers", route: "/sellers", element: <CategoryPage cat={CATEGORIES.sellers} go={noop} openPeggy={noop} /> },
  { name: "Buyers", route: "/buyers", element: <CategoryPage cat={CATEGORIES.buyers} go={noop} openPeggy={noop} /> },
  { name: "Deal finders", route: "/dealfinders", element: <CategoryPage cat={CATEGORIES.dealfinders} go={noop} openPeggy={noop} /> },
  { name: "Capital", route: "/capital", element: <CategoryPage cat={CATEGORIES.capital} go={noop} openPeggy={noop} /> },
  { name: "Operators", route: "/operators", element: <CategoryPage cat={CATEGORIES.operators} go={noop} openPeggy={noop} /> },
  { name: "Referral", route: "/referral", element: <CategoryPage cat={CATEGORIES.referral} go={noop} openPeggy={noop} /> },
  { name: "Deal Architecture", route: "/deal-architecture", element: <DealArchitecturePage go={noop} openPeggy={noop} /> },
  { name: "Investments", route: "/investments", element: <InvestmentsPage go={noop} openPeggy={noop} /> },
  { name: "Development", route: "/development", element: <DevelopmentPage go={noop} /> },
  { name: "Strategy Lab", route: "/strategy-lab", element: <StrategyLabPage go={noop} openPeggy={noop} /> },
  { name: "MarketFlow", route: "/marketflow", element: <MarketFlowPage go={noop} /> },
  { name: "Work with Apollo", route: "/work-with-apollo", element: <WorkWithApolloPage go={noop} /> },
  { name: "Ecosystem", route: "/ecosystem", element: <EcosystemPage go={noop} openPeggy={noop} /> },
  { name: "About", route: "/about", element: <AboutPage go={noop} openPeggy={noop} /> },
  { name: "Contact", route: "/contact", element: <ContactPage /> },
  { name: "Peggy", route: "/peggy", element: <PeggyPage go={noop} openPeggy={noop} /> },
];

afterEach(() => cleanup());

describe("Public Pegasus pages never ship a generic CTA label (Task #195)", () => {
  for (const spec of PAGES) {
    it(`${spec.name} body has no banned generic CTA`, () => {
      const { container } = renderPage(spec.element, spec.route);
      const labels = ctaLabels(container);
      // Sanity: the page actually rendered clickable CTAs.
      expect(labels.length, `${spec.name} rendered no clickable CTAs`).toBeGreaterThan(0);
      const offenders = bannedOffenders(labels, {
        allowSubmitProperty: spec.allowSubmitProperty,
      });
      expect(
        offenders,
        `${spec.name} renders banned generic CTA label(s): ${offenders.join(", ")}`,
      ).toEqual([]);
    });
  }
});

describe("CTABand per-page primaryLabel override is wired (Task #195)", () => {
  it("renders its primaryLabel prop verbatim", () => {
    const { container } = renderPage(
      <CTABand go={noop} openPeggy={noop} title="t" text="x" primaryLabel="Start with one honest read" />,
    );
    const labels = ctaLabels(container);
    expect(labels.some((l) => l === "Start with one honest read")).toBe(true);
    // The generic-but-not-banned default must not leak through when overridden.
    expect(labels.some((l) => l === "Request a Property Review")).toBe(false);
  });

  it("About page surfaces its overridden CTA, not the CTABand default", () => {
    const { container } = renderPage(<AboutPage go={noop} openPeggy={noop} />, "/about");
    const labels = ctaLabels(container);
    // Locks the override in: a regression back to the default 'Request a
    // Property Review' (which the banned-label net would NOT catch) fails here.
    expect(
      labels.some((l) => l === "Start with one honest read"),
      "About page must keep its bespoke CTABand primaryLabel",
    ).toBe(true);
    expect(labels.some((l) => l === "Request a Property Review")).toBe(false);
  });
});
