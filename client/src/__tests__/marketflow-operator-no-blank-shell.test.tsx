import React from "react";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Operator-dashboard blank-shell net (Task #218).
//
// The standalone net (standalone-no-blank-shell.test.tsx, Task #215) only
// covers public, unauthenticated pages — it deliberately excludes the
// AuthGuard-gated MarketFlow operator surfaces, because for a logged-out
// visitor those routes just <Redirect> to /login. So the operator
// dashboards Apollo and his network actually live in every day —
// /marketflow/dashboard, /deals, /capital, /properties, /community,
// /messages, /my-deals, /analytics, the role dashboards, etc. — have NO
// blank-shell net at all. A refactor could leave a logged-in operator
// staring at an empty page with no failing test.
//
// This suite sets the auth mock to an AUTHENTICATED operator (mirroring the
// mutable-auth pattern in keyboard-a11y.test.tsx) so AuthGuard lets the page
// mount instead of redirecting, then mounts each AuthGuard-gated MarketFlow
// route through the REAL App router stack (the exported <AppRouter> = the
// production <Switch> with PEGASUS_URLS, legacyRedirects, and AuthGuard all
// intact) and asserts each resolves to substantive content (a heading + real
// copy) — not a blank shell, not the 404 page, and not a redirect away. A
// broken operator dashboard fails CI instead of shipping blank.

// Authenticated operator. Every role flag is on and hasPermission/
// canAccessRoute return true so that AuthGuard (and any in-page role/
// permission gate) lets the real dashboard content render instead of an
// "access restricted" / "verification required" fallback. The point of this
// net is to catch a BLANK operator surface, so we maximize the chance each
// page reaches its real content.
const authState: Record<string, unknown> = {
  user: { id: "operator-test", email: "apollo@pegasusdreamscapes.com" },
  profile: { display_name: "Apollo", avatar_url: null },
  isAuthenticated: true,
  isAdmin: true,
  isLoading: false,
  userRole: "admin",
  isGuestMode: false,
  guestRole: null,
  isWholesaler: true,
  isDreamscaper: true,
  isInvestor: true,
  isBuyer: true,
  isPegasus: true,
  hasPermission: () => true,
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

// Heavy operator-only chrome that pulls in browser-only assets (Uppy CSS,
// the marketflow sidebar shell, websocket-backed notifications). The
// page-level content is what this net cares about, not the chrome — swap
// them for thin pass-throughs. Mirrors keyboard-a11y.test.tsx.
vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-marketplace-layout">{children}</div>
  ),
}));
vi.mock("@/components/ObjectUploader", () => ({
  ObjectUploader: ({ children }: { children: React.ReactNode }) => (
    <button type="button" data-testid="mock-object-uploader">
      {children}
    </button>
  ),
}));
vi.mock("@/components/notification-dropdown", () => ({
  NotificationDropdown: () => null,
}));
vi.mock("@/hooks/use-upload", () => ({
  useUpload: () => ({ getUploadParameters: async () => ({ method: "PUT", url: "" }) }),
}));

// jsdom polyfills — ScrollReveal/IntersectionObserver, hero parallax
// (matchMedia), Radix + recharts (ResizeObserver), and scroll handlers.
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

import { Router as AppRouter } from "@/App";
import { SiteContentProvider } from "@/contexts/site-content-context";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { DemoModeProvider } from "@/contexts/demo-mode-context";
import { PeggyProvider } from "@/contexts/peggy-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { DealActionProvider } from "@/contexts/deal-action-context";
import { TooltipProvider } from "@/components/ui/tooltip";

// Every AuthGuard-gated, statically-mounted (non-:param) MarketFlow operator
// surface in App.tsx. These are the logged-in dashboards Apollo and his
// network use. Dynamic :param detail routes (/deals/:id, /capital/:id,
// /properties/:id, /negotiate/*, /offer-studio/*) are excluded — no canned
// id to resolve — and covered by the drift guard's exclusion below.
const MARKETFLOW_OPERATOR_URLS: string[] = [
  "/marketflow/wholesaler",
  "/marketflow/dreamscaper",
  "/marketflow/investor",
  "/marketflow/buyer",
  "/marketflow/admin",
  "/marketflow/calculators",
  "/marketflow/resources",
  "/marketflow/community",
  "/marketflow/messages",
  "/marketflow/deals",
  "/marketflow/capital",
  "/marketflow/properties",
  "/marketflow/submit",
  "/marketflow/dashboard",
  "/marketflow/my-deals",
  "/marketflow/analytics",
  "/marketflow/my-analytics",
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

afterEach(() => cleanup());

describe("Every AuthGuard-gated MarketFlow operator route renders real content for a logged-in operator, never a blank shell (Task #218)", () => {
  // Non-vacuous guard: if the list ever empties out the suite must not
  // silently pass with no cases. Pin a sane floor.
  it("MARKETFLOW_OPERATOR_URLS covers the operator surface", () => {
    expect(MARKETFLOW_OPERATOR_URLS.length).toBeGreaterThanOrEqual(15);
  });

  // Drift guard — the real point of the net. Derive every AuthGuard-wrapped
  // /marketflow route straight from App.tsx's route table (the render-prop
  // form `<Route path="X">{() => <AuthGuard>...`), subtract the dynamic
  // :param detail routes this net deliberately does NOT cover, and assert
  // whatever remains appears in MARKETFLOW_OPERATOR_URLS. So a newly added
  // gated operator dashboard cannot ship without either a test entry here or
  // an explicit, documented exclusion — it fails CI.
  it("MARKETFLOW_OPERATOR_URLS covers every static AuthGuard-gated /marketflow route in App.tsx", () => {
    const appSrc = fs.readFileSync(
      path.join(process.cwd(), "client/src/App.tsx"),
      "utf-8",
    );
    const re = /<Route\s+path="(\/marketflow\/[^"]+)">\s*\{\s*\(\)\s*=>\s*<AuthGuard>/g;
    const gatedRoutes: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(appSrc)) !== null) {
      gatedRoutes.push(m[1]);
    }
    // Sanity: App.tsx must still mount gated operator routes in this form.
    expect(gatedRoutes.length).toBeGreaterThan(15);

    // Dynamic :param detail routes — no canned id/slug to resolve here.
    const isDynamic = (u: string) => u.includes(":");

    const expectedOperator = gatedRoutes.filter((u) => !isDynamic(u));
    const covered = new Set(MARKETFLOW_OPERATOR_URLS);
    const missing = expectedOperator.filter((u) => !covered.has(u));
    expect(
      missing,
      `App.tsx mounts these AuthGuard-gated /marketflow routes that the operator blank-shell net does not cover — add them to MARKETFLOW_OPERATOR_URLS (or, if intentionally excluded, to an exclusion set with a reason): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  for (const url of MARKETFLOW_OPERATOR_URLS) {
    it(`${url} renders a real operator page for an authenticated operator, not a blank shell`, async () => {
      const { container } = renderRoute(url);

      // The route's page is lazy — wait past the Suspense <PageLoader/>
      // fallback (which has no h1/h2) until the real page heading appears.
      let heading: Element | null = null;
      await waitFor(
        () => {
          heading = container.querySelector("h1, h2");
          expect(
            heading,
            `${url}: no heading rendered — the route resolved to a blank/placeholder/crashing shell, an auth loader, or PageLoader never resolved`,
          ).toBeTruthy();
        },
        { timeout: 15000 },
      );

      // It must be the real page, not the 404 fallback. If a route is
      // removed/renamed in App.tsx, wouter falls through to <NotFound/>,
      // which DOES render a heading + copy — so the checks above would pass
      // falsely. Assert the route did not resolve to the 404 page.
      expect(
        container.querySelector('[data-testid="text-404-title"]'),
        `${url}: resolved to the 404 NotFound page — the route is missing/misrouted in App.tsx`,
      ).toBeNull();

      // It must not have redirected to the login form (AuthGuard's
      // unauthenticated fallback). A login surface means the operator was
      // bounced instead of seeing their dashboard.
      expect(
        container.querySelector('[data-testid="input-email"], [data-testid="input-password"]'),
        `${url}: resolved to the login form — the operator was redirected instead of seeing the dashboard`,
      ).toBeNull();

      // It must carry real copy, not just an empty heading husk.
      const text = (container.textContent || "").replace(/\s+/g, " ").trim();
      expect(
        text.length,
        `${url}: page rendered almost no text (${text.length} chars) — likely a blank shell`,
      ).toBeGreaterThan(40);
    }, 20000);
  }
});
