/**
 * Guards the 3-free-runs / gate-on-#4 policy in strategy-lab-session.ts.
 * The bug we're regressing on: gating fired one run too early.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FREE_RUN_LIMIT,
  bumpLabRunCount,
  clearLabRunCount,
  freeRunsRemaining,
  getLabRunCount,
  getOrCreateLabSessionId,
} from "../../lib/strategy-lab-session";

describe("Strategy Lab — anonymous run-limit policy", () => {
  beforeEach(() => {
    try { window.localStorage.clear(); } catch { /* ignore */ }
    try { window.sessionStorage.clear(); } catch { /* ignore */ }
    document.cookie = "pegasus.lab.runCount=; Max-Age=0; Path=/";
    document.cookie = "pegasus.lab.sessionId=; Max-Age=0; Path=/";
    clearLabRunCount();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it("keeps the run limit in sessionStorage without persistent cookie or fingerprint slots", () => {
    window.localStorage.setItem("pegasus.lab.fp.legacy", "3");
    document.cookie = "pegasus.lab.runCount=3; Path=/; SameSite=Lax";

    expect(getLabRunCount()).toBe(0);
    bumpLabRunCount();

    expect(window.sessionStorage.getItem("pegasus.lab.runCount")).toBe("1");
    expect(window.localStorage.getItem("pegasus.lab.runCount")).toBeNull();
    expect(Object.keys(window.localStorage)).not.toContain("pegasus.lab.fp.legacy");
    expect(document.cookie).not.toContain("pegasus.lab.runCount=");
  });

  it("does not inspect browser fingerprint signals when counting runs", () => {
    const forbidden = () => {
      throw new Error("browser fingerprint input accessed");
    };
    vi.spyOn(window.navigator, "userAgent", "get").mockImplementation(forbidden);
    vi.spyOn(window.navigator, "language", "get").mockImplementation(forbidden);
    vi.spyOn(window.screen, "width", "get").mockImplementation(forbidden);
    vi.spyOn(window.screen, "height", "get").mockImplementation(forbidden);
    vi.spyOn(Date.prototype, "getTimezoneOffset").mockImplementation(forbidden);

    expect(() => bumpLabRunCount()).not.toThrow();
    expect(getLabRunCount()).toBe(1);
  });

  it("keeps a random anonymous session id in localStorage without a fallback cookie", () => {
    const id = getOrCreateLabSessionId();

    expect(id).toBeTruthy();
    expect(window.localStorage.getItem("pegasus.lab.sessionId")).toBe(id);
    expect(document.cookie).not.toContain("pegasus.lab.sessionId=");
  });
});
