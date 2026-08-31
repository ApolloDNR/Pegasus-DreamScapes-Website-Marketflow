import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SEO_ROUTES, SITE_URL } from "../../shared/seo-routes";
import { jsonLdFor, jsonLdScript } from "../../shared/structured-data";

const NELSON_SURFACES = [
  "/our-work",
  "/case-study",
  "/projects/nelson-dr",
] as const;

describe("Nelson search and structured-data ownership", () => {
  it("gives the gallery, financial summary, and full record distinct jobs", () => {
    const records = NELSON_SURFACES.map((path) => SEO_ROUTES[path]);

    expect(new Set(records.map(({ title }) => title)).size).toBe(3);
    expect(new Set(records.map(({ description }) => description)).size).toBe(3);
    expect(SEO_ROUTES["/our-work"].description).toMatch(/gallery|photos/i);
    expect(SEO_ROUTES["/case-study"].description).toMatch(/financial summary/i);
    expect(SEO_ROUTES["/projects/nelson-dr"].description).toMatch(
      /full .+ project record|photo essay/i,
    );
    expect(SEO_ROUTES["/our-work"].type).toBeUndefined();
    expect(SEO_ROUTES["/case-study"].type).toBeUndefined();
    expect(SEO_ROUTES["/projects/nelson-dr"].type).toBe("article");
  });

  it("publishes one canonical Article only on the full project record", () => {
    for (const path of ["/our-work", "/case-study"] as const) {
      expect(jsonLdFor(path).filter((node) => node["@type"] === "Article"), path)
        .toHaveLength(0);
    }

    const nodes = jsonLdFor("/projects/nelson-dr");
    const articles = nodes.filter((node) => node["@type"] === "Article");

    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      "@type": "Article",
      url: `${SITE_URL}/projects/nelson-dr`,
      description: SEO_ROUTES["/projects/nelson-dr"].description,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/projects/nelson-dr`,
      },
    });
    expect(jsonLdScript("/projects/nelson-dr")).not.toContain('"@type": "CreativeWork"');
  });

  it("does not add a second client-side CreativeWork record on hydration", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/project-nelson-dr.tsx"),
      "utf8",
    );

    expect(source).not.toContain("NELSON_JSONLD");
    expect(source).not.toContain("ld-nelson");
    expect(source).not.toContain('"@type": "CreativeWork"');
    expect(source).not.toContain('type = "application/ld+json"');
  });
});
