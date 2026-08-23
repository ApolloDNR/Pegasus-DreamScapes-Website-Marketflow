import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import express, { type RequestHandler } from "express";
import fs from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";

type HandlerFactory = (dependencies: {
  getUserId: (request: unknown) => string | null;
  canAccessItemType: (response: unknown, itemType: string) => boolean;
  saveItem: (
    userId: string,
    itemType: string,
    itemId: string,
  ) => Promise<Record<string, unknown> | null>;
  removeItem: (
    userId: string,
    itemType: string,
    itemId: string,
  ) => Promise<boolean>;
  logError: (message: string, error: unknown) => void;
}) => { post: RequestHandler; remove: RequestHandler };

const modulePath = path.join(
  process.cwd(),
  "server/saved-item-route-handlers.ts",
);
const moduleContract = fs.existsSync(modulePath)
  ? await import(/* @vite-ignore */ "../saved-item-route-handlers")
  : {};
const createSavedItemRouteHandlers = (
  moduleContract as { createSavedItemRouteHandlers?: unknown }
).createSavedItemRouteHandlers;

function requireFactory(): HandlerFactory {
  expect(
    createSavedItemRouteHandlers,
    "saved-item writes need behavior-tested route handlers",
  ).toBeTypeOf("function");
  if (typeof createSavedItemRouteHandlers !== "function") {
    throw new Error("Saved-item route handlers are not implemented");
  }
  return createSavedItemRouteHandlers as HandlerFactory;
}

const persistence = {
  saveItem: vi.fn(),
  removeItem: vi.fn(),
  canAccessItemType: vi.fn(),
  logError: vi.fn(),
};

let server: Server | undefined;
let baseUrl = "";

beforeAll(async () => {
  if (typeof createSavedItemRouteHandlers !== "function") return;
  const handlers = requireFactory()({
    getUserId: () => "approved-user",
    canAccessItemType: persistence.canAccessItemType,
    saveItem: persistence.saveItem,
    removeItem: persistence.removeItem,
    logError: persistence.logError,
  });
  const app = express();
  app.use(express.json());
  app.post("/saved", handlers.post);
  app.delete("/saved", handlers.remove);
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server!.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  persistence.saveItem.mockReset();
  persistence.removeItem.mockReset();
  persistence.canAccessItemType.mockReset().mockReturnValue(true);
  persistence.logError.mockReset();
});

async function write(method: "POST" | "DELETE") {
  requireFactory();
  return fetch(`${baseUrl}/saved`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ itemType: "listing", itemId: 42 }),
  });
}

async function writeBody(
  method: "POST" | "DELETE",
  body: Record<string, unknown>,
) {
  requireFactory();
  return fetch(`${baseUrl}/saved`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("saved-item write route behavior", () => {
  it("rejects arbitrary item types before persistence", async () => {
    const response = await writeBody("POST", {
      itemType: "arbitrary_private_table",
      itemId: "42",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid itemType" });
    expect(persistence.saveItem).not.toHaveBeenCalled();
  });

  it("returns 404 when a valid reviewed type is outside the viewer's access", async () => {
    persistence.canAccessItemType.mockReturnValue(false);

    const response = await writeBody("POST", {
      itemType: "wholesale_deal",
      itemId: "42",
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Item not found" });
    expect(persistence.saveItem).not.toHaveBeenCalled();
  });

  it("returns non-2xx when storage returns null from POST", async () => {
    persistence.saveItem.mockResolvedValue(null);

    const response = await write("POST");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      message: "Saved item was not persisted",
    });
    expect(persistence.saveItem).toHaveBeenCalledWith(
      "approved-user",
      "listing",
      "42",
    );
  });

  it("returns non-2xx when storage returns false from DELETE", async () => {
    persistence.removeItem.mockResolvedValue(false);

    const response = await write("DELETE");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      message: "Saved item was not removed",
    });
    expect(persistence.removeItem).toHaveBeenCalledWith(
      "approved-user",
      "listing",
      "42",
    );
  });

  it("returns successful bodies only after storage confirms each write", async () => {
    persistence.saveItem.mockResolvedValue({
      id: "saved-42",
      externalUserId: "approved-user",
      itemType: "listing",
      itemId: "42",
    });
    persistence.removeItem.mockResolvedValue(true);

    const created = await write("POST");
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ id: "saved-42" });

    const removed = await write("DELETE");
    expect(removed.status).toBe(200);
    expect(await removed.json()).toEqual({ success: true });
  });
});
