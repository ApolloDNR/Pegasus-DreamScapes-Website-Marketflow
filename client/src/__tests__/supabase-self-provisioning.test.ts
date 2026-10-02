import { afterEach, describe, expect, it, vi } from "vitest";
import * as supabaseClient from "@/lib/supabase";

type ProvisionAuthenticatedUserProfile = (input: {
  userId: string;
  role: string;
  displayName: string;
  accessToken: string;
}) => Promise<{ success: boolean }>;

type EnsureAuthenticatedUserProfile = (
  session: {
    access_token: string;
    user: {
      id: string;
      user_metadata: Record<string, unknown>;
    };
  },
  fetchProfile: (userId: string, accessToken?: string) => Promise<unknown>,
) => Promise<unknown>;

function requireProvisioner(): ProvisionAuthenticatedUserProfile {
  const provisioner = (
    supabaseClient as unknown as {
      provisionAuthenticatedUserProfile?: unknown;
    }
  ).provisionAuthenticatedUserProfile;
  expect(
    provisioner,
    "the Supabase signup flow must use an authenticated provisioning request",
  ).toBeTypeOf("function");
  if (typeof provisioner !== "function") {
    throw new Error("provisionAuthenticatedUserProfile is not implemented");
  }
  return provisioner as ProvisionAuthenticatedUserProfile;
}

function requireProfileEnsurer(): EnsureAuthenticatedUserProfile {
  const ensureProfile = (
    supabaseClient as unknown as {
      ensureAuthenticatedUserProfile?: unknown;
    }
  ).ensureAuthenticatedUserProfile;
  expect(
    ensureProfile,
    "authenticated sessions must recover deferred email-confirmation signups",
  ).toBeTypeOf("function");
  if (typeof ensureProfile !== "function") {
    throw new Error("ensureAuthenticatedUserProfile is not implemented");
  }
  return ensureProfile as EnsureAuthenticatedUserProfile;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("provisionAuthenticatedUserProfile", () => {
  it("binds self-provisioning to the current Supabase bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await requireProvisioner()({
      userId: "user-123",
      role: "investor",
      displayName: "Taylor Investor",
      accessToken: "signed-user-token",
    });

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/supabase/provision-user",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer signed-user-token",
        },
        body: JSON.stringify({
          userId: "user-123",
          role: "investor",
          displayName: "Taylor Investor",
        }),
      }),
    );
  });

  it("refuses to issue a provisioning request without an access token", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requireProvisioner()({
        userId: "user-123",
        role: "investor",
        displayName: "Taylor Investor",
        accessToken: "",
      }),
    ).rejects.toThrow(/authenticated session/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("provisions a confirmation-deferred signup from signed user metadata", async () => {
    const profile = { user_id: "user-123", primary_role: "investor" };
    const fetchProfile = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(profile);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await requireProfileEnsurer()(
      {
        access_token: "signed-user-token",
        user: {
          id: "user-123",
          user_metadata: {
            primary_role: "investor",
            display_name: "Taylor Investor",
          },
        },
      },
      fetchProfile,
    );

    expect(result).toEqual(profile);
    expect(fetchProfile).toHaveBeenNthCalledWith(
      1,
      "user-123",
      "signed-user-token",
    );
    expect(fetchProfile).toHaveBeenNthCalledWith(
      2,
      "user-123",
      "signed-user-token",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/supabase/provision-user",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer signed-user-token",
        }),
      }),
    );
  });

  it("does not provision an authenticated user without signup metadata", async () => {
    const fetchProfile = vi.fn().mockResolvedValue(null);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await requireProfileEnsurer()(
      {
        access_token: "signed-user-token",
        user: {
          id: "user-123",
          user_metadata: {},
        },
      },
      fetchProfile,
    );

    expect(result).toBeNull();
    expect(fetchProfile).toHaveBeenCalledOnce();
    expect(fetchProfile).toHaveBeenCalledWith(
      "user-123",
      "signed-user-token",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
