import {
  isNotFoundUrl,
  isPegasusUrl,
  isStandaloneChromeUrl,
} from "@/pegasus/routes";
import {
  canAccessReviewedMarketflowInventory,
  type MarketflowInventoryIdentity,
} from "@shared/marketflow-inventory-access";
import { normalizeSpaPath } from "@shared/spa-routes";

export type ShellMode = "pegasus" | "standalone" | "legacy";

export function classifyShellMode({
  location,
  isAuthenticated,
  isGuestMode,
  isPegasusBadged,
  isStaff,
  roles,
}: MarketflowInventoryIdentity & {
  location: string;
}): ShellMode {
  const pathname = normalizeSpaPath(location);

  if (pathname === "/marketflow/deals") {
    return canAccessReviewedMarketflowInventory({
      isAuthenticated,
      isGuestMode,
      isPegasusBadged,
      isStaff,
      roles,
    })
      ? "legacy"
      : "standalone";
  }
  if (isPegasusUrl(location)) return "pegasus";
  if (isStandaloneChromeUrl(location) || isNotFoundUrl(location)) {
    return "standalone";
  }
  return "legacy";
}
