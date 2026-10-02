import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@shared/preview-hosts", () => ({
  isPreviewHostname: () => false,
}));

import { useSEO } from "@/hooks/use-seo";

describe("useSEO private-route boundary", () => {
  beforeEach(() => {
    document.head.innerHTML =
      '<meta name="robots" content="index, follow">' +
      '<link rel="canonical" href="https://pegasusdreamscapes.com/">';
  });

  it("cannot index or canonicalize an authenticated MarketFlow route even when a caller omits flags", () => {
    window.history.replaceState({}, "", "/marketflow/deals/42");

    renderHook(() =>
      useSEO({
        title: "Deal details",
        description: "Private deal detail.",
      }),
    );

    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
