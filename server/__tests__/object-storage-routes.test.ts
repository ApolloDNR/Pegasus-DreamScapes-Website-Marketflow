import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { registerObjectStorageRoutes } from "../replit_integrations/object_storage/routes";

let server: Server;
let baseUrl = "";
const createService = vi.fn(() => {
  throw new Error("storage service must not initialize");
});

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  registerObjectStorageRoutes(app, {
    isAvailable: () => false,
    createService,
  });
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

describe("object storage routes outside Replit", () => {
  it("fails upload URL issuance closed without initializing the provider", async () => {
    const response = await fetch(`${baseUrl}/api/uploads/request-url`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "private-document.pdf" }),
    });

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "File storage unavailable" });
    expect(createService).not.toHaveBeenCalled();
  });

  it("does not reveal whether a private object exists", async () => {
    const response = await fetch(`${baseUrl}/objects/private-document.pdf`);

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "Object not found" });
  });
});
