import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import Terms from "@/pages/terms";
import { DealPartnersPage } from "@/pegasus/deal-partners";
import { OurWorkPage } from "@/pegasus/our-work";
import { PropertyOwnersPage } from "@/pegasus/property-owners";

afterEach(cleanup);

const noop = () => undefined;

function renderPublicPage(ui: React.ReactElement, path: string) {
  const location = memoryLocation({ path, static: true });
  return render(<Router hook={location.hook}>{ui}</Router>);
}

function normalizedText(container: HTMLElement): string {
  return (container.textContent || "").replace(/\s+/g, " ").trim();
}

describe("primary public truth boundaries", () => {
  it("keeps every property-owner situation inside a possible-intake boundary", () => {
    const view = renderPublicPage(
      <PropertyOwnersPage go={noop} />,
      "/property-owners",
    );

    const observedStates: string[] = [];
    const choices = Array.from(
      view.container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="Common owner situations"] button',
      ),
    );
    for (const choice of choices) {
      fireEvent.click(choice);
      observedStates.push(normalizedText(view.container));
    }

    expect(choices.length).toBeGreaterThan(1);
    for (const text of observedStates) {
      expect(text).toMatch(
        /submission may be considered, but no written review, response, route, or offer is promised/i,
      );
      expect(text).not.toMatch(
        /we buy with tenants|close on the date|we give you a written read|carry the resolution ourselves|make a direct offer/i,
      );
    }
  });

  it("presents every deal-partner lane as a review question, not a promised capability", () => {
    const view = renderPublicPage(
      <DealPartnersPage go={noop} />,
      "/deal-partners",
    );

    const observedStates: string[] = [];
    const choices = Array.from(
      view.container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="What the deal is missing"] button',
      ),
    );
    for (const choice of choices) {
      fireEvent.click(choice);
      observedStates.push(normalizedText(view.container));
    }

    expect(choices.length).toBeGreaterThan(1);
    for (const text of observedStates) {
      expect(text).toMatch(
        /no response, buyer, written terms, distribution, funding, or closing is promised/i,
      );
      expect(text).not.toMatch(
        /pegasus supplies the missing capability|we size and arrange the funding|places it with our list|roughly half a retail bid|get an answer you can act on/i,
      );
    }
  });

  it("limits Nelson Drive proof to the documented financial record", () => {
    const { container } = renderPublicPage(
      <OurWorkPage go={noop} />,
      "/our-work",
    );
    const text = normalizedText(container);

    expect(text).toMatch(/Richmond \/ El Sobrante Area/i);
    expect(text).toMatch(/Acquisition.*\$600,000/i);
    expect(text).toMatch(/Improvement budget.*\$105,000/i);
    expect(text).toMatch(/Sale.*\$840,000/i);
    expect(text).toMatch(/\$135,000 gross spread/i);
    expect(text).toMatch(/not net profit or return/i);
    expect(text).toMatch(/does not assign those services to Pegasus or any individual/i);
    expect(text).not.toMatch(
      /\$200K|\$95K|renovation, in-house|all-in|Apollo.*sourced and bought|Pegasus coordinated construction|operating edge/i,
    );
  });

  it("states the draft and submission boundaries in the visible Terms", () => {
    const { container } = renderPublicPage(<Terms />, "/terms");
    const text = normalizedText(container);

    expect(text).toMatch(/draft pending qualified legal review/i);
    expect(text).toMatch(
      /does not guarantee review, analysis, an offer, a referral, a listing, an introduction, a response, or a response time/i,
    );
    expect(text).not.toMatch(/Every submission gets a serious (?:read|review)/i);
    expect(text).not.toMatch(/We acquire, joint-venture, refer, and list/i);
  });
});
