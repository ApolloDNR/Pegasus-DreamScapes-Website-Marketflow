#!/usr/bin/env node

import { readFile } from "node:fs/promises";

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

function usage() {
  return `Usage:
  node scripts/launch-intake-smoke.mjs --example
  node scripts/launch-intake-smoke.mjs --env
  node scripts/launch-intake-smoke.mjs --base-url https://site.example --post-test-lead

Modes:
  --example         Verify .env.example lists the required production variables.
  --env             Verify the current process environment has required variables.
  --base-url URL    Deployed site origin to check.
  --post-test-lead  Send a clearly marked discardable opportunity through the canonical intake.
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
    return;
  }
  console.log(`[launch-smoke] .env.example lists ${REQUIRED_ENV.length} required production variables.`);
}

function checkRuntimeEnv() {
  const production = isProductionEnvironment();
  const required = production
    ? REQUIRED_ENV
    : REQUIRED_ENV.filter(
        (name) => name !== "PEGASUS_HQ_PUBLIC_INTAKE_URL",
      );
  const missing = required.filter((name) => !process.env[name]);
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
    return `${url.protocol}//${url.host}`;
  } catch {
    fail(`[launch-smoke] invalid --base-url: ${raw}`);
    return null;
  }
}

async function checkHealth(baseUrl) {
  const response = await fetch(`${baseUrl}/api/health`, { method: "GET" });
  if (!response.ok) {
    fail(`[launch-smoke] ${baseUrl}/api/health returned ${response.status}.`);
    return false;
  }
  console.log(`[launch-smoke] health check returned ${response.status}.`);
  return true;
}

async function postTestOpportunity(baseUrl) {
  const payload = {
    hp_company: "",
    ts_elapsed_ms: 5000,
    sourcePage: "/bring-an-opportunity",
    leadSource: "launch_smoke",
    visitorType: "owner",
    contactName: "Launch Smoke",
    email: "apollo+launch-smoke@pegasusdreamscapes.com",
    phone: "9257448525",
    propertyAddress: "123 Launch Smoke Test",
    city: "Concord",
    state: "CA",
    situation: "Just exploring",
    goal: "Not sure",
    notes: "Launch smoke test. Discard after confirming lead row, HQ outbox/forwarding, and staff notification.",
    consentAccepted: true,
  };

  const response = await fetch(`${baseUrl}/api/opportunities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text.slice(0, 500) };
  }

  if (!response.ok) {
    fail(`[launch-smoke] POST /api/opportunities returned ${response.status}: ${JSON.stringify(body)}`);
    return;
  }

  const id = body?.id ?? body?.opportunity?.id ?? "unknown";
  console.log(`[launch-smoke] POST /api/opportunities accepted test opportunity. response id: ${id}`);
  console.log("[launch-smoke] Manual proof still required: confirm opportunity row, hq_outbox forward/queued state, and staff/customer notification emails.");
}

async function main() {
  if (!args.length || has("--help") || has("-h")) {
    console.log(usage());
    return;
  }

  if (has("--example")) {
    await checkExample();
  }

  if (has("--env")) {
    checkRuntimeEnv();
  }

  const baseUrl = normalizeBaseUrl(valueAfter("--base-url"));
  if (baseUrl) {
    const healthy = await checkHealth(baseUrl);
    if (healthy && has("--post-test-lead")) {
      await postTestOpportunity(baseUrl);
    } else if (healthy) {
      console.log("[launch-smoke] skipped POST /api/opportunities. Add --post-test-lead to create a marked test opportunity.");
    }
  }
}

main().catch((error) => {
  fail(`[launch-smoke] ${error?.message || String(error)}`);
});
