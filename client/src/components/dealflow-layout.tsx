import type { ReactNode } from "react";

import { MarketplaceLayout } from "@/components/marketplace-layout";

interface DealflowLayoutProps {
  children: ReactNode;
}

/**
 * Compatibility shell for the remaining /dealflow/* record routes.
 *
 * The former Dealflow chrome duplicated MarketFlow navigation and filled it
 * with hard-coded message counts, deal counts, presence dots, and system
 * health claims. Legacy records now use the canonical, data-backed MarketFlow
 * shell so there is one navigation and account contract to maintain.
 */
export function DealflowLayout({ children }: DealflowLayoutProps) {
  return <MarketplaceLayout>{children}</MarketplaceLayout>;
}
