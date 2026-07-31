import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const repoRoot = resolve(import.meta.dirname, "../..");

function readYaml(path: string): any {
  return parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

describe("production deployment contract", () => {
  it("deploys main only after CI passes and uses the readiness endpoint", () => {
    const blueprint = readYaml("render.yaml");
    const production = blueprint.services.find(
      (service: any) => service.name === "pegasus-dreamscapes",
    );

    expect(production).toMatchObject({
      type: "web",
      runtime: "node",
      branch: "main",
      autoDeployTrigger: "checksPass",
      healthCheckPath: "/api/ready",
    });
    expect(production).not.toHaveProperty("autoDeploy");
  });

  it("keeps the launch environment example check in GitHub verification", () => {
    const workflow = readYaml(".github/workflows/test.yml");
    const commands = workflow.jobs.test.steps
      .map((step: any) => step.run)
      .filter(Boolean);

    expect(commands).toContain("npm run smoke:launch -- --example");
  });

  it("rejects a malformed production HQ endpoint in the launch environment contract", () => {
    const requiredEnvironment = {
      ...process.env,
      APP_ENV: "production",
      DATABASE_URL: "postgresql://launch:launch@localhost:5432/launch",
      SESSION_SECRET: "launch-session-secret",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "launch-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "launch-service-role-key",
      SENDGRID_API_KEY: "launch-sendgrid-key",
      DEFAULT_FROM_EMAIL: "launch@example.com",
      STAFF_NOTIFICATION_EMAIL: "staff@example.com",
      PEGASUS_HQ_PUBLIC_INTAKE_URL: "not-a-url",
      AI_INTEGRATIONS_OPENAI_API_KEY: "launch-openai-key",
    };

    const result = spawnSync(
      process.execPath,
      ["scripts/launch-intake-smoke.mjs", "--env"],
      {
        cwd: repoRoot,
        env: requiredEnvironment,
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "PEGASUS_HQ_PUBLIC_INTAKE_URL must be a valid HTTPS URL in production",
    );
  });

  it("rejects an unencrypted production HQ endpoint", () => {
    const requiredEnvironment = {
      ...process.env,
      APP_ENV: "production",
      DATABASE_URL: "postgresql://launch:launch@localhost:5432/launch",
      SESSION_SECRET: "launch-session-secret",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "launch-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "launch-service-role-key",
      SENDGRID_API_KEY: "launch-sendgrid-key",
      DEFAULT_FROM_EMAIL: "launch@example.com",
      STAFF_NOTIFICATION_EMAIL: "staff@example.com",
      PEGASUS_HQ_PUBLIC_INTAKE_URL:
        "http://hq.example.com/api/public/intake",
      AI_INTEGRATIONS_OPENAI_API_KEY: "launch-openai-key",
    };

    const result = spawnSync(
      process.execPath,
      ["scripts/launch-intake-smoke.mjs", "--env"],
      {
        cwd: repoRoot,
        env: requiredEnvironment,
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "PEGASUS_HQ_PUBLIC_INTAKE_URL must be a valid HTTPS URL in production",
    );
  });

  it("accepts a valid production HQ endpoint in the launch environment contract", () => {
    const requiredEnvironment = {
      ...process.env,
      APP_ENV: "production",
      DATABASE_URL: "postgresql://launch:launch@localhost:5432/launch",
      SESSION_SECRET: "launch-session-secret",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "launch-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "launch-service-role-key",
      SENDGRID_API_KEY: "launch-sendgrid-key",
      DEFAULT_FROM_EMAIL: "launch@example.com",
      STAFF_NOTIFICATION_EMAIL: "staff@example.com",
      PEGASUS_HQ_PUBLIC_INTAKE_URL:
        "https://hq.example.com/api/public/intake",
      AI_INTEGRATIONS_OPENAI_API_KEY: "launch-openai-key",
    };

    expect(() =>
      execFileSync(
        process.execPath,
        ["scripts/launch-intake-smoke.mjs", "--env"],
        {
          cwd: repoRoot,
          env: requiredEnvironment,
          stdio: "pipe",
        },
      ),
    ).not.toThrow();
  });
});
