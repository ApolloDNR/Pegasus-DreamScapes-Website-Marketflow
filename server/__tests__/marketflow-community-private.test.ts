import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express, { type Express, type RequestHandler } from "express";
import fs from "node:fs";
import path from "node:path";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

type RegisterCommunityGate = (
  app: Express,
  dependencies: {
    isAuthenticated: RequestHandler;
    requireApprovedAccess: RequestHandler;
  },
) => void;

const modulePath = path.join(
  process.cwd(),
  "server/marketflow-community-access.ts",
);
const communityModule = fs.existsSync(modulePath)
  ? await import(/* @vite-ignore */ "../marketflow-community-access")
  : {};
const registerMarketflowCommunityGate = (
  communityModule as { registerMarketflowCommunityGate?: unknown }
).registerMarketflowCommunityGate;

function requireRegistrar(): RegisterCommunityGate {
  expect(
    registerMarketflowCommunityGate,
    "the private community prefix must have a production gate registrar",
  ).toBeTypeOf("function");
  if (typeof registerMarketflowCommunityGate !== "function") {
    throw new Error("MarketFlow community gate is not implemented");
  }
  return registerMarketflowCommunityGate as RegisterCommunityGate;
}

let server: Server | undefined;
let baseUrl = "";
const downstream = vi.fn();

beforeAll(async () => {
  if (typeof registerMarketflowCommunityGate !== "function") return;

  const app = express();
  const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.get("x-test-authenticated") !== "true") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
  };
  const requireApprovedAccess: RequestHandler = (req, res, next) => {
    if (req.get("x-test-approved") !== "true") {
      return res.status(403).json({ message: "Approved access required" });
    }
    return next();
  };
  requireRegistrar()(app, { isAuthenticated, requireApprovedAccess });
  app.use("/api/community", (_req, res) => {
    downstream();
    return res.status(204).end();
  });

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

const privateReadPaths = [
  "/api/community/categories",
  "/api/community/categories/deal-talk",
  "/api/community/posts",
  "/api/community/posts/12",
  "/api/community/posts/12/replies",
  "/api/community/feed",
] as const;

describe("private MarketFlow community prefix", () => {
  it.each(privateReadPaths)(
    "returns 401 before downstream data access for anonymous GET %s",
    async (route) => {
      requireRegistrar();
      downstream.mockClear();

      const response = await fetch(`${baseUrl}${route}`);

      expect(response.status).toBe(401);
      expect(downstream).not.toHaveBeenCalled();
    },
  );

  it.each(privateReadPaths)(
    "returns 403 before downstream data access for unapproved GET %s",
    async (route) => {
      requireRegistrar();
      downstream.mockClear();

      const response = await fetch(`${baseUrl}${route}`, {
        headers: { "x-test-authenticated": "true" },
      });

      expect(response.status).toBe(403);
      expect(downstream).not.toHaveBeenCalled();
    },
  );

  it("allows an authenticated, governed participant through the same prefix", async () => {
    requireRegistrar();
    downstream.mockClear();

    const response = await fetch(`${baseUrl}/api/community/feed`, {
      headers: {
        "x-test-authenticated": "true",
        "x-test-approved": "true",
      },
    });

    expect(response.status).toBe(204);
    expect(downstream).toHaveBeenCalledTimes(1);
  });

  it("wires the production gate before the community routes", () => {
    const routesSource = fs.readFileSync(
      path.join(process.cwd(), "server/routes.ts"),
      "utf8",
    );
    const gateIndex = routesSource.indexOf("registerMarketflowCommunityGate(app");
    const firstCommunityRoute = routesSource.indexOf(
      'app.get("/api/community/categories"',
    );

    expect(gateIndex).toBeGreaterThan(-1);
    expect(firstCommunityRoute).toBeGreaterThan(gateIndex);
    expect(routesSource.slice(gateIndex, firstCommunityRoute)).toContain(
      "isAuthenticated: isHybridAuthenticated",
    );
    expect(routesSource.slice(gateIndex, firstCommunityRoute)).toContain(
      "requireApprovedAccess: requireMarketflowInventoryAccess",
    );
  });
});
