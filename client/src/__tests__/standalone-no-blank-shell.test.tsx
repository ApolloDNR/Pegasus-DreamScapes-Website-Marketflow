import React from "react";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Standalone-page blank-shell net (Task #215).
//
// The prototype net (pegasus-no-blank-shell.test.tsx) only covers URLs the
// Pegasus prototype shell owns (PEGASUS_URLS). But App.tsx also mounts many
// app-level pages directly on the wouter <Switch> — e.g. /submit,
// /projects/nelson-dr, /library, /vendor-network, /connect, /disclosures,
// /privacy, /terms, /faq, /marketflow/access. None of those are covered by
// the prototype net, so a future refactor could leave one rendering an empty
// or crashing page with NO test failure.
//
// This suite mounts each public standalone (non-prototype) route through the
// REAL App router stack (the exported <AppRouter> = the production <Switch>
// with PEGASUS_URLS first, legacyRedirects, and AuthGuard all intact) and
// asserts each resolves to substantive, visible content (a heading + real
// copy), mirroring the prototype net. A route that resolves to a blank,
// crashing, or wrongly-redirected page fails CI instead of shipping a dead
// page.

// Auth mock — keep the public (unauthenticated) state so AuthGuard behaves
// exactly as it does for a logged-out visitor and pages that read
// useSupabaseAuth don't crash. Mirrors keyboard-a11y.test.tsx.
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

import { Router as AppRouter } from "@/App";
import { isPegasusUrl } from "@/pegasus/routes";
import { SiteContentProvider } from "@/contexts/site-content-context";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { DemoModeProvider } from "@/contexts/demo-mode-context";
import { PeggyProvider } from "@/contexts/peggy-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { DealActionProvider } from "@/contexts/deal-action-context";
import { TooltipProvider } from "@/components/ui/tooltip";

// Every public, standalone (non-prototype) content route mounted in App.tsx.
// Deliberately excludes: PEGASUS_URLS (covered by the prototype net),
// AuthGuard-gated operator surfaces, pure redirects (legacyRedirects), the
// /login + /signup auth forms, and dynamic-:param detail routes (no canned
// id to resolve). Each entry must render a real heading + copy, never a
// blank/crashing/mis-redirected shell.
const STANDALONE_URLS: string[] = [
  "/submit",
  // Public Website v1 (issue #22): multi-step intake desk.
  "/submit-property",
  "/pegasus-standard",
  "/connect",
  "/projects",
  "/projects/nelson-dr",
  "/vendor-network",
  "/faq",
  "/disclosures",
  "/privacy",
  "/terms",
  "/deal-blueprint",
  "/strategy-lab/library",
  "/strategy-lab/submitted",
  "/strategy-lab/blueprint-confirmed",
  // /strategy-lab/classic is now a pure redirect into the unified Lab's
  // in-page Quick Tools, so it is excluded here like the other redirects.
  "/marketflow/access",
  "/marketflow/buyboxes",
  "/marketflow/deals",
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

describe("Every standalone (non-prototype) public route renders real content, never a blank shell (Task #215)", () => {
  // Non-vacuous guard: if the list ever empties out the suite must not
  // silently pass with no cases. Pin a sane floor.
  it("STANDALONE_URLS covers the standalone public surface", () => {
    expect(STANDALONE_URLS.length).toBeGreaterThanOrEqual(14);
  });

  // Guard the list against drift back into prototype territory: anything the
  // prototype shell owns is already covered by the prototype net and must not
  // be claimed here (it would test the wrong renderer).
  it("none of the standalone URLs are owned by the Pegasus prototype shell", () => {
    const overlap = STANDALONE_URLS.filter((u) => isPegasusUrl(u));
    expect(
      overlap,
      `these URLs belong to the Pegasus prototype net, not the standalone net: ${overlap.join(", ")}`,
    ).toEqual([]);
  });

  // Drift guard — the real point of the net. Derive the set of public,
  // standalone, statically-mounted routes straight from App.tsx's route
  // table (every `<Route path="X" component={...}>` literal — the form used
  // for non-AuthGuard, non-redirect pages), then subtract the categories
  // this net deliberately does NOT cover. Whatever remains MUST appear in
  // STANDALONE_URLS. So a newly added standalone page (a new
  // `<Route path component={...}>` in App.tsx) cannot ship without either a
  // test entry here or an explicit, documented exclusion below — it fails CI.
  it("STANDALONE_URLS covers every public standalone route mounted in App.tsx", () => {
    const appSrc = fs.readFileSync(
      path.join(process.cwd(), "client/src/App.tsx"),
      "utf-8",
    );
    const re = /<Route\s+path="([^"]+)"\s+component=/g;
    const componentRoutes: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(appSrc)) !== null) {
      componentRoutes.push(m[1]);
    }
    // Sanity: App.tsx must still mount static component routes in this form.
    expect(componentRoutes.length).toBeGreaterThan(15);

    // Auth forms — exercised by their own flows, not "content pages".
    const AUTH_FORMS = new Set(["/login", "/signup"]);
    // Admin surfaces — gated by their own in-page auth, need an admin
    // session to render real content (see keyboard-a11y.test.tsx's
    // setAuthState pattern); out of scope for this public-content net.
    const isAdmin = (u: string) => u.startsWith("/admin");
    // Dynamic :param detail routes — no canned id/slug to resolve here;
    // tracked as a follow-up (#217).
    const isDynamic = (u: string) => u.includes(":");
    // Component-mounted routes that intentionally render only a <Redirect>,
    // not real content — excluded like the legacyRedirects map. The classic
    // calculator suite now folds into the unified Lab's in-page Quick Tools,
    // so /strategy-lab/classic forwards to /strategy-lab?tool=calculators.
    const REDIRECT_ONLY = new Set(["/strategy-lab/classic"]);

    const expectedStandalone = componentRoutes.filter(
      (u) =>
        !isPegasusUrl(u) && // shadowed by the prototype shell (matched first)
        !AUTH_FORMS.has(u) &&
        !isAdmin(u) &&
        !isDynamic(u) &&
        !REDIRECT_ONLY.has(u),
    );

    const covered = new Set(STANDALONE_URLS);
    const missing = expectedStandalone.filter((u) => !covered.has(u));
    expect(
      missing,
      `App.tsx mounts these public standalone routes that the blank-shell net does not cover — add them to STANDALONE_URLS (or, if intentionally excluded, to an exclusion set with a reason): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  for (const url of STANDALONE_URLS) {
    it(`${url} resolves through the real App router to a rendered page with visible content`, async () => {
      const { container } = renderRoute(url);

      // The route's page is lazy — wait past the Suspense <PageLoader/>
      // fallback (which has no h1/h2) until the real page heading appears.
      let heading: Element | null = null;
      await waitFor(
        () => {
          heading = container.querySelector("h1, h2");
          expect(
            heading,
            `${url}: no heading rendered — the route resolved to a blank/placeholder/crashing shell (or PageLoader never resolved)`,
          ).toBeTruthy();
        },
        { timeout: 5000 },
      );

      // It must be the real page, not the 404 fallback. If a route is
      // removed/renamed in App.tsx, wouter falls through to <NotFound/>,
      // which DOES render a heading + copy — so the checks above would pass
      // falsely. Assert the route did not resolve to the 404 page.
      expect(
        container.querySelector('[data-testid="text-404-title"]'),
        `${url}: resolved to the 404 NotFound page — the route is missing/misrouted in App.tsx`,
      ).toBeNull();

      // It must carry real copy, not just an empty heading husk.
      const text = (container.textContent || "").replace(/\s+/g, " ").trim();
      expect(
        text.length,
        `${url}: page rendered almost no text (${text.length} chars) — likely a blank shell`,
      ).toBeGreaterThan(40);
    });
  }
});
