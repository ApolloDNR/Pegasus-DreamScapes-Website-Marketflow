import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "../../shared/website-schema";
import { checkReadiness, registerReadinessRoute, type ReadinessDependencies } from "../readiness";

const tables = [schema.opportunities, schema.leads, schema.hqOutbox, schema.adminAuditLog,
  schema.peggyConversations, schema.peggyMessages, schema.intakeRequests,
  schema.websiteDeliveryJobs, schema.notificationOutbox].map(getTableConfig);
const completeSchema = () => ({
  tables: Object.fromEntries(tables.map(table => [table.name, table.columns.map(column => column.name)])),
  permissions: Object.fromEntries(tables.map(table => [table.name, { schemaUsage: true, select: true, insert: true, update: true, sequenceUsage: true }])),
});
const configured = {
  APP_ENV: "production",
  WEBSITE_ORG_ID: "10000000-0000-4000-8000-000000000001",
  PEGASUS_HQ_WEBSITE_INQUIRY_URL: "https://hq.example.test/api/public/website-inquiries",
  PEGASUS_WEBSITE_INQUIRY_TOKEN: "synthetic-test-token",
  SENDGRID_API_KEY: "synthetic-provider-key",
  DEFAULT_FROM_EMAIL: "sender@example.test",
  STAFF_NOTIFICATION_EMAIL: "staff@example.test",
};
let server: Server | undefined;

afterEach(async () => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  if (!server) return;
  await new Promise<void>((resolve, reject) => server!.close(error => error ? reject(error) : resolve()));
  server = undefined;
});

async function startReadinessServer(dependencies: ReadinessDependencies) {
  const app = express();
  registerReadinessRoute(app, dependencies);
  await new Promise<void>(resolve => { server = app.listen(0, resolve); });
  return `http://127.0.0.1:${(server!.address() as AddressInfo).port}`;
}

function environment(values: Record<string, string | undefined> = {}) {
  for (const [key, value] of Object.entries({ ...configured, VERCEL_ENV: undefined, PEGASUS_HQ_PUBLIC_INTAKE_URL: undefined, PEGASUS_ENABLE_HQ_DELIVERY_WORKER: undefined, PEGASUS_ENABLE_NOTIFICATION_WORKER: undefined, ...values })) vi.stubEnv(key, value);
}

async function responseFor(probe = async () => completeSchema()) {
  const baseUrl = await startReadinessServer({ probe });
  const response = await fetch(`${baseUrl}/api/ready`);
  return { status: response.status, body: await response.json() };
}

describe("GET /api/ready", () => {
  it("loads without opening the database or requiring DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", undefined);
    vi.resetModules();
    await expect(import("../readiness")).resolves.toMatchObject({ registerReadinessRoute: expect.any(Function) });
  });

  it("accepts the migrated website schema and new transport without the legacy endpoint", async () => {
    environment();
    expect(await responseFor()).toEqual({ status: 200, body: { status: "ready" } });
  });

  it.each(tables.map(table => table.name))("fails closed when website.%s is missing", async name => {
    environment();
    const result = completeSchema();
    delete result.tables[name];
    expect(await responseFor(async () => result)).toEqual({ status: 503, body: { status: "unavailable" } });
  });

  it.each(tables)("requires every mapped column in website.$name", async table => {
    environment();
    for (const column of table.columns) {
      const result = completeSchema();
      result.tables[table.name] = result.tables[table.name].filter(name => name !== column.name);
      expect(await checkReadiness({ probe: async () => result }), `${table.name}.${column.name}`).toBe(false);
    }
  });

  it.each(tables.filter(table => table.name !== "hq_outbox"))("requires capture privileges for website.$name", async table => {
    environment();
    for (const permission of ["schemaUsage", "select", "insert", "sequenceUsage"] as const) {
      const result = completeSchema();
      result.permissions[table.name][permission] = false;
      expect(await checkReadiness({ probe: async () => result }), `${table.name}.${permission}`).toBe(false);
    }
  });

  it.each(["peggy_conversations", "peggy_messages"])("requires Peggy UPDATE on %s", async table => {
    environment();
    const result = completeSchema();
    result.permissions[table].update = false;
    expect(await checkReadiness({ probe: async () => result })).toBe(false);
  });

  it.each([
    ["delivery_jobs", "PEGASUS_ENABLE_HQ_DELIVERY_WORKER"],
    ["notification_outbox", "PEGASUS_ENABLE_NOTIFICATION_WORKER"],
  ])("requires UPDATE on %s when %s is enabled", async (table, flag) => {
    environment({ [flag]: "true" });
    const result = completeSchema();
    result.permissions[table].update = false;
    expect(await checkReadiness({ probe: async () => result })).toBe(false);
    vi.stubEnv(flag, "false");
    expect(await checkReadiness({ probe: async () => result })).toBe(true);
  });

  it.each([undefined, "", "not-a-uuid", " 10000000-0000-4000-8000-000000000001 "])("requires the server intake organization: %s", async org => {
    environment({ WEBSITE_ORG_ID: org });
    expect(await responseFor()).toEqual({ status: 503, body: { status: "unavailable" } });
  });

  it.each([
    { PEGASUS_HQ_WEBSITE_INQUIRY_URL: undefined },
    { PEGASUS_HQ_WEBSITE_INQUIRY_URL: "http://hq.example.test/inquiries" },
    { PEGASUS_HQ_WEBSITE_INQUIRY_URL: "https://user:password@hq.example.test/inquiries" },
    { PEGASUS_HQ_WEBSITE_INQUIRY_URL: "https://hq.example.test/inquiries#fragment" },
    { PEGASUS_WEBSITE_INQUIRY_TOKEN: undefined },
    { PEGASUS_WEBSITE_INQUIRY_TOKEN: "  " },
    { PEGASUS_WEBSITE_INQUIRY_TOKEN: "unsafe\r\ntoken" },
  ])("rejects incomplete/invalid production HQ configuration: %o", async values => {
    environment({ ...values, PEGASUS_HQ_PUBLIC_INTAKE_URL: "https://legacy.example.test/api/public/intake" });
    expect(await responseFor()).toEqual({ status: 503, body: { status: "unavailable" } });
  });

  it.each([
    { SENDGRID_API_KEY: undefined }, { SENDGRID_API_KEY: "unsafe\r\nkey" },
    { DEFAULT_FROM_EMAIL: undefined }, { DEFAULT_FROM_EMAIL: "invalid-address" },
    { STAFF_NOTIFICATION_EMAIL: undefined }, { STAFF_NOTIFICATION_EMAIL: "invalid-address" },
  ])("rejects incomplete/invalid production email configuration: %o", async values => {
    environment(values);
    expect(await responseFor()).toEqual({ status: 503, body: { status: "unavailable" } });
  });

  it.each([
    { APP_ENV: "preview", NODE_ENV: "production" },
    { APP_ENV: "production", VERCEL_ENV: "preview", NODE_ENV: "production" },
    { APP_ENV: undefined, NODE_ENV: "development" },
  ])("allows storage-only non-production readiness: %o", async values => {
    environment({ ...values, PEGASUS_HQ_WEBSITE_INQUIRY_URL: undefined, PEGASUS_WEBSITE_INQUIRY_TOKEN: undefined,
      SENDGRID_API_KEY: undefined, DEFAULT_FROM_EMAIL: undefined, STAFF_NOTIFICATION_EMAIL: undefined });
    expect(await responseFor()).toEqual({ status: 200, body: { status: "ready" } });
  });

  it("requires provider configuration for NODE_ENV production without APP_ENV", async () => {
    environment({ APP_ENV: undefined, NODE_ENV: "production", PEGASUS_WEBSITE_INQUIRY_TOKEN: undefined });
    expect(await responseFor()).toEqual({ status: 503, body: { status: "unavailable" } });
  });

  it("does not contact providers or treat configuration as a delivery receipt", async () => {
    environment();
    const fetcher = vi.fn(() => { throw new Error("readiness must never send"); });
    vi.stubGlobal("fetch", fetcher);
    expect(await checkReadiness({ probe: async () => completeSchema() })).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns only the generic unavailable contract for database errors", async () => {
    environment();
    expect(await responseFor(async () => { throw new Error("private database details"); }))
      .toEqual({ status: 503, body: { status: "unavailable" } });
  });
});
