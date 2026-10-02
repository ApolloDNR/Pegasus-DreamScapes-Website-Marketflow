import { MessageCircle } from "lucide-react";
import { LegacyWorkflowNotice } from "@/components/legacy-workflow-notice";
import type { OfferStudioLane } from "@/components/open-offer-studio-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DealChatProps {
  dealType: "capital_project" | "wholesale_deal";
  dealId: number;
  className?: string;
}

const laneByDealType: Record<DealChatProps["dealType"], OfferStudioLane> = {
  capital_project: "CAPITAL",
  wholesale_deal: "WHOLESALE",
};

export function DealChat({ dealType, dealId, className = "" }: DealChatProps) {
  return (
    <Card className={className} data-testid="deal-chat-launch-notice">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Deal conversation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <LegacyWorkflowNotice
          compact
          title="Continue the conversation in Offer Studio"
          description="Offer Studio keeps messages attached to a persisted negotiation so both parties see the same terms and history."
          dealId={dealId}
          lane={laneByDealType[dealType]}
        />
      </CardContent>
    </Card>
  );
}
