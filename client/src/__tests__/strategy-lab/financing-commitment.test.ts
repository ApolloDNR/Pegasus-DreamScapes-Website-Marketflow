import { describe, it, expect } from "vitest";
import { runStrategyLab, type PropertyInput } from "@shared/strategy-lab";

const baseProperty = (overrides: Partial<PropertyInput> = {}): PropertyInput => ({
  address: "123 Test St",
  city: "Sacramento",
  state: "CA",
  beds: 3,
  baths: 2,
  sqft: 1450,
  yearBuilt: 1972,
  condition: "moderate",
  occupancyStatus: "vacant",
  askingPrice: 285000,
  rehabBudget: 62000,
  arvEstimate: 475000,
  marketRent: 1950,
  ...overrides,
});

describe("Strategy Lab — financingCommitted materially affects output", () => {
  it("uncommitted financing keeps capital-partner / JV lanes scored higher than committed", () => {
    const uncommitted = runStrategyLab(baseProperty({ financingCommitted: false }));
    const committed = runStrategyLab(baseProperty({ financingCommitted: true }));

    const jvUncommitted = uncommitted.lanes.find((l) => l.lane === "jv");
    const jvCommitted = committed.lanes.find((l) => l.lane === "jv");

    // JV is the lane most directly gated by whether the operator already
    // has capital committed. When financing is uncommitted the JV lane's
    // score should not be lower than when it is committed; in practice
    // it should be strictly higher. This guards against the regression
    // where every financingType forced committed=true.
    expect(jvUncommitted?.confidence.score ?? 0).toBeGreaterThan(
      jvCommitted?.confidence.score ?? 0,
    );
  });

  it("undefined financingCommitted is treated differently from explicit true", () => {
    const undef = runStrategyLab(baseProperty({ financingCommitted: undefined }));
    const yes = runStrategyLab(baseProperty({ financingCommitted: true }));
    // Risk register or memo should differ when commitment status is unknown
    // vs explicitly committed — at the very least the snapshots should not
    // be byte-identical (excluding generatedAt).
    const stripTime = (s: ReturnType<typeof runStrategyLab>) => ({
      ...s,
      generatedAt: "FIXED",
    });
    expect(JSON.stringify(stripTime(undef))).not.toEqual(
      JSON.stringify(stripTime(yes)),
    );
  });
});
