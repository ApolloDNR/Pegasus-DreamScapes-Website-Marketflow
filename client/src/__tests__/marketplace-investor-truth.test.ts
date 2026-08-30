// @vitest-environment node
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  path.join(process.cwd(), "client/src/pages/marketplace-investor.tsx"),
  "utf8",
);

describe("MarketFlow investor dashboard truth", () => {
  it("does not label status-less commitment records active", () => {
    expect(source).not.toContain("<Badge>Active</Badge>");
    expect(source).toContain('<Badge variant="outline">Recorded</Badge>');
    expect(source).toContain("recorded commitment");
  });

  it("does not present private project records as capital opportunities", () => {
    expect(source).not.toContain("Projects seeking investor capital");
    expect(source).not.toContain("Capital Opportunities");
    expect(source).not.toContain("grow your real estate portfolio");
    expect(source).not.toContain("availableProjects");
    expect(source).toContain("Private project records");
    expect(source).toContain("not offerings, allocations, recommendations, or verified investment terms");
  });

  it("distinguishes request failures from real zero and empty states", () => {
    expect(source).toContain("statsError");
    expect(source).toContain("commitmentsError");
    expect(source).toContain("Account data unavailable");
    expect(source).not.toContain("const displayStats: InvestorStats = stats ??");
  });
});
