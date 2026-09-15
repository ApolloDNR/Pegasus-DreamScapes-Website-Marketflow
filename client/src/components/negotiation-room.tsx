import { Scale } from "lucide-react";
import { LegacyWorkflowNotice } from "@/components/legacy-workflow-notice";
import type { OfferStudioLane } from "@/components/open-offer-studio-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type NegotiationType =
  | "wholesale_offer"
  | "wholesale_jv"
  | "capital_raise"
  | "capital_invest";

export type LegacyNegotiationType = "wholesale" | "capital";

export interface WholesaleOfferTerms {
  assignmentFee: number;
  earnestMoney: number;
  closingDate: string;
  inspectionPeriod: number;
  message?: string;
}

export interface WholesaleJVTerms {
  assignmentSplitPercent: number;
  partnerRole: "deal_bringer" | "buyer_bringer";
  message?: string;
}

export interface CapitalRaiseTerms {
  capitalTarget: number;
  minimumInvestment: number;
  structureType: "debt" | "equity" | "hybrid";
  proposedReturns: number;
  profitSplit: number;
  timeline: number;
  amountRaised?: number;
}

export interface CapitalInvestTerms {
  investmentAmount: number;
  expectedReturn: number;
  profitSplit: number;
  termMonths: number;
  message?: string;
}

export interface NegotiationTerms {
  assignmentFee?: number;
  earnestMoney?: number;
  closingDate?: string;
  inspectionPeriod?: number;
  assignmentSplitPercent?: number;
  partnerRole?: "deal_bringer" | "buyer_bringer";
  capitalTarget?: number;
  minimumInvestment?: number;
  structureType?: "debt" | "equity" | "hybrid";
  proposedReturns?: number;
  amountRaised?: number;
  investmentAmount?: number;
  expectedReturn?: number;
  profitSplit?: number;
  termMonths?: number;
  message?: string;
  notes?: string;
  purchasePrice?: number;
  contractPrice?: number;
  timeline?: number;
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  terms?: NegotiationTerms;
  type: "message" | "offer" | "counter" | "accepted" | "rejected";
  timestamp: Date;
}

export interface NegotiationRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: NegotiationType;
  dealId: string | number;
  dealTitle: string;
  originalTerms: NegotiationTerms;
  counterpartyName: string;
  counterpartyId: string;
  onAgreementReached?: (finalTerms: NegotiationTerms) => void;
}

function laneForNegotiation(type: NegotiationType): OfferStudioLane {
  return type.startsWith("wholesale") ? "WHOLESALE" : "CAPITAL";
}

export function NegotiationRoom({
  open,
  onOpenChange,
  type,
  dealId,
  dealTitle,
  counterpartyName,
}: NegotiationRoomProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" aria-hidden="true" />
            {dealTitle}
          </DialogTitle>
          <DialogDescription>
            Negotiation with {counterpartyName}
          </DialogDescription>
        </DialogHeader>

        <LegacyWorkflowNotice
          title="This negotiation has moved to Offer Studio"
          description="Use the persisted MarketFlow workflow to send terms, counter, accept, decline, and keep the conversation attached to the correct deal."
          dealId={dealId}
          lane={laneForNegotiation(type)}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
