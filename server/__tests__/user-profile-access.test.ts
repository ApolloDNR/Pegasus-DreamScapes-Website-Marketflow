import { describe, expect, it } from "vitest";
import { canReadUserProfile } from "../user-profile-access";

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
