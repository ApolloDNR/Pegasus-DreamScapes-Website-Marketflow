import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Landing } from "@/pegasus/Landing";
import { ThemeProvider } from "@/components/theme-provider";
import { PEGASUS_URLS, routeForUrl } from "@/pegasus/routes";

// Blank-shell net (Task #211).
//
// App.tsx mounts EVERY url in PEGASUS_URLS on the self-contained prototype
// shell (client/src/pegasus/Landing.tsx), and those routes come first in the
// wouter <Switch> — so the prototype captures the URL before any app-level
// page can. Inside Landing, the visible page is chosen by a chain of
// `route === '<key>'` branches in <main>. If a URL lives in PEGASUS_URLS but
// has NO matching render branch (the recorded /submit failure mode, see
// .agents/memory/pegasus-route-capture.md), the shell paints nav + footer
// with an EMPTY <main>: a silent blank page, no error, no test failure.
//
// Task #201's cta-routing spec proves CTAs point at *mapped* route keys, but it
// never mounts the shell at those URLs, so it cannot catch a mapped URL that
// renders nothing. This suite renders the real prototype shell at every
// PEGASUS_URLS entry and asserts each produces substantive, visible <main>
// content (a heading + real copy) — so a route that resolves to a blank shell
// fails CI instead of shipping a dead page.

// jsdom polyfills — Landing's ScrollReveal IntersectionObserver, hero parallax
// (matchMedia), and go()/scroll handlers rely on these.
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

function renderShell(routePath: string) {
  const { hook } = memoryLocation({ path: routePath, static: true });
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <Router hook={hook}>
          <Landing />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => cleanup());

describe("Every PEGASUS_URLS route renders real content, never a blank shell (Task #211)", () => {
  // Non-vacuous guard: if PEGASUS_URLS ever empties out (or stops being
  // derived from the route map), this whole suite would silently pass with no
  // cases. Pin a sane floor so the net keeps covering the real surface.
  it("PEGASUS_URLS covers the prototype's public surface", () => {
    expect(PEGASUS_URLS.length).toBeGreaterThanOrEqual(8);
  });

  for (const url of PEGASUS_URLS) {
    it(`${url} resolves to a rendered page branch with visible content`, async () => {
      const { container } = renderShell(url);

      const main = container.querySelector("main");
      expect(main, `${url}: prototype shell rendered no <main> landmark`).toBeTruthy();

      // Non-home Pegasus pages are route-level lazy chunks. Wait through the
      // shared PageLoader fallback before asserting the substantive page body.
      await waitFor(() => {
        expect(
          main!.querySelector("h1, h2"),
          `${url} (route '${routeForUrl(url)}') never resolved past PageLoader`,
        ).toBeTruthy();
      });

      // A blank shell renders <main> with no element children. A real page
      // mounts a substantial subtree.
      expect(
        main!.children.length,
        `${url} (route '${routeForUrl(url)}') renders an EMPTY <main> — no Landing.tsx branch matches this route, so it shows a blank prototype shell`,
      ).toBeGreaterThan(0);

      // It must surface a real heading — every prototype page leads with one.
      const heading = main!.querySelector("h1, h2");
      expect(
        heading,
        `${url} (route '${routeForUrl(url)}') renders <main> with no heading — likely a blank/placeholder shell`,
      ).toBeTruthy();

      // And it must carry real copy, not just an empty heading husk.
      const text = (main!.textContent || "").replace(/\s+/g, " ").trim();
      expect(
        text.length,
        `${url} (route '${routeForUrl(url)}') renders <main> with almost no text (${text.length} chars) — a blank shell`,
      ).toBeGreaterThan(40);
    });
  }
});
