/**
 * Strategy Lab — Account Wall PAGE integration test (Task #100).
 *
 * Mounts the real <StrategyLabPage /> in jsdom with the contexts the
 * page consumes (Supabase auth, Peggy, wouter, TanStack Query, toast)
 * stubbed at the module boundary via `vi.mock`. Drives the run-limit
 * useEffect end-to-end via fake timers and exercises the actual DOM
 * dialog rendered by Radix — this is the integration coverage the
 * hook-only spec cannot provide.
 *
 * The regression we're guarding: after the user dismissed the
 * Account Wall once, every subsequent keystroke re-popped the modal.
 * This test mounts the page, runs through 3 anonymous "runs",
 * confirms the 4th run opens the wall, dismisses it, makes ~12 more
 * input changes, and asserts the wall stays closed. It then clicks
 * Save / Share / Export PDF and asserts ensureAuth fires a sign-in
 * toast each time WITHOUT re-opening the modal (Task #101 contract).
 */
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  act,
  fireEvent,
} from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Module mocks — must be declared before importing the page under test.
// ---------------------------------------------------------------------------

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    profile: null,
    isAdmin: false,
  }),
}));

vi.mock("@/contexts/peggy-context", () => ({
  usePeggyContext: () => ({
    context: {},
    updateContext: vi.fn(),
    setPendingPrompt: vi.fn(),
    openChat: vi.fn(),
    closeChat: vi.fn(),
    isOpen: false,
  }),
}));

const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy, dismiss: vi.fn(), toasts: [] }),
  toast: toastSpy,
}));

vi.mock("@/hooks/use-seo", () => ({
  useSEO: () => undefined,
}));

// apiRequest is only hit by Save/Share/PDF/Submit; those mutations are
// gated by ensureAuth (returns false for anonymous) so the request is
// never sent. Stub anyway as defensive.
vi.mock("@/lib/queryClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queryClient")>(
    "@/lib/queryClient",
  );
  return {
    ...actual,
    apiRequest: vi.fn(async () => new Response("{}", { status: 200 })),
  };
});

// ---------------------------------------------------------------------------
// Helpers.
// ---------------------------------------------------------------------------

// jsdom does not implement Element.prototype.scrollIntoView; the page's
// mode=full effect calls it on mount.
if (!Element.prototype.scrollIntoView) {
  (Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView =
    function () {};
}

function clearAllStorage() {
  try { window.localStorage.clear(); } catch { /* ignore */ }
  try { window.sessionStorage.clear(); } catch { /* ignore */ }
  document.cookie.split(";").forEach((c) => {
    const eq = c.indexOf("=");
    const name = (eq > -1 ? c.slice(0, eq) : c).trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  });
}

function renderPage(PageComponent: React.ComponentType) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  // Mount in Full Path mode so the InstrumentWorkbench renders the
  // gated Save / Share / PDF / Submit buttons we need to click.
  window.history.replaceState({}, "", "/strategy-lab?mode=full");
  const { hook } = memoryLocation({ path: "/strategy-lab" });
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <Router hook={hook}>
          <PageComponent />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

/**
 * Type a value into the input element rendered for the `<NumInput />`
 * with the given data-testid, then advance fake timers past the 600ms
 * run-signature debounce so the run-limit useEffect commits.
 */
function setInput(testId: string, value: string) {
  const el = document.querySelector(
    `[data-testid="${testId}"]`,
  ) as HTMLInputElement | null;
  if (!el) throw new Error(`Input ${testId} not found`);
  act(() => {
    fireEvent.change(el, { target: { value } });
  });
}

// Advance past the 600ms run-signature debounce so the run-limit
// useEffect commits a single run for the most recent signature.
function flushRun() {
  act(() => {
    vi.advanceTimersByTime(700);
  });
}

function setInputAndDebounce(testId: string, value: string) {
  setInput(testId, value);
  flushRun();
}

function isWallOpen(): boolean {
  return Boolean(
    document.querySelector('[data-testid="btn-account-wall-dismiss"]'),
  );
}

// ---------------------------------------------------------------------------
// Tests.
// ---------------------------------------------------------------------------

describe("StrategyLabPage — account-wall integration", () => {
  let StrategyLabPage: React.ComponentType;

  beforeEach(async () => {
    clearAllStorage();
    toastSpy.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Lazy-import so the mocks above are in place first.
    const mod = await import("../../pages/strategy-lab");
    StrategyLabPage = mod.default;
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it(
    "4th anonymous run opens wall once; dismissal blocks keystroke re-pop; Save/Share/PDF toast-only after dismissal (Task #101)",
    async () => {
      renderPage(StrategyLabPage);

      // The Quick Read essentials are NumInputs with testids
      // input-asking-price / input-arv-estimate / input-rehab-budget /
      // input-market-rent / input-sqft / input-beds / input-baths.
      // Discover the real testids via the rendered DOM.
      const inputs = Array.from(
        document.querySelectorAll("input[data-testid]"),
      ).map((el) => el.getAttribute("data-testid") || "");
      const pricePick =
        inputs.find((t) => /asking|price/.test(t)) ||
        inputs.find((t) => /^num-/.test(t)) ||
        inputs[0];
      const arvPick =
        inputs.find((t) => /arv/.test(t)) || inputs[1] || pricePick;
      const rehabPick =
        inputs.find((t) => /rehab/.test(t)) || inputs[2] || pricePick;
      const rentPick =
        inputs.find((t) => /rent/.test(t)) || inputs[3] || pricePick;
      const sqftPick =
        inputs.find((t) => /^input-sqft$|^num-sqft$|sqft$/.test(t)) ||
        inputs[4] || pricePick;
      const bedsPick =
        inputs.find((t) => /beds/.test(t)) || inputs[5] || pricePick;
      const bathsPick =
        inputs.find((t) => /baths/.test(t)) || inputs[6] || pricePick;

      // Seed all essentials without debouncing between — the run-limit
      // useEffect only fires after the 600ms timer, so this entire
      // batch collapses into a single run signature.
      setInput(pricePick, "285000");
      setInput(arvPick, "475000");
      setInput(rehabPick, "62000");
      setInput(rentPick, "1950");
      setInput(sqftPick, "1450");
      setInput(bedsPick, "3");
      setInput(bathsPick, "2");
      flushRun(); // run #1

      // Bump price to consume runs #2 and #3.
      setInputAndDebounce(pricePick, "290000"); // run #2
      setInputAndDebounce(pricePick, "295000"); // run #3
      expect(isWallOpen()).toBe(false);

      // 4th distinct signature → wall opens.
      setInputAndDebounce(pricePick, "300000"); // run #4 → wall
      expect(isWallOpen()).toBe(true);

      // Dismiss via the actual dialog button.
      const dismissBtn = document.querySelector(
        '[data-testid="btn-account-wall-dismiss"]',
      ) as HTMLButtonElement;
      act(() => {
        fireEvent.click(dismissBtn);
      });
      // Radix dialog close animations — flush a couple of frames.
      act(() => { vi.advanceTimersByTime(200); });
      expect(isWallOpen()).toBe(false);
      expect(
        window.sessionStorage.getItem("pegasus.lab.wallDismissed"),
      ).toBe("1");

      // ~12 more keystroke changes — none should re-open the wall.
      for (let i = 0; i < 12; i++) {
        setInputAndDebounce(pricePick, String(305000 + i * 5000));
        expect(isWallOpen()).toBe(false);
      }

      // Now click Save / Share / PDF — each must fire a sign-in toast
      // WITHOUT re-popping the modal (Task #101 contract). The user
      // already dismissed the wall once this session; the toast carries
      // the message from here on.
      const actionTestIdRegex = /^(btn|mobile-btn)-(save|save-snapshot|share|share-snapshot|pdf|export-pdf)$/;
      const gated = Array.from(
        document.querySelectorAll("button[data-testid]"),
      ).filter((b) => actionTestIdRegex.test(b.getAttribute("data-testid") || ""));
      expect(gated.length).toBeGreaterThan(0);

      toastSpy.mockClear();
      for (const btn of gated) {
        act(() => { fireEvent.click(btn as HTMLButtonElement); });
        expect(isWallOpen()).toBe(false);
      }

      // The parallel sign-in toast fired on every gated click, even
      // though the modal stayed closed.
      expect(toastSpy.mock.calls.length).toBeGreaterThanOrEqual(gated.length);
      expect(toastSpy.mock.calls[0][0].title).toBe("Sign in to continue");
    },
    30_000,
  );
});
