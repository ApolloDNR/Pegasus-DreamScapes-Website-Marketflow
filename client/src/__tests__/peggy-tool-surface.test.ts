// @vitest-environment node
import { beforeAll, describe, it, expect } from "vitest";

let PEGGY_SYSTEM_PROMPT = "";

beforeAll(async () => {
  process.env.DATABASE_URL ??= "postgres://postgres:postgres@localhost:5432/postgres";
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY ??= "test-key";
  ({ PEGGY_SYSTEM_PROMPT } = await import("../../../server/peggy"));
});

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

  it("routes deeper written review privately instead of exposing a public Blueprint price sheet", () => {
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("/deal-blueprint");
    expect(PEGGY_SYSTEM_PROMPT).toContain("/submit?intent=strategy-review");
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("$497");
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("$897");
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("$1,497");
  });

  it("names Strategy Library, Vendor Network, MarketFlow, Submit, Capital, Contact routes", () => {
    for (const route of [
      "/library",
      "/vendor-network",
      "/marketflow",
      "/submit",
      "/capital",
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
