type CheckStatus = "pass" | "fail" | "warn";

type LaunchCheck = {
  key: string;
  label: string;
  required: boolean;
  status: CheckStatus;
  message: string;
};

type CheckDefinition = {
  key: string;
  label: string;
  required: boolean;
  validate: (value: string) => boolean;
  passMessage: string;
  failMessage: string;
};

const requiredChecks: CheckDefinition[] = [
  {
    key: "DATABASE_URL",
    label: "Postgres database URL",
    required: true,
    validate: (value) => /^postgres(ql)?:\/\//i.test(value),
    passMessage: "Postgres URL is configured.",
    failMessage: "Missing or invalid Postgres URL.",
  },
  {
    key: "SITE_URL",
    label: "Canonical public website URL",
    required: true,
    validate: (value) => isHttpsUrl(value) && new URL(value).host === "pegasusdreamscapes.com",
    passMessage: "Canonical production URL is configured.",
    failMessage: "Set SITE_URL to https://pegasusdreamscapes.com.",
  },
  {
    key: "PEGASUS_HQ_PUBLIC_INTAKE_URL",
    label: "Pegasus HQ public intake endpoint",
    required: true,
    validate: (value) => isHttpsUrl(value) && new URL(value).pathname.includes("/api/public/intake"),
    passMessage: "HQ intake endpoint is configured.",
    failMessage: "Missing or invalid HQ public intake endpoint.",
  },
  {
    key: "SUPABASE_URL",
    label: "Supabase project URL",
    required: true,
    validate: isHttpsUrl,
    passMessage: "Supabase project URL is configured.",
    failMessage: "Missing or invalid Supabase project URL.",
  },
  {
    key: "SUPABASE_ANON_KEY",
    label: "Supabase anonymous client key",
    required: true,
    validate: hasValue,
    passMessage: "Supabase anonymous key is present.",
    failMessage: "Missing Supabase anonymous key.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase service role key",
    required: true,
    validate: hasValue,
    passMessage: "Supabase service role key is present.",
    failMessage: "Missing Supabase service role key.",
  },
  {
    key: "SENDGRID_API_KEY",
    label: "SendGrid API key",
    required: true,
    validate: hasValue,
    passMessage: "SendGrid API key is present.",
    failMessage: "Missing SendGrid API key.",
  },
  {
    key: "DEFAULT_FROM_EMAIL",
    label: "Verified sender email",
    required: true,
    validate: isEmail,
    passMessage: "Default sender email is configured.",
    failMessage: "Missing or invalid verified sender email.",
  },
  {
    key: "STAFF_NOTIFICATION_EMAIL",
    label: "Staff notification inbox",
    required: true,
    validate: isEmail,
    passMessage: "Staff notification inbox is configured.",
    failMessage: "Missing or invalid staff notification inbox.",
  },
  {
    key: "SESSION_SECRET",
    label: "Express session secret",
    required: true,
    validate: (value) => value.length >= 32,
    passMessage: "Session secret length is acceptable.",
    failMessage: "Missing session secret or value is too short.",
  },
  {
    key: "REPL_ID",
    label: "Replit OIDC client id",
    required: true,
    validate: hasValue,
    passMessage: "Replit OIDC client id is present.",
    failMessage: "Missing Replit OIDC client id.",
  },
];

const optionalChecks: CheckDefinition[] = [
  {
    key: "ISSUER_URL",
    label: "Replit OIDC issuer URL",
    required: false,
    validate: (value) => !value || isHttpsUrl(value),
    passMessage: "Issuer URL is empty or valid.",
    failMessage: "Issuer URL must be HTTPS when provided.",
  },
  {
    key: "PORT",
    label: "Server port",
    required: false,
    validate: (value) => !value || (/^\d+$/.test(value) && Number(value) > 0),
    passMessage: "Server port is empty or valid.",
    failMessage: "Server port must be a positive number when provided.",
  },
];

export function getLaunchLiveness(env: NodeJS.ProcessEnv = process.env) {
  return {
    service: "pegasus-dreamscapes-website",
    status: "ok",
    environment: normalize(env.NODE_ENV) || "development",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  };
}

export function getLaunchReadiness(env: NodeJS.ProcessEnv = process.env) {
  const checks = [...requiredChecks, ...optionalChecks].map((definition) => runCheck(definition, env));
  const failures = checks.filter((check) => check.status === "fail");
  const requiredFailures = failures.filter((check) => check.required);
  const warnings = checks.filter((check) => check.status === "warn");

  return {
    service: "pegasus-dreamscapes-website",
    status: requiredFailures.length === 0 ? "ready" : "not_ready",
    environment: normalize(env.NODE_ENV) || "development",
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter((check) => check.status === "pass").length,
      failed: failures.length,
      warnings: warnings.length,
      requiredFailures: requiredFailures.length,
    },
  };
}

function runCheck(definition: CheckDefinition, env: NodeJS.ProcessEnv): LaunchCheck {
  const value = normalize(env[definition.key]);
  const valid = definition.validate(value);
  if (valid) {
    return {
      key: definition.key,
      label: definition.label,
      required: definition.required,
      status: "pass",
      message: definition.passMessage,
    };
  }

  return {
    key: definition.key,
    label: definition.label,
    required: definition.required,
    status: definition.required ? "fail" : "warn",
    message: definition.failMessage,
  };
}

function normalize(value: string | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function hasValue(value: string) {
  return Boolean(value);
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
