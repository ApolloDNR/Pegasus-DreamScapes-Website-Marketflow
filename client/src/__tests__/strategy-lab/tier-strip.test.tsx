/**
 * Strategy Lab — Tier strip render + routing guard (Task #176).
 *
 * Locks in the premium planning-depth upgrade:
 *   1. All three tiers (Instant Strategy Preview / Opportunity Intake /
 *      Deal Blueprint request) render.
 *   2. The Opportunity Intake CTA routes to the canonical intake.
 *   3. The Deal Blueprint request CTA preserves its Blueprint intent.
 *   4. The free "Instant Strategy Preview" tier has no CTA button.
 */
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { StrategyTierStrip } from "@/pegasus/forms";

function renderStrip(initialPath = "/strategy-lab") {
  const { hook, history } = memoryLocation({ path: initialPath, record: true });
  render(
    <Router hook={hook}>
      <StrategyTierStrip />
    </Router>,
  );
  return history;
}

describe("StrategyTierStrip — three-tier pricing strip", () => {
  beforeEach(() => {
    // StrategyTierStrip calls window.scrollTo on navigation.
    window.scrollTo = vi.fn();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders all three Strategy Lab tiers", () => {
    renderStrip();
    expect(screen.getByTestId("strategy-tier-strip")).toBeInTheDocument();
    expect(screen.getByTestId("tier-preview")).toBeInTheDocument();
    expect(screen.getByTestId("tier-snapshot")).toBeInTheDocument();
    expect(screen.getByTestId("tier-blueprint")).toBeInTheDocument();

    expect(screen.getByText("Instant Strategy Preview")).toBeInTheDocument();
    expect(screen.getByText("Opportunity Intake")).toBeInTheDocument();
    expect(screen.getByText("Deal Blueprint request")).toBeInTheDocument();
  });

  it("the free Instant Strategy Preview tier has no CTA button", () => {
    renderStrip();
    expect(screen.queryByTestId("button-tier-preview")).toBeNull();
  });

  it("the Opportunity Intake CTA routes to the canonical intake", () => {
    const history = renderStrip();
    fireEvent.click(screen.getByTestId("button-tier-snapshot"));
    expect(history[history.length - 1]).toBe("/bring-an-opportunity");
  });

  it("the Deal Blueprint CTA preserves Blueprint intent", () => {
    const history = renderStrip();
    fireEvent.click(screen.getByTestId("button-tier-blueprint"));
    expect(history[history.length - 1]).toBe("/bring-an-opportunity?intent=blueprint");
  });
});
