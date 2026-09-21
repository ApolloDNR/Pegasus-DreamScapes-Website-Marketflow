import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createRateLimit } from "../rate-limit";

let server: Server;
let baseUrl = "";

beforeAll(async () => {
  const app = express();
  app.set("trust proxy", 1);
  app.post(
    "/api/intake",
    createRateLimit({ maxRequests: 2, windowMs: 60_000 }),
    (_req, res) => res.status(201).json({ accepted: true }),
  );
  app.post(
    "/api/messages/:id/feedback",
    createRateLimit({ maxRequests: 2, windowMs: 60_000 }),
    (_req, res) => res.status(201).json({ accepted: true }),
  );
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe("createRateLimit", () => {
  it("rejects the first request over quota with a retry window", async () => {
    const first = await fetch(`${baseUrl}/api/intake`, { method: "POST" });
    const second = await fetch(`${baseUrl}/api/intake`, { method: "POST" });
    const rejected = await fetch(`${baseUrl}/api/intake`, { method: "POST" });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(rejected.status).toBe(429);
    expect(Number(rejected.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("isolates quotas by the trusted client IP", async () => {
    const response = await fetch(`${baseUrl}/api/intake`, {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.8" },
    });

    expect(response.status).toBe(201);
  });

  it("does not let callers evade a dynamic-route quota by rotating ids", async () => {
    const first = await fetch(`${baseUrl}/api/messages/1/feedback`, {
      method: "POST",
    });
    const second = await fetch(`${baseUrl}/api/messages/2/feedback`, {
      method: "POST",
    });
    const rejected = await fetch(`${baseUrl}/api/messages/3/feedback`, {
      method: "POST",
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(rejected.status).toBe(429);
  });
});
