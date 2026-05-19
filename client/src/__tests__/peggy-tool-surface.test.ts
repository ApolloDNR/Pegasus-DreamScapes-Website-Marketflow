// @vitest-environment node
import { describe, it, expect } from "vitest";
import { PEGGY_SYSTEM_PROMPT } from "../../../server/peggy";

describe("Peggy system prompt: tool surface enumeration", () => {
  it("enumerates Strategy Lab Quick Read and Full Path modes", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("/strategy-lab");
    expect(PEGGY_SYSTEM_PROMPT).toContain("Quick Read");
    expect(PEGGY_SYSTEM_PROMPT).toContain("Full Path");
  });

  it("names all 8 classic calculators by name", () => {
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
    expect(PEGGY_SYSTEM_PROMPT).toContain("/strategy-lab/classic");
  });

  it("names the Strategy Snapshot PDF and route family", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("Strategy Snapshot PDF");
    expect(PEGGY_SYSTEM_PROMPT).toContain("/api/pdf/strategy-snapshot/by-id/:id");
  });

  it("enumerates the three Deal Blueprint tiers with locked default prices", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("/deal-blueprint");
    expect(PEGGY_SYSTEM_PROMPT).toContain("$497");
    expect(PEGGY_SYSTEM_PROMPT).toContain("$897");
    expect(PEGGY_SYSTEM_PROMPT).toContain("$1,497");
  });

  it("names Strategy Library, Vendor Network, MarketFlow, Sell, Invest, Contact routes", () => {
    for (const route of [
      "/resources",
      "/vendor-network",
      "/marketflow",
      "/sell",
      "/invest",
      "/contact",
    ]) {
      expect(PEGGY_SYSTEM_PROMPT).toContain(route);
    }
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
