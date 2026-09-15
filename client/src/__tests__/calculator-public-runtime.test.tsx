import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalculatorToolsPanel } from "@/components/strategy-lab/calculator-tools-panel";

class NoopResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = NoopResizeObserver;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("public Strategy Lab calculator runtime", () => {
  it("runs a real worksheet without authenticated or Peggy providers", async () => {
    render(
      <CalculatorToolsPanel
        activeTab="arv"
        setActiveTab={vi.fn()}
        publicMode
      />,
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.queryByText(/My Analyses/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("input-arv-purchase"), {
      target: { value: "250000" },
    });

    const publicBoundaries = await screen.findAllByTestId("calculator-public-boundary");
    expect(publicBoundaries.length).toBeGreaterThan(0);
    expect(publicBoundaries[0]).toHaveTextContent("stays in your browser");
    expect(screen.queryByTestId("button-save-analysis")).not.toBeInTheDocument();
    expect(screen.queryByTestId("button-share-analysis")).not.toBeInTheDocument();
  });

  it.each([
    ["brrrr" as const, "input-brrrr-purchase"],
    ["cashflow" as const, "input-cf-rent"],
  ])("runs the %s scenario analysis without mounting private save providers", async (activeTab, inputTestId) => {
    render(
      <CalculatorToolsPanel
        activeTab={activeTab}
        setActiveTab={vi.fn()}
        publicMode
      />,
    );

    fireEvent.change(screen.getByTestId(inputTestId), {
      target: { value: "250000" },
    });

    expect(await screen.findByTestId("card-scenario-compare")).toBeInTheDocument();
    expect(screen.queryByTestId("button-save-scenarios")).not.toBeInTheDocument();
  });
});
