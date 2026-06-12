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
import { Footer, HomePage, CapitalPage, DevelopmentPage } from "@/pegasus/pages";
import type { Nav, Route } from "@/pegasus/theme";

// Website Doctrine v3.0 — Lean Launch Cut net.
//
// The v3 "demolition" cut pulls a set of public surfaces out of the live site
// and redirects them (temporarily — they return in #251/#252):
//   • the pegasus-shell-owned URLs in REDIRECTED_URLS (the five audience lanes
//     + /strategy-lab, /marketflow, /peggy, /deal-architecture,
//     /work-with-apollo), and
//   • the two standalone pages /library and /faq.
//
// Two invariants must hold for the cut to be safe:
//   1. redirects-resolve — every demoted URL actually redirects to a KEPT
//      surface (/, /submit, or /connect), never to a dead path and never to
//      another demoted route (no redirect chain). This is the same dead-end
//      class the legacy-redirect net (legacy-redirects.test.tsx) guards for the
//      retired funnel, applied to the v3 demotions.
//   2. no-redirected-link — the live chrome (nav + footer) and the surfaces
//      that ship in the lean cut (the demolished Home + the Capital/Development
//      stubs) must not link to ANY demoted URL. A redirected URL is still a
//      "known path", so the CTA dead-end net (cta-routing.test.tsx) would NOT
//      catch a stray link to one — it would just bounce the visitor through a
//      redirect. This net asserts the chrome points only at live surfaces.

function read(rel: string): string {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf-8");
}

// The full v3 demotion set: pegasus-owned URLs (REDIRECTED_URLS) plus the two
// standalone pages also demoted to home. /library and /faq are not in
// ROUTE_TO_URL (they are app-level pages, never part of the prototype shell),
// so they are not in REDIRECTED_URLS — they are demoted purely via App.tsx
// redirect Routes, and must be covered here explicitly.
const DEMOTED_URLS: string[] = [...REDIRECTED_URLS, "/library", "/faq"];
const DEMOTED_SET = new Set<string>(DEMOTED_URLS);

// The only destinations a v3 demotion is allowed to land on.
const KEPT_DESTINATIONS = new Set<string>(["/", "/submit", "/connect"]);

// Build the from→to redirect map the app actually applies:
//   • legacyRedirects — the [from, to] tuples (the five audience lanes etc.),
//     imported as data so a rename is reflected automatically.
//   • explicit single-route redirects in App.tsx of the form
//     <Route path="X">{() => <Redirect to="Y" />}</Route> (the non-lane
//     demotions), parsed from source. The legacyRedirects.map mount uses
//     path={from}/to={to} (no string literals), so this regex naturally
//     excludes it — those are already covered by the imported array.
function explicitRedirects(src: string): Array<[string, string]> {
  const re =
    /<Route\s+path="([^"]+)">\s*\{\s*\(\s*\)\s*=>\s*<Redirect\s+to="([^"]+)"\s*\/>\s*\}\s*<\/Route>/g;
  const out: Array<[string, string]> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.push([m[1], m[2]]);
  return out;
}

const REDIRECT_MAP: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [from, to] of legacyRedirects) map.set(from, to);
  for (const [from, to] of explicitRedirects(read("client/src/App.tsx"))) {
    if (!map.has(from)) map.set(from, to);
  }
  return map;
})();

describe("v3 lean cut: every demoted route redirects to a kept surface", () => {
  it("has a demotion set to test (non-vacuous)", () => {
    expect(DEMOTED_URLS.length).toBeGreaterThanOrEqual(12);
  });

  it("no demoted URL still renders the prototype shell (PEGASUS_URLS)", () => {
    const leaked = DEMOTED_URLS.filter((u) => PEGASUS_URLS.includes(u));
    expect(
      leaked,
      `these demoted URLs still resolve to the prototype shell instead of redirecting: ${leaked.join(", ")}`,
    ).toEqual([]);
  });

  for (const url of DEMOTED_URLS) {
    it(`${url} redirects to a kept, non-demoted surface`, () => {
      const dest = REDIRECT_MAP.get(url);
      expect(
        dest,
        `${url} has no redirect rule in App.tsx (legacyRedirects tuple or an explicit <Redirect>)`,
      ).toBeTruthy();
      expect(
        DEMOTED_SET.has(dest as string),
        `${url} redirects to ${dest}, which is itself demoted (redirect chain)`,
      ).toBe(false);
      expect(
        KEPT_DESTINATIONS.has(dest as string),
        `${url} redirects to ${dest}, which is not a kept v3 surface (${Array.from(KEPT_DESTINATIONS).join(", ")})`,
      ).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// no-redirected-link: live chrome + lean-cut surfaces never link to a demotion
// ---------------------------------------------------------------------------

const noop = () => {};
const parallaxRef = React.createRef<HTMLDivElement>();

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
    render: (go) => (
      <HomePage go={go} theme="light" parallaxRef={parallaxRef} openPeggy={noop} />
    ),
  },
  { name: "Capital stub", render: (go) => <CapitalPage go={go} /> },
  { name: "Development stub", render: (go) => <DevelopmentPage go={go} /> },
];

afterEach(() => cleanup());

describe("v3 lean cut: chrome + lean surfaces never link to a demoted route", () => {
  for (const spec of CHROME) {
    it(`${spec.name} routes/links only to live (non-demoted) surfaces`, () => {
      const { go, calls } = makeGo();
      const { container } = renderChrome(spec.render(go), "/");
      clickAll(container);

      // go(route) calls must not resolve (via ROUTE_TO_URL) to a demoted URL.
      const demotedGo = Array.from(new Set(calls)).filter((r) =>
        DEMOTED_SET.has(ROUTE_TO_URL[r as Route]),
      );
      expect(
        demotedGo,
        `${spec.name} navigates to demoted route key(s): ${demotedGo
          .map((r) => `${r}→${ROUTE_TO_URL[r as Route]}`)
          .join(", ")}`,
      ).toEqual([]);

      // <a href> internal links must not point at a demoted URL.
      const demotedLinks = internalLinkPaths(container).filter((p) =>
        DEMOTED_SET.has(p),
      );
      expect(
        demotedLinks,
        `${spec.name} links to demoted URL(s): ${Array.from(new Set(demotedLinks)).join(", ")}`,
      ).toEqual([]);
    });
  }

  it("the harness actually exercises navigation (non-vacuous)", () => {
    // Guard against a vacuous pass: the demolished Home still offers its
    // primary Submit CTA through go(), proving clickAll wires the handlers.
    const { go, calls } = makeGo();
    const { container } = renderChrome(
      <HomePage go={go} theme="light" parallaxRef={parallaxRef} openPeggy={noop} />,
      "/",
    );
    clickAll(container);
    expect(calls, "Home triggered no go() navigations").toContain("submit");
  });
});
