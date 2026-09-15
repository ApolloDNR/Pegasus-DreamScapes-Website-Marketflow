#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { z } from "zod";

const REQUIRED_ENV = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SENDGRID_API_KEY",
  "DEFAULT_FROM_EMAIL",
  "STAFF_NOTIFICATION_EMAIL",
  "PEGASUS_HQ_PUBLIC_INTAKE_URL",
  "AI_INTEGRATIONS_OPENAI_API_KEY",
];

const args = process.argv.slice(2);
const VALUE_FLAGS = new Set(["--base-url", "--test-email"]);
const SWITCH_FLAGS = new Set(["--example", "--env", "--post-test-lead", "--help", "-h"]);
const RECEIPT_SCHEMA = z.object({ id: z.string().uuid(), status: z.literal("New") });

function isProductionEnvironment(environment = process.env) {
  if (environment.APP_ENV) {
    return environment.APP_ENV === "production";
  }
  return environment.NODE_ENV === "production";
}

function isValidHqUrl(raw, production) {
  if (!raw?.trim()) return false;
  try {
    const url = new URL(raw);
    if (url.username || url.password) return false;
    if (production) return url.protocol === "https:";
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function has(flag) {
  return args.includes(flag);
}

function valueAfter(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

function validateArguments() {
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if ((!VALUE_FLAGS.has(flag) && !SWITCH_FLAGS.has(flag)) || seen.has(flag)) {
      fail("[launch-smoke] Unknown or repeated option. Use --help for supported options.");
      return false;
    }
    seen.add(flag);
    if (VALUE_FLAGS.has(flag) && (!args[++i] || args[i].startsWith("--"))) {
      fail(`[launch-smoke] ${flag} requires a value.`);
      return false;
    }
  }
  if (has("--post-test-lead") && (!has("--base-url") || !has("--test-email"))) {
    fail("[launch-smoke] --post-test-lead requires --base-url and --test-email for an authorized test recipient.");
    return false;
  }
  if (has("--test-email") && !has("--post-test-lead")) {
    fail("[launch-smoke] --test-email is only used with --post-test-lead.");
    return false;
  }
  if (has("--test-email") && !z.string().trim().email().max(255).safeParse(valueAfter("--test-email")).success) {
    fail("[launch-smoke] --test-email must be a valid test recipient address.");
    return false;
  }
  return true;
}

function usage() {
  return `Usage:
  node scripts/launch-intake-smoke.mjs --example
  node scripts/launch-intake-smoke.mjs --env
  node scripts/launch-intake-smoke.mjs --base-url https://site.example
  node scripts/launch-intake-smoke.mjs --base-url https://site.example --post-test-lead --test-email YOUR_TEST_EMAIL

Modes:
  --example         Verify .env.example lists the required production variables.
  --env             Verify the current process environment has required variables.
  --base-url URL     Check JSON health and database/configuration readiness at this exact origin.
  --post-test-lead   Send one marked test opportunity after the selected checks pass.
  --test-email EMAIL Authorized recipient for the test submission's customer notification.

Read-only by default. A test POST can send staff and customer notifications.
Successful checks do not prove HQ or email delivery; verify those receipts separately.
`;
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function checkExample() {
  const source = await readFile(".env.example", "utf8");
  const missing = REQUIRED_ENV.filter((name) => !new RegExp(`^${name}=`, "m").test(source));
  if (missing.length) {
    fail(`[launch-smoke] .env.example is missing: ${missing.join(", ")}`);
    return false;
  }
  console.log(`[launch-smoke] .env.example lists ${REQUIRED_ENV.length} required production variables.`);
  return true;
}

function checkRuntimeEnv() {
  const production = isProductionEnvironment();
  const required = production
    ? REQUIRED_ENV
    : REQUIRED_ENV.filter(
        (name) => name !== "PEGASUS_HQ_PUBLIC_INTAKE_URL",
      );
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    fail(`[launch-smoke] runtime env is missing: ${missing.join(", ")}`);
    return false;
  }

  const hqEndpoint = process.env.PEGASUS_HQ_PUBLIC_INTAKE_URL;
  if (hqEndpoint && !isValidHqUrl(hqEndpoint, production)) {
    fail(
      production
        ? "[launch-smoke] PEGASUS_HQ_PUBLIC_INTAKE_URL must be a valid HTTPS URL in production."
        : "[launch-smoke] PEGASUS_HQ_PUBLIC_INTAKE_URL must be a valid http(s) URL.",
    );
    return false;
  }

  console.log(
    `[launch-smoke] runtime env has ${required.length} required variables.`,
  );
  return true;
}

function normalizeBaseUrl(raw) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash
    ) throw new Error("invalid origin");
    return url.origin;
  } catch {
    fail("[launch-smoke] --base-url must be an HTTP(S) origin without credentials, a path, query, or fragment.");
    return null;
  }
}

async function requestJson(baseUrl, path, options = {}) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      ...options,
      redirect: "error",
      // Keep the deadline active while reading the response body as well.
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      fail(`[launch-smoke] ${path} returned ${response.status}. No response body logged.`);
      return null;
    }
    if (!/^application\/json\b/i.test(response.headers.get("content-type") || "")) {
      fail(`[launch-smoke] ${path} did not return JSON.`);
      return null;
    }
    const body = await response.json();
    return { status: response.status, body };
  } catch {
    fail(`[launch-smoke] ${path} request failed or timed out, or returned invalid JSON. No automatic retry was sent.`);
    return null;
  }
}

async function checkStatus(baseUrl, path, expectedStatus) {
  const response = await requestJson(baseUrl, path);
  if (!response) return false;
  if (response.status !== 200 || response.body?.status !== expectedStatus) {
    fail(`[launch-smoke] ${path} did not confirm ${expectedStatus}.`);
    return false;
  }
  console.log(`[launch-smoke] ${path} confirmed ${expectedStatus}.`);
  return true;
}

async function postTestOpportunity(baseUrl, testEmail) {
  const payload = {
    hp_company: "",
    ts_elapsed_ms: 5000,
    sourcePage: "/bring-an-opportunity",
    leadSource: "launch_smoke",
    visitorType: "owner",
    contactName: "Launch Smoke",
    email: testEmail,
    propertyAddress: "123 Launch Smoke Test",
    city: "Concord",
    state: "CA",
    situation: "Just exploring",
    goal: "Not sure",
    notes: "Launch smoke test. Discard after confirming lead row, HQ outbox/forwarding, and staff notification.",
    consentAccepted: true,
  };

  const response = await requestJson(baseUrl, "/api/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response) return;
  const receipt = RECEIPT_SCHEMA.safeParse(response.body);
  if (response.status !== 201 || !receipt.success) {
    fail("[launch-smoke] POST /api/opportunities did not return a canonical 201 receipt with a UUID and New status. Check existing records before rerunning; no automatic retry was sent.");
    return;
  }

  const id = receipt.data.id;
  console.log(`[launch-smoke] POST /api/opportunities accepted test opportunity. response id: ${id}`);
  console.log("[launch-smoke] Manual proof still required: confirm the opportunity row, correlated hq_outbox forwarded state and traceable HQ receipt, and staff/customer notification receipts. Queued is not delivered.");
}

async function main() {
  if (!args.length || has("--help") || has("-h")) {
    console.log(usage());
    return;
  }

  if (!validateArguments()) return;
  const baseUrl = normalizeBaseUrl(valueAfter("--base-url"));
  if (has("--base-url") && !baseUrl) return;
  if (has("--example") && !(await checkExample())) return;
  if (has("--env") && !checkRuntimeEnv()) return;

  if (baseUrl) {
    if (!(await checkStatus(baseUrl, "/api/health", "ok"))) return;
    if (!(await checkStatus(baseUrl, "/api/ready", "ready"))) return;
    console.log("[launch-smoke] Site readiness passed. This does not prove HQ or email delivery.");
    if (has("--post-test-lead")) {
      await postTestOpportunity(baseUrl, valueAfter("--test-email").trim());
    } else {
      console.log("[launch-smoke] No submission sent. Use --post-test-lead with --test-email only for an authorized test.");
    }
  }
}

main().catch(() => {
  fail("[launch-smoke] Check failed. Verify the local environment and input files; no untrusted error detail logged.");
});
