import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { injectSeo } from "../seo-html";

const htmlShell = readFileSync(
  resolve(import.meta.dirname, "../../client/index.html"),
  "utf8",
);

const homepageHeroPreload =
  /<link\s+rel="preload"\s+as="image"\s+href="\/images\/hero\/pegasus-v6-arrival\.webp"[\s\S]*?>/i;

describe("route-aware homepage LCP preload", () => {
  it("keeps the static shell neutral and injects the hero preload only on home", () => {
    expect(htmlShell).not.toMatch(homepageHeroPreload);
    expect(injectSeo(htmlShell, "/")).toMatch(homepageHeroPreload);
    expect(injectSeo(htmlShell, "/marketflow/deals")).not.toMatch(
      homepageHeroPreload,
    );
  });
});
