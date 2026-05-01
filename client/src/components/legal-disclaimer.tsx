import type { ReactNode } from "react";
interface LegalDisclaimerProps {
  className?: string;
  children?: ReactNode;
}

export function LegalDisclaimer({ className = "", children }: LegalDisclaimerProps) {
  return (
    <div className={`rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground ${className}`}>
      {children ?? "Information on this website is for general informational purposes only and does not constitute an offer to sell or a solicitation to buy securities. Any investment, lending, joint venture, or partnership opportunity is subject to private review, diligence, appropriate documentation, and applicable legal requirements. Past performance does not guarantee future results."}
    </div>
  );
}
