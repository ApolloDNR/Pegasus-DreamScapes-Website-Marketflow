import { describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

vi.mock("../storage", () => ({
  storage: {
    getSiteContent: async () => null,
  },
}));

vi.mock("../email", () => ({
  sendPegasusSubmissionNotification: async () => undefined,
  sendBlueprintOrderNotification: async () => undefined,
}));

vi.mock("../pdf", () => ({
  generateStrategySnapshotPDF: async () => Buffer.from("pdf"),
}));

vi.mock("../supabaseAuth", () => ({
  extractSupabaseUser: async () => null,
}));

const { registerStrategyLabRoutes } = await import("../strategyLabRoutes");

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  registerStrategyLabRoutes(app, {
    isAuthenticated: (_req, res, _next) => res.status(401).json({ message: "Unauthorized" }),
    adminEmails: ["admin@pegasus.test"],
  });

  let server: Server | null = null;
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });

  try {
    const port = (server.address() as AddressInfo).port;
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve) => server?.close(() => resolve()));
  }
}

describe("Strategy Lab public boundary", () => {
  it("does not expose legacy Blueprint tier pricing to anonymous visitors", async () => {
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/strategy-lab/blueprint-tiers`);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(JSON.stringify(body)).not.toContain("priceCents");
      expect(JSON.stringify(body)).not.toContain("49700");
      expect(JSON.stringify(body)).not.toContain("Single-Path Blueprint");
    });
  });
});
