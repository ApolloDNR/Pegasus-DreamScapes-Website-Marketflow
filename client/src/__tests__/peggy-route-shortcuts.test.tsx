/**
 * Peggy — persistent route shortcuts guard (Task #176).
 *
 * The PeggyAI concierge surfaces an "Or go straight to" strip of route
 * shortcuts that are always present (regardless of conversation state):
 * Strategy Lab / Submit a Property / Work With Apollo / MarketFlow.
 * Each shortcut must fire its handler and close the panel.
 */
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Peggy } from "@/pegasus/peggy";

function renderPeggy() {
  const setOpen = vi.fn();
  const toStrategyLab = vi.fn();
  const onHandoffToReview = vi.fn();
  const go = vi.fn();
  const toSubmit = vi.fn();
  render(
    <Peggy
      open={true}
      setOpen={setOpen}
      toStrategyLab={toStrategyLab}
      onHandoffToReview={onHandoffToReview}
      go={go}
      toSubmit={toSubmit}
    />,
  );
  return { setOpen, toStrategyLab, onHandoffToReview, go, toSubmit };
}

describe("Peggy — persistent route shortcuts", () => {
  afterEach(() => cleanup());

  it("renders all four route shortcuts", () => {
    renderPeggy();
    expect(screen.getByTestId("peggy-route-strategylab")).toHaveTextContent(
      "Strategy Lab",
    );
    expect(screen.getByTestId("peggy-route-submit")).toHaveTextContent(
      "Submit a Property",
    );
    expect(screen.getByTestId("peggy-route-apollo")).toHaveTextContent(
      "Work With Apollo",
    );
    expect(screen.getByTestId("peggy-route-marketflow")).toHaveTextContent(
      "MarketFlow",
    );
  });

  it("Strategy Lab shortcut routes to the lab and closes the panel", () => {
    const { toStrategyLab, setOpen } = renderPeggy();
    fireEvent.click(screen.getByTestId("peggy-route-strategylab"));
    expect(toStrategyLab).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("Submit a Property shortcut invokes the submit handoff and closes the panel", () => {
    const { toSubmit, setOpen } = renderPeggy();
    fireEvent.click(screen.getByTestId("peggy-route-submit"));
    expect(toSubmit).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("Work With Apollo shortcut navigates to the apollo lane and closes the panel", () => {
    const { go, setOpen } = renderPeggy();
    fireEvent.click(screen.getByTestId("peggy-route-apollo"));
    expect(go).toHaveBeenCalledWith("apollo");
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("MarketFlow shortcut navigates to the marketflow lane and closes the panel", () => {
    const { go, setOpen } = renderPeggy();
    fireEvent.click(screen.getByTestId("peggy-route-marketflow"));
    expect(go).toHaveBeenCalledWith("marketflow");
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
