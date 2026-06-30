/**
 * Compliance copy lock (Task #177).
 *
 * The Strategy Lab output disclaimer and the Peggy compliance footer note are
 * compliance-sensitive, contractual-grade copy. A small silent wording change
 * could create real legal exposure, so these string-snapshot tests assert the
 * EXACT text. If you intend to change this copy, update these assertions
 * deliberately (and confirm the new wording with legal).
 */
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  StrategyCalculator,
  useStrategyModel,
  type StrategyModel,
} from "@/pegasus/forms";
import { Peggy } from "@/pegasus/peggy";
import { PEGGY_COMPLIANCE } from "@/pegasus/data";

const STRATEGY_DISCLAIMER_PRIMARY =
  "Strategy Lab outputs are preliminary and directional. They are not legal, tax, lending, accounting, appraisal, engineering, securities, or construction advice. All outputs are subject to a written Pegasus read, market conditions, property condition, title, occupancy, and written agreements.";

const STRATEGY_DISCLAIMER_SECONDARY =
  "Carry is modeled as a flat annual rate on basis; it simplifies financing structure, draw timing, and contingencies, and excludes transfer taxes. Every real read is handled by Pegasus in writing.";

const PEGGY_COMPLIANCE_TEXT =
  "Peggy is an AI intake assistant. She does not approve deals, make offers, or provide legal, tax, lending, or investment advice.";

function CalculatorHarness() {
  const model: StrategyModel = useStrategyModel();
  return <StrategyCalculator go={vi.fn()} model={model} />;
}

describe("Strategy Lab disclaimer — exact copy lock", () => {
  afterEach(() => cleanup());

  it("renders the exact disclaimer text in StrategyCalculator", () => {
    render(<CalculatorHarness />);
    const block = screen.getByTestId("text-strategy-disclaimer");

    expect(block).toHaveTextContent(STRATEGY_DISCLAIMER_PRIMARY);
    expect(block).toHaveTextContent(STRATEGY_DISCLAIMER_SECONDARY);

    expect(
      screen.getByText(STRATEGY_DISCLAIMER_PRIMARY),
    ).toBeInTheDocument();
    expect(
      screen.getByText(STRATEGY_DISCLAIMER_SECONDARY),
    ).toBeInTheDocument();
  });
});

describe("Peggy compliance note — exact copy lock", () => {
  afterEach(() => cleanup());

  it("PEGGY_COMPLIANCE constant matches the exact contractual text", () => {
    expect(PEGGY_COMPLIANCE).toBe(PEGGY_COMPLIANCE_TEXT);
  });

  it("renders the exact compliance note in the Peggy footer", () => {
    render(
      <Peggy
        open={true}
        setOpen={vi.fn()}
        toStrategyLab={vi.fn()}
        onHandoffToReview={vi.fn()}
        go={vi.fn()}
        toSubmit={vi.fn()}
      />,
    );
    expect(screen.getByTestId("peggy-compliance")).toHaveTextContent(
      PEGGY_COMPLIANCE_TEXT,
    );
  });
});
