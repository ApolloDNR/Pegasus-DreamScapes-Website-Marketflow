import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import {
  OpenOfferStudioButton,
  type OfferStudioLane,
  useCanOpenOfferStudio,
} from "@/components/open-offer-studio-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LegacyWorkflowNoticeProps {
  title: string;
  description: string;
  dealId?: string | number;
  lane?: OfferStudioLane;
  className?: string;
  compact?: boolean;
}

export function LegacyWorkflowNotice({
  title,
  description,
  dealId,
  lane,
  className,
  compact = false,
}: LegacyWorkflowNoticeProps) {
  const canOpenOfferStudio = useCanOpenOfferStudio();
  const hasDirectDestination =
    canOpenOfferStudio && dealId !== undefined && lane !== undefined;

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/20 bg-primary/5",
        compact ? "p-4" : "p-5 sm:p-6",
        className,
      )}
      data-testid="legacy-workflow-notice"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            This older panel is read-only for launch. It does not send, accept,
            decline, counter, or record messages.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {hasDirectDestination ? (
              <OpenOfferStudioButton
                dealId={dealId}
                lane={lane}
                label="Continue in Offer Studio"
                variant="default"
                size="sm"
              />
            ) : (
              <Link
                href={canOpenOfferStudio ? "/marketflow/deals" : "/marketflow/access"}
              >
                <Button size="sm">
                  {canOpenOfferStudio
                    ? "Open MarketFlow deals"
                    : "Request MarketFlow access"}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
