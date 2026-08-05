import { STAFF_ROLES } from "./schema";

export type MarketflowInventoryIdentity = {
  isAuthenticated: boolean;
  isGuestMode?: boolean;
  isPegasusBadged?: unknown;
  isStaff?: unknown;
  roles?: readonly unknown[];
};

const STAFF_ROLE_SET = new Set<string>(STAFF_ROLES);

function normalizeRole(role: unknown): string | null {
  return typeof role === "string" && role.trim()
    ? role.trim().toLowerCase()
    : null;
}

/**
 * MarketFlow inventory is private-beta data. Authentication alone is not an
 * approval signal: access requires a governed Pegasus badge/role or a staff
 * identity that cannot be created through the self-provisioning endpoint.
 */
export function canAccessReviewedMarketflowInventory(
  identity: MarketflowInventoryIdentity,
): boolean {
  if (!identity.isAuthenticated || identity.isGuestMode === true) {
    return false;
  }

  if (identity.isPegasusBadged === true || identity.isStaff === true) {
    return true;
  }

  return (identity.roles ?? []).some((candidate) => {
    const role = normalizeRole(candidate);
    return (
      role !== null &&
      (STAFF_ROLE_SET.has(role) || role.startsWith("pegasus_"))
    );
  });
}
