import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
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
  "/contact",
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

  it("describes Contact as a general routing surface rather than property intake", () => {
    expect(SEO_ROUTES["/connect"]).toBeUndefined();
    expect(SEO_ROUTES["/contact"].description).toMatch(/general question|right public route/i);
    expect(SEO_ROUTES["/contact"].description).not.toMatch(/share a property/i);
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

  it("keeps operator-prepared legal drafts out of crawl surfaces pending review", () => {
    for (const path of ["/privacy", "/terms", "/disclosures"] as const) {
      expect(SEO_ROUTES[path].noIndex, path).toBe(true);
      expect(isCrawlablePublicPath(path), path).toBe(false);
      expect(ROBOTS_DISALLOW, path).toContain(path);
    }
  });

  it("keeps every search description concise", () => {
    for (const [path, route] of Object.entries(SEO_ROUTES)) {
      expect(route.description.length, path).toBeLessThanOrEqual(155);
    }
  });

  it("keeps every same-origin social image backed by a public asset", () => {
    for (const [path, route] of Object.entries(SEO_ROUTES)) {
      const imageUrl = new URL(route.image);
      if (imageUrl.origin !== "https://pegasusdreamscapes.com") continue;

      const publicAsset = resolve(
        process.cwd(),
        "client/public",
        imageUrl.pathname.replace(/^\//, ""),
      );
      expect(existsSync(publicAsset), `${path}: ${imageUrl.pathname}`).toBe(true);
    }
  });
});
