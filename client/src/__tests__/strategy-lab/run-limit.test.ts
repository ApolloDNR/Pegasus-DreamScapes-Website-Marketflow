/**
 * Guards the 3-free-runs / gate-on-#4 policy in strategy-lab-session.ts.
 * The bug we're regressing on: gating fired one run too early.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  FREE_RUN_LIMIT,
  bumpLabRunCount,
  clearLabRunCount,
  freeRunsRemaining,
  getLabRunCount,
} from "../../lib/strategy-lab-session";

describe("Strategy Lab — anonymous run-limit policy", () => {
  beforeEach(() => {
    try { window.localStorage.clear(); } catch { /* ignore */ }
    document.cookie = "pegasus.lab.runCount=; Max-Age=0; Path=/";
    clearLabRunCount();
  });

  it("starts with FREE_RUN_LIMIT (3) free runs remaining", () => {
    expect(FREE_RUN_LIMIT).toBe(3);
    expect(freeRunsRemaining()).toBe(3);
  });

  it("counts run #1, #2, #3 and only goes to 0 after the 3rd", () => {
    bumpLabRunCount();
    expect(getLabRunCount()).toBe(1);
    expect(freeRunsRemaining()).toBe(2);

    bumpLabRunCount();
    expect(getLabRunCount()).toBe(2);
    expect(freeRunsRemaining()).toBe(1);

    bumpLabRunCount();
    expect(getLabRunCount()).toBe(3);
    expect(freeRunsRemaining()).toBe(0);
  });

  it("persists the run count via cookie even when localStorage is wiped (anti-reset)", () => {
    bumpLabRunCount();
    bumpLabRunCount();
    expect(getLabRunCount()).toBe(2);
    window.localStorage.clear();
    expect(getLabRunCount()).toBeGreaterThanOrEqual(2);
  });
});
