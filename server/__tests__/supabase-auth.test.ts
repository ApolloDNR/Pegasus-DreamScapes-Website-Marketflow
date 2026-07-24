import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { auth: { getUser: mocks.getUser } },
  supabaseAdmin: { auth: { getUser: mocks.getUser } },
  isSupabaseConfigured: true,
  isSupabaseAdminConfigured: true,
}));

import { extractSupabaseUser } from "../supabaseAuth";

describe("extractSupabaseUser", () => {
  beforeEach(() => {
    mocks.getUser.mockReset();
  });

  it("keeps verified identity authoritative over conflicting user metadata", async () => {
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "verified-user",
          email: "verified@example.com",
          user_metadata: {
            sub: "metadata-attacker",
            email: "attacker@example.com",
            primary_role: "investor",
          },
        },
      },
      error: null,
    });

    const request = {
      headers: { authorization: "Bearer signed-user-token" },
    };
    const user = await extractSupabaseUser(request as any);

    expect(mocks.getUser).toHaveBeenCalledWith("signed-user-token");
    expect(user).toEqual({
      id: "verified-user",
      email: "verified@example.com",
      claims: {
        sub: "verified-user",
        email: "verified@example.com",
        primary_role: "investor",
      },
    });
  });
});
