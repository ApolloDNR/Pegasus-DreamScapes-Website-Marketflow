/**
 * Strategy Lab — useStrategyModel underwriting math.
 *
 * Guards the headline "read" (Strong / Workable / Tight / Underwater) and the
 * spread/margin/lane snapshot that the Instant Strategy Preview shows visitors.
 * A future edit to the carry/exit/margin formulas would otherwise silently
 * change what the public sees with no test to catch it.
 */

import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStrategyModel, type StrategyModel } from "../../pegasus/forms";

type Inputs = {
  acq: number;
  rehab: number;
  arv: number;
  holdMonths: number;
  carryRate: number;
  exitRate: number;
};

function setInputs(result: { current: StrategyModel }, vals: Inputs) {
  act(() => {
    result.current.setAcq(vals.acq);
    result.current.setRehab(vals.rehab);
    result.current.setArv(vals.arv);
    result.current.setHoldMonths(vals.holdMonths);
    result.current.setCarryRate(vals.carryRate);
    result.current.setExitRate(vals.exitRate);
  });
}

// With carry + exit rates at 0, margin collapses to (arv - hardCost) / hardCost.
// hardCost is pinned at 100,000 so each arv maps to an exact margin percentage,
// letting us land precisely on the 15 / 8 / 0 tier boundaries.
function inputsForArv(arv: number): Inputs {
  return { acq: 100_000, rehab: 0, arv, holdMonths: 6, carryRate: 0, exitRate: 0 };
}

describe("useStrategyModel — read tier thresholds", () => {
  it("reads Strong at exactly 15% margin", () => {
    const { result } = renderHook(() => useStrategyModel());
    setInputs(result, inputsForArv(115_000)); // margin = 15
    expect(result.current.margin).toBeCloseTo(15, 6);
    expect(result.current.read.tier).toBe("strong");
  });

  it("drops from Strong to Workable just below 15% margin", () => {
    const { result } = renderHook(() => useStrategyModel());
    setInputs(result, inputsForArv(114_900)); // margin = 14.9
    expect(result.current.margin).toBeLessThan(15);
    expect(result.current.read.tier).toBe("workable");
  });

  it("reads Workable at exactly 8% margin", () => {
    const { result } = renderHook(() => useStrategyModel());
    setInputs(result, inputsForArv(108_000)); // margin = 8
    expect(result.current.margin).toBeCloseTo(8, 6);
    expect(result.current.read.tier).toBe("workable");
  });

  it("drops from Workable to Tight just below 8% margin", () => {
    const { result } = renderHook(() => useStrategyModel());
    setInputs(result, inputsForArv(107_900)); // margin = 7.9
    expect(result.current.margin).toBeLessThan(8);
    expect(result.current.read.tier).toBe("tight");
  });

  it("reads Tight at exactly 0% margin", () => {
    const { result } = renderHook(() => useStrategyModel());
    setInputs(result, inputsForArv(100_000)); // margin = 0
    expect(result.current.margin).toBeCloseTo(0, 6);
    expect(result.current.read.tier).toBe("tight");
  });

  it("drops from Tight to Underwater below 0% margin", () => {
    const { result } = renderHook(() => useStrategyModel());
    setInputs(result, inputsForArv(99_000)); // margin = -1
    expect(result.current.margin).toBeLessThan(0);
    expect(result.current.read.tier).toBe("under");
  });

  it("each tier carries its own lane label", () => {
    const { result } = renderHook(() => useStrategyModel());

    setInputs(result, inputsForArv(115_000));
    expect(result.current.read.lane).toBe("Investments / Value-add");

    setInputs(result, inputsForArv(108_000));
    expect(result.current.read.lane).toBe("Strategy Review");

    setInputs(result, inputsForArv(100_000));
    expect(result.current.read.lane).toBe("Strategy Review");

    setInputs(result, inputsForArv(99_000));
    expect(result.current.read.lane).toBe("Re-examine basis");
  });
});

describe("useStrategyModel — snapshot parity with UI values", () => {
  it("snapshot mirrors the live spread / margin / lane the UI renders", () => {
    const { result } = renderHook(() => useStrategyModel());
    // Realistic inputs with non-zero carry + exit so the full formula runs.
    setInputs(result, {
      acq: 600_000,
      rehab: 95_000,
      arv: 840_000,
      holdMonths: 6,
      carryRate: 9,
      exitRate: 7,
    });

    const m = result.current;
    const snap = m.snapshot;

    expect(snap.spread).toBe(m.spread);
    expect(snap.margin).toBe(m.margin);
    expect(snap.lane).toBe(m.read.lane);
    expect(snap.acquisition).toBe(m.acq);
    expect(snap.rehab).toBe(m.rehab);
    expect(snap.arv).toBe(m.arv);
    expect(snap.allIn).toBe(m.hardCost);
    expect(snap.holdMonths).toBe(m.holdMonths);
    expect(snap.carry).toBe(m.carry);
    expect(snap.exitCosts).toBe(m.exitCosts);
    expect(snap.netProceeds).toBe(m.netProceeds);
    expect(snap.cashOnCost).toBe(m.cashOnCost);
  });

  it("derives spread and margin from the carry/exit waterfall", () => {
    const { result } = renderHook(() => useStrategyModel());
    setInputs(result, {
      acq: 600_000,
      rehab: 95_000,
      arv: 840_000,
      holdMonths: 6,
      carryRate: 9,
      exitRate: 7,
    });
    const m = result.current;

    const hardCost = 600_000 + 95_000;
    const carry = hardCost * (9 / 100) * (6 / 12);
    const exitCosts = 840_000 * (7 / 100);
    const netProceeds = 840_000 - exitCosts;
    const totalCost = hardCost + carry + exitCosts;
    const spread = netProceeds - hardCost - carry;

    expect(m.hardCost).toBeCloseTo(hardCost, 6);
    expect(m.carry).toBeCloseTo(carry, 6);
    expect(m.exitCosts).toBeCloseTo(exitCosts, 6);
    expect(m.netProceeds).toBeCloseTo(netProceeds, 6);
    expect(m.spread).toBeCloseTo(spread, 6);
    expect(m.margin).toBeCloseTo((spread / totalCost) * 100, 6);
  });
});
