import { describe, it, expect } from "vitest";
import {
  SEO_ROUTES,
  sitemapEntries,
  isCrawlablePublicPath,
  ROBOTS_DISALLOW,
} from "../../shared/seo-routes";

describe("sitemap generation from seo-routes", () => {
  it("includes every crawlable public route from SEO_ROUTES", () => {
    const entries = sitemapEntries();
    const paths = new Set(entries.map((e) => e.path));
    for (const route of Object.keys(SEO_ROUTES)) {
      if (isCrawlablePublicPath(route)) {
        expect(paths.has(route)).toBe(true);
      }
    }
  });

  it("emits no duplicate paths and valid priority/changefreq for each", () => {
    const entries = sitemapEntries();
    const paths = entries.map((e) => e.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const e of entries) {
      expect(Number(e.priority)).toBeGreaterThanOrEqual(0);
      expect(Number(e.priority)).toBeLessThanOrEqual(1);
      expect(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]).toContain(
        e.changefreq,
      );
    }
  });

  it("gives the home route top priority", () => {
    const home = sitemapEntries().find((e) => e.path === "/");
    expect(home?.priority).toBe("1.0");
  });
});

describe("isCrawlablePublicPath", () => {
  it("allows public surfaces", () => {
    for (const p of ["/", "/about", "/bring-an-opportunity", "/marketflow/access"]) {
      expect(isCrawlablePublicPath(p)).toBe(true);
    }
  });

  it("does not advertise the legacy /submit alias", () => {
    const sitemapPaths = new Set(sitemapEntries().map((entry) => entry.path));
    expect(isCrawlablePublicPath("/submit")).toBe(false);
    expect(sitemapPaths.has("/submit")).toBe(false);
    expect(sitemapPaths.has("/bring-an-opportunity")).toBe(true);
  });

  it("excludes the remaining demoted bare route from the sitemap (it 302-redirects)", () => {
    const sitemapPaths = new Set(sitemapEntries().map((e) => e.path));
    // Website Spec v4 restored /marketflow to the live public surface, so it is
    // crawlable and advertised again. /library remains demoted (302 → home).
    expect(isCrawlablePublicPath("/library")).toBe(false);
    expect(sitemapPaths.has("/library")).toBe(false);
    // /marketflow is live again; its access subpath stays live too.
    expect(isCrawlablePublicPath("/marketflow")).toBe(true);
    expect(sitemapPaths.has("/marketflow")).toBe(true);
    expect(isCrawlablePublicPath("/marketflow/access")).toBe(true);
    expect(sitemapPaths.has("/marketflow/access")).toBe(true);
  });

  it("blocks admin, auth, api, and operator surfaces", () => {
    for (const p of [
      "/api/leads",
      "/admin",
      "/admin/cta-events",
      "/hq",
      "/dashboard",
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/offer-studio",
      "/profile/123",
      "/snapshot/abc",
      "/saved",
      "/marketflow/admin",
      "/marketflow/dashboard",
      "/marketflow/messages",
    ]) {
      expect(isCrawlablePublicPath(p)).toBe(false);
    }
  });

  it("keeps the personal saved workspace out of search and the sitemap", async () => {
    const { SEO_ROUTES } = await import("../../shared/seo-routes");
    const sitemapPaths = new Set(sitemapEntries().map((entry) => entry.path));

    expect(SEO_ROUTES["/saved"]?.noIndex).toBe(true);
    expect(sitemapPaths.has("/saved")).toBe(false);
    expect(ROBOTS_DISALLOW).toContain("/saved");
  });

  it("keeps password-recovery routes out of search and the sitemap", () => {
    const sitemapPaths = new Set(sitemapEntries().map((entry) => entry.path));

    for (const route of ["/forgot-password", "/reset-password"]) {
      expect(isCrawlablePublicPath(route)).toBe(false);
      expect(sitemapPaths.has(route)).toBe(false);
      expect(ROBOTS_DISALLOW).toContain(route);
    }
  });
});

describe("robots disallow list", () => {
  it("never disallows a route that the sitemap advertises", () => {
    const sitemapPaths = sitemapEntries().map((e) => e.path);
    for (const path of sitemapPaths) {
      const blocked = ROBOTS_DISALLOW.some((d) =>
        d.endsWith("/") ? path.startsWith(d) : path === d || path.startsWith(d + "/"),
      );
      expect(blocked, `${path} should not be disallowed`).toBe(false);
    }
  });
});
