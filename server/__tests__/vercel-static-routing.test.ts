import express from "express";
import fs from "node:fs";
import type { Express, NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { serveStatic } from "../static";

interface Registration {
  method: "get" | "use";
  path: unknown;
  handler: unknown;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Vercel function static routing", () => {
  it("uses an explicit asset route instead of express.static", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "statSync").mockReturnValue({ isFile: () => true } as never);
    const expressStatic = vi.spyOn(express, "static");
    const registrations: Registration[] = [];
    const app = {
      get: (path: unknown, handler: unknown) => {
        registrations.push({ method: "get", path, handler });
      },
      use: (path: unknown, handler?: unknown) => {
        registrations.push({
          method: "use",
          path: handler === undefined ? "middleware" : path,
          handler: handler ?? path,
        });
      },
    } as unknown as Express;

    serveStatic(app, {
      assetMode: "function",
      distPath: "/deployment/dist/public",
    });

    expect(expressStatic).not.toHaveBeenCalled();
    expect(registrations.map(({ method, path }) => [method, path])).toEqual([
      ["get", "/index.html"],
      ["get", "*"],
      ["use", "*"],
    ]);

    const assetRoute = registrations[1].handler as (
      req: Pick<Request, "path">,
      res: Pick<Response, "sendFile">,
      next: NextFunction,
    ) => unknown;
    const sendFile = vi.fn();
    const next = vi.fn();
    assetRoute(
      { path: "/assets/app.js" },
      { sendFile } as unknown as Pick<Response, "sendFile">,
      next,
    );

    expect(sendFile).toHaveBeenCalledWith(
      "/deployment/dist/public/assets/app.js",
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("never resolves an encoded traversal outside the client build", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    const stat = vi.spyOn(fs, "statSync");
    const registrations: Registration[] = [];
    const app = {
      get: (path: unknown, handler: unknown) =>
        registrations.push({ method: "get", path, handler }),
      use: (path: unknown, handler: unknown) =>
        registrations.push({ method: "use", path, handler }),
    } as unknown as Express;

    serveStatic(app, {
      assetMode: "function",
      distPath: "/deployment/dist/public",
    });
    const assetRoute = registrations[1].handler as (
      req: Pick<Request, "path">,
      res: Pick<Response, "sendFile">,
      next: NextFunction,
    ) => unknown;
    const sendFile = vi.fn();
    const next = vi.fn();

    assetRoute(
      { path: "/%2e%2e/server.mjs" },
      { sendFile } as unknown as Pick<Response, "sendFile">,
      next,
    );

    expect(stat).not.toHaveBeenCalled();
    expect(sendFile).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
