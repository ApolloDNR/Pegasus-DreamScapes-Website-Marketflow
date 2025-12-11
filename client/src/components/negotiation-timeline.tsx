import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Send,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type NegotiationStatus = 
  | "pending"
  | "under_review"
  | "counter_offered"
  | "accepted"
  | "declined"
  | "expired"
  | "withdrawn";

export interface NegotiationEvent {
  id: string;
  type: "offer" | "counter" | "message" | "status_change" | "accepted" | "declined";
  timestamp: string;
  actor: string;
  actorRole: string;
  details: {
    amount?: number;
    equityPercent?: number;
    profitSplit?: string;
    interestRate?: string;
    duration?: string;
    message?: string;
    previousStatus?: NegotiationStatus;
    newStatus?: NegotiationStatus;
  };
}

interface NegotiationTimelineProps {
  events: NegotiationEvent[];
  currentStatus: NegotiationStatus;
  canCounter?: boolean;
  canAccept?: boolean;
  canDecline?: boolean;
  onCounter?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusConfig: Record<NegotiationStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }> = {
  pending: { label: "Pending Review", variant: "secondary", icon: Clock },
  under_review: { label: "Under Review", variant: "secondary", icon: Clock },
  counter_offered: { label: "Counter Offered", variant: "outline", icon: RefreshCw },
  accepted: { label: "Accepted", variant: "default", icon: CheckCircle2 },
  declined: { label: "Declined", variant: "destructive", icon: XCircle },
  expired: { label: "Expired", variant: "secondary", icon: Clock },
  withdrawn: { label: "Withdrawn", variant: "secondary", icon: XCircle },
};

function EventIcon({ type }: { type: NegotiationEvent["type"] }) {
  switch (type) {
    case "offer":
      return <DollarSign className="w-4 h-4 text-green-600" />;
    case "counter":
      return <RefreshCw className="w-4 h-4 text-amber-600" />;
    case "message":
      return <MessageCircle className="w-4 h-4 text-blue-600" />;
    case "accepted":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "declined":
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

function TimelineEvent({ event }: { event: NegotiationEvent }) {
  const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
  
  return (
    <div className="flex gap-3 py-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <EventIcon type={event.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{event.actor}</span>
          <Badge variant="outline" className="text-xs">
            {event.actorRole}
          </Badge>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        
        {event.type === "offer" || event.type === "counter" ? (
          <div className="mt-2 p-3 rounded-lg bg-muted/50 space-y-1">
            {event.details.amount && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">{formatCurrency(event.details.amount)}</span>
              </div>
            )}
            {event.details.equityPercent && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Equity</span>
                <span className="font-semibold">{event.details.equityPercent}%</span>
              </div>
            )}
            {event.details.profitSplit && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit Split</span>
                <span className="font-semibold">{event.details.profitSplit}</span>
              </div>
            )}
            {event.details.interestRate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-semibold">{event.details.interestRate}</span>
              </div>
            )}
            {event.details.duration && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">{event.details.duration}</span>
              </div>
            )}
          </div>
        ) : event.type === "message" && event.details.message ? (
          <p className="mt-1 text-sm text-muted-foreground">{event.details.message}</p>
        ) : event.type === "accepted" ? (
          <p className="mt-1 text-sm text-green-600 font-medium">Offer accepted</p>
        ) : event.type === "declined" ? (
          <p className="mt-1 text-sm text-red-600 font-medium">Offer declined</p>
        ) : null}
      </div>
    </div>
  );
}

export function NegotiationTimeline({
  events,
  currentStatus,
  canCounter,
  canAccept,
  canDecline,
  onCounter,
  onAccept,
  onDecline,
  isLoading,
}: NegotiationTimelineProps) {
  const statusInfo = statusConfig[currentStatus];
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Negotiation History
          </CardTitle>
          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length > 0 ? (
          <div className="divide-y">
            {events.map((event, index) => (
              <TimelineEvent key={event.id || index} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No negotiation history yet
          </div>
        )}

        {(canCounter || canAccept || canDecline) && (
          <>
            <Separator />
            <div className="flex gap-2 flex-wrap">
              {canAccept && onAccept && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onAccept}
                  disabled={isLoading}
                  data-testid="button-accept-offer"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              )}
              {canCounter && onCounter && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCounter}
                  disabled={isLoading}
                  data-testid="button-counter-offer"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Counter
                </Button>
              )}
              {canDecline && onDecline && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={onDecline}
                  disabled={isLoading}
                  data-testid="button-decline-offer"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function NegotiationStatusBadge({ status }: { status: NegotiationStatus }) {
  const info = statusConfig[status];
  const Icon = info.icon;
  
  return (
    <Badge variant={info.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {info.label}
    </Badge>
  );
}
