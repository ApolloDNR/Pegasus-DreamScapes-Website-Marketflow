import dns from "node:dns/promises";

export const DEFAULT_BASE_URL = "https://pegasusdreamscapes.com";

const SQUARESPACE_IPS = new Set(["198.185.159.144", "198.185.159.145", "198.49.23.144", "198.49.23.145"]);
const REQUIRED_SITEMAP_ROUTES = [
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
];

export async function runLaunchSmoke({
  baseUrl = DEFAULT_BASE_URL,
  canonicalUrl = baseUrl,
  skipDns = false,
  fetchImpl = globalThis.fetch,
  resolve4 = dns.resolve4,
  resolveCname = dns.resolveCname,
} = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const normalizedCanonicalUrl = normalizeBaseUrl(canonicalUrl);
  const base = new URL(normalizedBaseUrl);
  const dnsHosts = base.hostname.startsWith("www.") ? [base.hostname] : [base.hostname, `www.${base.hostname}`];
  const results = [];

  async function check(name, run) {
    try {
      await run();
      results.push({ name, status: "pass" });
    } catch (error) {
      results.push({ name, status: "fail", detail: error instanceof Error ? error.message : String(error) });
    }
  }

  if (!skipDns) {
    await check("DNS no longer points at Squarespace", async () => {
      const allRecords = await Promise.all(
        dnsHosts.map(async (hostname) => ({ hostname, ...(await lookupDns(hostname, resolve4, resolveCname)) })),
      );
      const squarespaceRecords = allRecords.filter((records) => {
        const squareSpaceAddresses = records.addresses.filter((address) => SQUARESPACE_IPS.has(address));
        const squareSpaceCnames = records.cnames.filter((name) => name.includes("squarespace") || name.includes("ext-sq"));
        return squareSpaceAddresses.length > 0 || squareSpaceCnames.length > 0;
      });

      assert(
        squarespaceRecords.length === 0,
        `Current records still look like Squarespace: ${squarespaceRecords.map(formatDns).join(" | ")}`,
      );
    });
  }

  await check("Home page serves Pegasus Dreamscapes", async () => {
    const res = await request("/", normalizedBaseUrl, fetchImpl);
    assert(res.status === 200, `Expected 200, received ${res.status}.`);
    assert(res.body.includes("Pegasus Dreamscapes"), "Home page does not contain Pegasus Dreamscapes.");
    assert(!res.body.includes("Squarespace"), "Home page still appears to be served by Squarespace.");
  });

  await check("/api/health is the Pegasus Express server", async () => {
    const body = await requestJson("/api/health", 200, normalizedBaseUrl, fetchImpl);
    assert(body.service === "pegasus-dreamscapes-website", "Health response does not identify the Pegasus website service.");
    assert(body.status === "ok", `Health status is ${body.status || "missing"}.`);
  });

  await check("/api/readiness is production-ready", async () => {
    const body = await requestJson("/api/readiness", 200, normalizedBaseUrl, fetchImpl);
    assert(body.service === "pegasus-dreamscapes-website", "Readiness response does not identify the Pegasus website service.");
    assert(body.status === "ready", `Readiness status is ${body.status || "missing"}.`);
    assert(body.summary?.requiredFailures === 0, `Readiness has ${body.summary?.requiredFailures ?? "unknown"} required failures.`);
  });

  await check("/robots.txt exposes production crawl policy", async () => {
    const res = await request("/robots.txt", normalizedBaseUrl, fetchImpl);
    assert(res.status === 200, `Expected 200, received ${res.status}.`);
    assert(res.body.includes("Allow: /"), "robots.txt is missing Allow: /.");
    assert(!/^Disallow: \/\s*$/m.test(res.body), "robots.txt is still fully disallowing the site.");
    assert(res.body.includes(`${normalizedCanonicalUrl}/sitemap.xml`), "robots.txt is missing the production sitemap URL.");
  });

  await check("/sitemap.xml lists launch routes", async () => {
    const res = await request("/sitemap.xml", normalizedBaseUrl, fetchImpl);
    assert(res.status === 200, `Expected 200, received ${res.status}.`);
    for (const route of REQUIRED_SITEMAP_ROUTES) {
      const loc = `${normalizedCanonicalUrl}${route === "/" ? "/" : route}`;
      assert(res.body.includes(`<loc>${loc}</loc>`), `sitemap.xml is missing ${route}.`);
    }
  });

  const failures = results.filter((result) => result.status === "fail");

  return {
    baseUrl: normalizedBaseUrl,
    canonicalUrl: normalizedCanonicalUrl,
    results,
    failures,
  };
}

async function lookupDns(hostname, resolve4, resolveCname) {
  const [addresses, cnames] = await Promise.all([
    resolve4(hostname).catch(() => []),
    resolveCname(hostname).catch(() => []),
  ]);

  return { addresses, cnames };
}

async function requestJson(pathname, expectedStatus, baseUrl, fetchImpl) {
  const res = await request(pathname, baseUrl, fetchImpl);
  assert(res.status === expectedStatus, `Expected ${expectedStatus}, received ${res.status}. Body starts: ${res.body.slice(0, 80)}`);
  assert(res.contentType.includes("application/json"), `Expected JSON, received ${res.contentType || "no content-type"}.`);

  try {
    return JSON.parse(res.body);
  } catch {
    throw new Error("Response was not parseable JSON.");
  }
}

async function request(pathname, baseUrl, fetchImpl) {
  const url = new URL(pathname, baseUrl);
  const res = await fetchImpl(url, {
    headers: {
      "accept": pathname.startsWith("/api/") ? "application/json" : "text/html,application/xml,text/plain,*/*",
      "user-agent": "PegasusLaunchSmoke/1.0",
    },
    redirect: "follow",
  });

  return {
    status: res.status,
    contentType: res.headers.get("content-type") || "",
    body: await res.text(),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function formatDns(records) {
  const parts = [];
  if (records.addresses.length) parts.push(`A=${records.addresses.join(",")}`);
  if (records.cnames.length) parts.push(`CNAME=${records.cnames.join(",")}`);
  return `${records.hostname}: ${parts.join(" ") || "no A/CNAME records found"}`;
}
