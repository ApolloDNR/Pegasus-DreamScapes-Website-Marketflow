import { describe, expect, it, vi } from "vitest";

const baseUrl = "https://example.replit.app";
const canonicalUrl = "https://pegasusdreamscapes.com";

function makeFetch(expectedCanonicalUrl = baseUrl) {
  return vi.fn(async (url: URL) => {
    const pathname = url.pathname;
    const responses: Record<string, { contentType: string; body: string }> = {
      "/": {
        contentType: "text/html;charset=utf-8",
        body: "<html><title>Pegasus Dreamscapes</title><body>Pegasus Dreamscapes</body></html>",
      },
      "/api/health": {
        contentType: "application/json",
        body: JSON.stringify({ service: "pegasus-dreamscapes-website", status: "ok" }),
      },
      "/api/readiness": {
        contentType: "application/json",
        body: JSON.stringify({
          service: "pegasus-dreamscapes-website",
          status: "ready",
          summary: { requiredFailures: 0 },
        }),
      },
      "/robots.txt": {
        contentType: "text/plain",
        body: `User-agent: *\nAllow: /\nSitemap: ${expectedCanonicalUrl}/sitemap.xml`,
      },
      "/sitemap.xml": {
        contentType: "application/xml",
        body: [
          "<urlset>",
          "/",
          "/submit",
          "/connect",
          "/deal-architecture",
          "/strategy-lab",
          "/work-with-apollo",
          "/marketflow",
          "/disclosures",
          "/privacy",
          "/terms",
        ]
          .map((route) => `<loc>${expectedCanonicalUrl}${route === "/" ? "/" : route}</loc>`)
          .join(""),
      },
    };
    const response = responses[pathname];

    return {
      status: response ? 200 : 404,
      headers: new Headers({ "content-type": response?.contentType || "text/plain" }),
      text: async () => response?.body || "",
    };
  });
}

describe("live launch smoke core", () => {
  it("keeps the production DNS block when the host still points at Squarespace", async () => {
    const { runLaunchSmoke } = await import("../../scripts/live-launch-smoke-core.mjs");

    const result = await runLaunchSmoke({
      baseUrl,
      fetchImpl: makeFetch(),
      resolve4: async () => ["198.185.159.144"],
      resolveCname: async () => [],
    });

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].name).toBe("DNS no longer points at Squarespace");
  });

  it("can skip DNS for a pre-cutover deployment URL while preserving app checks", async () => {
    const { runLaunchSmoke } = await import("../../scripts/live-launch-smoke-core.mjs");
    const resolve4 = vi.fn(async () => ["198.185.159.144"]);

    const result = await runLaunchSmoke({
      baseUrl,
      skipDns: true,
      fetchImpl: makeFetch(),
      resolve4,
      resolveCname: async () => [],
    });

    expect(result.failures).toHaveLength(0);
    expect(resolve4).not.toHaveBeenCalled();
    expect(result.results.map((check) => check.name)).not.toContain("DNS no longer points at Squarespace");
    expect(result.results.map((check) => check.name)).toContain("/api/readiness is production-ready");
  });

  it("can smoke a deployment URL while expecting production canonical robots and sitemap URLs", async () => {
    const { runLaunchSmoke } = await import("../../scripts/live-launch-smoke-core.mjs");

    const result = await runLaunchSmoke({
      baseUrl,
      canonicalUrl,
      skipDns: true,
      fetchImpl: makeFetch(canonicalUrl),
      resolve4: async () => [],
      resolveCname: async () => [],
    });

    expect(result.failures).toHaveLength(0);
    expect(result.baseUrl).toBe(baseUrl);
    expect(result.canonicalUrl).toBe(canonicalUrl);
  });
});
