import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { injectSeo, isPrivateNoindexSpaPath } from "../seo-html";

const htmlShell = readFileSync(
  resolve(import.meta.dirname, "../../client/index.html"),
  "utf8",
);

const PRIVATE_MOUNTED_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/saved",
  "/strategy-lab/library",
  "/strategy-lab/submitted",
  "/strategy-lab/blueprint-confirmed",
  "/admin/strategy-lab",
  "/admin/vendors",
  "/admin/cta-events",
  "/admin/hq-outbox",
  "/admin/peggy/conversations",
  "/snapshot/calc/token-42",
  "/snapshot/property/token-42",
  "/snapshot/token-42",
  "/dealflow/project/project-42",
  "/offer-studio/capital/deal-42",
  "/profile/user-42",
  "/dashboard",
  "/hq",
  "/dealflow/hq",
  "/marketflow/wholesaler",
  "/marketflow/dreamscaper",
  "/marketflow/investor",
  "/marketflow/buyer",
  "/marketflow/buyer/saved",
  "/marketflow/buyer/offers",
  "/marketflow/admin",
  "/marketflow/admin/users/operator-42",
  "/marketflow/discover",
  "/marketflow/calculators",
  "/marketflow/resources",
  "/marketflow/community",
  "/marketflow/messages",
  "/marketflow/deals",
  "/marketflow/deals/deal-42",
  "/marketflow/capital",
  "/marketflow/capital/project-42",
  "/marketflow/listings/listing-42",
  "/marketflow/properties",
  "/marketflow/properties/property-42",
  "/marketflow/submit",
  "/marketflow/deals/deal-42/negotiate",
  "/marketflow/negotiate/wholesale/deal-42",
  "/marketflow/dashboard",
  "/marketflow/my-deals",
  "/marketflow/analytics",
  "/marketflow/my-analytics",
  "/marketflow/offer-studio/deal-42",
] as const;

function robotsContent(html: string): string | null {
  return html.match(/<meta\s+name="robots"\s+content="([^"]+)"\s*\/?>/i)?.[1] ?? null;
}

describe("raw HTML private-route SEO boundary", () => {
  it.each(PRIVATE_MOUNTED_PATHS)(
    "suppresses indexing, canonical, and JSON-LD for %s",
    (pathname) => {
      const html = injectSeo(htmlShell, pathname);

      expect(isPrivateNoindexSpaPath(pathname)).toBe(true);
      expect(robotsContent(html)).toBe("noindex, nofollow");
      expect(html).not.toMatch(/<link\s+rel="canonical"/i);
      expect(html).not.toMatch(/<script\s+type="application\/ld\+json"/i);
    },
  );

  it("normalizes query, hash, and trailing slashes before privacy classification", () => {
    const pathname = "/marketflow/deals/deal-42///?source=preview#terms";
    const html = injectSeo(htmlShell, pathname);

    expect(isPrivateNoindexSpaPath(pathname)).toBe(true);
    expect(robotsContent(html)).toBe("noindex, nofollow");
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('type="application/ld+json"');
  });

  it.each([
    "/strategy-lab",
    "/marketflow",
    "/marketflow/access",
  ])("preserves canonical public SEO for %s", (pathname) => {
    const html = injectSeo(htmlShell, pathname);

    expect(isPrivateNoindexSpaPath(pathname)).toBe(false);
    expect(robotsContent(html)).toBe("index, follow");
    expect(html).toContain(
      `<link rel="canonical" href="https://pegasusdreamscapes.com${pathname}" />`,
    );
    expect(html).toContain('type="application/ld+json"');
  });

  it("keeps the unpublished buybox surface out of the index", () => {
    const html = injectSeo(htmlShell, "/marketflow/buyboxes");

    expect(isPrivateNoindexSpaPath("/marketflow/buyboxes")).toBe(false);
    expect(robotsContent(html)).toBe("noindex, nofollow");
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('type="application/ld+json"');
  });
});
