import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { securityHeaders } from "../http-hardening";

let server: Server;
let baseUrl = "";
const originalNodeEnv = process.env.NODE_ENV;

beforeAll(async () => {
  process.env.NODE_ENV = "production";
  const app = express();
  app.use(securityHeaders);
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/page", (_req, res) => res.type("html").send("<h1>Page</h1>"));

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});

describe("securityHeaders", () => {
  it("protects API responses and prevents sensitive caching", async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-security-policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(response.headers.get("strict-transport-security")).toContain(
      "max-age=31536000",
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
  });

  it("applies the document-boundary policy to HTML without forcing no-store", async () => {
    const response = await fetch(`${baseUrl}/page`);

    expect(response.headers.get("cache-control")).not.toBe("no-store");
    expect(response.headers.get("cross-origin-opener-policy")).toBe("same-origin");
    expect(response.headers.get("permissions-policy")).toContain("microphone=()");
    expect(response.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });
});
