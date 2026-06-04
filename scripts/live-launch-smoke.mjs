#!/usr/bin/env node

import dns from "node:dns/promises";

const DEFAULT_BASE_URL = "https://pegasusdreamscapes.com";
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

const args = new Set(process.argv.slice(2));
const baseArg = process.argv.slice(2).find((arg) => arg.startsWith("--base="));

if (args.has("--help")) {
  console.log([
    "Usage: node scripts/live-launch-smoke.mjs [--base=https://pegasusdreamscapes.com]",
    "",
    "Checks DNS, /api/health, /api/readiness, robots.txt, sitemap.xml, and the home page.",
    "The smoke intentionally fails while the domain still points at Squarespace or readiness is not 200.",
  ].join("\n"));
  process.exit(0);
}

const baseUrl = normalizeBaseUrl(baseArg?.slice("--base=".length) || process.env.SITE_URL || DEFAULT_BASE_URL);
const base = new URL(baseUrl);
const dnsHosts = base.hostname.startsWith("www.") ? [base.hostname] : [base.hostname, `www.${base.hostname}`];
const results = [];

await check("DNS no longer points at Squarespace", async () => {
  const allRecords = await Promise.all(dnsHosts.map(async (hostname) => ({ hostname, ...(await lookupDns(hostname)) })));
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

await check("Home page serves Pegasus Dreamscapes", async () => {
  const res = await request("/");
  assert(res.status === 200, `Expected 200, received ${res.status}.`);
  assert(res.body.includes("Pegasus Dreamscapes"), "Home page does not contain Pegasus Dreamscapes.");
  assert(!res.body.includes("Squarespace"), "Home page still appears to be served by Squarespace.");
});

await check("/api/health is the Pegasus Express server", async () => {
  const body = await requestJson("/api/health", 200);
  assert(body.service === "pegasus-dreamscapes-website", "Health response does not identify the Pegasus website service.");
  assert(body.status === "ok", `Health status is ${body.status || "missing"}.`);
});

await check("/api/readiness is production-ready", async () => {
  const body = await requestJson("/api/readiness", 200);
  assert(body.service === "pegasus-dreamscapes-website", "Readiness response does not identify the Pegasus website service.");
  assert(body.status === "ready", `Readiness status is ${body.status || "missing"}.`);
  assert(body.summary?.requiredFailures === 0, `Readiness has ${body.summary?.requiredFailures ?? "unknown"} required failures.`);
});

await check("/robots.txt exposes production crawl policy", async () => {
  const res = await request("/robots.txt");
  assert(res.status === 200, `Expected 200, received ${res.status}.`);
  assert(res.body.includes("Allow: /"), "robots.txt is missing Allow: /.");
  assert(!/^Disallow: \/\s*$/m.test(res.body), "robots.txt is still fully disallowing the site.");
  assert(res.body.includes(`${baseUrl}/sitemap.xml`), "robots.txt is missing the production sitemap URL.");
});

await check("/sitemap.xml lists launch routes", async () => {
  const res = await request("/sitemap.xml");
  assert(res.status === 200, `Expected 200, received ${res.status}.`);
  for (const route of REQUIRED_SITEMAP_ROUTES) {
    const loc = `${baseUrl}${route === "/" ? "/" : route}`;
    assert(res.body.includes(`<loc>${loc}</loc>`), `sitemap.xml is missing ${route}.`);
  }
});

const failures = results.filter((result) => result.status === "fail");

for (const result of results) {
  const prefix = result.status === "pass" ? "PASS" : "FAIL";
  console.log(`${prefix} ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}

if (failures.length) {
  console.error(`\nLive launch smoke failed (${failures.length}/${results.length}).`);
  process.exit(1);
}

console.log(`\nLive launch smoke passed (${results.length} checks) for ${baseUrl}.`);

async function check(name, run) {
  try {
    await run();
    results.push({ name, status: "pass" });
  } catch (error) {
    results.push({ name, status: "fail", detail: error instanceof Error ? error.message : String(error) });
  }
}

async function lookupDns(hostname) {
  const [addresses, cnames] = await Promise.all([
    dns.resolve4(hostname).catch(() => []),
    dns.resolveCname(hostname).catch(() => []),
  ]);

  return { addresses, cnames };
}

async function requestJson(pathname, expectedStatus) {
  const res = await request(pathname);
  assert(res.status === expectedStatus, `Expected ${expectedStatus}, received ${res.status}. Body starts: ${res.body.slice(0, 80)}`);
  assert(res.contentType.includes("application/json"), `Expected JSON, received ${res.contentType || "no content-type"}.`);

  try {
    return JSON.parse(res.body);
  } catch {
    throw new Error("Response was not parseable JSON.");
  }
}

async function request(pathname) {
  const url = new URL(pathname, baseUrl);
  const res = await fetch(url, {
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
