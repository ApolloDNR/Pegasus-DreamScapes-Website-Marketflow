import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { registerPublicLibraryRetirementRoutes } from "../public-library-retirement";

describe("public Strategy Library retirement HTTP boundary", () => {
  let server: Server;
  let baseUrl = "";

  beforeAll(async () => {
    const app = express();
    registerPublicLibraryRetirementRoutes(app);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it.each([
    "/library",
    "/library/fixture-article",
    "/resources",
    "/education",
    "/strategy-library",
  ])(
    "302 redirects %s directly to Strategy Lab",
    async (path) => {
      const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe("/strategy-lab");
    },
  );

  it.each([
    "/api/articles",
    "/api/articles/library",
    "/api/articles/fixture-article",
    "/api/library/beginner-path",
    "/api/library/glossary",
  ])("returns a deliberate non-success response from %s", async (path) => {
    const response = await fetch(`${baseUrl}${path}`);
    expect(response.status).toBe(410);
    const body = await response.json();
    expect(body).toEqual({ message: "Public Strategy Library is retired" });
  });
});
