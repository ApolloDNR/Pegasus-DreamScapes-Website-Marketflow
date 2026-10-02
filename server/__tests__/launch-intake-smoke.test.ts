import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../..");
const recordId = "77d04035-01b5-4873-a38c-96789ac59695";
const baseArgs = ["--base-url", "https://release.example.test"];
const postArgs = [...baseArgs, "--post-test-lead", "--test-email", "tester@example.test"];

// Exercise the actual CLI in a separate process. Every request is intercepted;
// these tests never contact a deployment, create a lead, or send an email.
const preload = `
const fixtures = JSON.parse(process.env.SMOKE_FIXTURES);
globalThis.fetch = async (url, options = {}) => {
  const path = new URL(url).pathname;
  console.log('[fixture-request] ' + JSON.stringify({
    path, method: options.method || 'GET', redirect: options.redirect,
    hasDeadline: options.signal instanceof AbortSignal,
    body: options.body ? JSON.parse(options.body) : undefined,
  }));
  const fixture = fixtures[path];
  if (!fixture) throw new Error('Unexpected request');
  if (fixture.networkError) throw new Error('PRIVATE_NETWORK_DIAGNOSTIC');
  return new Response(
    fixture.raw ?? JSON.stringify(fixture.body),
    {status: fixture.status ?? 200, headers: {'Content-Type': fixture.contentType ?? 'application/json'}},
  );
};
`;

function run(args: string[], fixtures: Record<string, unknown> = {}, environment = {}) {
  const result = spawnSync(process.execPath, [
    "--import", `data:text/javascript;base64,${Buffer.from(preload).toString("base64")}`,
    "scripts/launch-intake-smoke.mjs", ...args,
  ], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 5000,
    env: {
      ...process.env,
      APP_ENV: "production",
      DATABASE_URL: "",
      SESSION_SECRET: "",
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      SENDGRID_API_KEY: "",
      DEFAULT_FROM_EMAIL: "",
      STAFF_NOTIFICATION_EMAIL: "",
      PEGASUS_HQ_PUBLIC_INTAKE_URL: "",
      AI_INTEGRATIONS_OPENAI_API_KEY: "",
      SMOKE_FIXTURES: JSON.stringify(fixtures),
      ...environment,
    },
  });
  expect(result.error).toBeUndefined();
  const requests = result.stdout.split("\n")
    .filter((line) => line.startsWith("[fixture-request] "))
    .map((line) => JSON.parse(line.slice("[fixture-request] ".length)));
  return { ...result, requests };
}

const ready = {
  "/api/health": { body: { status: "ok" } },
  "/api/ready": { body: { status: "ready" } },
};

describe("launch intake smoke, CLI behavior", () => {
  it("checks health and readiness without sending a submission by default", () => {
    const result = run(baseArgs, ready);
    expect(result.status).toBe(0);
    expect(result.requests.map((request) => request.path)).toEqual(["/api/health", "/api/ready"]);
    expect(result.requests.every((request) => request.method === "GET")).toBe(true);
    expect(result.stdout).toContain("No submission sent");
    expect(result.stdout).toContain("does not prove HQ or email delivery");
  });

  it("blocks submission when the process is healthy but the database is unavailable", () => {
    const result = run(postArgs, {
      ...ready,
      "/api/ready": { status: 503, body: { status: "unavailable" } },
    });
    expect(result.status).toBe(1);
    expect(result.requests.map((request) => request.path)).toEqual(["/api/health", "/api/ready"]);
    expect(result.stderr).toContain("/api/ready");
  });

  it.each(["/api/health", "/api/ready"])("rejects an HTML sign-in page at %s", (path) => {
    const result = run(postArgs, {
      ...ready,
      [path]: { raw: "<html>Private sign-in page</html>", contentType: "text/html" },
    });
    expect(result.status).toBe(1);
    expect(result.requests.some((request) => request.method === "POST")).toBe(false);
    expect(result.stderr).toContain(path);
    expect(result.stderr).not.toContain("Private sign-in");
  });

  it("rejects a 200 readiness response that does not declare ready", () => {
    const result = run(postArgs, { ...ready, "/api/ready": { body: { status: "unavailable" } } });
    expect(result.status).toBe(1);
    expect(result.requests.some((request) => request.method === "POST")).toBe(false);
  });

  it("stops before any request when a requested environment check fails", () => {
    const result = run(["--env", ...postArgs], ready);
    expect(result.status).toBe(1);
    expect(result.requests).toEqual([]);
    expect(result.stderr).toContain("runtime env is missing");
  });

  it.each([
    ["--base-url"],
    ["--post-test-lead"],
    [...baseArgs, "--post-test-lead"],
    [...baseArgs, "--post-test-led"],
    [...postArgs, "--base-url", "https://another.example.test"],
    [...baseArgs, "--test-email", "tester@example.test"],
    [...baseArgs, "--post-test-lead", "--test-email", "invalid"],
  ])("rejects incomplete or ambiguous invocation %j before requests", (...args) => {
    const result = run(args, ready);
    expect(result.status).toBe(1);
    expect(result.requests).toEqual([]);
  });

  it.each([
    "ftp://release.example.test",
    "https://secret-user:secret-password@release.example.test",
    "https://release.example.test/path",
    "https://release.example.test/?token=private-value",
    "https://release.example.test/#anchor",
  ])("rejects a non-origin URL without exposing it", (url) => {
    const result = run(["--base-url", url], ready);
    expect(result.status).toBe(1);
    expect(result.requests).toEqual([]);
    expect(result.stderr).not.toContain(url);
    expect(result.stderr).not.toContain("secret-password");
    expect(result.stderr).not.toContain("private-value");
  });

  it.each([
    { status: 200, body: { accepted: true } },
    { status: 201, body: {} },
    { status: 201, body: { id: "unknown", status: "New" } },
    { status: 201, body: { id: recordId, status: "unavailable" } },
    { status: 201, raw: "<html>Created</html>", contentType: "text/html" },
  ])("does not call an untraceable response accepted: %j", (receipt) => {
    const result = run(postArgs, { ...ready, "/api/opportunities": receipt });
    expect(result.status).toBe(1);
    expect(result.requests.at(-1)?.method).toBe("POST");
    expect(result.stdout).not.toContain("accepted test opportunity");
  });

  it("reports a canonical receipt while leaving downstream proof explicitly outstanding", () => {
    const result = run(postArgs, {
      ...ready,
      "/api/opportunities": { status: 201, body: { id: recordId, status: "New" } },
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(recordId);
    expect(result.stdout).toContain("Manual proof still required");
    const submission = result.requests.at(-1);
    expect(submission.body).toMatchObject({
      leadSource: "launch_smoke", email: "tester@example.test", consentAccepted: true,
    });
    expect(submission.body).not.toHaveProperty("phone");
    expect(submission.body).not.toHaveProperty("consentCcpaAcknowledged");
    expect(result.requests.every((request) => request.hasDeadline && request.redirect === "error")).toBe(true);
  });

  it("does not print a server response that echoes contact data", () => {
    const result = run(postArgs, {
      ...ready,
      "/api/opportunities": { status: 400, body: { message: "PRIVATE_CONTACT_DATA" } },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("400");
    expect(result.stderr).not.toContain("PRIVATE_CONTACT_DATA");
  });

  it("reports a failed request without printing untrusted network diagnostics", () => {
    const result = run(baseArgs, { "/api/health": { networkError: true } });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("failed or timed out");
    expect(result.stderr).not.toContain("PRIVATE_NETWORK_DIAGNOSTIC");
  });
});
