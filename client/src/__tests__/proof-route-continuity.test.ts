import { describe, expect, it } from "vitest";
import { appendRedirectSearch, LEGACY_SPA_EXACT_REDIRECTS } from "@shared/redirects";
import { sitemapEntries } from "@shared/seo-routes";

describe("one canonical proof journey", () => {
  it("maps the legacy index and case summary to their canonical destinations", () => {
    expect(LEGACY_SPA_EXACT_REDIRECTS).toContainEqual(["/projects", "/our-work"]);
    expect(LEGACY_SPA_EXACT_REDIRECTS).toContainEqual(["/case-study", "/projects/nelson-dr"]);
  });
  it("preserves a legacy proof section with its query context", () => {
    expect(appendRedirectSearch("/our-work", "ref=story", "#published-work")).toBe("/our-work?ref=story#published-work");
    expect(appendRedirectSearch("/projects/nelson-dr", "", "#case-record")).toBe("/projects/nelson-dr#case-record");
  });
  it("keeps a fixed destination fragment authoritative", () => {
    expect(appendRedirectSearch("/our-work#project-record", "ref=story", "#other")).toBe("/our-work?ref=story#project-record");
  });
  it("advertises canonical proof routes rather than duplicate summaries", () => {
    const paths = sitemapEntries().map(entry => entry.path);
    expect(paths).toContain("/our-work");
    expect(paths).toContain("/projects/nelson-dr");
    expect(paths).not.toContain("/projects");
    expect(paths).not.toContain("/case-study");
  });
});
