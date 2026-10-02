import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApplication } from "../application";
import type { DeploymentEnvironment } from "../deployment-policy";

// Replace only startup side-effect boundaries. Exercise the real application's
// default dependencies without reaching a database, HQ, email, or timer service.
const calls = vi.hoisted(() => [] as string[]);
vi.mock("../seed", () => ({
  seedProjects: async () => { calls.push("seedProjects"); },
  seedArticles: async () => { calls.push("seedArticles"); },
  seedLibraryBeginnerPath: async () => { calls.push("seedLibraryBeginnerPath"); },
  seedLibraryGlossary: async () => { calls.push("seedLibraryGlossary"); },
  seedCommunityCategories: async () => { calls.push("seedCommunityCategories"); },
  seedDealflowData: async () => { calls.push("seedDealflowData"); },
}));
vi.mock("../integrations/hq-client", () => ({
  startHqPendingRecoveryWorker: () => { calls.push("startHqRecovery"); },
  stopHqPendingRecoveryWorker: () => { calls.push("stopHqRecovery"); },
}));
vi.mock("../peggy-cron", () => ({
  startPeggyCron: () => { calls.push("startPeggyReports"); },
}));

const SEED_CALLS = [
  "seedProjects",
  "seedArticles",
  "seedLibraryBeginnerPath",
  "seedLibraryGlossary",
  "seedCommunityCategories",
];
const ALL_OPT_INS = {
  PEGASUS_PREVIEW_ENABLE_SEEDING: "true",
  PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY: "true",
  PEGASUS_PREVIEW_ENABLE_PEGGY_REPORTS: "true",
};
const servers = new Set<Server>();

async function createStartup(
  environment: DeploymentEnvironment,
  runtime: "persistent" | "serverless" = "persistent",
) {
  const result = await createApplication({
    runtime,
    environment,
    dependencies: {
      registerRoutes: async () => { calls.push("routes"); },
      setupStatic: async () => { calls.push("static"); },
      setupVite: async () => { calls.push("vite"); },
    },
  });
  servers.add(result.httpServer);
  return result;
}

beforeEach(() => { calls.length = 0; });
afterEach(async () => {
  for (const server of servers) {
    if (server.listening) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
    server.removeAllListeners("close");
  }
  servers.clear();
});

describe("persistent preview startup safety", () => {
  it.each(["production", "development"])(
    "defaults all three preview tasks off with NODE_ENV=%s",
    async (nodeEnvironment) => {
      const { httpServer } = await createStartup({
        APP_ENV: "preview",
        NODE_ENV: nodeEnvironment,
      });
      expect(calls).toEqual(["routes", nodeEnvironment === "production" ? "static" : "vite"]);
      expect(httpServer.listenerCount("close")).toBe(0);
    },
  );

  it.each([
    { seeding: false, recovery: false, reports: false },
    { seeding: true, recovery: false, reports: false },
    { seeding: false, recovery: true, reports: false },
    { seeding: false, recovery: false, reports: true },
    { seeding: true, recovery: true, reports: false },
    { seeding: true, recovery: false, reports: true },
    { seeding: false, recovery: true, reports: true },
    { seeding: true, recovery: true, reports: true },
  ])("independently honors preview opt-ins: %j", async ({ seeding, recovery, reports }) => {
    const { httpServer } = await createStartup({
      APP_ENV: "preview",
      NODE_ENV: "production",
      PEGASUS_PREVIEW_ENABLE_SEEDING: String(seeding),
      PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY: String(recovery),
      PEGASUS_PREVIEW_ENABLE_PEGGY_REPORTS: String(reports),
    });
    expect(calls).toEqual([
      ...(seeding ? SEED_CALLS : []),
      "routes",
      ...(recovery ? ["startHqRecovery"] : []),
      ...(reports ? ["startPeggyReports"] : []),
      "static",
    ]);
    expect(httpServer.listenerCount("close")).toBe(recovery ? 1 : 0);
  });

  it.each([undefined, "", "false", "1", "yes", "TRUE", "True", " true", "true "])(
    "rejects the nonliteral opt-in %j for every preview task",
    async (value) => {
      await createStartup({
        APP_ENV: "preview",
        NODE_ENV: "production",
        PEGASUS_PREVIEW_ENABLE_SEEDING: value,
        PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY: value,
        PEGASUS_PREVIEW_ENABLE_PEGGY_REPORTS: value,
      });
      expect(calls).toEqual(["routes", "static"]);
    },
  );

  it("uses the normalized preview deployment identity for the safety boundary", async () => {
    await createStartup({ APP_ENV: " PREVIEW ", NODE_ENV: "production" });
    expect(calls).toEqual(["routes", "static"]);
  });

  it.each(["production", "development", undefined])(
    "retains non-preview startup with APP_ENV=%s even when preview flags are false",
    async (appEnvironment) => {
      const nodeEnvironment = appEnvironment === "development" ? "development" : "production";
      await createStartup({
        APP_ENV: appEnvironment,
        NODE_ENV: nodeEnvironment,
        PEGASUS_PREVIEW_ENABLE_SEEDING: "false",
        PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY: "false",
        PEGASUS_PREVIEW_ENABLE_PEGGY_REPORTS: "false",
      });
      expect(calls).toEqual([
        ...SEED_CALLS,
        ...(nodeEnvironment === "development" ? ["seedDealflowData"] : []),
        "routes",
        "startHqRecovery",
        "startPeggyReports",
        nodeEnvironment === "development" ? "vite" : "static",
      ]);
    },
  );

  it.each(["preview", "production", "development", undefined])(
    "never starts tasks in serverless mode with APP_ENV=%s and all preview opt-ins",
    async (appEnvironment) => {
      const { httpServer } = await createStartup({
        APP_ENV: appEnvironment,
        NODE_ENV: "production",
        ...ALL_OPT_INS,
      }, "serverless");
      expect(calls).toEqual(["routes", "static"]);
      expect(httpServer.listenerCount("close")).toBe(0);
    },
  );

  it.each(["preview", "production"])(
    "stops enabled HQ recovery exactly once when the %s server closes",
    async (appEnvironment) => {
      const { httpServer } = await createStartup({
        APP_ENV: appEnvironment,
        NODE_ENV: "production",
        PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY: "true",
      });
      await new Promise<void>((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(0, "127.0.0.1", resolve);
      });
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => error ? reject(error) : resolve());
      });
      expect(calls.filter((call) => call === "stopHqRecovery")).toHaveLength(1);
      expect(httpServer.listenerCount("close")).toBe(0);
    },
  );
});
