import { describe, expect, it } from "vitest";
import {
  isCrawlablePublicPath,
  ROBOTS_DISALLOW,
  SEO_ROUTES,
} from "../../shared/seo-routes";

const relationshipRoutes = [
  "/",
  "/property-owners",
  "/deal-partners",
  "/referral",
  "/development",
  "/connect",
] as const;

describe("public project SEO truth contract", () => {
  it("keeps relationship and service metadata conditional", () => {
    for (const path of relationshipRoutes) {
      expect(SEO_ROUTES[path].description, path).toMatch(
        /possible|may be considered|no .+ (?:is|are) promised|does not promise/i,
      );
    }
  });

  it("does not revive unconditional response, closing, staffing, or delivery promises", () => {
    const descriptions = Object.values(SEO_ROUTES)
      .map(({ description }) => description)
      .join("\n");

    expect(descriptions).not.toMatch(
      /get a straight answer|one buyer who actually closes|we handle the relationship|coordinates the right licensed project team|deliver a finished product/i,
    );
  });

  it("keeps the project register singular until another case study is reviewed", () => {
    expect(SEO_ROUTES["/projects"].description).toContain(
      "currently published project case study",
    );
    expect(SEO_ROUTES["/projects"].description).toContain("Nelson Drive");
  });

  it("does not promise a time to result for the directional Strategy Lab", () => {
    expect(SEO_ROUTES["/strategy-lab"].description).toContain(
      "directional only",
    );
    expect(SEO_ROUTES["/strategy-lab"].description).not.toMatch(
      /in minutes|within \d+|same day/i,
    );
  });

  it("retires the former investments route from crawl surfaces", () => {
    expect(SEO_ROUTES["/investments"].noIndex).toBe(true);
    expect(isCrawlablePublicPath("/investments")).toBe(false);
    expect(ROBOTS_DISALLOW).toContain("/investments");
  });

  it("keeps every search description concise", () => {
    for (const [path, route] of Object.entries(SEO_ROUTES)) {
      expect(route.description.length, path).toBeLessThanOrEqual(155);
    }
  });
});
