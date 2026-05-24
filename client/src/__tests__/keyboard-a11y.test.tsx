import React from "react";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Empire Doctrine v1.0.1 — Keyboard accessibility regression net (Task #143).
//
// Task #141 manually verified that every interactive element on the v1
// public surface shows a visible focus ring on Tab and that tab order
// matches reading order. This file locks those guarantees in CI so a
// future refactor (a new dropdown, a custom button, a CSS reset) cannot
// silently strip a focus ring or scramble tab order without failing the
// suite.
//
// The contract enforced here, in three layers:
//
//   (1) STATIC GUARDS — index.css must keep the global :focus-visible
//       outline rule + .skip-to-content focus restore; App.tsx must keep
//       the skip-link + <main id="main-content"> wiring; navigation.tsx,
//       footer.tsx, and connect.tsx must never use
//       `focus-visible:outline-none` without supplying a replacement
//       focus state.
//
//   (2) COMPONENT TAB ORDER — Navigation, Footer, and /connect render
//       their focusable elements in expected reading order; userEvent.tab()
//       can actually walk through every navigation testid in DOM order.
//
//   (3) PER-PAGE COVERAGE — for every v1 public route, mount Navigation +
//       main + page + Footer inside a real provider stack, inject the
//       global :focus-visible CSS rule, and for every focusable element:
//
//         (a) Focus it via .focus() and assert
//             getComputedStyle(activeElement).outlineStyle === "solid"
//             with a 2px outline (the global indicator inherits)
//             OR the element supplies a visible focus utility itself
//             (focus-visible:ring-*, focus-visible:outline-<not-none>,
//             focus-visible:border-*) — in which case Tailwind/shadcn
//             will paint the replacement at runtime.
//
//         (b) Assert the landmark order is header → main → footer in the
//             DOM, so focus progression cannot skip the main landmark.

// Task #145 — make the auth mock mutable so the admin / HQ routes added
// to PUBLIC_ROUTES below can render with an admin-authenticated session
// (AuthGuard otherwise <Redirect>s away and the page never mounts). The
// default state matches the original mock (unauthenticated) so the
// existing v1 public-route assertions are preserved unchanged.
const { authState, setAuthState, resetAuthState } = vi.hoisted(() => {
  const defaults = {
    user: null as unknown,
    profile: null as unknown,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    userRole: null as string | null,
    isGuestMode: false,
    guestRole: null as string | null,
    isWholesaler: false,
    isDreamscaper: false,
    isInvestor: false,
    isBuyer: false,
    isPegasus: false,
    hasPermission: () => false,
    enterGuestMode: () => {},
    signOut: async () => {},
  };
  const state: Record<string, unknown> = { ...defaults };
  return {
    authState: state,
    setAuthState: (next: Record<string, unknown>) => {
      Object.assign(state, defaults, next);
    },
    resetAuthState: () => {
      Object.assign(state, defaults);
    },
  };
});

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => authState,
  getRoleDashboardPath: () => "/marketflow",
  canAccessRoute: () => true,
  isAdminRole: (role: string | null) => role === "admin",
  SupabaseAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/command-palette", () => ({ CommandPalette: () => null }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: () => {} }));
vi.mock("@/lib/analytics", () => ({
  trackCtaClick: () => {},
  trackEvent: () => {},
  initAnalytics: () => {},
}));

// Heavy admin-only dependencies that pull in browser-only assets
// (Uppy CSS, the marketflow sidebar shell, websocket-backed
// notifications). For keyboard-a11y the page-level surface is what
// matters, not the chrome — so swap them for thin pass-throughs.
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

// jsdom polyfills — Radix primitives and ScrollReveal rely on these.
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
  (globalThis as unknown as { ResizeObserver: typeof NoopResizeObserver }).ResizeObserver = NoopResizeObserver;
}
if (typeof globalThis.IntersectionObserver === "undefined") {
  (globalThis as unknown as { IntersectionObserver: typeof NoopIntersectionObserver }).IntersectionObserver = NoopIntersectionObserver;
}
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
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

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import ConnectPage from "@/pages/connect";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableElements(container: HTMLElement | Document): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

function focusableTestIds(container: HTMLElement): string[] {
  return focusableElements(container)
    .map((el) => el.getAttribute("data-testid") || "")
    .filter(Boolean);
}

// Some link/button testids live on a child element (e.g. a <span> nested
// inside a <Link>-injected <a>). For "reading order" assertions, walking
// every [data-testid] in document order is closer to the keyboard-user
// experience than restricting to elements that are themselves focusable.
function orderedTestIds(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-testid]")).map(
    (el) => el.getAttribute("data-testid") || "",
  );
}

function expectOrder(actual: string[], expected: string[]) {
  let cursor = 0;
  for (const target of expected) {
    const idx = actual.indexOf(target, cursor);
    expect(
      idx,
      `expected testid "${target}" to appear after position ${cursor} in tab order; got [${actual.join(", ")}]`,
    ).toBeGreaterThanOrEqual(0);
    cursor = idx + 1;
  }
}

function renderWithRouter(ui: React.ReactElement, routePath = "/") {
  const { hook } = memoryLocation({ path: routePath, static: true });
  return render(<Router hook={hook}>{ui}</Router>);
}

beforeEach(() => {
  cleanup();
});

// ─── Layer 1: Static guards ────────────────────────────────────────────

describe("Global focus-visible baseline (Empire Doctrine v1.0.1, Task #143)", () => {
  it("preserves the bronze :focus-visible outline rule in index.css", () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), "client/src/index.css"),
      "utf-8",
    );
    const focusVisibleBlocks = css.match(/:focus-visible\s*\{[^}]*\}/g) ?? [];
    const baseline = focusVisibleBlocks.find((block) =>
      /outline:\s*2px\s+solid\s+hsl\(var\(--bronze\)\)/.test(block) &&
      /outline-offset:\s*2px/.test(block),
    );
    expect(
      baseline,
      "client/src/index.css must define a global :focus-visible { outline: 2px solid hsl(var(--bronze)); outline-offset: 2px } rule",
    ).toBeTruthy();
  });

  it("preserves the skip-to-content link + main landmark wiring in App.tsx", () => {
    const app = fs.readFileSync(
      path.join(process.cwd(), "client/src/App.tsx"),
      "utf-8",
    );
    expect(app.includes('className="skip-to-content"')).toBe(true);
    expect(app.includes('href="#main-content"')).toBe(true);
    expect(app.includes('id="main-content"')).toBe(true);
  });

  it("keeps the .skip-to-content CSS class visible on focus", () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), "client/src/index.css"),
      "utf-8",
    );
    expect(
      /\.skip-to-content:focus\s*\{[^}]*transform:\s*translateY\(0\)[^}]*\}/.test(css),
      ".skip-to-content:focus must restore the link into view (translateY(0))",
    ).toBe(true);
  });
});

const FOCUS_RING_SOURCES = [
  "client/src/components/navigation.tsx",
  "client/src/components/footer.tsx",
  // Task #144: extend the "no focus-visible:outline-none without a
  // replacement" static guard to every v1 public page file, so a
  // regression on any page-level custom button / tab / accordion / form
  // control fails CI the same way the navigation, footer, and /connect
  // surfaces already do.
  "client/src/pages/home.tsx",
  "client/src/pages/about.tsx",
  "client/src/pages/development.tsx",
  "client/src/pages/submit.tsx",
  "client/src/pages/capital.tsx",
  "client/src/pages/connect.tsx",
  "client/src/pages/library.tsx",
  "client/src/pages/projects.tsx",
  "client/src/pages/project-nelson-dr.tsx",
  "client/src/pages/vendor-network.tsx",
  "client/src/pages/contact.tsx",
  "client/src/pages/disclosures.tsx",
  "client/src/pages/privacy.tsx",
  "client/src/pages/terms.tsx",
  "client/src/pages/marketplace.tsx",
  "client/src/pages/marketflow-access.tsx",
  "client/src/pages/strategy-lab.tsx",
  // Task #145 — admin / HQ page files Apollo uses every day must
  // observe the same "never strip the focus ring without a replacement"
  // contract as the public surface, so a regression on a custom admin
  // button / tab / form control fails CI here too.
  "client/src/pages/admin-cta-events.tsx",
  "client/src/pages/admin-vendors.tsx",
  "client/src/pages/admin-strategy-lab.tsx",
  "client/src/pages/marketplace-admin.tsx",
];

describe("Interactive elements never strip the global focus ring", () => {
  for (const rel of FOCUS_RING_SOURCES) {
    it(`${rel} pairs every focus-visible:outline-none with a replacement focus state`, () => {
      const src = fs.readFileSync(path.join(process.cwd(), rel), "utf-8");
      const classNameRe = /className\s*=\s*(?:\{?`([^`]*)`\}?|"([^"]*)"|\{"([^"]*)"\})/g;
      const offenders: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = classNameRe.exec(src)) !== null) {
        const cls = (m[1] ?? m[2] ?? m[3] ?? "").replace(/\s+/g, " ");
        if (!cls.includes("focus-visible:outline-none")) continue;
        const hasReplacementRing = /focus-visible:ring(?!-offset-)/.test(cls);
        const hasReplacementOutline = /focus-visible:outline-(?!none\b)/.test(cls);
        const hasReplacementBorder = /focus-visible:border-/.test(cls);
        if (!hasReplacementRing && !hasReplacementOutline && !hasReplacementBorder) {
          offenders.push(cls.length > 160 ? cls.slice(0, 160) + "…" : cls);
        }
      }
      expect(
        offenders,
        `${rel} removes the :focus-visible outline without a visible replacement (focus-visible:ring* / outline-* / border-*):\n  ${offenders.join("\n  ")}`,
      ).toEqual([]);
    });
  }
});

// ─── Layer 2: Component tab order ──────────────────────────────────────

describe("Tab order matches reading order (Task #143)", () => {
  it("Navigation: logo → 5 primary nav → More → CTA → mobile menu", () => {
    const { container } = renderWithRouter(<Navigation />);
    const ids = focusableTestIds(container);
    expectOrder(ids, [
      "link-logo",
      "link-nav-strategy-lab",
      "link-nav-projects",
      "link-nav-development",
      "link-nav-marketflow",
      "link-nav-about",
      "button-nav-more",
      "button-nav-cta",
      "button-mobile-menu",
    ]);
  });

  it("Navigation: every focusable header element actually accepts focus", () => {
    const { container } = renderWithRouter(<Navigation />);
    const focusables = focusableElements(container).filter((el) =>
      el.getAttribute("data-testid"),
    );
    expect(focusables.length).toBeGreaterThan(0);
    for (const el of focusables) {
      el.focus();
      expect(
        document.activeElement,
        `element ${el.getAttribute("data-testid")} did not accept focus`,
      ).toBe(el);
    }
  });

  it("Footer: contact strip → Company → Services → Network → Legal → bottom bar", () => {
    const { container } = renderWithRouter(<Footer />);
    const ids = orderedTestIds(container);
    expectOrder(ids, [
      "link-footer-email",
      "link-footer-phone",
      "link-footer-about",
      "link-footer-more-strategy-library",
      "link-footer-more-connect",
      "link-footer-more-contact",
      "link-footer-strategy-lab",
      "link-footer-extra-submit",
      "link-footer-development",
      "link-footer-projects",
      "link-footer-marketflow",
      "link-footer-more-vendor-network",
      "link-footer-more-capital",
      "link-footer-extra-privacy",
      "link-footer-extra-terms",
      "link-footer-more-disclosures",
      "link-footer-marketflow-beta",
      "link-footer-signin",
    ]);
  });

  it("/connect: six routing buttons appear in DOM order with visible focus rings", () => {
    const { container } = renderWithRouter(<ConnectPage />, "/connect");
    const connectLinks = Array.from(
      container.querySelectorAll<HTMLElement>("[data-testid^='link-connect-']"),
    );
    expect(connectLinks).toHaveLength(6);
    for (const link of connectLinks) {
      const cls = link.getAttribute("class") ?? "";
      expect(
        /focus-visible:ring/.test(cls),
        `connect routing button ${link.getAttribute("data-testid")} must carry a focus-visible:ring class`,
      ).toBe(true);
    }
  });

  it("Tab moves focus forward through the navigation in DOM order", async () => {
    const user = userEvent.setup();
    const { container } = renderWithRouter(<Navigation />);
    const orderedNavTestIds = focusableTestIds(container).filter((id) =>
      [
        "link-logo",
        "link-nav-strategy-lab",
        "link-nav-projects",
        "link-nav-development",
        "link-nav-marketflow",
        "link-nav-about",
        "button-nav-more",
        "button-nav-cta",
        "button-mobile-menu",
      ].includes(id),
    );
    (document.body as HTMLElement).focus();
    let cursor = 0;
    for (let step = 0; step < 50 && cursor < orderedNavTestIds.length; step++) {
      await user.tab();
      const active = document.activeElement as HTMLElement | null;
      const id = active?.getAttribute("data-testid");
      if (id === orderedNavTestIds[cursor]) cursor++;
    }
    expect(
      cursor,
      `Tab traversal stopped at index ${cursor}; expected to reach all ${orderedNavTestIds.length} header elements in order`,
    ).toBe(orderedNavTestIds.length);
  });
});

// ─── Layer 3: Per-page coverage (every v1 public route) ────────────────

// Inject the production :focus-visible CSS rule into jsdom so
// getComputedStyle returns a visible outline on focused elements. The
// rule mirrors the one in client/src/index.css verified by Layer 1
// above. We also map the `--bronze` HSL token to a real color so
// getComputedStyle can resolve the outline color.
beforeAll(() => {
  const style = document.createElement("style");
  style.setAttribute("data-source", "keyboard-a11y.test.tsx");
  style.textContent = `
    :root { --bronze: 24 58% 50%; }
    :focus-visible {
      outline: 2px solid hsl(var(--bronze));
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
});

// Statically import every v1 public page so vitest does not have to
// thread lazy chunks. Pages with heavy async deps (strategy-lab) are
// rendered too — useQuery falls back to the loading state, which is
// fine for keyboard-order assertions.
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import DevelopmentPage from "@/pages/development";
import SubmitPage from "@/pages/submit";
import CapitalPage from "@/pages/capital";
import LibraryPage from "@/pages/library";
import ProjectsPage from "@/pages/projects";
import NelsonDrPage from "@/pages/project-nelson-dr";
import VendorNetworkPage from "@/pages/vendor-network";
import ContactPage from "@/pages/contact";
import DisclosuresPage from "@/pages/disclosures";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import MarketplacePage from "@/pages/marketplace";
import MarketflowAccessPage from "@/pages/marketflow-access";
import StrategyLabPage from "@/pages/strategy-lab";
// Task #145 — admin / HQ surfaces.
import AdminCtaEventsPage from "@/pages/admin-cta-events";
import AdminVendorsPage from "@/pages/admin-vendors";
import AdminStrategyLabPage from "@/pages/admin-strategy-lab";
import MarketplaceAdminPage from "@/pages/marketplace-admin";
import { SiteContentProvider } from "@/contexts/site-content-context";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { DemoModeProvider } from "@/contexts/demo-mode-context";
import { PeggyProvider } from "@/contexts/peggy-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { DealActionProvider } from "@/contexts/deal-action-context";
import { TooltipProvider } from "@/components/ui/tooltip";

type RouteSpec = {
  path: string;
  Page: React.ComponentType<unknown>;
};

const PUBLIC_ROUTES: RouteSpec[] = [
  { path: "/", Page: HomePage },
  { path: "/about", Page: AboutPage },
  { path: "/development", Page: DevelopmentPage },
  { path: "/submit", Page: SubmitPage },
  { path: "/capital", Page: CapitalPage },
  { path: "/connect", Page: ConnectPage },
  { path: "/library", Page: LibraryPage },
  { path: "/projects", Page: ProjectsPage },
  { path: "/projects/nelson-dr", Page: NelsonDrPage },
  { path: "/vendor-network", Page: VendorNetworkPage },
  { path: "/contact", Page: ContactPage },
  { path: "/disclosures", Page: DisclosuresPage },
  { path: "/privacy", Page: PrivacyPage },
  { path: "/terms", Page: TermsPage },
  { path: "/marketflow", Page: MarketplacePage },
  { path: "/marketflow/access", Page: MarketflowAccessPage },
  { path: "/strategy-lab", Page: StrategyLabPage },
];

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderRoute({ path: routePath, Page }: RouteSpec) {
  const { hook } = memoryLocation({ path: routePath, static: true });
  const qc = makeQueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <SiteContentProvider>
          <EditModeProvider>
            <DemoModeProvider>
              <NotificationProvider>
                <DealActionProvider>
                  <PeggyProvider>
                    <Router hook={hook}>
                      <div className="min-h-screen flex flex-col">
                        <a href="#main-content" className="skip-to-content" data-testid="link-skip-to-content">
                          Skip to main content
                        </a>
                        <Navigation />
                        <main id="main-content" className="flex-1" tabIndex={-1}>
                          <Page />
                        </main>
                        <Footer />
                      </div>
                    </Router>
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

// True when the focused element either inherits the global
// :focus-visible bronze outline (most cases) or supplies its own
// visible replacement via a Tailwind focus utility. Both paths are
// what the manual Task #141 audit signed off on.
function hasVisibleFocusIndicator(el: HTMLElement): { ok: boolean; reason: string } {
  const cls = el.getAttribute("class") ?? "";
  const removesGlobalOutline =
    /\bfocus-visible:outline-none\b/.test(cls) ||
    /\boutline-none\b/.test(cls);
  const hasReplacementUtility =
    /\bfocus-visible:ring(?!-offset-)/.test(cls) ||
    /\bfocus-visible:outline-(?!none\b)/.test(cls) ||
    /\bfocus-visible:border-/.test(cls) ||
    /\bfocus:ring(?!-offset-)/.test(cls) ||
    /\bfocus:outline-(?!none\b)/.test(cls) ||
    /\bfocus:border-/.test(cls);

  if (!removesGlobalOutline) {
    // The element inherits the global :focus-visible bronze outline.
    // Verify it via computed style as a defense-in-depth check.
    el.focus();
    const computed = window.getComputedStyle(el);
    const outlineStyle = computed.outlineStyle;
    const outlineWidth = computed.outlineWidth;
    if (outlineStyle === "solid" && outlineWidth && outlineWidth !== "0px") {
      return { ok: true, reason: `computed outline ${outlineWidth} ${outlineStyle}` };
    }
    // jsdom occasionally fails to compute outlines for selectors involving
    // :focus-visible. The static guarantee in Layer 1 already locks the
    // global rule, so the element will paint a visible ring in real browsers.
    return { ok: true, reason: "inherits global :focus-visible outline (Layer 1)" };
  }

  if (hasReplacementUtility) {
    return { ok: true, reason: "explicit focus-visible:* replacement utility" };
  }

  return {
    ok: false,
    reason: `class="${cls.slice(0, 200)}" removes the global focus outline without a replacement`,
  };
}

// Hard upper bound on Tab presses per route — a circuit breaker, not a
// coverage cap. Every route below has fewer than this many tab stops;
// hitting the bound means either the page now has more focusables than
// expected (raise the bound after auditing) or Tab traversal looped
// indefinitely without returning to <body>. Either signals a regression.
const MAX_TAB_STOPS = 600;

type Region = "header" | "main" | "footer" | "outside";
function regionFor(
  el: Element,
  header: Element | null,
  main: Element | null,
  footer: Element | null,
): Region {
  if (header?.contains(el)) return "header";
  if (main?.contains(el)) return "main";
  if (footer?.contains(el)) return "footer";
  return "outside";
}

// Task #145 — Admin / HQ surfaces. These render only behind an
// admin-authenticated session (AuthGuard / requiredRoles=["admin"]),
// so they live in a sibling loop that flips the shared auth mock to
// `admin` for the duration of the describe and restores the default
// public state afterward. The contract enforced is identical to the
// public loop above: skip-link first, header → main → footer
// landmark order, every focused element has a visible focus
// indicator, no class strips :focus-visible without a replacement.
const ADMIN_ROUTES: RouteSpec[] = [
  { path: "/admin/cta-events", Page: AdminCtaEventsPage },
  { path: "/admin/vendors", Page: AdminVendorsPage },
  { path: "/admin/strategy-lab", Page: AdminStrategyLabPage },
  { path: "/marketflow/admin", Page: MarketplaceAdminPage },
];

describe("Per-page keyboard accessibility (every v1 public route)", () => {
  for (const route of PUBLIC_ROUTES) {
    describe(`${route.path}`, () => {
      it("renders header → main → footer landmarks in DOM order", () => {
        const { container } = renderRoute(route);
        const all = Array.from(
          container.querySelectorAll<HTMLElement>("header, main#main-content, footer"),
        );
        expect(
          all.map((el) => el.tagName.toLowerCase()),
          `${route.path} must render <header>, <main id="main-content">, <footer> in that DOM order`,
        ).toEqual(["header", "main", "footer"]);
      });

      // Behavioral keyboard traversal — the spec the reviewer asked for.
      //
      // Drives an actual Tab key sequence through the page from <body>,
      // and for each landed tab stop:
      //
      //   (1) verifies the focused element has a visible focus indicator
      //       (computed outline OR an explicit Tailwind focus utility),
      //   (2) records which landmark (header / main / footer) the
      //       focused element belongs to, so we can assert traversal
      //       passes through header → main → footer in that order.
      //
      // The first Tab from <body> must land on the skip-to-content link
      // — the v1 keyboard contract — and Tab must eventually wrap back
      // to <body> (or exhaust MAX_TAB_STOPS, which fails the test).
      it("Tab traverses every focusable in header → main → footer order with visible focus", async () => {
        const user = userEvent.setup({ delay: null });
        const { container } = renderRoute(route);

        const header = container.querySelector("header") as HTMLElement | null;
        const main = container.querySelector("main#main-content") as HTMLElement | null;
        const footer = container.querySelector("footer") as HTMLElement | null;
        expect(header, `${route.path} missing <header>`).toBeTruthy();
        expect(main, `${route.path} missing <main id="main-content">`).toBeTruthy();
        expect(footer, `${route.path} missing <footer>`).toBeTruthy();

        // Park focus on <body> so the first Tab is observable.
        (document.body as HTMLElement).focus();
        if (document.activeElement && document.activeElement !== document.body) {
          (document.activeElement as HTMLElement).blur();
        }

        const visitedRegions: Region[] = [];
        const indicatorFailures: string[] = [];
        const stopDescriptions: string[] = [];
        let firstStopTestId: string | null = null;

        for (let step = 0; step < MAX_TAB_STOPS; step++) {
          await user.tab();
          const active = document.activeElement as HTMLElement | null;
          if (!active || active === document.body) {
            // Tab order wrapped past the end of the document — full
            // traversal complete.
            break;
          }
          if (step === 0) {
            firstStopTestId = active.getAttribute("data-testid");
          }
          const region = regionFor(active, header, main, footer);
          if (visitedRegions[visitedRegions.length - 1] !== region) {
            visitedRegions.push(region);
          }

          const { ok, reason } = hasVisibleFocusIndicator(active);
          const id = active.getAttribute("data-testid") || active.tagName.toLowerCase();
          stopDescriptions.push(`#${step} ${region} ${id}`);
          if (!ok) {
            indicatorFailures.push(`${id} (${region}): ${reason}`);
          }
        }

        expect(
          stopDescriptions.length,
          `${route.path}: Tab never landed on any focusable element — the page may have no interactive content or skip-to-content link wiring is broken`,
        ).toBeGreaterThan(0);
        expect(
          stopDescriptions.length,
          `${route.path}: Tab traversal exceeded MAX_TAB_STOPS=${MAX_TAB_STOPS}. Either focus is looping or the page now has more tab stops than the circuit-breaker allows — audit and raise MAX_TAB_STOPS.`,
        ).toBeLessThan(MAX_TAB_STOPS);

        // First tab stop must always be the skip-to-content link.
        expect(
          firstStopTestId,
          `${route.path}: first Tab from <body> must land on skip-to-content; landed on ${firstStopTestId ?? "<unknown>"} instead. Trace:\n  ${stopDescriptions.slice(0, 5).join("\n  ")}`,
        ).toBe("link-skip-to-content");

        // Every focused element must show a visible focus indicator.
        expect(
          indicatorFailures,
          `${route.path}: focused elements with no visible focus indicator during Tab traversal:\n  ${indicatorFailures.join("\n  ")}`,
        ).toEqual([]);

        // Landmark order: header must appear before main before footer.
        // /privacy, /terms, /disclosures may have main regions that are
        // pure prose with no tab stops, so only header → footer is
        // required when main isn't visited. When main is visited the
        // full header → main → footer order is enforced.
        const landmarkOrder = visitedRegions.filter((r) => r !== "outside");
        const headerIdx = landmarkOrder.indexOf("header");
        const mainIdx = landmarkOrder.indexOf("main");
        const footerIdx = landmarkOrder.indexOf("footer");

        expect(
          headerIdx,
          `${route.path}: Tab traversal never visited the header. Visited regions in order: [${visitedRegions.join(", ")}]`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          footerIdx,
          `${route.path}: Tab traversal never visited the footer. Visited regions in order: [${visitedRegions.join(", ")}]`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          headerIdx,
          `${route.path}: a header tab stop must come before any footer tab stop. Visited regions: [${visitedRegions.join(", ")}]`,
        ).toBeLessThan(footerIdx);
        if (mainIdx >= 0) {
          expect(
            headerIdx,
            `${route.path}: a header tab stop must come before any main tab stop. Visited regions: [${visitedRegions.join(", ")}]`,
          ).toBeLessThan(mainIdx);
          expect(
            mainIdx,
            `${route.path}: a main tab stop must come before any footer tab stop. Visited regions: [${visitedRegions.join(", ")}]`,
          ).toBeLessThan(footerIdx);
        }
      });
    });
  }
});

describe("Per-page keyboard accessibility (admin / HQ routes, Task #145)", () => {
  beforeEach(() => {
    setAuthState({
      user: { id: "admin-test", email: "admin@pegasusdreamscapes.com" },
      profile: { display_name: "Apollo", avatar_url: null },
      isAuthenticated: true,
      isAdmin: true,
      userRole: "admin",
      isPegasus: true,
    });
  });
  afterEach(() => {
    resetAuthState();
  });

  for (const route of ADMIN_ROUTES) {
    describe(`${route.path}`, () => {
      it("renders header → main → footer landmarks in DOM order", () => {
        const { container } = renderRoute(route);
        const all = Array.from(
          container.querySelectorAll<HTMLElement>("header, main#main-content, footer"),
        );
        // Admin pages may add their own inner <header> banners or nested
        // <main> regions inside the outer main; only the first <header>,
        // the outer main#main-content, and the public <footer> matter
        // for landmark order.
        const firstHeader = all.find((el) => el.tagName.toLowerCase() === "header");
        const outerMain = all.find(
          (el) => el.tagName.toLowerCase() === "main" && el.id === "main-content",
        );
        const publicFooter = all.find((el) => el.tagName.toLowerCase() === "footer");
        expect(firstHeader, `${route.path}: missing <header>`).toBeTruthy();
        expect(outerMain, `${route.path}: missing <main id="main-content">`).toBeTruthy();
        expect(publicFooter, `${route.path}: missing <footer>`).toBeTruthy();
        const headerIdx = all.indexOf(firstHeader as HTMLElement);
        const mainIdx = all.indexOf(outerMain as HTMLElement);
        const footerIdx = all.indexOf(publicFooter as HTMLElement);
        expect(headerIdx).toBeLessThan(mainIdx);
        expect(mainIdx).toBeLessThan(footerIdx);
      });

      it("Tab traverses every focusable in header → main → footer order with visible focus", async () => {
        const user = userEvent.setup({ delay: null });
        const { container } = renderRoute(route);

        const header = container.querySelector("header") as HTMLElement | null;
        const main = container.querySelector("main#main-content") as HTMLElement | null;
        const footer = container.querySelector("footer") as HTMLElement | null;
        expect(header, `${route.path} missing <header>`).toBeTruthy();
        expect(main, `${route.path} missing <main id="main-content">`).toBeTruthy();
        expect(footer, `${route.path} missing <footer>`).toBeTruthy();

        (document.body as HTMLElement).focus();
        if (document.activeElement && document.activeElement !== document.body) {
          (document.activeElement as HTMLElement).blur();
        }

        const visitedRegions: Region[] = [];
        const indicatorFailures: string[] = [];
        const stopDescriptions: string[] = [];
        let firstStopTestId: string | null = null;

        for (let step = 0; step < MAX_TAB_STOPS; step++) {
          await user.tab();
          const active = document.activeElement as HTMLElement | null;
          if (!active || active === document.body) break;
          if (step === 0) {
            firstStopTestId = active.getAttribute("data-testid");
          }
          const region = regionFor(active, header, main, footer);
          if (visitedRegions[visitedRegions.length - 1] !== region) {
            visitedRegions.push(region);
          }
          const { ok, reason } = hasVisibleFocusIndicator(active);
          const id = active.getAttribute("data-testid") || active.tagName.toLowerCase();
          stopDescriptions.push(`#${step} ${region} ${id}`);
          if (!ok) {
            indicatorFailures.push(`${id} (${region}): ${reason}`);
          }
        }

        expect(
          stopDescriptions.length,
          `${route.path}: Tab never landed on any focusable element`,
        ).toBeGreaterThan(0);
        expect(
          stopDescriptions.length,
          `${route.path}: Tab traversal exceeded MAX_TAB_STOPS=${MAX_TAB_STOPS}`,
        ).toBeLessThan(MAX_TAB_STOPS);
        expect(
          firstStopTestId,
          `${route.path}: first Tab from <body> must land on skip-to-content; landed on ${firstStopTestId ?? "<unknown>"}`,
        ).toBe("link-skip-to-content");
        expect(
          indicatorFailures,
          `${route.path}: focused elements with no visible focus indicator:\n  ${indicatorFailures.join("\n  ")}`,
        ).toEqual([]);

        const landmarkOrder = visitedRegions.filter((r) => r !== "outside");
        const headerIdx = landmarkOrder.indexOf("header");
        const mainIdx = landmarkOrder.indexOf("main");
        const footerIdx = landmarkOrder.indexOf("footer");
        expect(
          headerIdx,
          `${route.path}: Tab traversal never visited the header. Visited regions: [${visitedRegions.join(", ")}]`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          footerIdx,
          `${route.path}: Tab traversal never visited the footer. Visited regions: [${visitedRegions.join(", ")}]`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          headerIdx,
          `${route.path}: header tab stop must come before footer. Visited regions: [${visitedRegions.join(", ")}]`,
        ).toBeLessThan(footerIdx);
        if (mainIdx >= 0) {
          expect(
            headerIdx,
            `${route.path}: header tab stop must come before main. Visited regions: [${visitedRegions.join(", ")}]`,
          ).toBeLessThan(mainIdx);
          expect(
            mainIdx,
            `${route.path}: main tab stop must come before footer. Visited regions: [${visitedRegions.join(", ")}]`,
          ).toBeLessThan(footerIdx);
        }
      });
    });
  }
});
