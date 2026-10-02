import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  STRATEGY_LAB_HANDOFF_SESSION_KEY,
  clearStrategyLabHandoff,
  formatStrategyLabHandoffSummary,
  readStrategyLabHandoff,
  writeStrategyLabHandoff,
} from "@/pegasus/strategy-lab-handoff";

const NOW = new Date("2026-07-23T18:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  window.sessionStorage.clear();
});

afterEach(() => {
  clearStrategyLabHandoff();
  vi.useRealTimers();
});

describe("Strategy Lab intake handoff", () => {
  it("preserves bounded scenario assumptions and an explicitly reported zero scope", () => {
    writeStrategyLabHandoff({ address: "New model", askingPrice: 600000, rehabBudget: 0, scopeReported: true, scenario: "conservative", modelAssumptions: "75% acquisition LTV; 8.5% interest; 30 years; 3% closing reserve", illustrative: true });
    const brief = readStrategyLabHandoff()!;
    expect(brief).toMatchObject({ scenario: "conservative", rehabBudget: 0, scopeReported: true, illustrative: true });
    const summary = formatStrategyLabHandoffSummary(brief);
    expect(summary).toContain("Scenario: Conservative");
    expect(summary).toContain("Scope: $0");
    expect(summary).toContain("8.5% interest");
    expect(summary).toContain("Synthetic example");
    window.sessionStorage.setItem(STRATEGY_LAB_HANDOFF_SESSION_KEY, JSON.stringify({ ...brief, scenario: "guaranteed", modelAssumptions: "x".repeat(1000) }));
    expect(readStrategyLabHandoff()?.scenario).toBeUndefined();
    expect(readStrategyLabHandoff()?.modelAssumptions?.length).toBeLessThanOrEqual(240);
  });
  it("stores only a bounded, versioned Strategy Lab brief", () => {
    expect(writeStrategyLabHandoff({
      address: "  19 Bay View Ave\nWalnut Creek, CA  ",
      propertyType: "Single-family residence",
      occupancy: "Vacant",
      condition: "Moderate repairs",
      situation: "Inherited or estate property",
      askingPrice: 600_000,
      rehabBudget: 105_000,
      arvEstimate: 840_000,
      marketRent: -1,
      topLaneLabel: `Value-add execution${"x".repeat(300)}`,
      topLaneVerdict: "Needs disciplined terms",
      primaryMetric: "$44,475 modeled spread",
      memoNextStep: "Confirm title, scope, and market support.",
      engineVersion: "premium-desk-v1",
      generatedAt: NOW.toISOString(),
    })).toBe(true);

    expect(readStrategyLabHandoff()).toEqual({
      schemaVersion: 1,
      storedAt: NOW.toISOString(),
      generatedAt: NOW.toISOString(),
      address: "19 Bay View Ave Walnut Creek, CA",
      propertyType: "Single-family residence",
      occupancy: "Vacant",
      condition: "Moderate repairs",
      situation: "Inherited or estate property",
      askingPrice: 600_000,
      rehabBudget: 105_000,
      arvEstimate: 840_000,
      topLaneLabel: expect.stringMatching(/^Value-add executionx+$/),
      topLaneVerdict: "Needs disciplined terms",
      primaryMetric: "$44,475 modeled spread",
      memoNextStep: "Confirm title, scope, and market support.",
      engineVersion: "premium-desk-v1",
    });
    expect(readStrategyLabHandoff()?.topLaneLabel.length).toBeLessThanOrEqual(160);
  });

  it("rejects stale, malformed, and unsupported stored data", () => {
    window.sessionStorage.setItem(STRATEGY_LAB_HANDOFF_SESSION_KEY, JSON.stringify({
      schemaVersion: 999,
      storedAt: NOW.toISOString(),
      address: "Should not be trusted",
    }));
    expect(readStrategyLabHandoff()).toBeNull();
    expect(window.sessionStorage.getItem(STRATEGY_LAB_HANDOFF_SESSION_KEY)).toBeNull();

    window.sessionStorage.setItem(STRATEGY_LAB_HANDOFF_SESSION_KEY, "{not-json");
    expect(readStrategyLabHandoff()).toBeNull();

    window.sessionStorage.setItem(STRATEGY_LAB_HANDOFF_SESSION_KEY, JSON.stringify({
      schemaVersion: 1,
      storedAt: "2026-07-23T12:00:00.000Z",
      address: "Expired brief",
    }));
    expect(readStrategyLabHandoff()).toBeNull();
  });

  it("formats a concise summary that stays explicitly directional", () => {
    writeStrategyLabHandoff({
      address: "19 Bay View Ave",
      propertyType: "Single-family residence",
      occupancy: "Vacant",
      askingPrice: 600_000,
      rehabBudget: 105_000,
      arvEstimate: 840_000,
      topLaneLabel: "Value-add execution",
      topLaneVerdict: "Needs disciplined terms",
      primaryMetric: "$44,475 modeled spread",
      memoNextStep: "Verify title and market support.",
      engineVersion: "premium-desk-v1",
    });

    const brief = readStrategyLabHandoff();
    expect(brief).not.toBeNull();
    const summary = formatStrategyLabHandoffSummary(brief!);

    expect(summary).toContain(
      "Directional Strategy Lab brief (visitor-entered; automated and unverified):",
    );
    expect(summary).toContain("Asking price / basis: $600,000");
    expect(summary).toContain("Scope: $105,000");
    expect(summary).toContain("Projected exit value: $840,000");
    expect(summary).toContain(
      "Modeled path: Value-add execution — Needs disciplined terms",
    );
    expect(summary).toContain("Engine: premium-desk-v1");
    expect(summary.length).toBeLessThanOrEqual(1_200);
  });

  it("does not turn empty numeric Lab fields into asserted zero-dollar facts", () => {
    writeStrategyLabHandoff({
      address: "Walnut Creek, CA",
      askingPrice: 0,
      rehabBudget: 0,
      arvEstimate: 0,
      marketRent: 0,
    });

    const brief = readStrategyLabHandoff();
    expect(brief).toEqual(expect.objectContaining({
      address: "Walnut Creek, CA",
    }));
    expect(brief).not.toEqual(expect.objectContaining({
      askingPrice: expect.any(Number),
    }));
    expect(formatStrategyLabHandoffSummary(brief!)).not.toContain("$0");
  });
});
