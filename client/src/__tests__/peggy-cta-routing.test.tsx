import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  render,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Landing } from "@/pegasus/Landing";
import { ROUTE_TO_URL } from "@/pegasus/routes";

// Peggy quick-action net (Task #214).
//
// The Peggy intake concierge (client/src/pegasus/peggy.tsx) carries its own
// navigation CTAs that Task #201's cta-routing net never sees: the "Or go
// straight to" chips (Strategy Lab / Submit a Property / Work With Apollo /
// MarketFlow) and the streamed handoff buttons ("Open Strategy Lab" /
// "Start my Review"). They navigate through the toStrategyLab / toSubmit /
// onHandoffToReview / go callbacks wired in Landing.tsx — none of which the
// page-body harness exercises. Task #210 covered the ApolloSelector and
// StrategyTierStrip programmatic CTAs but explicitly not Peggy's.
//
// This suite renders the real prototype shell (Landing), opens the Peggy
// widget, drives each quick-action through the SAME wiring the app ships, and
// captures the real wouter navigation. It asserts every destination resolves
// to a known app route and any ?intent= value is one /submit recognizes. A
// regression that points a Peggy action at a bad route or unknown intent fails
// here instead of silently 404-ing / dropping a prefill at runtime.

// Real surfaces a navigation may legitimately land on: the Pegasus route map
// plus standalone functional pages a CTA may deep-link to.
const KNOWN_PATHS = new Set<string>([...Object.values(ROUTE_TO_URL), "/faq"]);

// The exact set of ?intent= values the canonical /submit intake recognizes.
// Mirrors the zod enum + allow-list in client/src/pages/submit.tsx.
const VALID_INTENTS = new Set<string>([
  "sell",
  "property",
  "adu",
  "deal-jv",
  "explore",
  "blueprint",
]);

// --- jsdom polyfills — Landing relies on these (mirrors pegasus-no-blank-shell).
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
if (typeof window !== "undefined") {
  // jsdom's scrollTo throws "Not implemented"; go()/toSubmit call it on nav.
  (window as unknown as { scrollTo: () => void }).scrollTo = () => {};
}

function renderLanding(routePath = "/") {
  const mem = memoryLocation({ path: routePath, record: true });
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const utils = render(
    <QueryClientProvider client={qc}>
      <Router hook={mem.hook}>
        <Landing />
      </Router>
    </QueryClientProvider>,
  );
  return { ...utils, history: mem.history as string[] };
}

// Opens the Peggy widget by clicking its launcher (FAB) and returns the
// open dialog panel element.
function openPeggy(container: HTMLElement): HTMLElement {
  const fab = container.querySelector<HTMLButtonElement>(
    'button[aria-label^="Talk to PeggyAI"]',
  );
  expect(fab, "Peggy launcher (FAB) not found").toBeTruthy();
  fireEvent.click(fab!);
  const panel = container.querySelector<HTMLElement>('[role="dialog"]');
  expect(panel, "Peggy panel did not open").toBeTruthy();
  return panel!;
}

// Assert a captured navigation target points at a real route + valid intent.
function expectValidNavTarget(target: string, ctx: string) {
  const path = target.split(/[?#]/)[0];
  expect(
    KNOWN_PATHS.has(path),
    `${ctx} navigates to unknown path: ${target}`,
  ).toBe(true);
  const query = target.includes("?") ? target.split("?")[1] : "";
  const intent = new URLSearchParams(query).get("intent");
  if (intent !== null) {
    expect(
      VALID_INTENTS.has(intent),
      `${ctx} uses an ?intent= value /submit does not recognize: ${intent}`,
    ).toBe(true);
  }
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Peggy 'Or go straight to' chips navigate to real routes (Task #214)", () => {
  const CHIPS: { testid: string; expected: string }[] = [
    { testid: "peggy-route-strategylab", expected: ROUTE_TO_URL.strategylab },
    { testid: "peggy-route-submit", expected: ROUTE_TO_URL.submit },
    { testid: "peggy-route-apollo", expected: ROUTE_TO_URL.apollo },
    { testid: "peggy-route-marketflow", expected: ROUTE_TO_URL.marketflow },
  ];

  for (const { testid, expected } of CHIPS) {
    it(`${testid} → ${expected}`, () => {
      const { container, history } = renderLanding("/");
      const panel = openPeggy(container);

      const chip = panel.querySelector<HTMLButtonElement>(
        `[data-testid="${testid}"]`,
      );
      expect(chip, `${testid} chip not rendered`).toBeTruthy();

      const before = history.length;
      fireEvent.click(chip!);
      expect(
        history.length,
        `${testid} produced no navigation`,
      ).toBeGreaterThan(before);

      const target = history[history.length - 1];
      expect(target).toBe(expected);
      expectValidNavTarget(target, testid);
    });
  }

  // Non-vacuous guard: if the chip set ever shrinks, the loop above could pass
  // with fewer cases without anyone noticing. Pin the full quick-action set.
  it("renders all four quick-route chips", () => {
    const { container } = renderLanding("/");
    const panel = openPeggy(container);
    for (const { testid } of CHIPS) {
      expect(
        panel.querySelector(`[data-testid="${testid}"]`),
        `${testid} quick-route chip is missing`,
      ).toBeTruthy();
    }
  });
});

// Drives Peggy's streamed handoff buttons by mocking the chat endpoints so the
// assistant reply carries a [[HANDOFF]] directive, then clicks the resulting
// action and asserts where the SAME wiring (toStrategyLab / onHandoffToReview)
// actually navigates.
describe("Peggy handoff action buttons navigate to real routes (Task #214)", () => {
  function mockPeggyChat(response: string) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/peggy/conversations")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 1 }),
        } as Response;
      }
      if (url.includes("/api/peggy/chat")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ response }),
        } as Response;
      }
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
  }

  async function sendMessageAndWaitForAction(
    panel: HTMLElement,
    actionLabel: string,
  ): Promise<HTMLButtonElement> {
    const input = panel.querySelector<HTMLInputElement>(
      'input[aria-label="Ask PeggyAI"]',
    );
    expect(input, "Peggy input not found").toBeTruthy();
    fireEvent.change(input!, { target: { value: "I have a property to weigh" } });
    const sendBtn = panel.querySelector<HTMLButtonElement>(
      'button[aria-label="Send"]',
    );
    expect(sendBtn, "Peggy send button not found").toBeTruthy();
    fireEvent.click(sendBtn!);

    return await waitFor(() => {
      const btn = within(panel)
        .getAllByRole("button")
        .find((b) => (b.textContent || "").trim().startsWith(actionLabel)) as
        | HTMLButtonElement
        | undefined;
      expect(
        btn,
        `Peggy did not surface the "${actionLabel}" handoff action`,
      ).toBeTruthy();
      return btn!;
    });
  }

  it('strategylab handoff → "Open Strategy Lab" routes to the Strategy Lab', async () => {
    mockPeggyChat('Let me set you up. [[HANDOFF]]{"action":"strategylab"}[[/HANDOFF]]');
    const { container, history } = renderLanding("/");
    const panel = openPeggy(container);

    const action = await sendMessageAndWaitForAction(panel, "Open Strategy Lab");
    const before = history.length;
    fireEvent.click(action);

    expect(history.length, "strategylab handoff produced no navigation").toBeGreaterThan(before);
    const target = history[history.length - 1];
    expect(target).toBe(ROUTE_TO_URL.strategylab);
    expectValidNavTarget(target, "Peggy strategylab handoff");
  });

  it('review handoff → "Start my Review" routes to a real surface', async () => {
    mockPeggyChat(
      'I will hand this to a person. [[HANDOFF]]{"action":"review","role":"seller","area":"east-bay","situation":"probate"}[[/HANDOFF]]',
    );
    const { container, history } = renderLanding("/");
    const panel = openPeggy(container);

    const action = await sendMessageAndWaitForAction(panel, "Start my Review");
    const before = history.length;
    fireEvent.click(action);

    expect(history.length, "review handoff produced no navigation").toBeGreaterThan(before);
    const target = history[history.length - 1];
    expect(target).toBe(ROUTE_TO_URL.contact);
    expectValidNavTarget(target, "Peggy review handoff");
  });

  it("chat-error fallback offers Review + Strategy Lab that both route to real surfaces", async () => {
    // When the chat endpoint fails, Peggy shows recovery CTAs ("Start a Review"
    // / "Open Strategy Lab"). They use the same wiring and must stay real.
    const fetchMock = vi.fn(async () => {
      throw new Error("network down");
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container, history } = renderLanding("/");
    const panel = openPeggy(container);

    const input = panel.querySelector<HTMLInputElement>(
      'input[aria-label="Ask PeggyAI"]',
    );
    fireEvent.change(input!, { target: { value: "help" } });
    fireEvent.click(panel.querySelector<HTMLButtonElement>('button[aria-label="Send"]')!);

    const review = await waitFor(() => {
      const btn = within(panel)
        .getAllByRole("button")
        .find((b) => (b.textContent || "").trim().startsWith("Start a Review")) as
        | HTMLButtonElement
        | undefined;
      expect(btn, "error fallback did not offer a Review CTA").toBeTruthy();
      return btn!;
    });

    let before = history.length;
    fireEvent.click(review);
    expect(history.length).toBeGreaterThan(before);
    expect(history[history.length - 1]).toBe(ROUTE_TO_URL.contact);
    expectValidNavTarget(history[history.length - 1], "Peggy error Review CTA");
  });
});
