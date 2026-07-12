import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Landing } from "@/pegasus/Landing";

// Public Website v1 lane-page contract (issue #22, PRD §7.3–§7.8 /
// COPY_DECK §5–§10). The PRD locks each audience lane's hero headline and
// subtext, and requires three compliance notes verbatim: the deal-finder
// source-attribution note, the capital no-public-offering note, and the
// referral lawful-compensation note. It also locks the top navigation
// (§5.1) and the footer page map (§5.2). This suite renders the real
// prototype shell at each lane URL and pins all of it.

vi.mock("@/lib/analytics", () => ({
  initAnalytics: () => () => {},
  trackEvent: () => {},
  trackCtaClick: () => {},
}));

class NoopIntersectionObserver {
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

function renderAt(path: string) {
  const { hook } = memoryLocation({ path, static: true });
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

// Each lane: [url, locked hero fragments (split on the <br/>), locked
// subtext fragment, required compliance note (or null)].
const LANES: [string, string[], string, string | null][] = [
  [
    "/sellers",
    ["Sell on your terms,", "not the market’s."],
    "If the property is complicated, the answer does not have to be.",
    null,
  ],
  [
    "/dealfinders",
    ["Bring the deal.", "Get a serious review."],
    "deal finders, wholesalers, agents, contractors, and referral partners",
    "Source attribution is recorded at submission. Any JV, assignment, referral, or compensation structure must be agreed in writing before distribution.",
  ],
  [
    "/buyers",
    ["Buy with a strategy,", "not just a search."],
    "Licensed buyer representation is provided through Keller Williams East Bay when applicable.",
    null,
  ],
  [
    "/capital",
    ["Capital should", "follow discipline."],
    "Pegasus reviews capital relationships project-by-project.",
    "No public offering, no guaranteed returns, no pooled fund.",
  ],
  [
    "/operators",
    ["Join the Pegasus", "operator bench."],
    "contractors, trades, designers, architects, photographers, inspectors, lenders, escrow/title partners",
    null,
  ],
  [
    "/referral",
    ["Send the situation.", "Pegasus will handle it carefully."],
    "For professionals and trusted contacts who know a property owner, investor, or situation",
    "Referral compensation, JV participation, or professional coordination is handled only where lawful, permitted, and agreed in writing.",
  ],
];

describe("Lane pages PRD v1 contract (issue #22)", () => {
  for (const [url, heroParts, subtext, note] of LANES) {
    it(`locks the ${url} hero${note ? " + required compliance note" : ""}`, () => {
      const { container } = renderAt(url);
      const text = container.textContent!;
      for (const part of heroParts) {
        expect(text, `missing hero fragment on ${url}`).toContain(part);
      }
      expect(text, `missing locked subtext on ${url}`).toContain(subtext);
      if (note) {
        expect(text, `missing required note on ${url}`).toContain(note);
      }
    });
  }

  it("locks the PRD §5.1 top navigation and primary nav button", () => {
    const { container } = renderAt("/");
    const nav = container.querySelector("nav")!;
    for (const label of ["Home", "Departments", "Strategy Lab", "MarketFlow", "Work With Apollo"]) {
      expect(nav.textContent, `missing nav item: ${label}`).toContain(label);
    }
    expect(nav.textContent).toContain("Submit a Property");
  });

  it("locks the PRD §5.2 footer page map", () => {
    const { container } = renderAt("/");
    const footer = container.querySelector("footer")!;
    for (const label of [
      "Sellers & Owners",
      "Deal Finders",
      "Buyers",
      "Capital Partners",
      "Operators & Vendors",
      "Referral Partners",
      "Case Study",
      "The Pegasus Standard",
      "Contact",
      "Disclosures",
      "Privacy Policy",
      "Terms",
      "Submit a Property",
    ]) {
      expect(footer.textContent, `missing footer link: ${label}`).toContain(label);
    }
    // The site-wide locked disclosure paragraph stays intact.
    expect(footer.textContent).toContain("Pegasus Dreamscapes Corp. is not a real estate brokerage.");
    expect(footer.textContent).toContain("CA DRE #02333658");
    expect(footer.textContent).toContain("Equal Housing Opportunity");
  });
});
