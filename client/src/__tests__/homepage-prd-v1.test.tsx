import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Landing } from "@/pegasus/Landing";

// Homepage contract — Master Blueprint v5.1 (§7, §31, §32.1, §32.2).
//
// v5.1 locks the homepage to seven narrative movements in a fixed order:
//   1. Arrival  2. Visitor Router  3. Proof (Nelson Drive)  4. Pegasus Method
//   5. Opportunity Plan (signature)  6. Partner Proposition
//   7. Founder Trust + Final Invitation
// It also locks the public positioning ("Complex real estate, structured clearly."),
// the primary CTA ("Bring an Opportunity" → /bring-an-opportunity), and the
// evidence-bounded framing of the canonical Nelson figures (never "profit"
// and never an unsupported attribution of project or brokerage roles).
//
// This suite renders the real prototype shell at "/" and pins the locked
// copy and the movement order so a refactor cannot silently drift the
// homepage away from the blueprint. Supersedes the issue-#22 contract.

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

  it("locks the approved Arrival promise and concise three-action row", () => {
    const { container } = renderHome();
    const arrival = container.querySelector<HTMLElement>('[data-hv="arrival"]')!;
    const text = arrival.textContent!;
    expect(text).toContain("Complex real estate, structured clearly.");
    expect(text).toContain("Bring an Opportunity");
    expect(text).toContain("See How We Operate");
    expect(text).toContain("Open Strategy Lab");
    expect(arrival.querySelector(".hv-lead")).toBeNull();
    // §31: the primary CTA is a real link to the canonical intake URL.
    const primary = Array.from(container.querySelectorAll("a")).find((a) =>
      a.textContent?.includes("Bring an Opportunity"),
    );
    expect(primary?.getAttribute("href")).toBe("/bring-an-opportunity");
  });

  it("locks the approved four-part proof rail", () => {
    const { container } = renderHome();
    const rail = container.querySelector(".hv-hero-statbar")!;
    expect(rail.textContent).toContain("Founder-ledA defined point of view, published with boundaries.");
    expect(rail.textContent).toContain("Nelson DriveDocumented $600K acquisition to $840K sale.");
    expect(rail.textContent).toContain("East BayContra Costa & Alameda County.");
    expect(rail.textContent).toContain("Strategy firstStart with facts, constraints, roles, and written terms.");
  });

  it("locks the Visitor Router question and its four routes (§7.2)", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    expect(text).toContain("What are you bringing to Pegasus?");
    for (const route of [
      "A property I own",
      "A deal I found",
      "A project I'm operating",
      "A relationship or specialty",
    ]) {
      expect(text).toContain(route);
    }
  });

  it("locks the Nelson proof with the §11-safe number framing", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    expect(text).toContain("A completed East Bay residential transformation documented");
    expect(text).toContain("Nelson Drive");
    expect(text).toContain("El Sobrante");
    // Transparent stack — acquisition / improvement budget / basis / sale.
    expect(text).toContain("$600,000");
    expect(text).toContain("$105,000");
    expect(text).toContain("$840,000");
    expect(text).toContain("$135K gross spread");
    // The arithmetic is not presented as profit or proof of who performed the work.
    expect(text).toContain("not net profit");
    expect(text).toContain("does not identify every contractor");
    expect(text).not.toContain("$240K value created");
  });

  it("locks the five-step Pegasus Method (§7.4)", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    for (const step of ["Originate", "Structure", "Operate", "Realize", "Learn"]) {
      expect(text).toContain(step);
    }
  });

  it("locks the Opportunity Plan signature with its eight needs (§32.2)", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    expect(text).toContain("Most opportunities have a constraint to resolve.");
    for (const need of [
      "Control",
      "Underwriting",
      "Buyer",
      "Capital",
      "Development",
      "Local context",
      "Disposition",
      "Asset operations",
    ]) {
      expect(text).toContain(need);
    }
    // The signature must never read as a commitment (§15/§21 discipline).
    expect(text).toContain("Illustrative");
  });

  it("locks the Partner Proposition and Founder Trust movements (§7.7–§7.8)", () => {
    const { container } = renderHome();
    const text = container.querySelector("main")!.textContent!;
    expect(text).toContain("Bring what you do well.");
    expect(text).toContain("Paolo");
    expect(text).toContain("Duran Ramirez, Paolo Ariel");
    expect(text).toContain("BMP Realty Inc DBA Keller Williams Realty-East Bay");
    expect(text).toContain("CA DRE #02333658");
  });

  it("keeps the seven movements in the locked narrative order (§32.1)", () => {
    const { container } = renderHome();
    const order = Array.from(
      container.querySelectorAll<HTMLElement>("[data-hv]"),
    ).map((el) => el.dataset.hv);
    expect(order).toEqual([
      "arrival",
      "router",
      "proof",
      "method",
      "plan",
      "partner",
      "founder",
      "final",
    ]);
  });

  it("selecting an Opportunity Plan need reveals what Pegasus brings", () => {
    const { container } = renderHome();
    const chip = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.trim() === "Underwriting" && b.className.includes("hv-chip"),
    );
    expect(chip, "Opportunity Plan chip row must render").toBeTruthy();
    fireEvent.click(chip!);
    expect(chip!.getAttribute("aria-pressed")).toBe("true");
  });
});
