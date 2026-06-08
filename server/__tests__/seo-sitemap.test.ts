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
    for (const p of ["/", "/about", "/submit", "/marketflow", "/marketflow/access"]) {
      expect(isCrawlablePublicPath(p)).toBe(true);
    }
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
      "/offer-studio",
      "/profile/123",
      "/snapshot/abc",
      "/marketflow/admin",
      "/marketflow/dashboard",
      "/marketflow/messages",
    ]) {
      expect(isCrawlablePublicPath(p)).toBe(false);
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
