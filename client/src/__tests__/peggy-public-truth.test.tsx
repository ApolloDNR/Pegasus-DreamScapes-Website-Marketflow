import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import Privacy from "@/pages/privacy";
import Disclosures from "@/pages/disclosures";
import Ecosystem from "@/pages/ecosystem";
import { PeggyPage } from "@/pegasus/pages";

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
});
