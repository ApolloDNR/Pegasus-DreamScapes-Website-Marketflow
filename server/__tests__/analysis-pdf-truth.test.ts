import { describe, expect, it } from "vitest";

function countPdfPages(buffer: Buffer): number {
  return buffer.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;
}

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

  it("keeps model-fit display labels explicit without repeating their context", async () => {
    const publicModule = (await import("../publicAnalysis")) as Record<string, unknown>;
    const displayLabel = publicModule.getPublicModelFitDisplayLabel;
    expect(displayLabel).toBeTypeOf("function");
    if (typeof displayLabel !== "function") return;

    expect(
      (displayLabel as (value: unknown) => string)("Automated model fit: Strong fit"),
    ).toBe("Strong fit");
    expect((displayLabel as (value: unknown) => string)("Needs more data")).toBe(
      "Needs more data",
    );
  });

  it("keeps footers on their intended pages instead of creating blank PDF pages", async () => {
    const { generateSavedAnalysisPDF, generateStrategySnapshotPDF } = await import("../pdf");
    const saved = await generateSavedAnalysisPDF({
      name: "Oakland scenario",
      calculatorType: "roi",
      inputs: { purchasePrice: 510_000 },
      results: { roi: 19.2 },
      primaryMetric: "Projected ROI",
      primaryValue: "19.2%",
    });
    expect(countPdfPages(saved)).toBe(1);

    const property = await generateStrategySnapshotPDF({
      id: 1,
      visibility: "full",
      address: "400 Model Way",
      propertyInput: {
        address: "400 Model Way",
        askingPrice: 510_000,
        arvEstimate: 760_000,
        rehabBudget: 120_000,
        marketRent: 4_200,
      },
      snapshot: {
        engineVersion: "1.0.0",
        generatedAt: "2026-08-30T00:00:00.000Z",
        topLane: "flip",
        lanes: [{
          lane: "flip",
          laneLabel: "Fix and Flip",
          verdict: "strong",
          verdictLabel: "Strong fit",
          headline: "Automated path output.",
          confidence: { score: 80, supportingFactors: [], sensitiveFactors: [], missingInputs: [] },
          economics: { primaryMetric: "Modeled profit", primaryValue: "$82K", metrics: [] },
          laneRisks: [],
        }],
        memo: {
          paragraph: "Automated summary.",
          nextStep: "Gather independent verification.",
          hasCompOverrideWarning: false,
        },
        risks: [],
        capitalStack: [],
        sensitivities: [],
        reverseSolvers: [],
        breakevens: {},
        compsUsed: [],
        scenarios: {},
        totalCashIn: 210_000,
      },
    });
    expect(countPdfPages(property)).toBe(7);
  });
});
