import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const surfaces = [
  "client/src/pages/marketflow-negotiate.tsx",
  "client/src/pages/marketflow/offer-studio.tsx",
];

describe("MarketFlow negotiation guidance", () => {
  it.each(surfaces)("does not advertise or call an unavailable advisor on %s", (path) => {
    const source = readFileSync(path, "utf8");

    expect(source).not.toContain("/api/peggy-ai/chat");
    expect(source).not.toMatch(/real-time negotiation guidance/i);
    expect(source).not.toMatch(/Ask Peggy about this negotiation/i);
    expect(source).toMatch(/Negotiation checklist/);
    expect(source).toMatch(/informational/i);
  });
});
