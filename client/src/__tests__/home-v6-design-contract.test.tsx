import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { HomePageV6 } from "@/pegasus/home-v6";

const noop = () => {};

afterEach(() => cleanup());

function renderHome() {
  const { hook } = memoryLocation({ path: "/", static: true });
  return render(
    <Router hook={hook}>
      <HomePageV6 go={noop} openPeggy={noop} />
    </Router>,
  );
}

describe("Pegasus homepage v6 design contract", () => {
  it("uses the approved arrival image and locked first-viewport copy", () => {
    const { container, getByRole, getByText } = renderHome();
    const hero = container.querySelector('[data-testid="approved-home-hero-image"]') as HTMLImageElement | null;
    expect(hero?.getAttribute("src")).toBe("/images/hero/pegasus-v6-arrival.webp");
    expect(getByRole("heading", { level: 1 }).textContent?.replace(/\s+/g, " ").trim()).toBe(
      "Complex real estate, made executable.",
    );
    expect(getByText("Real estate operating company")).toBeTruthy();
    expect(getByText("Contra Costa & Alameda")).toBeTruthy();
  });

  it("keeps one dominant action and two subordinate first-viewport actions", () => {
    const { getByRole } = renderHome();
    expect(getByRole("link", { name: /Bring an Opportunity/i })).toBeTruthy();
    expect(getByRole("button", { name: /See How We Operate/i })).toBeTruthy();
    expect(getByRole("button", { name: /Open Strategy Lab/i })).toBeTruthy();
  });

  it("keeps the proof rail in the locked order", () => {
    const { container } = renderHome();
    const items = Array.from(container.querySelectorAll('[data-testid="home-proof-rail"] li'))
      .map((el) => el.textContent?.replace(/\s+/g, " ").trim() ?? "");
    expect(items).toHaveLength(4);
    expect(items[0]).toContain("Founder-led");
    expect(items[1]).toContain("Nelson Drive");
    expect(items[2]).toContain("East Bay");
    expect(items[3]).toContain("Strategy first");
  });

  it("presents visitor paths as an editorial list rather than a feature-card grid", () => {
    const { container } = renderHome();
    const router = container.querySelector('[data-testid="home-visitor-router"]');
    expect(router).toBeTruthy();
    expect(router?.querySelectorAll('[data-testid^="home-route-"]').length).toBe(4);
    expect(router?.querySelector('[data-layout="editorial-list"]')).toBeTruthy();
  });

  it("uses real Nelson Drive evidence and avoids fake social proof", () => {
    const { container, queryByText } = renderHome();
    expect(container.querySelector('img[src="/images/nelson/kitchen-after.webp"]')).toBeTruthy();
    expect(container.querySelector('img[src="/images/nelson/kitchen-before.webp"]')).toBeTruthy();
    expect(queryByText(/trusted by thousands/i)).toBeNull();
    expect(queryByText(/customers love/i)).toBeNull();
  });

  it("has one operating-map signature moment and no decorative SaaS language", () => {
    const { container, queryByText } = renderHome();
    expect(container.querySelector('[data-testid="home-operating-map"]')).toBeTruthy();
    expect(queryByText(/AI-powered/i)).toBeNull();
    expect(queryByText(/revolutionary platform/i)).toBeNull();
    expect(queryByText(/unlock your potential/i)).toBeNull();
  });

  it("keeps the founder and final invitation concise", () => {
    const { getByText, getAllByText } = renderHome();
    expect(getByText(/Paolo.*Apollo.*Duran/i)).toBeTruthy();
    expect(getAllByText(/DRE #02333658/i).length).toBeGreaterThan(0);
    expect(getByText("Bring the property, the deal, or the plan.")).toBeTruthy();
  });
});
