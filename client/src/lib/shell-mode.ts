import {
  isNotFoundUrl,
  isPegasusUrl,
  isProductShellUrl,
  isStandaloneChromeUrl,
} from "@/pegasus/routes";
import {
  canAccessReviewedMarketflowInventory,
  type MarketflowInventoryIdentity,
} from "@shared/marketflow-inventory-access";
import { normalizeSpaPath } from "@shared/spa-routes";

export type ShellMode = "pegasus" | "standalone" | "product" | "legacy";

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
      ? "product"
      : "standalone";
  }
  if (isPegasusUrl(pathname)) return "pegasus";
  if (isStandaloneChromeUrl(pathname) || isNotFoundUrl(pathname)) {
    return "standalone";
  }
  if (isProductShellUrl(pathname)) return "product";
  return "legacy";
}
