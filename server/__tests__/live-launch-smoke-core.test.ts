import { describe, expect, it, vi } from "vitest";

const baseUrl = "https://example.replit.app";
const canonicalUrl = "https://pegasusdreamscapes.com";

function makeFetch({
  expectedCanonicalUrl = baseUrl,
  buildCommit = "036c606abcdef1234567890abcdef12345678",
} = {}) {
  return vi.fn(async (url: URL) => {
    const pathname = url.pathname;
    const responses: Record<string, { contentType: string; body: string }> = {
      "/": {
        contentType: "text/html;charset=utf-8",
        body: "<html><title>Pegasus Dreamscapes</title><body>Pegasus Dreamscapes</body></html>",
      },
      "/api/health": {
        contentType: "application/json",
        body: JSON.stringify({
          service: "pegasus-dreamscapes-website",
          status: "ok",
          build: {
            commit: buildCommit,
            shortCommit: buildCommit.slice(0, 7),
            source: "APP_BUILD_COMMIT",
          },
        }),
      },
      "/api/readiness": {
        contentType: "application/json",
        body: JSON.stringify({
          service: "pegasus-dreamscapes-website",
          status: "ready",
          build: {
            commit: buildCommit,
            shortCommit: buildCommit.slice(0, 7),
            source: "APP_BUILD_COMMIT",
          },
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
      fetchImpl: makeFetch({ expectedCanonicalUrl: canonicalUrl }),
      resolve4: async () => [],
      resolveCname: async () => [],
    });

    expect(result.failures).toHaveLength(0);
    expect(result.baseUrl).toBe(baseUrl);
    expect(result.canonicalUrl).toBe(canonicalUrl);
  });

  it("can prove the deployed build commit when build metadata is exposed", async () => {
    const { runLaunchSmoke } = await import("../../scripts/live-launch-smoke-core.mjs");

    const result = await runLaunchSmoke({
      baseUrl,
      expectedCommit: "036c606",
      skipDns: true,
      fetchImpl: makeFetch({ buildCommit: "036c606abcdef1234567890abcdef12345678" }),
      resolve4: async () => [],
      resolveCname: async () => [],
    });

    expect(result.failures).toHaveLength(0);
    expect(result.expectedCommit).toBe("036c606");
    expect(result.results.map((check) => check.name)).toContain("Deployed build matches expected commit");
  });

  it("fails when the deployed build commit does not match the expected commit", async () => {
    const { runLaunchSmoke } = await import("../../scripts/live-launch-smoke-core.mjs");

    const result = await runLaunchSmoke({
      baseUrl,
      expectedCommit: "aaaaaaa",
      skipDns: true,
      fetchImpl: makeFetch({ buildCommit: "bbbbbbbabcdef1234567890abcdef12345678" }),
      resolve4: async () => [],
      resolveCname: async () => [],
    });

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].name).toBe("Deployed build matches expected commit");
    expect(result.failures[0].detail).toContain("Expected deployed commit aaaaaaa");
  });

  it("fails loudly when expected commit input is not a Git SHA", async () => {
    const { runLaunchSmoke } = await import("../../scripts/live-launch-smoke-core.mjs");

    const result = await runLaunchSmoke({
      baseUrl,
      expectedCommit: "latest",
      skipDns: true,
      fetchImpl: makeFetch(),
      resolve4: async () => [],
      resolveCname: async () => [],
    });

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].name).toBe("Expected build commit is valid");
  });

  it("calls out the Replit run shell when a deployment URL is not serving the app", async () => {
    const { runLaunchSmoke } = await import("../../scripts/live-launch-smoke-core.mjs");

    const result = await runLaunchSmoke({
      baseUrl,
      skipDns: true,
      fetchImpl: vi.fn(async () => ({
        status: 404,
        headers: new Headers({ "content-type": "text/html;charset=utf-8" }),
        text: async () => "<!DOCTYPE html><title>Run this app to see the result</title>",
      })),
      resolve4: async () => [],
      resolveCname: async () => [],
    });

    expect(result.failures.length).toBeGreaterThan(0);
    expect(result.failures.map((failure) => failure.detail).join("\n")).toContain("Replit run shell detected");
  });
});
