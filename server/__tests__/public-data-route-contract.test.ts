import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

describe("public data route contract", () => {
  it("projects public deal, listing, project, and buy-box responses", () => {
    expect(routesSource).toMatch(
      /deals\.filter\(isPublicWholesaleDeal\)\.map\(toPublicWholesaleDeal\)/s,
    );
    expect(routesSource).toMatch(
      /activeListings\.filter\(isPublicListing\)\.map\(toPublicListing\)/s,
    );
    expect(routesSource).toMatch(
      /projects\.filter\(isPublicCapitalProject\)\.map\(toPublicCapitalProject\)/s,
    );
    expect(routesSource).toMatch(
      /\.map\(toPublicInvestorWantedDeal\)/s,
    );
  });

  it("does not return full rows from public legacy detail aliases", () => {
    expect(routesSource).toMatch(
      /return res\.json\(toPublicWholesaleDeal\(deal\)\)/s,
    );
    expect(routesSource).toMatch(
      /return res\.json\(toPublicListing\(listing\)\)/s,
    );
    expect(routesSource).toMatch(
      /return res\.json\(toPublicCapitalProject\(project\)\)/s,
    );
    expect(routesSource).toMatch(
      /return res\.json\(toPublicUserProfile\(user\)\)/s,
    );
  });

  it("keeps sensitive PDFs and user activity behind verified identity", () => {
    expect(routesSource).toMatch(
      /app\.get\("\/api\/pdf\/wholesale-deal\/:id",\s*isHybridAuthenticated,/s,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/pdf\/capital-project\/:id",\s*isHybridAuthenticated,/s,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/users\/:userId\/activity",\s*isHybridAuthenticated,/s,
    );
  });
});
