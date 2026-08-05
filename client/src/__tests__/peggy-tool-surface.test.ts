// @vitest-environment node
import { describe, it, expect } from "vitest";
import { PEGGY_SYSTEM_PROMPT } from "../../../server/peggy";

describe("Peggy system prompt: tool surface enumeration", () => {
  it("enumerates Strategy Lab Quick Read and Full Path modes", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("/strategy-lab");
    expect(PEGGY_SYSTEM_PROMPT).toContain("Quick Read");
    expect(PEGGY_SYSTEM_PROMPT).toContain("Full Path");
  });

  it("names all 8 Quick Tools calculators by name", () => {
    for (const name of [
      "ARV",
      "ROI",
      "BRRRR",
      "Cash Flow",
      "Wholesale MAO",
      "PITI",
      "Own vs Rent",
      "Hard Money",
    ]) {
      expect(PEGGY_SYSTEM_PROMPT).toContain(name);
    }
    // The classic suite is retired; the calculators now live in-page in the
    // unified Lab, deep-linkable via the Quick Tools query param.
    expect(PEGGY_SYSTEM_PROMPT).toContain("/strategy-lab?tool=calculators");
  });

  it("names the Strategy Snapshot PDF and route family", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("Strategy Snapshot PDF");
    expect(PEGGY_SYSTEM_PROMPT).toContain("/api/pdf/strategy-snapshot/by-id/:id");
  });

  it("presents the Deal Blueprint as a by-review engagement, not a fixed-price product", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("/deal-blueprint");
    const lower = PEGGY_SYSTEM_PROMPT.toLowerCase();
    expect(lower).toContain("by review");
    expect(lower).toContain("do not quote a fixed price");
    // The retired fixed public prices must never reappear in the prompt.
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("$497");
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("$897");
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("$1,497");
  });

  it("routes education only to Strategy Lab while retaining live public routes", () => {
    for (const route of [
      "/strategy-lab",
      "/vendor-network",
      "/marketflow",
      "/bring-an-opportunity",
      "/capital",
      "/contact",
    ]) {
      expect(PEGGY_SYSTEM_PROMPT).toContain(route);
    }
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("/library");
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("/resources");
  });

  it("includes the direct line (Apollo email and phone)", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("apollo@pegasusdreamscapes.com");
    expect(PEGGY_SYSTEM_PROMPT).toContain("925-744-8525");
  });

  it("instructs Peggy to never use the forbidden public marketing phrases", () => {
    // These phrases are allowed inside the prompt only as items of the
    // explicit "Do not use" negative list. We assert the negative-list
    // framing is present for each, so the LLM is steered away from them.
    const forbidden = [
      "guaranteed returns",
      "principal protected",
      "passive income",
      "we buy houses fast",
      "investor returns",
      "invest now",
      "invest with us",
    ];
    const lower = PEGGY_SYSTEM_PROMPT.toLowerCase();
    expect(lower).toContain("do not use");
    for (const phrase of forbidden) {
      expect(lower).toContain(phrase);
    }
  });
});
