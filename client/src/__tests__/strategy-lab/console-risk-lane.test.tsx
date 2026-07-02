/**
 * Strategy Lab — Risk flags + lane routing guard (Task #183).
 *
 * The Property Console derives two more visitor-facing outputs that had no
 * test: the "Risk flags" list (thin margin, rough repair estimate,
 * tenant-occupied, probate/estate, subject-to) and the "lane" routing that
 * decides which next-step button label + route a visitor is sent to based on
 * role + condition + occupancy. Either could silently break or mis-route a
 * visitor with nothing to catch it. These tests drive the real component.
 */
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import {
  StrategyConsole,
  useStrategyModel,
  type StrategyModel,
} from "@/pegasus/forms";
import type { Nav } from "@/pegasus/theme";

let capturedModel: StrategyModel | null = null;

function ConsoleHarness({ go }: { go: Nav }) {
  const model = useStrategyModel();
  capturedModel = model;
  return <StrategyConsole go={go} model={model} />;
}

function setSelect(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

// Flags render as <li> text inside the "Risk flags" block; query by the
// distinctive copy each flag uses.
const FLAG = {
  thinMargin: /Thin margin once carry and exit costs come out/,
  roughRepair: /Repair budget is a rough estimate, not a verified scope/,
  tenant: /Tenant-occupied: possession and relocation may apply/,
  probate: /Probate \/ estate: court timing and authority to sell/,
  subjectTo: /Subject-to carries due-on-sale and disclosure exposure/,
} as const;
const NO_FLAGS = /No major flags on these inputs/;

function hasFlag(re: RegExp): boolean {
  return screen.queryByText(re) !== null;
}

// Raise ARV through the shared model so the projected net margin clears the
// 8% thin-margin threshold (default inputs sit just under it).
function clearThinMargin() {
  act(() => {
    capturedModel!.setArv(1_200_000);
  });
}

describe("StrategyConsole — Risk flags", () => {
  afterEach(() => {
    cleanup();
    capturedModel = null;
  });

  it("flags a thin margin only while the margin is under 8%", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    // Default inputs (600k / 95k / 840k) land just under an 8% net margin.
    expect(hasFlag(FLAG.thinMargin)).toBe(true);

    // A much stronger ARV lifts the margin clear of the threshold.
    clearThinMargin();
    expect(hasFlag(FLAG.thinMargin)).toBe(false);
  });

  it("flags a rough / sight-unseen repair budget but not a verified one", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    // Default repair confidence is "Rough estimate".
    expect(hasFlag(FLAG.roughRepair)).toBe(true);

    setSelect("Repair budget confidence", "Unknown / sight unseen");
    expect(hasFlag(FLAG.roughRepair)).toBe(true);

    setSelect("Repair budget confidence", "Contractor walk-through done");
    expect(hasFlag(FLAG.roughRepair)).toBe(false);

    setSelect("Repair budget confidence", "Detailed bid in hand");
    expect(hasFlag(FLAG.roughRepair)).toBe(false);
  });

  it("raises a possession flag only when tenant-occupied", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    // Default occupancy is "Vacant".
    expect(hasFlag(FLAG.tenant)).toBe(false);

    setSelect("Occupancy", "Tenant-occupied");
    expect(hasFlag(FLAG.tenant)).toBe(true);

    setSelect("Occupancy", "Vacant");
    expect(hasFlag(FLAG.tenant)).toBe(false);
  });

  it("raises a probate flag only when probate / estate", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    expect(hasFlag(FLAG.probate)).toBe(false);

    setSelect("Occupancy", "Probate / estate");
    expect(hasFlag(FLAG.probate)).toBe(true);

    setSelect("Occupancy", "Owner-occupied");
    expect(hasFlag(FLAG.probate)).toBe(false);
  });

  it("raises a subject-to flag only when financing is subject-to", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    // Default financing is "All cash".
    expect(hasFlag(FLAG.subjectTo)).toBe(false);

    setSelect("Financing / position", "Subject-to existing loan");
    expect(hasFlag(FLAG.subjectTo)).toBe(true);

    setSelect("Financing / position", "All cash");
    expect(hasFlag(FLAG.subjectTo)).toBe(false);
  });

  it("shows 'No major flags' when none of the triggers apply", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    // Clear every trigger: healthy margin, verified repairs, clean occupancy
    // (Vacant by default) and all-cash financing (default).
    clearThinMargin();
    setSelect("Repair budget confidence", "Detailed bid in hand");

    expect(screen.queryByText(NO_FLAGS)).not.toBeNull();
    expect(hasFlag(FLAG.thinMargin)).toBe(false);
    expect(hasFlag(FLAG.roughRepair)).toBe(false);
    expect(hasFlag(FLAG.tenant)).toBe(false);
    expect(hasFlag(FLAG.probate)).toBe(false);
    expect(hasFlag(FLAG.subjectTo)).toBe(false);
  });

  it("stacks multiple flags when several triggers apply at once", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    // Default margin is thin and repairs are a rough estimate; add a
    // tenant-occupied subject-to deal on top.
    setSelect("Occupancy", "Tenant-occupied");
    setSelect("Financing / position", "Subject-to existing loan");

    expect(hasFlag(FLAG.thinMargin)).toBe(true);
    expect(hasFlag(FLAG.roughRepair)).toBe(true);
    expect(hasFlag(FLAG.tenant)).toBe(true);
    expect(hasFlag(FLAG.subjectTo)).toBe(true);
    expect(screen.queryByText(NO_FLAGS)).toBeNull();
  });
});

describe("StrategyConsole — lane routing", () => {
  afterEach(() => {
    cleanup();
    capturedModel = null;
  });

  function laneButton() {
    return screen.getByTestId("button-console-lane");
  }

  it("routes an owner with a distressed property to a property review", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    setSelect("Your role", "Owner / Seller");
    setSelect("Condition", "Distressed");

    expect(laneButton().textContent).toContain("Request a Property Read");
    fireEvent.click(laneButton());
    expect(go).toHaveBeenCalledWith("sellers");
  });

  it("routes an owner with a poor-condition property to a property review", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    setSelect("Your role", "Owner / Seller");
    setSelect("Condition", "Poor");

    expect(laneButton().textContent).toContain("Request a Property Read");
    fireEvent.click(laneButton());
    expect(go).toHaveBeenCalledWith("sellers");
  });

  it("routes an owner with a probate property to a property review", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    setSelect("Your role", "Owner / Seller");
    setSelect("Condition", "Good");
    setSelect("Occupancy", "Probate / estate");

    expect(laneButton().textContent).toContain("Request a Property Read");
    fireEvent.click(laneButton());
    expect(go).toHaveBeenCalledWith("sellers");
  });

  it("routes an owner with a sound, clean property to seller representation", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    setSelect("Your role", "Owner / Seller");
    setSelect("Condition", "Good");
    setSelect("Occupancy", "Vacant");

    expect(laneButton().textContent).toContain("See seller representation");
    fireEvent.click(laneButton());
    expect(go).toHaveBeenCalledWith("apollo");
  });

  it("routes a deal finder to the Deal Finders lane", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    setSelect("Your role", "Deal Finder / Wholesaler");

    expect(laneButton().textContent).toContain("Submit the deal to Deal Finders");
    fireEvent.click(laneButton());
    expect(go).toHaveBeenCalledWith("dealfinders");
  });

  it("routes a capital partner to the Capital lane", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    setSelect("Your role", "Capital Partner");

    expect(laneButton().textContent).toContain("See the Capital lane");
    fireEvent.click(laneButton());
    expect(go).toHaveBeenCalledWith("capital");
  });

  it("routes an agent / referral to partnering with Apollo", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    setSelect("Your role", "Agent / Referral");

    expect(laneButton().textContent).toContain("Partner with Apollo");
    fireEvent.click(laneButton());
    expect(go).toHaveBeenCalledWith("apollo");
  });

  it("routes a buyer / investor to the Buyers lane", () => {
    const go = vi.fn();
    render(<ConsoleHarness go={go} />);

    // Buyer / Investor is the default role.
    setSelect("Your role", "Buyer / Investor");

    expect(laneButton().textContent).toContain("See the Buyers lane");
    fireEvent.click(laneButton());
    expect(go).toHaveBeenCalledWith("buyers");
  });
});
