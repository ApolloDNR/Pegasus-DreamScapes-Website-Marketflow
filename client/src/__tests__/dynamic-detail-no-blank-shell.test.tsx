import React from "react";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Dynamic-detail-page blank-shell net (Task #217).
//
// The standalone net (standalone-no-blank-shell.test.tsx) deliberately
// EXCLUDES dynamic :param routes — there's no canned id/slug to resolve, so
// those pages never get exercised there. But /projects/:slug (ProjectDetail),
// the project detail page and snapshot share pages
// (/snapshot/calc/:token, /snapshot/property/:token, /snapshot/:token) are
// exactly the data-driven surfaces that can silently render a blank or
// crashing shell after a refactor with NO test catching it.
//
// This suite mounts each dynamic detail route through the REAL App router
// stack (the exported <AppRouter>), with a stubbed successful data response so
// each page reaches its LOADED state (not just the skeleton/loader). It then
// asserts a real heading + substantive copy and that the route did not fall
// through to the 404 NotFound page. A detail route that resolves to a
// blank/crashing page fails CI.

// Auth mock — public (unauthenticated) state, mirroring the standalone net.
const authState: Record<string, unknown> = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  userRole: null,
  isGuestMode: false,
  guestRole: null,
  isWholesaler: false,
  isDreamscaper: false,
  isInvestor: false,
  isBuyer: false,
  isPegasus: false,
  hasPermission: () => false,
  enterGuestMode: () => {},
  signOut: async () => {},
};

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => authState,
  getRoleDashboardPath: () => "/marketflow",
  canAccessRoute: () => true,
  isAdminRole: (role: string | null) => role === "admin",
  SupabaseAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/hooks/use-seo", () => ({ useSEO: () => {} }));
vi.mock("@/lib/analytics", () => ({
  trackCtaClick: () => {},
  trackEvent: () => {},
  initAnalytics: () => {},
}));

// jsdom polyfills — ScrollReveal/IntersectionObserver, hero parallax
// (matchMedia), Radix (ResizeObserver), and scroll handlers rely on these.
class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
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
if (typeof globalThis.ResizeObserver === "undefined") {
  (globalThis as unknown as { ResizeObserver: typeof NoopResizeObserver }).ResizeObserver =
    NoopResizeObserver;
}
if (typeof globalThis.IntersectionObserver === "undefined") {
  (globalThis as unknown as { IntersectionObserver: typeof NoopIntersectionObserver }).IntersectionObserver =
    NoopIntersectionObserver;
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
if (typeof window !== "undefined" && !(window as unknown as { scrollTo?: unknown }).scrollTo) {
  (window as unknown as { scrollTo: () => void }).scrollTo = () => {};
}

import { Router as AppRouter } from "@/LegacyApp";
import { SiteContentProvider } from "@/contexts/site-content-context";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { DemoModeProvider } from "@/contexts/demo-mode-context";
import { PeggyProvider } from "@/contexts/peggy-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { DealActionProvider } from "@/contexts/deal-action-context";
import { TooltipProvider } from "@/components/ui/tooltip";

// ─── Canned successful data responses ──────────────────────────────────────
// Each detail page reaches its LOADED state from these, so the test exercises
// the real rendered page, not the loading skeleton or the error fallback.

const PROJECT = {
  id: 1,
  slug: "test-flip",
  name: "Test Flip Project",
  address: "100 Test Street",
  city: "Richmond",
  state: "CA",
  strategy: "fix-flip",
  status: "completed",
  purchasePrice: 600000,
  rehabCost: 100000,
  arv: 840000,
  salePrice: 840000,
  profit: 140000,
  roi: "23%",
  holdTime: "6 months",
  bedrooms: 3,
  bathrooms: "2",
  sqft: 1500,
  yearBuilt: 1958,
  description:
    "A documented East Bay value-add renovation case study used to verify the project detail page renders real content end to end.",
  beforeImages: ["/img/before-1.webp"],
  afterImages: ["/img/after-1.webp"],
  highlights: ["Full interior renovation", "Permit coordination with the city"],
  createdAt: new Date("2025-09-01").toISOString(),
};

const SNAPSHOT = {
  id: 1,
  shareToken: "tok-test-123",
  visibility: "full",
  address: "200 Snapshot Avenue",
  city: "Oakland",
  state: "CA",
  zip: "94601",
  propertyInput: {
    address: "200 Snapshot Avenue",
    city: "Oakland",
    state: "CA",
    zip: "94601",
    askingPrice: 500000,
    arvEstimate: 700000,
    rehabBudget: 90000,
    marketRent: 3200,
    beds: 3,
    baths: 2,
    sqft: 1400,
  },
  snapshot: {
    topLane: "fix_flip",
    lanes: [
      {
        lane: "fix_flip",
        laneLabel: "Fix & Flip",
        headline: "A strong value-add play with a clear retail exit.",
        verdictLabel: "Pursue",
        economics: {
          primaryMetric: "Projected profit",
          primaryValue: "$120K",
        },
      },
    ],
    totalCashIn: 200000,
    risks: [],
    capitalStack: [],
    memo: {
      paragraph:
        "This is the decision memo paragraph that confirms the snapshot share page renders substantive content for the recipient.",
      nextStep: "Submit this property for a full Pegasus read.",
    },
  },
  createdAt: new Date("2025-09-01").toISOString(),
};

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: new Headers(),
  } as unknown as Response;
}

// Route the canned responses by URL. Unknown URLs (e.g. background context
// queries) resolve to a clean 404 so they fail fast without retries instead
// of hanging on a missing dev server — mirroring how the standalone net's
// unmocked relative fetches simply fail.
function mockFetch(input: RequestInfo | URL): Promise<Response> {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : (input as Request).url;
  if (url.includes("/api/projects/")) return Promise.resolve(jsonResponse(PROJECT));
  if (url.includes("/api/property-analyses/by-token/"))
    return Promise.resolve(jsonResponse(SNAPSHOT));
  return Promise.resolve(jsonResponse({ error: "not found" }, false, 404));
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(mockFetch));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// Each dynamic detail route paired with a concrete :param value the mock above
// resolves to a successful payload. Keep in lockstep with the drift guard.
const DYNAMIC_DETAIL_ROUTES: { url: string; route: string }[] = [
  { url: "/projects/test-flip", route: "/projects/:slug" },
  { url: "/snapshot/calc/tok-test-123", route: "/snapshot/calc/:token" },
  { url: "/snapshot/property/tok-test-123", route: "/snapshot/property/:token" },
  { url: "/snapshot/some-status-token", route: "/snapshot/:token" },
];

function renderRoute(routePath: string) {
  const { hook } = memoryLocation({ path: routePath, static: true });
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <SiteContentProvider>
          <EditModeProvider>
            <DemoModeProvider>
              <NotificationProvider>
                <DealActionProvider>
                  <PeggyProvider>
                    <WouterRouter hook={hook}>
                      <AppRouter />
                    </WouterRouter>
                  </PeggyProvider>
                </DealActionProvider>
              </NotificationProvider>
            </DemoModeProvider>
          </EditModeProvider>
        </SiteContentProvider>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("Every dynamic :param detail route renders real loaded content, never a blank shell (Task #217)", () => {
  // Non-vacuous guard: never silently pass with zero cases.
  it("DYNAMIC_DETAIL_ROUTES covers the dynamic detail surface", () => {
    expect(DYNAMIC_DETAIL_ROUTES.length).toBeGreaterThanOrEqual(4);
  });

  // Drift guard — the real point of the net. Derive every dynamic :param
  // component route straight from App.tsx's route table, then require each one
  // to be covered here. A newly added dynamic detail page cannot ship without
  // a test entry (or a documented exclusion) — it fails CI.
  it("DYNAMIC_DETAIL_ROUTES covers every dynamic :param route mounted in App.tsx", () => {
    const appSrc = fs.readFileSync(
      path.join(process.cwd(), "client/src/LegacyApp.tsx"),
      "utf-8",
    );
    const re = /<Route\s+path="([^"]+)"\s+component=/g;
    const dynamicRoutes: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(appSrc)) !== null) {
      if (m[1].includes(":")) dynamicRoutes.push(m[1]);
    }
    // Sanity: App.tsx must still mount dynamic component routes in this form.
    expect(dynamicRoutes.length).toBeGreaterThanOrEqual(4);

    // Admin surfaces — gated by their own in-page auth, need an admin session
    // to render real content; out of scope for this public-content net.
    const isAdmin = (u: string) => u.startsWith("/admin");

    const expectedDynamic = dynamicRoutes.filter((u) => !isAdmin(u));
    const covered = new Set(DYNAMIC_DETAIL_ROUTES.map((r) => r.route));
    const missing = expectedDynamic.filter((u) => !covered.has(u));
    expect(
      missing,
      `App.tsx mounts these dynamic :param routes that the blank-shell net does not cover — add them to DYNAMIC_DETAIL_ROUTES (or, if intentionally excluded, to an exclusion set with a reason): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  for (const { url, route } of DYNAMIC_DETAIL_ROUTES) {
    it(`${route} (${url}) resolves through the real App router to a loaded page with visible content`, async () => {
      const { container } = renderRoute(url);

      // The page is lazy AND data-driven — wait past the Suspense
      // <PageLoader/> fallback and the in-page loading skeleton until the real
      // loaded-state heading appears.
      let heading: Element | null = null;
      await waitFor(
        () => {
          heading = container.querySelector("h1, h2");
          expect(
            heading,
            `${url}: no heading rendered — the route resolved to a blank/loading/crashing shell (or never reached its loaded state)`,
          ).toBeTruthy();
        },
        { timeout: 5000 },
      );

      // Must be the real page, not the 404 fallback. If a route is
      // removed/renamed in App.tsx, wouter falls through to <NotFound/>, which
      // DOES render a heading — so the check above could pass falsely.
      expect(
        container.querySelector('[data-testid="text-404-title"]'),
        `${url}: resolved to the 404 NotFound page — the route is missing/misrouted in App.tsx`,
      ).toBeNull();

      // Must carry real copy, not just an empty heading husk.
      const text = (container.textContent || "").replace(/\s+/g, " ").trim();
      expect(
        text.length,
        `${url}: page rendered almost no text (${text.length} chars) — likely a blank shell`,
      ).toBeGreaterThan(40);
    });
  }
});
