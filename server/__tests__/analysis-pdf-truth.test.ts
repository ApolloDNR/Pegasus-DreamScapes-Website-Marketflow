import { describe, expect, it } from "vitest";

describe("analysis PDF truth framing", () => {
  it("builds Strategy Snapshot disclosure copy without unconditional review promises", async () => {
    const pdfModule = (await import("../pdf")) as Record<string, unknown>;
    const buildCopy = pdfModule.getStrategySnapshotDisclosureCopy;
    expect(buildCopy).toBeTypeOf("function");
    if (typeof buildCopy !== "function") return;

    const paragraphs = (buildCopy as () => string[])();
    const copy = paragraphs.join(" ");
    expect(copy).toMatch(/user-entered, unverified inputs/i);
    expect(copy).toMatch(/automated model/i);
    expect(copy).toMatch(/does not represent a Pegasus review or recommendation/i);
    expect(copy).not.toMatch(/reviews every property/i);
    expect(copy).not.toMatch(/every property gets/i);
    expect(copy).not.toMatch(/no lead dies/i);
  });

  it("builds saved-calculator PDF disclosure copy that identifies estimates and assumptions", async () => {
    const pdfModule = (await import("../pdf")) as Record<string, unknown>;
    const buildCopy = pdfModule.getSavedAnalysisDisclosureCopy;
    expect(buildCopy).toBeTypeOf("function");
    if (typeof buildCopy !== "function") return;

    const copy = (buildCopy as () => string)();
    expect(copy).toMatch(/user-entered inputs/i);
    expect(copy).toMatch(/automated calculations/i);
    expect(copy).toMatch(/not independently verified by Pegasus/i);
    expect(copy).not.toMatch(/recommended by Pegasus/i);
  });
});
