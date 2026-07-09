import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Landing } from "@/pegasus/Landing";

// Public Website v1 homepage contract (issue #22, PRD §6.2 / COPY_DECK §2).
//
// The PRD locks the homepage promise, the Situation Router, the Deal
// Engine, the four departments, the Apollo disclosure, the Nelson proof,
// the labeled Pegasus Standard vision band, and the final CTA — in that
// narrative order. This suite renders the real prototype shell at "/"
// and pins both the locked copy and the section order so a future
// refactor cannot silently drift the homepage away from the PRD.

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

function renderHome() {
  const { hook } = memoryLocation({ path: "/", static: true });
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

describe("Homepage PRD v1 contract (issue #22)", () => {
  it("locks the hero promise, CTAs, and trust line", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    expect(text).toContain("Complex property.");
    expect(text).toContain("Structured opportunity.");
    expect(text).toContain(
      "reviews real estate situations and routes them into the right path",
    );
    expect(text).toContain("Submit a Property");
    expect(text).toContain("Request a Strategy Review");
    expect(text).toContain(
      "Based in the East Bay. Founder-led real estate investment, development, and strategy.",
    );
    // Primary CTA routes to the reinstated intake desk.
    const primary = Array.from(container.querySelectorAll("a")).find((a) =>
      a.textContent?.includes("Submit a Property"),
    );
    expect(primary?.getAttribute("href")).toBe("/submit-property");
  });

  it("renders the five locked Situation Router lanes", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    for (const lane of [
      "I own a property",
      "I found a deal",
      "I want to buy",
      "I want to partner",
      "I need a strategy",
    ]) {
      expect(text).toContain(lane);
    }
    expect(text).toContain("What brings you here?");
    expect(text).toContain("Start Owner Review");
  });

  it("renders the Deal Engine flow and the four locked departments", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    expect(text).toContain("One property. Four departments. One routed path.");
    for (const step of ["Submit", "Review", "Structure", "Route", "Execute", "Exit / Hold"]) {
      expect(text).toContain(step);
    }
    expect(text).toContain("Finds, reviews, structures, and secures opportunities.");
    expect(text).toContain("Scopes, renovates, repositions, builds, and manages execution.");
    expect(text).toContain("Packages, markets, sells, assigns, lists, or connects the right exit.");
    expect(text).toContain("Operates, protects, and compounds long-term holds.");
  });

  it("keeps the labeled future-vision band and the locked final CTA", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    expect(text).toContain("The long-term vision is bigger than transactions.");
    expect(text).toContain("Eudaimonia");
    // Non-negotiable: future vision must never read as current inventory.
    expect(text).toContain("Long-term development direction — not current inventory");
    expect(text).toContain("Have a property, deal, or situation worth reviewing?");
  });

  it("tells the story in PRD order: hero → router → engine → Apollo → proof → vision → final CTA", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    const beats = [
      "Structured opportunity.",
      "What brings you here?",
      "One property. Four departments. One routed path.",
      "CA DRE #02333658",
      "$840",
      "The long-term vision is bigger than transactions.",
      "Have a property, deal, or situation worth reviewing?",
    ];
    const positions = beats.map((b) => text.indexOf(b));
    for (let i = 0; i < positions.length; i++) {
      expect(positions[i], `missing beat: ${beats[i]}`).toBeGreaterThan(-1);
      if (i > 0) {
        expect(positions[i], `beat out of order: ${beats[i]}`).toBeGreaterThan(positions[i - 1]);
      }
    }
  });
});
