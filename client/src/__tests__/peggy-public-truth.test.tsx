import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import Privacy from "@/pages/privacy";
import Disclosures from "@/pages/disclosures";
import Ecosystem from "@/pages/ecosystem";
import { PeggyPage } from "@/pegasus/pages";
import { StrategyLabFeature } from "@/pegasus/blocks";

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

function visibleText(ui: React.ReactElement, path: string): string {
  const memory = memoryLocation({ path });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const { container } = render(
    <QueryClientProvider client={queryClient}>
      <Router hook={memory.hook}>{ui}</Router>
    </QueryClientProvider>,
  );
  return (container.textContent || "").replace(/\s+/g, " ").trim();
}

describe("public Peggy capability truth", () => {
  it("accurately describes browser storage without fingerprinting claims", () => {
    const privacyText = visibleText(<Privacy />, "/privacy");
    const disclosuresText = visibleText(<Disclosures />, "/disclosures");

    expect(privacyText).toMatch(/local browser storage/i);
    expect(privacyText).toMatch(/session storage/i);
    expect(privacyText).toMatch(/current browsing session/i);
    expect(privacyText).toMatch(/random anonymous Strategy Lab session identifier/i);
    expect(privacyText).toMatch(/not derived from.*browser.*characteristics/i);
    expect(privacyText).toMatch(
      /send Peggy conversation content to our configured AI processing provider so it can generate Peggy(?:'s|’s) reply/i,
    );
    expect(privacyText).toMatch(/choose to save.*property and financial.*draft/i);
    expect(privacyText).toMatch(/stored on your device.*local browser storage/i);
    expect(privacyText).toMatch(/does not itself submit.*Pegasus/i);
    expect(privacyText).not.toMatch(/one session cookie/i);
    expect(privacyText).not.toMatch(/one preference cookie/i);
    const memory = memoryLocation({ path: "/privacy" });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Router hook={memory.hook}><Privacy /></Router>
      </QueryClientProvider>,
    );
    const whatWeCollect = within(container)
      .getByTestId("section-privacy-what-we-collect")
      .textContent || "";
    const cookies = within(container)
      .getByTestId("section-privacy-cookies")
      .textContent || "";

    expect(whatWeCollect).toMatch(
      /associate it with a server-created conversation record/i,
    );
    expect(whatWeCollect).not.toMatch(
      /first-party conversation identifier.*connected to this browser/i,
    );
    expect(cookies).toMatch(
      /active server conversation ID and access credential stay only in page memory, not in local browser storage/i,
    );
    expect(cookies).toMatch(
      /closing and reopening Peggy on the same loaded page may continue/i,
    );
    expect(cookies).toMatch(
      /reloading or closing the page ends that browser view/i,
    );
    expect(cookies).toMatch(
      /explicitly choose Save chat.*separate transcript copy to local browser storage/i,
    );
    expect(cookies).not.toMatch(
      /Peggy keeps a random first-party conversation identifier in local browser storage/i,
    );
    expect(`${privacyText} ${disclosuresText}`).not.toContain("Pegasus DreamScapes");
    expect(`${privacyText} ${disclosuresText}`).toContain("Pegasus Dreamscapes");
  });

  it("states on Privacy that Peggy phone and recording are not live", () => {
    const text = visibleText(<Privacy />, "/privacy");

    expect(text).toMatch(/phone and voice are in development/i);
    expect(text).toMatch(/Peggy does not currently answer or record calls/i);
    expect(text).not.toMatch(/Peggy .* answers and may record the call/i);
    expect(text).not.toMatch(/recordings are encrypted at rest, retained for 90 days/i);
  });

  it("states on Disclosures that phone consent controls are launch gates", () => {
    const text = visibleText(<Disclosures />, "/disclosures");

    expect(text).toMatch(/Peggy does not currently answer or record calls/i);
    expect(text).toMatch(/before any voice launch/i);
    expect(text).not.toMatch(/the first turn of every call .* includes/i);
  });

  it("distinguishes Peggy's live web training surface from planned voice", () => {
    const ecosystemText = visibleText(<Ecosystem />, "/ecosystem");
    const peggyText = visibleText(
      <PeggyPage go={() => undefined} openPeggy={() => undefined} />,
      "/peggy",
    );

    expect(ecosystemText).toMatch(/available on the website in private training/i);
    expect(ecosystemText).toMatch(/phone and voice remain in development/i);
    expect(peggyText).toMatch(/web intake is in active training/i);
    expect(peggyText).toMatch(/phone and voice remain in development/i);
  });

  it("keeps calculator education and Peggy decision boundaries public", () => {
    const memory = memoryLocation({ path: "/disclosures" });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Router hook={memory.hook}><Disclosures /></Router>
      </QueryClientProvider>,
    );
    const educationText = (
      within(container).getByTestId("disclosure-education").textContent || ""
    ).replace(/\s+/g, " ").trim();
    const peggyText = (
      within(container).getByTestId("disclosure-peggy").textContent || ""
    ).replace(/\s+/g, " ").trim();
    const disclosuresText = (container.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
    const strategyText = visibleText(
      <StrategyLabFeature go={() => undefined} />,
      "/",
    );
    const reviewedText = `${disclosuresText} ${strategyText}`;

    expect(educationText).toMatch(
      /Strategy Lab, calculators, articles, and worked examples.*educational/i,
    );
    expect(educationText).toMatch(
      /not legal, tax, accounting, or investment advice/i,
    );
    expect(educationText).toMatch(
      /illustrative and depend entirely on the inputs you provide/i,
    );

    expect(peggyText).toMatch(/Not the decision-maker/i);
    expect(peggyText).toMatch(/cannot give legal, tax, or investment advice/i);
    expect(peggyText).toMatch(/cannot quote a specific offer/i);
    expect(peggyText).toMatch(
      /hard refusal categories.*price quotes, valuations, fitness claims/i,
    );

    expect(strategyText).toMatch(/planning support, not a valuation/i);
    expect(strategyText).toMatch(/not an appraisal, offer/i);
    expect(strategyText).toMatch(/Directional only/i);
    expect(strategyText).toMatch(/legal advice, tax advice/i);
    expect(strategyText).toMatch(/investment recommendation/i);
    expect(reviewedText).toContain("Pegasus Dreamscapes");
    expect(reviewedText).not.toContain("Pegasus DreamScapes");
  });
});
