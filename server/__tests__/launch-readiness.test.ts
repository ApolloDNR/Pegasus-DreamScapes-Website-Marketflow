import { describe, expect, it } from "vitest";
import { getLaunchLiveness, getLaunchReadiness } from "../launch-readiness";

const readyEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:pass@example.com:5432/pegasus",
  SITE_URL: "https://pegasusdreamscapes.com",
  PEGASUS_HQ_PUBLIC_INTAKE_URL: "https://pegasus-hq.example.com/api/public/intake",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  SENDGRID_API_KEY: "SG.fake",
  DEFAULT_FROM_EMAIL: "hello@pegasusdreamscapes.com",
  STAFF_NOTIFICATION_EMAIL: "apollo@pegasusdreamscapes.com",
  SESSION_SECRET: "session-secret-at-least-thirty-two-chars",
  REPL_ID: "repl-id",
};

describe("launch readiness", () => {
  it("passes with production-shaped launch configuration", () => {
    const readiness = getLaunchReadiness(readyEnv);

    expect(readiness.status).toBe("ready");
    expect(readiness.summary.requiredFailures).toBe(0);
    expect(readiness.checks.every((check) => check.status === "pass")).toBe(true);
  });

  it("exposes only safe build metadata on health and readiness", () => {
    const env = {
      ...readyEnv,
      APP_BUILD_COMMIT: "036c606abcdef1234567890abcdef12345678",
    };
    const liveness = getLaunchLiveness(env);
    const readiness = getLaunchReadiness(env);

    expect(liveness.build).toEqual({
      commit: "036c606abcdef1234567890abcdef12345678",
      shortCommit: "036c606",
      source: "APP_BUILD_COMMIT",
    });
    expect(readiness.build).toEqual(liveness.build);
    expect(JSON.stringify(liveness)).not.toContain("postgresql://user:pass");
    expect(JSON.stringify(readiness)).not.toContain("service-role-key");
  });

  it("fails without leaking configured secret values", () => {
    const readiness = getLaunchReadiness({
      ...readyEnv,
      SENDGRID_API_KEY: "",
      SESSION_SECRET: "short",
      SUPABASE_SERVICE_ROLE_KEY: "very-sensitive-value",
    });
    const serialized = JSON.stringify(readiness);

    expect(readiness.status).toBe("not_ready");
    expect(readiness.summary.requiredFailures).toBe(2);
    expect(serialized).not.toContain("very-sensitive-value");
    expect(serialized).not.toContain("session-secret-at-least");
    expect(serialized).not.toContain("SG.fake");
  });

  it("warns rather than blocks for invalid optional configuration", () => {
    const readiness = getLaunchReadiness({
      ...readyEnv,
      ISSUER_URL: "http://issuer.example.com",
    });

    expect(readiness.status).toBe("ready");
    expect(readiness.summary.requiredFailures).toBe(0);
    expect(readiness.summary.warnings).toBe(1);
    expect(readiness.checks.find((check) => check.key === "ISSUER_URL")?.status).toBe("warn");
  });
});
