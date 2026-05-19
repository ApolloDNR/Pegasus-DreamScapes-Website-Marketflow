import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { usePeggyContext } from "@/contexts/peggy-context";

type DealType = "capital" | "wholesale" | "retail";

interface AskPeggyButtonProps {
  dealType: DealType;
  dealId: number | string | null | undefined;
  dealLabel?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  fullWidth?: boolean;
}

const TYPE_LABEL: Record<DealType, string> = {
  capital: "capital project",
  wholesale: "wholesale deal",
  retail: "retail listing",
};

export function buildDealAskPeggyPrompt(
  dealType: DealType,
  dealLabel?: string,
): string {
  const kind = TYPE_LABEL[dealType];
  const subject = dealLabel ? `${kind} "${dealLabel}"` : `this ${kind}`;
  return [
    `I'm looking at ${subject}.`,
    "Give me a structural read: which of the 8 outcome lanes most likely fits, what should I stress-test in this deal, and what info is still missing for a real review?",
  ].join(" ");
}

export function AskPeggyButton({
  dealType,
  dealId,
  dealLabel,
  variant = "default",
  size = "sm",
  className,
  fullWidth,
}: AskPeggyButtonProps) {
  const { setDealContext, setPendingPrompt, openChat } = usePeggyContext();

  const numericId =
    typeof dealId === "number"
      ? dealId
      : typeof dealId === "string"
      ? parseInt(dealId, 10)
      : NaN;

  const handleClick = () => {
    if (Number.isFinite(numericId)) {
      setDealContext(dealType, numericId);
    }
    setPendingPrompt(buildDealAskPeggyPrompt(dealType, dealLabel));
    openChat();
  };

  return (
    <Button
      variant={variant === "default" ? "default" : variant}
      size={size}
      onClick={handleClick}
      className={[
        variant === "default" ? "bg-primary/90 hover:bg-primary" : "",
        fullWidth ? "w-full" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid={`button-ask-peggy-${dealType}`}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Ask Peggy
    </Button>
  );
}
