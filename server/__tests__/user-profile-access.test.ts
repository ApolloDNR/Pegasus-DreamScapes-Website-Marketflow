import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import express, { type Express, type RequestHandler } from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { canReadUserProfile } from "../user-profile-access";

type ProfileRouteDependencies = {
  isAuthenticated: RequestHandler;
  getAuthenticatedUserId: (req: unknown) => string | null;
  loadUserProfile: (userId: string) => Promise<unknown | null>;
};

type RegisterUserProfileRoute = (
  app: Express,
  dependencies: ProfileRouteDependencies,
) => void;

const { registerUserProfileRoute } = await import("../user-profile-route");

let server: Server | undefined;
let baseUrl = "";
let loadedUserIds: string[] = [];

async function getProfile(targetUserId: string, requesterUserId?: string) {
  return fetch(`${baseUrl}/api/supabase/profile/${targetUserId}`, {
    headers: requesterUserId
      ? { "x-test-authenticated-user": requesterUserId }
      : {},
  });
}

beforeAll(async () => {
  const app = express();
  const dependencies: ProfileRouteDependencies = {
    isAuthenticated: ((req: any, res, next) => {
      const userId = req.get("x-test-authenticated-user");
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = { claims: { sub: userId } };
      next();
    }) as RequestHandler,
    getAuthenticatedUserId: (req: any) => req.user?.claims?.sub ?? null,
    loadUserProfile: async (userId) => {
      loadedUserIds.push(userId);
      return { user_id: userId, display_name: "Private Profile" };
    },
  };

  (registerUserProfileRoute as RegisterUserProfileRoute)(app, dependencies);
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
  loadedUserIds = [];
});

describe("user profile access", () => {
  it("allows an authenticated user to read their own profile", () => {
    expect(
      canReadUserProfile({
        requesterUserId: "user-123",
        targetUserId: "user-123",
      }),
    ).toBe(true);
  });

  it("does not let an authenticated user read another user's raw profile", () => {
    expect(
      canReadUserProfile({
        requesterUserId: "user-123",
        targetUserId: "user-456",
      }),
    ).toBe(false);
  });

  it("does not expose another user's raw profile through a staff session", () => {
    expect(
      canReadUserProfile({
        requesterUserId: "staff-123",
        targetUserId: "user-456",
      }),
    ).toBe(false);
  });
});

describe("GET /api/supabase/profile/:userId", () => {
  it("rejects an anonymous caller", async () => {
    const response = await getProfile("user-123");

    expect(response.status).toBe(401);
    expect(loadedUserIds).toEqual([]);
  });

  it("does not load another user's raw profile", async () => {
    const response = await getProfile("user-456", "user-123");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Profile not found" });
    expect(loadedUserIds).toEqual([]);
  });

  it("returns the authenticated user's own raw profile", async () => {
    const response = await getProfile("user-123", "user-123");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      user_id: "user-123",
      display_name: "Private Profile",
    });
    expect(loadedUserIds).toEqual(["user-123"]);
  });

  it("does not give a staff account a raw-profile bypass", async () => {
    const response = await getProfile("user-456", "staff-123");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Profile not found" });
    expect(loadedUserIds).toEqual([]);
  });
});
