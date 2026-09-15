import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSEO } from "@/hooks/use-seo";
import {
  isPrivateNoindexSpaPath,
  SEO_ROUTES,
  SITE_URL,
} from "@shared/seo-routes";

vi.mock("@shared/preview-hosts", () => ({
  isPreviewHostname: () => false,
}));

function meta(selector: string): string | null {
  return document.head.querySelector<HTMLMetaElement>(selector)?.content ?? null;
}

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
  document.title = "";
  window.history.replaceState({}, "", "/");
});

describe("static route SEO hydration parity", () => {
  it("keeps every exact shared route identical after a divergent page-level call", () => {
    for (const [path, expected] of Object.entries(SEO_ROUTES)) {
      window.history.replaceState({}, "", path);
      document.head.innerHTML =
        '<meta name="robots" content="index, follow">' +
        '<link rel="canonical" href="https://incorrect.example/">';

      const { unmount } = renderHook(() =>
        useSEO({
          title: "Divergent page title",
          description: "Divergent page description.",
          type: expected.type === "article" ? "website" : "article",
          image: "/og/default.png",
          noIndex: expected.noIndex !== true,
          noCanonical: expected.noIndex !== true,
        }),
      );

      const expectedUrl = `${SITE_URL}${path === "/" ? "" : path}`;
      const suppressIndexing =
        expected.noIndex === true || isPrivateNoindexSpaPath(path);

      expect(document.title, path).toBe(expected.title);
      expect(meta('meta[name="description"]'), path).toBe(expected.description);
      expect(meta('meta[property="og:title"]'), path).toBe(expected.title);
      expect(meta('meta[property="og:description"]'), path).toBe(expected.description);
      expect(meta('meta[property="og:type"]'), path).toBe(expected.type ?? "website");
      expect(meta('meta[property="og:url"]'), path).toBe(expectedUrl);
      expect(meta('meta[property="og:image"]'), path).toBe(expected.image);
      expect(meta('meta[name="twitter:title"]'), path).toBe(expected.title);
      expect(meta('meta[name="twitter:description"]'), path).toBe(expected.description);
      expect(meta('meta[name="twitter:image"]'), path).toBe(expected.image);
      expect(meta('meta[name="robots"]'), path).toBe(
        suppressIndexing ? "noindex, nofollow" : "index, follow",
      );

      const canonical = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );
      if (suppressIndexing) {
        expect(canonical, path).toBeNull();
      } else {
        expect(canonical?.getAttribute("href"), path).toBe(expectedUrl);
      }

      unmount();
    }
  });

  it("leaves unregistered detail metadata caller-driven", () => {
    window.history.replaceState({}, "", "/projects/oak-street");

    renderHook(() =>
      useSEO({
        title: "Oak Street Record",
        description: "A data-specific project record.",
        type: "article",
        image: "/og/oak-street.png",
      }),
    );

    expect(document.title).toBe("Oak Street Record · Pegasus Dreamscapes");
    expect(meta('meta[name="description"]')).toBe(
      "A data-specific project record.",
    );
    expect(meta('meta[property="og:type"]')).toBe("article");
    expect(meta('meta[property="og:image"]')).toBe(
      `${SITE_URL}/og/oak-street.png`,
    );
    expect(
      document.head
        .querySelector<HTMLLinkElement>('link[rel="canonical"]')
        ?.getAttribute("href"),
    ).toBe(`${SITE_URL}/projects/oak-street`);
  });
});
