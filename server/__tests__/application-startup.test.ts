import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DeploymentEnvironment } from "../deployment-policy";

// Mock only side-effect boundaries; keep each worker's real configuration gate.
const state = vi.hoisted(() => ({
  calls: [] as string[],
  db: {},
  hqStop: vi.fn(async () => {}),
  notificationStop: vi.fn(async () => {}),
  hqStart: vi.fn(),
  notificationStart: vi.fn(),
}));
vi.mock("../seed", () => ({
  seedProjects: async () => { state.calls.push("seedProjects"); },
  seedArticles: async () => { state.calls.push("seedArticles"); },
  seedLibraryBeginnerPath: async () => { state.calls.push("seedLibraryBeginnerPath"); },
  seedLibraryGlossary: async () => { state.calls.push("seedLibraryGlossary"); },
  seedCommunityCategories: async () => { state.calls.push("seedCommunityCategories"); },
  seedDealflowData: async () => { state.calls.push("seedDealflowData"); },
}));
vi.mock("../integrations/hq-client", () => {
  state.calls.push("legacyHqImport");
  return {
    startHqPendingRecoveryWorker: () => { state.calls.push("legacyHqStart"); },
    stopHqPendingRecoveryWorker: () => { state.calls.push("legacyHqStop"); },
  };
});
vi.mock("../website/delivery", async (importOriginal) => ({
  ...await importOriginal<typeof import("../website/delivery")>(),
  startWebsiteHqWorker: (...args: unknown[]) => {
    state.calls.push("startWebsiteHq");
    state.hqStart(...args);
    return { enabled: true, stop: state.hqStop };
  },
}));
vi.mock("../website/notifications", async (importOriginal) => ({
  ...await importOriginal<typeof import("../website/notifications")>(),
  startNotificationWorker: (...args: unknown[]) => {
    state.calls.push("startNotifications");
    state.notificationStart(...args);
    return { enabled: true, stop: state.notificationStop };
  },
}));
vi.mock("../peggy-cron", () => ({
  startPeggyCron: () => { state.calls.push("startPeggyReports"); },
}));

const SEED_CALLS = [
  "seedProjects", "seedArticles", "seedLibraryBeginnerPath",
  "seedLibraryGlossary", "seedCommunityCategories",
];
const TASKS = [
  ["PEGASUS_ENABLE_SEEDING", "PEGASUS_PREVIEW_ENABLE_SEEDING"],
  ["PEGASUS_ENABLE_HQ_DELIVERY_WORKER", "PEGASUS_PREVIEW_ENABLE_HQ_RECOVERY"],
  ["PEGASUS_ENABLE_NOTIFICATION_WORKER", "PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS"],
  ["PEGASUS_ENABLE_PEGGY_REPORTS", "PEGASUS_PREVIEW_ENABLE_PEGGY_REPORTS"],
] as const;
const GLOBAL_OPT_INS = Object.fromEntries(TASKS.map(([global]) => [global, "true"]));
const PREVIEW_OPT_INS = Object.fromEntries(TASKS.map(([, preview]) => [preview, "true"]));
const CONFIGURED = {
  DATABASE_URL: "postgresql://test@127.0.0.1/pegasus_test",
  WEBSITE_ORG_ID: "11111111-1111-4111-8111-111111111111",
  PEGASUS_HQ_WEBSITE_INQUIRY_URL: "https://hq.example/api/public/website-inquiries",
  PEGASUS_WEBSITE_INQUIRY_TOKEN: "synthetic-hq-token",
  SENDGRID_API_KEY: "synthetic-provider-key",
  DEFAULT_FROM_EMAIL: "sender@example.test",
  PEGASUS_NOTIFICATION_ALLOWED_RECIPIENTS: "recipient@example.test",
};
const servers = new Set<Server>();

async function createStartup(
  environment: DeploymentEnvironment,
  runtime: "persistent" | "serverless" = "persistent",
) {
  const { createApplication } = await import("../application");
  const result = await createApplication({
    runtime,
    environment,
    dependencies: {
      registerRoutes: async () => { state.calls.push("routes"); },
      setupStatic: async () => { state.calls.push("static"); },
      setupVite: async () => { state.calls.push("vite"); },
    },
  });
  servers.add(result.httpServer);
  return result;
}

beforeEach(() => {
  vi.resetModules();
  vi.doMock("../db", () => {
    state.calls.push("databaseImport");
    return { db: state.db };
  });
  vi.clearAllMocks();
  state.calls.length = 0;
  state.hqStop.mockImplementation(async () => {});
  state.notificationStop.mockImplementation(async () => {});
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected external HTTP"); }));
});
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
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("explicit persistent startup safety", () => {
  it.each(["preview", "production", "development", undefined])(
    "defaults every background task off with APP_ENV=%s even with provider configuration",
    async (appEnvironment) => {
      const { httpServer } = await createStartup({
        APP_ENV: appEnvironment, NODE_ENV: "production", ...CONFIGURED,
      });
      expect(state.calls).toEqual(["routes", "static"]);
      expect(httpServer.listenerCount("close")).toBe(0);
    },
  );

  it.each(Array.from({ length: 16 }, (_, mask) => mask))(
    "independently enables the four preview tasks for opt-in mask %i",
    async (mask) => {
      const enabled = TASKS.map((_, index) => Boolean(mask & (1 << index)));
      const { httpServer } = await createStartup({
        APP_ENV: "preview", NODE_ENV: "production", ...CONFIGURED, ...GLOBAL_OPT_INS,
        ...Object.fromEntries(TASKS.map(([, preview], index) => [preview, String(enabled[index])])),
      });
      expect(state.calls).toEqual([
        ...(enabled[0] ? SEED_CALLS : []), "routes",
        ...(enabled[1] || enabled[2] ? ["databaseImport"] : []),
        ...(enabled[1] ? ["startWebsiteHq"] : []),
        ...(enabled[2] ? ["startNotifications"] : []),
        ...(enabled[3] ? ["startPeggyReports"] : []), "static",
      ]);
      expect(httpServer.listenerCount("close")).toBe(Number(enabled[1]) + Number(enabled[2]));
    },
  );

  it.each(Array.from({ length: 16 }, (_, mask) => mask))(
    "independently enables the four production tasks for global mask %i",
    async (mask) => {
      const enabled = TASKS.map((_, index) => Boolean(mask & (1 << index)));
      const { httpServer } = await createStartup({
        APP_ENV: "production", NODE_ENV: "production", ...CONFIGURED,
        ...Object.fromEntries(TASKS.map(([global], index) => [global, String(enabled[index])])),
      });
      expect(state.calls).toEqual([
        ...(enabled[0] ? SEED_CALLS : []), "routes",
        ...(enabled[1] || enabled[2] ? ["databaseImport"] : []),
        ...(enabled[1] ? ["startWebsiteHq"] : []),
        ...(enabled[2] ? ["startNotifications"] : []),
        ...(enabled[3] ? ["startPeggyReports"] : []), "static",
      ]);
      expect(httpServer.listenerCount("close")).toBe(Number(enabled[1]) + Number(enabled[2]));
    },
  );

  it("does not treat preview opt-ins alone as global activation", async () => {
    await createStartup({
      APP_ENV: "preview", NODE_ENV: "production", ...CONFIGURED, ...PREVIEW_OPT_INS,
    });
    expect(state.calls).toEqual(["routes", "static"]);
  });

  it.each([undefined, "", "false", "1", "yes", "TRUE", "True", " true", "true "])(
    "rejects nonliteral global opt-ins %j even with preview approval",
    async (value) => {
      await createStartup({
        APP_ENV: "production", NODE_ENV: "production", ...CONFIGURED, ...PREVIEW_OPT_INS,
        ...Object.fromEntries(TASKS.map(([global]) => [global, value])),
      });
      expect(state.calls).toEqual(["routes", "static"]);
    },
  );

  it.each([undefined, "", "false", "1", "yes", "TRUE", "True", " true", "true "])(
    "rejects nonliteral preview opt-ins %j even with global approval",
    async (value) => {
      await createStartup({
        APP_ENV: "preview", NODE_ENV: "production", ...CONFIGURED, ...GLOBAL_OPT_INS,
        ...Object.fromEntries(TASKS.map(([, preview]) => [preview, value])),
      });
      expect(state.calls).toEqual(["routes", "static"]);
    },
  );

  it.each([
    { APP_ENV: " PREVIEW " },
    { APP_ENV: "production", VERCEL_ENV: " Preview " },
  ])("respects normalized preview identities %j", async (identity) => {
    await createStartup({ ...identity, NODE_ENV: "production", ...CONFIGURED, ...GLOBAL_OPT_INS });
    expect(state.calls).toEqual(["routes", "static"]);
  });

  it.each(["production", "development", undefined])(
    "permits explicit non-preview tasks with APP_ENV=%s without preview opt-ins",
    async (appEnvironment) => {
      const nodeEnvironment = appEnvironment === "development" ? "development" : "production";
      await createStartup({
        APP_ENV: appEnvironment, NODE_ENV: nodeEnvironment, ...CONFIGURED, ...GLOBAL_OPT_INS,
      });
      expect(state.calls).toEqual([
        ...SEED_CALLS, ...(nodeEnvironment === "development" ? ["seedDealflowData"] : []),
        "routes", "databaseImport", "startWebsiteHq", "startNotifications", "startPeggyReports",
        nodeEnvironment === "development" ? "vite" : "static",
      ]);
    },
  );

  it.each(["preview", "production", "development", undefined])(
    "never imports DB or starts tasks in serverless mode with APP_ENV=%s and every opt-in",
    async (appEnvironment) => {
      const { httpServer } = await createStartup({
        APP_ENV: appEnvironment, NODE_ENV: "production", ...CONFIGURED, ...GLOBAL_OPT_INS, ...PREVIEW_OPT_INS,
      }, "serverless");
      expect(state.calls).toEqual(["routes", "static"]);
      expect(httpServer.listenerCount("close")).toBe(0);
    },
  );

  it.each([
    ["hq", "DATABASE_URL"], ["hq", "WEBSITE_ORG_ID"],
    ["hq", "PEGASUS_HQ_WEBSITE_INQUIRY_URL"], ["hq", "PEGASUS_WEBSITE_INQUIRY_TOKEN"],
    ["notifications", "DATABASE_URL"], ["notifications", "WEBSITE_ORG_ID"],
    ["notifications", "SENDGRID_API_KEY"], ["notifications", "DEFAULT_FROM_EMAIL"],
  ])("does not import DB or start %s when %s is absent", async (worker, field) => {
    const { httpServer } = await createStartup({
      APP_ENV: "production", NODE_ENV: "production", ...CONFIGURED,
      [worker === "hq" ? "PEGASUS_ENABLE_HQ_DELIVERY_WORKER" : "PEGASUS_ENABLE_NOTIFICATION_WORKER"]: "true",
      [field]: undefined,
    });
    expect(state.calls).toEqual(["routes", "static"]);
    expect(httpServer.listenerCount("close")).toBe(0);
  });

  it.each([
    ["hq", "WEBSITE_ORG_ID", "invalid-org"],
    ["hq", "PEGASUS_HQ_WEBSITE_INQUIRY_URL", "http://hq.example/api/public/website-inquiries"],
    ["hq", "PEGASUS_WEBSITE_INQUIRY_TOKEN", "invalid\ntoken"],
    ["notifications", "WEBSITE_ORG_ID", "invalid-org"],
    ["notifications", "SENDGRID_API_KEY", "invalid\nkey"],
    ["notifications", "DEFAULT_FROM_EMAIL", "invalid-sender"],
  ])("does not import DB or start %s when %s is invalid", async (worker, field, value) => {
    await createStartup({
      APP_ENV: "production", NODE_ENV: "production", ...CONFIGURED,
      [worker === "hq" ? "PEGASUS_ENABLE_HQ_DELIVERY_WORKER" : "PEGASUS_ENABLE_NOTIFICATION_WORKER"]: "true",
      [field]: value,
    });
    expect(state.calls).toEqual(["routes", "static"]);
  });

  it("passes the selected runtime and environment to each new worker exactly once", async () => {
    const environment = {
      APP_ENV: "production", NODE_ENV: "production", ...CONFIGURED,
      PEGASUS_ENABLE_HQ_DELIVERY_WORKER: "true", PEGASUS_ENABLE_NOTIFICATION_WORKER: "true",
    };
    await createStartup(environment);
    expect(state.hqStart).toHaveBeenCalledExactlyOnceWith({ db: state.db, runtime: "persistent", environment });
    expect(state.notificationStart).toHaveBeenCalledExactlyOnceWith(state.db, expect.objectContaining({ runtime: "persistent", environment }));
    expect(state.calls).not.toContain("legacyHqImport");
    expect(state.calls).not.toContain("legacyHqStart");
  });

  it("awaits both shutdown handles once when the server closes", async () => {
    let release!: () => void;
    const finishing = new Promise<void>(resolve => { release = resolve; });
    state.hqStop.mockImplementation(() => finishing);
    state.notificationStop.mockImplementation(() => finishing);
    const { httpServer } = await createStartup({
      APP_ENV: "production", NODE_ENV: "production", ...CONFIGURED,
      PEGASUS_ENABLE_HQ_DELIVERY_WORKER: "true", PEGASUS_ENABLE_NOTIFICATION_WORKER: "true",
    });
    const listeners = httpServer.rawListeners("close");
    const completed: number[] = [];
    const stops = listeners.map((listener, index) => Promise.resolve(listener.call(httpServer)).then(() => { completed.push(index); }));
    await Promise.resolve();
    expect(state.hqStop).toHaveBeenCalledOnce();
    expect(state.notificationStop).toHaveBeenCalledOnce();
    expect(completed).toEqual([]);
    release();
    await Promise.all(stops);
    expect(completed).toHaveLength(2);
    expect(httpServer.listenerCount("close")).toBe(0);
    httpServer.emit("close");
    expect(state.hqStop).toHaveBeenCalledOnce();
    expect(state.notificationStop).toHaveBeenCalledOnce();
  });

  it("catches async worker shutdown errors without logging provider or database details", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    state.hqStop.mockRejectedValue(new Error("private-database-detail"));
    state.notificationStop.mockRejectedValue(new Error("private-provider-detail"));
    const { httpServer } = await createStartup({
      APP_ENV: "production", NODE_ENV: "production", ...CONFIGURED,
      PEGASUS_ENABLE_HQ_DELIVERY_WORKER: "true", PEGASUS_ENABLE_NOTIFICATION_WORKER: "true",
    });
    await Promise.all(httpServer.rawListeners("close").map(listener => listener.call(httpServer)));
    expect(errorLog.mock.calls).toEqual([
      ["[website-hq] worker shutdown failed"],
      ["[website notifications] worker shutdown failed"],
    ]);
  });
});
