import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import CaseStudyPage from "@/pages/case-study";
import DisclosuresPage from "@/pages/disclosures";

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
  (
    globalThis as unknown as {
      IntersectionObserver: typeof NoopIntersectionObserver;
    }
  ).IntersectionObserver = NoopIntersectionObserver;
}

afterEach(cleanup);

function renderPage(path: string, page: React.ReactElement) {
  const memory = memoryLocation({ path, static: true });
  return render(<Router hook={memory.hook}>{page}</Router>);
}

function normalizedText(element: HTMLElement): string {
  return (element.textContent || "").replace(/\s+/g, " ").trim();
}

describe("Nelson case-study truth boundary", () => {
  it("publishes the documented figures without assigning Pegasus or founder roles", () => {
    const { container } = renderPage("/case-study", <CaseStudyPage />);
    const text = normalizedText(container);
    const imageDescriptions = Array.from(container.querySelectorAll("img"))
      .map((image) => image.alt)
      .join(" ");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A documented acquisition, improvement, and sale.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Nelson Dr finished exterior shown in the public project record",
      }),
    ).toBeInTheDocument();
    expect(text).toMatch(/Richmond \/ El Sobrante Area.*settled September 2025/i);
    expect(text).toMatch(/Acquired\s*\$600,000/i);
    expect(text).toMatch(/Improvement budget\s*≈ \$105,000/i);
    expect(text).toMatch(/Basis before other costs\s*≈ \$705,000/i);
    expect(text).toMatch(/Sale\s*\$840,000/i);
    expect(text).toMatch(/Gross spread before other costs\s*≈ \$135,000/i);
    expect(text).toMatch(/not net profit or return/i);
    expect(text).toMatch(
      /does not assign those services to Pegasus or any individual without separate evidence/i,
    );
    expect(`${text} ${imageDescriptions}`).not.toMatch(
      /founder-led|Pegasus repositioning|rebuilt to neighborhood standard/i,
    );
  });
});

describe("Disclosures identity and review status", () => {
  it("shows the verified identity, responsible broker, and brokerage separation", () => {
    renderPage("/disclosures", <DisclosuresPage />);
    const identity = screen.getByTestId("disclosure-identity");
    const text = normalizedText(identity);

    expect(screen.getByTestId("link-disclosures-jump-disclosure-identity")).toHaveAttribute(
      "href",
      "#disclosure-identity",
    );
    expect(text).toMatch(
      /Pegasus Dreamscapes Corp\. is a real estate operating company, not a real estate brokerage/i,
    );
    expect(text).toMatch(/Paolo Ariel Duran Ramirez uses “Apollo” as a public-facing name/i);
    expect(text).toContain("Duran Ramirez, Paolo Ariel");
    expect(text).toContain("DRE #02333658");
    expect(text).toMatch(
      /responsible broker.*BMP Realty Inc DBA Keller Williams Realty-East Bay.*DRE #01277896/i,
    );
    expect(text).toMatch(/verify current status/i);
    expect(text).toMatch(/requires a separate written brokerage agreement/i);
  });

  it("marks the page as an August 2026 operator draft pending review", () => {
    renderPage("/disclosures", <DisclosuresPage />);
    const text = normalizedText(screen.getByTestId("disclosure-identity"));

    expect(text).toMatch(
      /operator-prepared draft pending qualified legal and broker review/i,
    );
    expect(text).toMatch(/site-copy consistency date: August 2026/i);
    expect(screen.queryByText(/Last updated: May 2026/i)).not.toBeInTheDocument();
  });
});
