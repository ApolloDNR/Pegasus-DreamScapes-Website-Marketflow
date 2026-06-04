#!/usr/bin/env node

import { DEFAULT_BASE_URL, runLaunchSmoke } from "./live-launch-smoke-core.mjs";

const args = new Set(process.argv.slice(2));
const baseArg = process.argv.slice(2).find((arg) => arg.startsWith("--base="));
const canonicalArg = process.argv.slice(2).find((arg) => arg.startsWith("--canonical="));
const skipDns = args.has("--skip-dns");

if (args.has("--help")) {
  console.log([
    "Usage: node scripts/live-launch-smoke.mjs [--base=https://pegasusdreamscapes.com] [--canonical=https://pegasusdreamscapes.com] [--skip-dns]",
    "",
    "Checks DNS, /api/health, /api/readiness, robots.txt, sitemap.xml, and the home page.",
    "Use --canonical when a temporary deployment URL should serve production robots and sitemap URLs.",
    "Use --skip-dns only for pre-cutover deployment URL checks, such as a Replit deployment URL before custom-domain DNS is moved.",
    "The default smoke intentionally fails while the production domain still points at Squarespace or readiness is not 200.",
  ].join("\n"));
  process.exit(0);
}

const result = await runLaunchSmoke({
  baseUrl: baseArg?.slice("--base=".length) || process.env.SITE_URL || DEFAULT_BASE_URL,
  canonicalUrl: canonicalArg?.slice("--canonical=".length) || process.env.SITE_URL || baseArg?.slice("--base=".length) || DEFAULT_BASE_URL,
  skipDns,
});

for (const checkResult of result.results) {
  const prefix = checkResult.status === "pass" ? "PASS" : "FAIL";
  console.log(`${prefix} ${checkResult.name}${checkResult.detail ? ` - ${checkResult.detail}` : ""}`);
}

if (result.failures.length) {
  console.error(`\nLive launch smoke failed (${result.failures.length}/${result.results.length}).`);
  process.exit(1);
}

console.log(`\nLive launch smoke passed (${result.results.length} checks) for ${result.baseUrl}.`);
