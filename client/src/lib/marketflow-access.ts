import {
  canAccessReviewedMarketflowInventory,
} from "@shared/marketflow-inventory-access";
import { normalizeSpaPath } from "@shared/spa-routes";

type MarketflowProfileLike = {
  primary_role?: unknown;
  is_pegasus_badged?: unknown;
} | null;

export function hasGovernedMarketflowAccess(input: {
  isAuthenticated: boolean;
  isGuestMode?: boolean;
  isAdmin?: boolean;
  profile?: MarketflowProfileLike;
  userRole?: unknown;
}): boolean {
  return canAccessReviewedMarketflowInventory({
    isAuthenticated: input.isAuthenticated,
    isGuestMode: input.isGuestMode,
    isPegasusBadged: input.profile?.is_pegasus_badged,
    isStaff: input.isAdmin,
    roles: [input.profile?.primary_role, input.userRole],
  });
}

const GUEST_ROLE_WALKTHROUGHS = new Set([
  "/marketflow/wholesaler",
  "/marketflow/dreamscaper",
  "/marketflow/investor",
  "/marketflow/buyer",
]);

export function isGuestMarketflowWalkthrough(pathname: string): boolean {
  return GUEST_ROLE_WALKTHROUGHS.has(normalizeSpaPath(pathname));
}
