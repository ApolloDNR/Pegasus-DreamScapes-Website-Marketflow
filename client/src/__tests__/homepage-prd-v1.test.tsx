import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, fireEvent, within } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Landing } from "@/pegasus/Landing";

// Homepage contract: experience blueprint v1.1 and its approved parchment refinement.
// Six sections: arrival, visitor paths, Nelson evidence, founder, optional plan,
// and invitation. The owner-approved clearer headline supersedes the older
// "made executable" wording; the original image hash, action destinations,
// evidence boundaries and representation disclosures remain locked.

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

describe("Homepage premium editorial contract", () => {
  it("locks the approved Bay-colonnade plate instead of silently replacing its architecture", () => {
    const asset = readFileSync(
      resolve(process.cwd(), "client/public/images/hero/pegasus-v6-arrival.webp"),
    );
    expect(createHash("sha256").update(asset).digest("hex")).toBe(
      "a1de24393eda3bf7ca0ece805a96b71554b7006aee0fcede5d7c41554d8409a3",
    );

    const { container } = renderHome();
    const hero = container.querySelector<HTMLImageElement>(
      '[data-testid="approved-home-hero-image"]',
    );
    expect(hero).toBeTruthy();
    expect(hero).toHaveAttribute("src", "/images/hero/pegasus-v6-arrival.webp");
    expect(hero).toHaveAttribute("width", "1672");
    expect(hero).toHaveAttribute("height", "941");
    expect(hero).toHaveAttribute("fetchpriority", "high");
  });

  it("uses the specified arrival copy and two real links", () => {
    const { container } = renderHome();
    const arrival = within(container.querySelector<HTMLElement>('[data-hv="arrival"]')!);
    expect(arrival.getByRole('heading', { level:1 })).toHaveTextContent('Complex real estate, a clear way forward.');
    expect(arrival.getAllByRole('link').map(link => link.getAttribute('href'))).toEqual(['/bring-an-opportunity','/our-work']);
    expect(arrival.getByText(/Property strategy, renovation insight/)).toBeInTheDocument();
  });
  it("does not repeat the old proof rail", () => {
    const { container } = renderHome();
    expect(container.querySelector('.hv-hero-statbar')).toBeNull();
    expect(container.querySelector('[data-hv="proof"] img')).toBeInTheDocument();
  });
  it("gives owners, representation clients, and deal partners a direct path", () => {
    const { container } = renderHome();
    const links = within(container.querySelector<HTMLElement>('[data-hv="router"]')!).getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/property-owners','/work-with-apollo','/deal-partners']);
  });
  it("keeps accounting and role attribution out of the homepage evidence summary", () => {
    const { container } = renderHome();
    const proof = container.querySelector<HTMLElement>('[data-hv="proof"]')!;
    expect(proof).toHaveTextContent('A completed East Bay residential transformation.');
    expect(proof).not.toHaveTextContent(/\$|ROI|profit|sourced the deal/);
    expect(within(proof).getByRole('link')).toHaveAttribute('href','/projects/nelson-dr');
  });
  it("removes the duplicated method pitch from Home", () => {
    const { container } = renderHome();
    expect(container.querySelector('[data-hv="method"]')).toBeNull();
    expect(within(container.querySelector('nav')!).getByRole('button', {name:'Real Estate'})).toBeInTheDocument();
  });
  it("keeps the optional tool behind an on-demand load and direct Strategy Lab access", () => {
    const { container } = renderHome();
    const plan = within(container.querySelector<HTMLElement>('[data-hv="plan"]')!);
    expect(plan.getByRole('button', {name:'Open the planning guide'})).toBeInTheDocument();
    expect(plan.getByRole('link', {name:'Open Strategy Lab'})).toHaveAttribute('href','/strategy-lab');
  });
  it("pairs the founder portrait and biography with the required representation boundary", () => {
    const { container } = renderHome();
    const founder = container.querySelector<HTMLElement>('[data-hv="founder"]')!;
    expect(founder).toHaveTextContent('Apollo Duran');
    expect(founder).toHaveTextContent('Duran Ramirez, Paolo Ariel');
    expect(founder).toHaveTextContent('BMP Realty Inc DBA Keller Williams Realty-East Bay');
    expect(founder).toHaveTextContent('CA DRE #02333658');
  });
  it("keeps exactly six sections in the blueprint order", () => {
    const { container } = renderHome();
    expect(Array.from(container.querySelectorAll<HTMLElement>('[data-hv]')).map(el=>el.dataset.hv)).toEqual(['arrival','router','proof','founder','plan','final']);
  });
  it("selects the real connected question after loading the guide", async () => {
    const { container } = renderHome();
    fireEvent.click(within(container).getByRole('button', {name:'Open the planning guide'}));
    const plan = await within(container).findByTestId('opportunity-plan');
    const choice = within(plan).getByRole('button', {name:'Underwriting'});
    fireEvent.click(choice);
    expect(choice).toHaveAttribute('aria-pressed','true');
    expect(within(plan).getByRole('link', {name:'Work through the numbers'})).toHaveAttribute('href','/strategy-lab');
    expect(plan.querySelector('.op-map-node:not(.op-map-focus)')).toHaveTextContent('Capital');
  });
});
