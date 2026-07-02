/**
 * Strategy Lab — Property Fit Score derivation + autofill handoff (Task #181).
 *
 * The Property Console blends the live underwriting margin with qualitative
 * inputs (condition, occupancy, goal, seller motivation) into a directional "Fit
 * Score" that visitors see, and its "Use an example property" autofill seeds
 * acquisition / rehab / ARV into the shared underwriting model so the Instant
 * Strategy Preview reflects the chosen sample. Neither path had a test, so a
 * future edit could silently shift the score or break the autofill handoff.
 * These tests drive the real component through both.
 */
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import {
  StrategyConsole,
  useStrategyModel,
  type StrategyModel,
} from "@/pegasus/forms";

let capturedModel: StrategyModel | null = null;

function ConsoleHarness() {
  const model = useStrategyModel();
  capturedModel = model;
  return <StrategyConsole go={vi.fn()} model={model} />;
}

function fitScore(): number {
  return Number(screen.getByTestId("text-console-fit-score").textContent);
}

function fitBand(): string | null {
  return screen.getByTestId("text-console-fit-band").textContent;
}

function setSelect(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("StrategyConsole — Property Fit Score derivation", () => {
  afterEach(() => {
    cleanup();
    capturedModel = null;
  });

  it("scores a clear value-add candidate higher than a poor-fit edge case", () => {
    render(<ConsoleHarness />);

    // Poor-fit edge case: pristine, owner lives there, just browsing.
    setSelect("Condition", "Excellent");
    setSelect("Occupancy", "Owner-occupied");
    setSelect("Your goal", "Understand options");
    setSelect("Seller motivation", "Just curious");
    const poorFit = fitScore();

    // Clear value-add candidate: needs work, estate sale, motivated seller.
    setSelect("Condition", "Distressed");
    setSelect("Occupancy", "Probate / estate");
    setSelect("Your goal", "Maximize value");
    setSelect("Seller motivation", "Time-sensitive / urgent");
    const strongFit = fitScore();

    expect(strongFit).toBeGreaterThan(poorFit);
  });

  it("raises the score as seller motivation increases (margin held constant)", () => {
    render(<ConsoleHarness />);

    setSelect("Seller motivation", "Just curious");
    const curious = fitScore();

    setSelect("Seller motivation", "Motivated");
    const motivated = fitScore();

    setSelect("Seller motivation", "Time-sensitive / urgent");
    const urgent = fitScore();

    expect(motivated).toBeGreaterThan(curious);
    expect(urgent).toBeGreaterThan(motivated);
  });

  it("rewards value-add upside: worse condition scores higher than pristine", () => {
    render(<ConsoleHarness />);

    setSelect("Condition", "Excellent");
    const excellent = fitScore();

    setSelect("Condition", "Distressed");
    const distressed = fitScore();

    expect(distressed).toBeGreaterThan(excellent);
  });

  it("rises with a stronger deal margin from the shared model", () => {
    render(<ConsoleHarness />);
    // Hold the qualitative inputs fixed; only the underwriting margin moves.
    setSelect("Condition", "Good");
    setSelect("Occupancy", "Vacant");
    setSelect("Your goal", "Maximize value");
    setSelect("Seller motivation", "Motivated");

    expect(capturedModel).not.toBeNull();
    const m = capturedModel!;

    // Thin deal: ARV barely above basis.
    fireEvent.change(screen.getByTestId("input-console-address"), {
      target: { value: "thin" },
    });
    // Drive the shared model directly via its setters (acq/rehab fixed).
    // A weak ARV yields a low margin -> low marginScore contribution.
    act(() => {
      m.setAcq(600_000);
      m.setRehab(95_000);
      m.setArv(720_000);
    });
    const thinFit = fitScore();

    // Strong deal: same basis, much higher ARV -> higher margin -> higher score.
    act(() => {
      m.setArv(1_050_000);
    });
    const strongFit = fitScore();

    expect(strongFit).toBeGreaterThan(thinFit);
  });

  it("labels the band consistently with the score it shows", () => {
    render(<ConsoleHarness />);

    setSelect("Condition", "Distressed");
    setSelect("Occupancy", "Probate / estate");
    setSelect("Your goal", "Maximize value");
    setSelect("Seller motivation", "Time-sensitive / urgent");
    act(() => {
      capturedModel!.setArv(1_200_000);
    });

    const score = fitScore();
    const band = fitBand();
    const expectedBand =
      score >= 75
        ? "Strong fit"
        : score >= 55
        ? "Worth a read"
        : score >= 35
        ? "Possible, needs work"
        : "Likely not a fit";
    expect(band).toBe(expectedBand);
  });
});

describe("StrategyConsole — autofill seeds the shared underwriting model", () => {
  afterEach(() => {
    cleanup();
    capturedModel = null;
    vi.restoreAllMocks();
  });

  it("seeds acq / rehab / arv into the model and the Instant Strategy Preview", () => {
    // Math.random -> 0 deterministically selects the first sample property.
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<ConsoleHarness />);

    // First sample: 1428 Walnut Blvd — acq 575k, rehab 85k, arv 815k.
    fireEvent.click(screen.getByTestId("button-console-autofill"));

    expect(capturedModel).not.toBeNull();
    const m = capturedModel!;
    expect(m.acq).toBe(575_000);
    expect(m.rehab).toBe(85_000);
    expect(m.arv).toBe(815_000);

    // The shared snapshot (Instant Strategy Preview) reflects the seeded values.
    expect(m.snapshot.acquisition).toBe(575_000);
    expect(m.snapshot.rehab).toBe(85_000);
    expect(m.snapshot.arv).toBe(815_000);
    expect(m.snapshot.allIn).toBe(575_000 + 85_000);
  });

  it("seeds a different sample when the random pick changes", () => {
    // 0.5 -> floor(0.5 * 3) = 1 -> second sample (92 Estate Way).
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    render(<ConsoleHarness />);

    fireEvent.click(screen.getByTestId("button-console-autofill"));

    const m = capturedModel!;
    expect(m.acq).toBe(910_000);
    expect(m.rehab).toBe(180_000);
    expect(m.arv).toBe(1_340_000);
  });
});
