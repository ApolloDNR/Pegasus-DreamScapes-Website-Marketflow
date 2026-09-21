// @vitest-environment node
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("MarketFlow detail action truth", () => {
  it("does not render inert save controls or promise unavailable document access", () => {
    const source = read("client/src/pages/marketplace-deal-detail.tsx");

    expect(source).not.toContain('data-testid="button-save-deal"');
    expect(source).not.toContain('data-testid="button-save-deal-sidebar"');
    expect(source).not.toContain("Available after offer accepted");
    expect(source).toContain('href="/strategy-lab"');
    expect(source).toContain("Open Strategy Lab");
  });

  it("uses the working share menu on property detail", () => {
    const source = read("client/src/pages/marketplace-property-detail.tsx");

    expect(source).toContain("<ShareButtons");
    expect(source).not.toContain('data-testid="button-share" aria-label="Share property"');
  });
});
