import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";

const readinessModule = await import("../readiness").catch(() => null);
const opportunityColumns = readinessModule
  ? [...readinessModule.REQUIRED_OPPORTUNITY_COLUMNS]
  : [];
const hqOutboxColumns = readinessModule
  ? [...readinessModule.REQUIRED_HQ_OUTBOX_COLUMNS]
  : [];

let server: Server | undefined;

afterEach(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server!.close((error) => (error ? reject(error) : resolve()));
  });
  server = undefined;
});

async function startReadinessServer(dependencies: {
  probe: () => Promise<{
    opportunities: string | null;
    hqOutbox: string | null;
    opportunityColumns: string[];
    hqOutboxColumns: string[];
  }>;
  hasRequiredHqEndpoint: () => boolean;
  hasRequiredEmail?: () => boolean;
}) {
  expect(readinessModule).not.toBeNull();
  if (!readinessModule) return "";

  const app = express();
  readinessModule.registerReadinessRoute(app, dependencies);
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

describe("GET /api/ready", () => {
  it("loads without opening the database or requiring DATABASE_URL", async () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    vi.resetModules();

    try {
      await expect(import("../readiness")).resolves.toMatchObject({
        registerReadinessRoute: expect.any(Function),
      });
    } finally {
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
      vi.resetModules();
    }
  });

  it("returns ready only when both launch tables and the production HQ contract are available", async () => {
    const baseUrl = await startReadinessServer({
      probe: async () => ({
        opportunities: "opportunities",
        hqOutbox: "hq_outbox",
        opportunityColumns,
        hqOutboxColumns,
      }),
      hasRequiredHqEndpoint: () => true,
      hasRequiredEmail: () => true,
    });

    const response = await fetch(`${baseUrl}/api/ready`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ready" });
  });

  it("fails closed with a generic response when a launch table is missing", async () => {
    const baseUrl = await startReadinessServer({
      probe: async () => ({
        opportunities: "opportunities",
        hqOutbox: null,
        opportunityColumns,
        hqOutboxColumns: [],
      }),
      hasRequiredHqEndpoint: () => true,
      hasRequiredEmail: () => true,
    });

    const response = await fetch(`${baseUrl}/api/ready`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
  });

  it("fails closed with a generic response when the database probe throws", async () => {
    const baseUrl = await startReadinessServer({
      probe: async () => {
        throw new Error("database details must not escape");
      },
      hasRequiredHqEndpoint: () => true,
      hasRequiredEmail: () => true,
    });

    const response = await fetch(`${baseUrl}/api/ready`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
  });

  it("fails closed when the production HQ endpoint contract is missing", async () => {
    const baseUrl = await startReadinessServer({
      probe: async () => ({
        opportunities: "opportunities",
        hqOutbox: "hq_outbox",
        opportunityColumns,
        hqOutboxColumns,
      }),
      hasRequiredHqEndpoint: () => false,
      hasRequiredEmail: () => true,
    });

    const response = await fetch(`${baseUrl}/api/ready`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
  });

  it("fails closed when launch table shapes are incomplete", async () => {
    const baseUrl = await startReadinessServer({
      probe: async () => ({
        opportunities: "opportunities",
        hqOutbox: "hq_outbox",
        opportunityColumns: opportunityColumns.filter(
          (column) => column !== "referrer",
        ),
        hqOutboxColumns,
      }),
      hasRequiredHqEndpoint: () => true,
      hasRequiredEmail: () => true,
    });

    const response = await fetch(`${baseUrl}/api/ready`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
  });

  it("fails closed when production email delivery is not configured", async () => {
    const baseUrl = await startReadinessServer({
      probe: async () => ({
        opportunities: "opportunities",
        hqOutbox: "hq_outbox",
        opportunityColumns,
        hqOutboxColumns,
      }),
      hasRequiredHqEndpoint: () => true,
      hasRequiredEmail: () => false,
    });

    const response = await fetch(`${baseUrl}/api/ready`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
  });
});
