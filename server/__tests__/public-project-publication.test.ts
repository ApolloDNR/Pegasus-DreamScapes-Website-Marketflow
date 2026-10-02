import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  filterPublishedProjects,
  isPublishedProjectSlug,
  publishedProjectPaths,
  PUBLIC_PROJECT_PUBLICATION_REGISTRY,
} from "../../shared/public-projects";

const routesSource = readFileSync(
  resolve(import.meta.dirname, "../routes.ts"),
  "utf8",
);

describe("public project publication gate", () => {
  it("publishes only the evidence-reviewed Nelson case study", () => {
    expect(Object.keys(PUBLIC_PROJECT_PUBLICATION_REGISTRY)).toEqual([
      "nelson-dr",
    ]);
    expect(publishedProjectPaths()).toEqual(["/projects/nelson-dr"]);
    expect(isPublishedProjectSlug("nelson-dr")).toBe(true);
    expect(isPublishedProjectSlug("draft-seed-row")).toBe(false);
    expect(isPublishedProjectSlug("NELSON-DR")).toBe(false);
  });

  it("filters arbitrary database rows without mutating the reviewed record", () => {
    const reviewed = { id: 1, slug: "nelson-dr", name: "Nelson Drive" };
    const draft = { id: 2, slug: "unreviewed-project", name: "Internal draft" };

    expect(filterPublishedProjects([draft, reviewed])).toEqual([reviewed]);
  });

  it("applies the same fail-closed registry to the list, detail, and sitemap reads", () => {
    expect(routesSource).toMatch(
      /const projects = filterPublishedProjects\(await storage\.getProjects\(\)\);/,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/projects",[\s\S]*?res\.json\(filterPublishedProjects\(projectsList\)\)/,
    );
    expect(routesSource).toMatch(
      /app\.get\("\/api\/projects\/:slug",[\s\S]*?if \(!isPublishedProjectSlug\(req\.params\.slug\)\)[\s\S]*?storage\.getProjectBySlug/,
    );
    expect(routesSource).toMatch(
      /if \(!project \|\| !isPublishedProjectSlug\(project\.slug\)\)/,
    );
  });
});
