import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const propertySource = readFileSync(
  resolve(import.meta.dirname, "../pages/snapshot-property.tsx"),
  "utf8",
);
const calculatorSource = readFileSync(
  resolve(import.meta.dirname, "../pages/snapshot-calc.tsx"),
  "utf8",
);

describe("public Snapshot truth presentation", () => {
  it("frames a property share as unverified automated model output", () => {
    expect(propertySource).toContain("data.outputContext.label");
    expect(propertySource).toContain("data.outputContext.disclaimer");
    expect(propertySource).toContain("Modeled path · based on user-entered inputs");
    expect(propertySource).toContain("Automated model fit");
    expect(propertySource).toContain("User Inputs & Model Estimates");
    expect(propertySource).toContain("Automated Model Summary");
    expect(propertySource).toContain("Model consideration");

    expect(propertySource).not.toContain("Recommended path");
    expect(propertySource).not.toContain("Decision Memo");
    expect(propertySource).not.toContain("Recommended next step");
    expect(propertySource).not.toContain("Every property gets a serious review");
  });

  it("distinguishes calculator inputs, model outputs, and user notes", () => {
    expect(calculatorSource).toContain("data.outputContext.label");
    expect(calculatorSource).toContain("data.outputContext.disclaimer");
    expect(calculatorSource).toContain("User-entered inputs");
    expect(calculatorSource).toContain("Automated calculation outputs");
    expect(calculatorSource).toContain("User-entered note");
    expect(calculatorSource).toContain("Model estimate");

    expect(calculatorSource).not.toContain("from the Pegasus DreamScapes calculator suite");
  });
});
