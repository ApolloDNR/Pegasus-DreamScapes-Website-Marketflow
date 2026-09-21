import type { Express } from "express";
import type { Server } from "node:http";
import { request as httpRequest } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createApplication,
  type ApplicationDependencies,
} from "../application";
import { PREVIEW_ROBOTS_HEADER } from "../deployment-policy";

const SHA = "c".repeat(40);
const openServers = new Set<Server>();

interface TestResponse {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

function dependencies(
  register?: (httpServer: Server, app: Express) => Promise<void>,
): ApplicationDependencies {
  return {
    registerRoutes: vi.fn(
      register ??
        (async (_httpServer, app) => {
          app.get("/api/example", (_req, res) => res.json({ ok: true }));
          app.get("/robots.txt", (_req, res) =>
            res.type("text/plain").send("User-agent: *\nAllow: /\n"),
          );
        }),
    ),
    seedPersistentData: vi.fn(async () => undefined),
    startPersistentWorkers: vi.fn(async () => undefined),
    setupStatic: vi.fn(async () => undefined),
    setupVite: vi.fn(async () => undefined),
  };
}

async function listen(server: Server): Promise<number> {
  openServers.add(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected an ephemeral TCP port");
  }
  return address.port;
}

async function get(
  port: number,
  path: string,
  hostHeader: string,
): Promise<TestResponse> {
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method: "GET",
        headers: { Host: hostHeader },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            headers: response.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    request.once("error", reject);
    request.end();
  });
}

afterEach(async () => {
  await Promise.all(
    [...openServers].map(
      (server) =>
        new Promise<void>((resolve) => {
          if (!server.listening) return resolve();
          server.close(() => resolve());
        }),
    ),
  );
  openServers.clear();
  vi.restoreAllMocks();
});

describe("listener-free application factory", () => {
  it("skips seeds, cron, and recovery workers in serverless mode", async () => {
    const testDependencies = dependencies();
    const { httpServer } = await createApplication({
      runtime: "serverless",
      environment: { NODE_ENV: "production", APP_ENV: "preview" },
      dependencies: testDependencies,
    });

    expect(httpServer.listening).toBe(false);
    expect(testDependencies.registerRoutes).toHaveBeenCalledOnce();
    expect(testDependencies.seedPersistentData).not.toHaveBeenCalled();
    expect(testDependencies.startPersistentWorkers).not.toHaveBeenCalled();
    expect(testDependencies.setupStatic).toHaveBeenCalledOnce();
    expect(testDependencies.setupVite).not.toHaveBeenCalled();
  });

  it("retains seeds, workers, and Vite for the persistent development server", async () => {
    const testDependencies = dependencies();
    const environment = { NODE_ENV: "development", APP_ENV: "development" };
    const { httpServer } = await createApplication({
      runtime: "persistent",
      environment,
      dependencies: testDependencies,
    });

    expect(httpServer.listening).toBe(false);
    expect(testDependencies.seedPersistentData).toHaveBeenCalledWith(environment);
    expect(testDependencies.startPersistentWorkers).toHaveBeenCalledWith(httpServer);
    expect(testDependencies.setupVite).toHaveBeenCalledOnce();
    expect(testDependencies.setupStatic).not.toHaveBeenCalled();
  });

  it("publishes the validated version and disallows robots on every preview host", async () => {
    const { httpServer } = await createApplication({
      runtime: "serverless",
      environment: {
        NODE_ENV: "production",
        APP_ENV: "preview",
        SITE_INDEXABLE: "false",
        VERCEL_GIT_COMMIT_SHA: SHA,
      },
      dependencies: dependencies(),
    });
    const port = await listen(httpServer);

    const version = await get(port, "/api/version", "custom-preview.example");
    expect(version.status).toBe(200);
    expect(version.headers["x-pegasus-commit"]).toBe(SHA);
    expect(version.headers["x-robots-tag"]).toBe(PREVIEW_ROBOTS_HEADER);
    expect(JSON.parse(version.body)).toEqual({
      commit: SHA,
      environment: "preview",
      indexable: false,
    });

    const robots = await get(port, "/robots.txt", "custom-preview.example");
    expect(robots.status).toBe(200);
    expect(robots.body).toBe("User-agent: *\nDisallow: /\n");
  });

  it("permits the canonical robots policy only under explicit production settings", async () => {
    const { httpServer } = await createApplication({
      runtime: "serverless",
      environment: {
        NODE_ENV: "production",
        APP_ENV: "production",
        SITE_INDEXABLE: "true",
        PEGASUS_SOURCE_SHA: SHA,
      },
      dependencies: dependencies(),
    });
    const port = await listen(httpServer);

    const canonical = await get(
      port,
      "/api/version",
      "pegasusdreamscapes.com",
    );
    expect(JSON.parse(canonical.body).indexable).toBe(true);
    expect(canonical.headers["x-robots-tag"]).toBeUndefined();

    const robots = await get(port, "/robots.txt", "pegasusdreamscapes.com");
    expect(robots.body).toBe("User-agent: *\nAllow: /\n");

    const alias = await get(port, "/api/version", "www.pegasusdreamscapes.com");
    expect(JSON.parse(alias.body).indexable).toBe(false);
    expect(alias.headers["x-robots-tag"]).toBe(PREVIEW_ROBOTS_HEADER);
  });

  it("registers API routes before the built-client fallback", async () => {
    const testDependencies = dependencies(async (_httpServer, app) => {
      app.get("/api/example", (_req, res) => res.status(200).send("api"));
    });
    testDependencies.setupStatic = vi.fn(async (app) => {
      app.use((_req, res) => res.status(200).send("static-fallback"));
    });

    const { httpServer } = await createApplication({
      runtime: "serverless",
      environment: { NODE_ENV: "production", APP_ENV: "preview" },
      dependencies: testDependencies,
    });
    const port = await listen(httpServer);

    expect((await get(port, "/api/example", "preview.example")).body).toBe("api");
    expect((await get(port, "/client/route", "preview.example")).body).toBe(
      "static-fallback",
    );
  });
});
