/**
 * Strategy Lab — Console input-confidence indicator guard (Task #176).
 *
 * The Property Console shows an "Input confidence" badge that reflects how
 * complete the visitor's inputs are (not how good the deal is). It moves
 * Low -> Medium -> High as more property fields are filled. This test drives
 * the real component through those thresholds.
 */
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { StrategyConsole, useStrategyModel } from "@/pegasus/forms";

function ConsoleHarness() {
  const model = useStrategyModel();
  return <StrategyConsole go={vi.fn()} model={model} />;
}

function confidenceText() {
  return within(screen.getByTestId("text-console-confidence")).getByText(
    /^(Low|Medium|High)$/,
  ).textContent;
}

describe("StrategyConsole — input-confidence indicator", () => {
  afterEach(() => cleanup());

  it("starts at Low with no property fields filled", () => {
    render(<ConsoleHarness />);
    expect(confidenceText()).toBe("Low");
  });

  it("moves to Medium once three fields are filled", () => {
    render(<ConsoleHarness />);
    fireEvent.change(screen.getByTestId("input-console-address"), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByTestId("input-console-zip"), {
      target: { value: "94521" },
    });
    fireEvent.change(screen.getByTestId("input-console-beds"), {
      target: { value: "3" },
    });
    expect(confidenceText()).toBe("Medium");
  });

  it("reaches High once six fields are filled", () => {
    render(<ConsoleHarness />);
    for (const [testid, value] of [
      ["input-console-address", "123 Main St"],
      ["input-console-zip", "94521"],
      ["input-console-beds", "3"],
      ["input-console-baths", "2"],
      ["input-console-sqft", "1600"],
      ["input-console-rent", "3200"],
    ] as const) {
      fireEvent.change(screen.getByTestId(testid), { target: { value } });
    }
    expect(confidenceText()).toBe("High");
  });
});
