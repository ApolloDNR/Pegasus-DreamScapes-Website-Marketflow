import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { legacyRedirects } from "@/App";
import { REDIRECTED_URLS, PEGASUS_URLS, ROUTE_TO_URL } from "@/pegasus/routes";
import { NavBar } from "@/pegasus/nav";
import { Footer, CapitalPage, DevelopmentPage } from "@/pegasus/pages";
import { HomePageV51 } from "@/pegasus/home-v51";
import type { Nav, Route } from "@/pegasus/theme";

// Website Spec v4 (Re-skin) — redirect-reversal net.
//
// The v3 "Lean Launch Cut" temporarily pulled a block of public surfaces out
// of the live site and redirected them. Website Spec v4 reverses that cut: the
// "Who We Serve" audience lanes plus /strategy-lab, /marketflow, /peggy,
// /deal-strategy (renamed from /deal-architecture), and /work-with-apollo are
// live prototype-shell pages again. Only /library remains demoted.
//
// This net locks the reversal in so a future edit cannot silently re-demote a
// restored surface or strand a stale redirect:
//   1. reversed — REDIRECTED_URLS is empty (nothing is pulled from the shell).
//   2. restored — every surface that came back renders the prototype shell
//      (is in PEGASUS_URLS) and has NO redirect rule pointing it away.
//   3. residual — /library still 302s to home, and the legacy
//      /deal-architecture URL 301s forward to the live /deal-strategy.
//   4. no-stale-link — the live chrome (nav + footer) and a few shell pages
//      never link to a still-demoted or renamed-away URL.

function read(rel: string): string {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf-8");
}

// Live public shell surfaces at their v5.1 canonical URLs (Master Blueprint
// §6 renamed the spine: /property-owners, /deal-partners, /how-we-operate).
const RESTORED_URLS: string[] = [
  "/property-owners",
  "/buyers",
  "/deal-partners",
  "/operators",
  "/referral",
  "/strategy-lab",
  "/marketflow",
  "/peggy",
  "/how-we-operate",
  "/work-with-apollo",
  "/our-work",
];

// Still demoted: the standalone page that 302-redirects to home.
const DEMOTED_URLS: string[] = ["/library"];

// Renamed surfaces: each legacy URL 301s forward to its live v5.1 canonical.
const RENAMED_LEGACY: Array<[string, string]> = [
  ["/deal-architecture", "/how-we-operate"],
  ["/sellers", "/property-owners"],
  ["/dealfinders", "/deal-partners"],
  ["/deal-strategy", "/how-we-operate"],
];

// URLs the live chrome must never link to: still-demoted or renamed-away.
const OFF_LIMITS = new Set<string>([
  ...DEMOTED_URLS,
  ...RENAMED_LEGACY.map(([from]) => from),
]);

// Explicit single-route redirects in App.tsx of the form
//   <Route path="X">{() => <Redirect to="Y" />}</Route>
// The legacyRedirects.map mount uses path={from}/to={to} (no string literals),
// so this regex naturally excludes it — those are covered by the imported array.
function explicitRedirects(src: string): Array<[string, string]> {
  const re =
    /<Route\s+path="([^"]+)">\s*\{\s*\(\s*\)\s*=>\s*<Redirect\s+to="([^"]+)"\s*\/>\s*\}\s*<\/Route>/g;
  const out: Array<[string, string]> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.push([m[1], m[2]]);
  return out;
}

// The from→to redirect map the app actually applies: the legacyRedirects tuples
// (imported as data so a rename is reflected automatically) plus the explicit
// <Redirect> Routes parsed from App.tsx source.
const REDIRECT_MAP: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [from, to] of legacyRedirects) map.set(from, to);
  for (const [from, to] of explicitRedirects(read("client/src/App.tsx"))) {
    if (!map.has(from)) map.set(from, to);
  }
  return map;
})();

describe("v4 re-skin: the v3 lean cut is fully reversed", () => {
  it("demotes nothing out of the prototype shell anymore", () => {
    expect(REDIRECTED_URLS).toEqual([]);
  });
});

describe("v4 re-skin: every restored surface is live and not redirected", () => {
  it("has a restored set to test (non-vacuous)", () => {
    expect(RESTORED_URLS.length).toBeGreaterThanOrEqual(10);
  });

  for (const url of RESTORED_URLS) {
    it(`${url} renders the prototype shell and has no redirect rule`, () => {
      expect(
        PEGASUS_URLS.includes(url),
        `${url} should be a live PEGASUS_URLS shell page after the v4 re-skin`,
      ).toBe(true);
      expect(
        REDIRECT_MAP.has(url),
        `${url} is restored but still has a redirect rule → ${REDIRECT_MAP.get(url)}`,
      ).toBe(false);
    });
  }
});

describe("v4 re-skin: residual demotions + the Deal Strategy rename", () => {
  for (const url of DEMOTED_URLS) {
    it(`${url} still redirects to home and is not a shell page`, () => {
      expect(REDIRECT_MAP.get(url)).toBe("/");
      expect(PEGASUS_URLS.includes(url)).toBe(false);
    });
  }

  for (const [from, to] of RENAMED_LEGACY) {
    it(`${from} 301s forward to the live ${to}`, () => {
      expect(REDIRECT_MAP.get(from)).toBe(to);
      expect(
        PEGASUS_URLS.includes(to),
        `${to} should be a live shell page so the rename lands somewhere real`,
      ).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// no-stale-link: live chrome + shell pages never link to an off-limits URL
// ---------------------------------------------------------------------------

const noop = () => {};

// jsdom has no scrollIntoView; some CTAs call it. Stub so clicks don't throw.
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

function renderChrome(ui: React.ReactElement, routePath = "/") {
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
  }) as Nav;
  return { go, calls };
}

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

// Internal-link pathnames rendered as <a href>, ignoring mailto/tel/http and
// in-page anchors (which point nowhere off-page).
function internalLinkPaths(container: HTMLElement): string[] {
  const out: string[] = [];
  for (const a of Array.from(
    container.querySelectorAll<HTMLAnchorElement>("a[href]"),
  )) {
    const href = a.getAttribute("href") || "";
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("http")
    ) {
      continue;
    }
    out.push(href.split(/[?#]/)[0]);
  }
  return out;
}

type ChromeSpec = {
  name: string;
  render: (go: Nav) => React.ReactElement;
};

const CHROME: ChromeSpec[] = [
  {
    name: "NavBar",
    render: (go) => (
      <NavBar
        go={go}
        route="home"
        theme="light"
        toggleTheme={noop}
        scrolled={false}
      />
    ),
  },
  { name: "Footer", render: (go) => <Footer go={go} /> },
  {
    name: "Home",
    render: (go) => <HomePageV51 go={go} openPeggy={noop} />,
  },
  { name: "Capital stub", render: (go) => <CapitalPage go={go} /> },
  { name: "Development stub", render: (go) => <DevelopmentPage go={go} /> },
];

afterEach(() => cleanup());

describe("v4 re-skin: chrome + shell pages never link to an off-limits URL", () => {
  for (const spec of CHROME) {
    it(`${spec.name} routes/links only to live (non-demoted) surfaces`, () => {
      const { go, calls } = makeGo();
      const { container } = renderChrome(spec.render(go), "/");
      clickAll(container);

      // go(route) calls must not resolve (via ROUTE_TO_URL) to an off-limits URL.
      const staleGo = Array.from(new Set(calls)).filter((r) =>
        OFF_LIMITS.has(ROUTE_TO_URL[r as Route]),
      );
      expect(
        staleGo,
        `${spec.name} navigates to off-limits route key(s): ${staleGo
          .map((r) => `${r}→${ROUTE_TO_URL[r as Route]}`)
          .join(", ")}`,
      ).toEqual([]);

      // <a href> internal links must not point at an off-limits URL.
      const staleLinks = internalLinkPaths(container).filter((p) =>
        OFF_LIMITS.has(p),
      );
      expect(
        staleLinks,
        `${spec.name} links to off-limits URL(s): ${Array.from(new Set(staleLinks)).join(", ")}`,
      ).toEqual([]);
    });
  }

  it("the harness actually exercises navigation (non-vacuous)", () => {
    // Guard against a vacuous pass: the v5.1 Home routes its proof CTA to
    // /our-work through go(), proving clickAll wires the handlers.
    const { go, calls } = makeGo();
    const { container } = renderChrome(
      <HomePageV51 go={go} openPeggy={noop} />,
      "/",
    );
    clickAll(container);
    expect(calls, "Home triggered no go() navigations").toContain("ourwork");
  });
});
