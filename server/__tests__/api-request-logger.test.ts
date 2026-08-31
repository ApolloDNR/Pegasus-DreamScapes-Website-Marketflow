import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApiRequestLogger } from "../api-request-logger";

let server: Server;
let baseUrl = "";
const write = vi.fn();

beforeAll(async () => {
  const app = express();
  app.use(createApiRequestLogger(write));
  app.get("/api/private-record", (_req, res) =>
    res.json({
      email: "sensitive.person@example.test",
      phone: "510-555-0199",
      address: "123 Private Address",
      notes: "confidential situation",
    }),
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

describe("API request logging", () => {
  it("records only request metadata, never JSON response bodies", async () => {
    const response = await fetch(`${baseUrl}/api/private-record`);
    await response.json();

    expect(write).toHaveBeenCalledTimes(1);
    const logged = String(write.mock.calls[0][0]);
    expect(logged).toMatch(/^GET \/api\/private-record 200 in \d+ms$/);
    expect(logged).not.toContain("sensitive.person@example.test");
    expect(logged).not.toContain("510-555-0199");
    expect(logged).not.toContain("123 Private Address");
    expect(logged).not.toContain("confidential situation");
  });
});
