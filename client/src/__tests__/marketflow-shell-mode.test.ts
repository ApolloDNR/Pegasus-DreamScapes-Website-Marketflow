import { describe, expect, it } from "vitest";
import { classifyShellMode } from "@/lib/shell-mode";

describe("private MarketFlow deals shell", () => {
  it("uses standalone chrome for anonymous, guest, and ordinary authenticated holds", () => {
    expect(
      classifyShellMode({
        location: "/marketflow/deals",
        isAuthenticated: false,
        isGuestMode: false,
      }),
    ).toBe("standalone");
    expect(
      classifyShellMode({
        location: "/marketflow/deals",
        isAuthenticated: false,
        isGuestMode: true,
      }),
    ).toBe("standalone");
    expect(
      classifyShellMode({
        location: "/marketflow/deals",
        isAuthenticated: true,
        isGuestMode: false,
        roles: ["investor"],
      }),
    ).toBe("standalone");
  });

  it.each([
    {
      label: "Pegasus badge",
      identity: { isPegasusBadged: true, roles: ["investor"] },
    },
    {
      label: "Pegasus-prefixed role",
      identity: { roles: ["pegasus_wholesaler"] },
    },
    {
      label: "staff role",
      identity: { roles: ["project_manager"] },
    },
    {
      label: "administrative identity",
      identity: { isStaff: true, roles: ["investor"] },
    },
  ])("uses legacy operator chrome for an approved $label", ({ identity }) => {
    expect(
      classifyShellMode({
        location: "/marketflow/deals",
        isAuthenticated: true,
        isGuestMode: false,
        ...identity,
      }),
    ).toBe("legacy");
  });

  it("does not change unrelated authenticated operator routes", () => {
    expect(
      classifyShellMode({
        location: "/marketflow/submit",
        isAuthenticated: true,
        isGuestMode: false,
        roles: ["wholesaler"],
      }),
    ).toBe("legacy");
  });

  it.each([
    "/marketflow/deals/",
    "/marketflow/deals///?source=preview#inventory",
  ])("keeps anonymous trailing-slash aliases in the public hold shell: %s", (location) => {
    expect(
      classifyShellMode({
        location,
        isAuthenticated: false,
        isGuestMode: false,
      }),
    ).toBe("standalone");
  });

  it("preserves approved operator chrome on the normalized trailing-slash alias", () => {
    expect(
      classifyShellMode({
        location: "/marketflow/deals/",
        isAuthenticated: true,
        isGuestMode: false,
        isPegasusBadged: true,
      }),
    ).toBe("legacy");
  });
});
