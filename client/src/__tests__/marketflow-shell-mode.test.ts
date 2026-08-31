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
  ])("uses the self-owned product shell for an approved $label", ({ identity }) => {
    expect(
      classifyShellMode({
        location: "/marketflow/deals",
        isAuthenticated: true,
        isGuestMode: false,
        ...identity,
      }),
    ).toBe("product");
  });

  it.each([
    "/marketflow/submit",
    "/marketflow/dashboard",
    "/marketflow/deals/deal-42",
    "/marketflow/listings/listing-42",
    "/marketflow/properties/property-42",
    "/marketflow/offer-studio/deal-42",
    "/dealflow/project/project-42",
    "/profile/member-42",
    "/offer-studio/capital/deal-42",
  ])("uses product-owned chrome for the mounted operator route %s", (location) => {
    expect(
      classifyShellMode({
        location,
        isAuthenticated: true,
        isGuestMode: false,
        roles: ["wholesaler"],
      }),
    ).toBe("product");
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
    ).toBe("product");
  });

  it.each([
    "/marketflow",
    "/marketflow/access",
    "/marketflow/buyboxes",
  ])("preserves the public shell contract for %s", (location) => {
    expect(
      classifyShellMode({
        location,
        isAuthenticated: false,
        isGuestMode: false,
      }),
    ).not.toBe("product");
  });
});
