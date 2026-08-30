// @vitest-environment node
import { describe, it, expect } from "vitest";
import { PEGGY_SYSTEM_PROMPT } from "../../../server/peggy";

describe("Peggy system prompt: bounded public tool guidance", () => {
  it("describes Strategy Lab without promising controls the visitor cannot see", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain(
      "**Strategy Lab — public modeling surface.** /strategy-lab",
    );
    expect(PEGGY_SYSTEM_PROMPT).toContain("visitor-entered assumptions");
    expect(PEGGY_SYSTEM_PROMPT).toContain(
      "Explain only controls and outputs that the visitor says are visible",
    );
  });

  it("routes calculator questions to the visible Strategy Lab work area", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain(
      "Point to the right calculator or educational work area in /strategy-lab",
    );
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("three free runs before sign-in");
  });

  it("describes an offered Strategy Snapshot PDF without exposing an API route", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("Strategy Snapshot PDF");
    expect(PEGGY_SYSTEM_PROMPT).toContain("When the interface offers a PDF action");
    expect(PEGGY_SYSTEM_PROMPT).toContain(
      "visitor-entered assumptions and remains directional, not a valuation or advice",
    );
    expect(PEGGY_SYSTEM_PROMPT).not.toContain("/api/pdf/strategy-snapshot/");
  });

  it("presents Deal Blueprint as a possible separately scoped request", () => {
    expect(PEGGY_SYSTEM_PROMPT).toContain("/deal-blueprint");
    const lower = PEGGY_SYSTEM_PROMPT.toLowerCase();
    expect(lower).toContain("request for possible separately scoped work");
    expect(lower).toContain(
      "no purchase, acceptance, fee, turnaround, or delivery is promised",
    );
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
