/**
 * Strategy Lab — Account Wall behavioral guard (Task #100).
 *
 * Locks in the fix for the regression where the wall re-popped on every
 * keystroke. Targets `useAccountWall` (extracted from strategy-lab.tsx)
 * and simulates the run-limit useEffect path that lives on the page.
 *
 * Covers:
 *   1. The 4th anonymous "run" opens the wall once.
 *   2. After dismissing, additional input does not re-open the wall.
 *   3. Save/Share/PDF (ensureAuth) still gates: opens the wall on the
 *      first call, then surfaces a toast on subsequent calls instead of
 *      modal-blocking the user twice.
 *   4. Signing in clears the sessionStorage dismissed flag.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAccountWall } from "../../hooks/use-account-wall";
import {
  FREE_RUN_LIMIT,
  bumpLabRunCount,
  clearLabRunCount,
  freeRunsRemaining,
} from "../../lib/strategy-lab-session";

const DISMISSED_KEY = "pegasus.lab.wallDismissed";

function clearSession() {
  try { window.sessionStorage.clear(); } catch { /* ignore */ }
  try { window.localStorage.clear(); } catch { /* ignore */ }
  document.cookie = "pegasus.lab.runCount=; Max-Age=0; Path=/";
  clearLabRunCount();
}

/**
 * Mirrors the run-limit branch in strategy-lab.tsx so the test exercises
 * the same gating logic that the page useEffect runs after a debounce.
 * Anonymous user + zero runs remaining → openAccountWall, no counter bump.
 */
function simulateRunAttempt(
  isAuthenticated: boolean,
  open: (reason: string) => void,
) {
  if (!isAuthenticated && freeRunsRemaining() === 0) {
    open("keep running new properties");
    return;
  }
  bumpLabRunCount();
}

describe("useAccountWall — Strategy Lab account-wall behavior", () => {
  beforeEach(() => {
    clearSession();
  });

  it("4th anonymous run attempt opens the wall once", () => {
    const toast = vi.fn();
    const { result } = renderHook(() =>
      useAccountWall({ isAuthenticated: false, toast }),
    );

    // Burn through the 3 free runs.
    for (let i = 0; i < FREE_RUN_LIMIT; i++) {
      act(() => {
        simulateRunAttempt(false, result.current.openAccountWall);
      });
    }
    expect(result.current.accountWallOpen).toBe(false);
    expect(freeRunsRemaining()).toBe(0);

    // 4th attempt opens the wall.
    act(() => {
      simulateRunAttempt(false, result.current.openAccountWall);
    });
    expect(result.current.accountWallOpen).toBe(true);
    expect(result.current.accountWallReason).toBe("keep running new properties");

    // 4th attempt also did not consume a free run.
    expect(freeRunsRemaining()).toBe(0);
  });

  it("does NOT re-open the wall on further input after the user dismisses it", () => {
    const toast = vi.fn();
    const { result } = renderHook(() =>
      useAccountWall({ isAuthenticated: false, toast }),
    );

    // Drive into the gated state and open the wall.
    for (let i = 0; i < FREE_RUN_LIMIT; i++) {
      act(() => { simulateRunAttempt(false, result.current.openAccountWall); });
    }
    act(() => { simulateRunAttempt(false, result.current.openAccountWall); });
    expect(result.current.accountWallOpen).toBe(true);

    // User dismisses (Radix calls onOpenChange(false)).
    act(() => { result.current.handleWallOpenChange(false); });
    expect(result.current.accountWallOpen).toBe(false);
    expect(window.sessionStorage.getItem(DISMISSED_KEY)).toBe("1");

    // Simulate many further keystrokes -> the run-limit branch fires
    // again and again. The wall must stay closed.
    for (let i = 0; i < 25; i++) {
      act(() => { simulateRunAttempt(false, result.current.openAccountWall); });
    }
    expect(result.current.accountWallOpen).toBe(false);

    // Even a direct openAccountWall call (non-forced) is suppressed.
    act(() => { result.current.openAccountWall("anything"); });
    expect(result.current.accountWallOpen).toBe(false);

    // But a forced open (reserved for the page if it ever needs it)
    // still works.
    act(() => { result.current.openAccountWall("forced", { force: true }); });
    expect(result.current.accountWallOpen).toBe(true);
  });

  it("Save/Share/PDF (ensureAuth) opens the wall once, then toast-only after dismissal (Task #101)", () => {
    const toast = vi.fn();
    const { result } = renderHook(() =>
      useAccountWall({ isAuthenticated: false, toast }),
    );

    // First gated action opens the wall and returns false.
    let returned = true;
    act(() => {
      returned = result.current.ensureAuth("save this snapshot to your library");
    });
    expect(returned).toBe(false);
    expect(result.current.accountWallOpen).toBe(true);
    expect(result.current.accountWallReason).toBe(
      "save this snapshot to your library",
    );

    // User dismisses the wall.
    act(() => { result.current.handleWallOpenChange(false); });
    expect(result.current.accountWallOpen).toBe(false);
    expect(result.current.wallDismissedRef.current).toBe(true);

    // After-dismiss: the run-limit auto-pop is suppressed (regression
    // fix) — verify that explicitly here.
    act(() => { result.current.openAccountWall("auto run-limit re-pop"); });
    expect(result.current.accountWallOpen).toBe(false);

    // Task #101: subsequent explicit Share / PDF / Submit clicks must
    // NOT re-pop the modal. The toast carries the sign-in message.
    act(() => {
      returned = result.current.ensureAuth("create a shareable link");
    });
    expect(returned).toBe(false);
    expect(result.current.accountWallOpen).toBe(false);

    act(() => {
      returned = result.current.ensureAuth("export the full Snapshot PDF");
    });
    expect(returned).toBe(false);
    expect(result.current.accountWallOpen).toBe(false);

    // ensureAuth fires a parallel sign-in toast on every gated call
    // (the user always gets the message, just not the modal twice).
    expect(toast).toHaveBeenCalledTimes(3);
    expect(toast.mock.calls[0][0].title).toBe("Sign in to continue");
    expect(toast.mock.calls[1][0].description).toContain(
      "create a shareable link",
    );
    expect(toast.mock.calls[2][0].description).toContain(
      "export the full Snapshot PDF",
    );
  });

  it("ensureAuth returns true (and does nothing) when the user is authenticated", () => {
    const toast = vi.fn();
    const { result } = renderHook(() =>
      useAccountWall({ isAuthenticated: true, toast }),
    );
    let returned = false;
    act(() => {
      returned = result.current.ensureAuth("save this snapshot to your library");
    });
    expect(returned).toBe(true);
    expect(result.current.accountWallOpen).toBe(false);
    expect(toast).not.toHaveBeenCalled();
  });

  it("signing in clears the sessionStorage dismissed flag", () => {
    const toast = vi.fn();
    // Seed: user previously dismissed the wall this session.
    window.sessionStorage.setItem(DISMISSED_KEY, "1");

    const { result, rerender } = renderHook(
      ({ isAuthenticated }: { isAuthenticated: boolean }) =>
        useAccountWall({ isAuthenticated, toast }),
      { initialProps: { isAuthenticated: false } },
    );

    // Pre-auth: dismissed flag is honored by the hook.
    expect(result.current.wallDismissedRef.current).toBe(true);

    // User signs in.
    rerender({ isAuthenticated: true });

    expect(window.sessionStorage.getItem(DISMISSED_KEY)).toBeNull();
    expect(result.current.wallDismissedRef.current).toBe(false);

    // ensureAuth now passes through.
    let returned = false;
    act(() => {
      returned = result.current.ensureAuth("save this snapshot to your library");
    });
    expect(returned).toBe(true);
  });
});
