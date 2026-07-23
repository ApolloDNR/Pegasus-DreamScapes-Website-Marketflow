import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSEO } from "@/hooks/use-seo";

describe("useSEO preview boundary", () => {
  it("keeps a preview noindexed and removes the production canonical after hydration", () => {
    window.history.replaceState({}, "", "/about");
    document.head.innerHTML =
      '<meta name="robots" content="index, follow">' +
      '<link rel="canonical" href="https://pegasusdreamscapes.com/about">';

    renderHook(() =>
      useSEO({
        title: "About",
        description: "About Pegasus Dreamscapes.",
      }),
    );

    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow, noarchive, nosnippet",
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `${window.location.origin}/about`,
    );
  });
});
