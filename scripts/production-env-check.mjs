#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_FILE = path.join(ROOT, ".env");

const fileEnv = existsSync(ENV_FILE) ? parseEnv(readFileSync(ENV_FILE, "utf8")) : {};

const required = [
  {
    key: "DATABASE_URL",
    label: "Postgres database URL",
    validate: (value) => /^postgres(ql)?:\/\//i.test(value),
    hint: "Must be a postgres:// or postgresql:// URL.",
  },
  {
    key: "SITE_URL",
    label: "Canonical public website URL",
    validate: (value) => isHttpsUrl(value) && new URL(value).host === "pegasusdreamscapes.com",
    hint: "Set to https://pegasusdreamscapes.com for production.",
  },
  {
    key: "PEGASUS_HQ_PUBLIC_INTAKE_URL",
    label: "Pegasus HQ public intake endpoint",
    validate: (value) => isHttpsUrl(value) && new URL(value).pathname.includes("/api/public/intake"),
    hint: "Must be the HTTPS HQ public intake endpoint.",
  },
  {
    key: "SUPABASE_URL",
    label: "Supabase project URL",
    validate: isHttpsUrl,
    hint: "Must be an HTTPS Supabase project URL.",
  },
  {
    key: "SUPABASE_ANON_KEY",
    label: "Supabase anonymous client key",
    validate: hasValue,
    hint: "Required for Supabase client auth/config responses.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase service role key",
    validate: hasValue,
    hint: "Required for server-side Supabase admin fallbacks.",
  },
  {
    key: "SENDGRID_API_KEY",
    label: "SendGrid API key",
    validate: hasValue,
    hint: "Required before launch email smoke testing.",
  },
  {
    key: "DEFAULT_FROM_EMAIL",
    label: "Verified sender email",
    validate: isEmail,
    hint: "Must be a verified sender in SendGrid.",
  },
  {
    key: "STAFF_NOTIFICATION_EMAIL",
    label: "Staff notification inbox",
    validate: isEmail,
    hint: "Must be the inbox that receives website lead notifications.",
  },
  {
    key: "SESSION_SECRET",
    label: "Express session secret",
    validate: (value) => value.length >= 32,
    hint: "Use a private random value at least 32 characters long.",
  },
  {
    key: "REPL_ID",
    label: "Replit OIDC client id",
    validate: hasValue,
    hint: "Required because the current server registers Replit Auth routes.",
  },
];

const optional = [
  {
    key: "ISSUER_URL",
    label: "Replit OIDC issuer URL",
    validate: (value) => !value || isHttpsUrl(value),
    hint: "Optional; defaults to https://replit.com/oidc.",
  },
  {
    key: "PORT",
    label: "Server port",
    validate: (value) => !value || (/^\d+$/.test(value) && Number(value) > 0),
    hint: "Optional; defaults to 5000.",
  },
];

let checks = 0;
const failures = [];

for (const item of required) {
  const value = envValue(item.key);
  checks += 1;
  if (!value) {
    failures.push(`${item.key} missing: ${item.label}. ${item.hint}`);
    continue;
  }

  if (!item.validate(value)) {
    failures.push(`${item.key} invalid: ${item.label}. ${item.hint}`);
  }
}

for (const item of optional) {
  const value = envValue(item.key);
  checks += 1;
  if (value && !item.validate(value)) {
    failures.push(`${item.key} invalid: ${item.label}. ${item.hint}`);
  }
}

if (failures.length) {
  console.error("Production environment check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("\nNo secret values were printed. Set the missing values in the host environment or local .env, then rerun npm run env:production.");
  process.exit(1);
}

console.log(`Production environment check passed (${checks} checks). No secret values printed.`);

function envValue(key) {
  const processValue = normalize(process.env[key]);
  if (processValue) return processValue;
  return normalize(fileEnv[key]);
}

function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasValue(value) {
  return Boolean(value);
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseEnv(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}
