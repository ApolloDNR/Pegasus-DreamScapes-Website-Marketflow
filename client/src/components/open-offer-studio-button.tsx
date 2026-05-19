import { Link } from "wouter";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

export type OfferStudioLane = "WHOLESALE" | "CAPITAL" | "LISTING";

interface OpenOfferStudioButtonProps extends Omit<ButtonProps, "asChild" | "onClick"> {
  dealId: string | number;
  lane: OfferStudioLane;
  label?: string;
  showIcon?: boolean;
  stopPropagation?: boolean;
}

export function useCanOpenOfferStudio() {
  const { isAuthenticated, isAdmin, isWholesaler, isDreamscaper, isInvestor, isBuyer } =
    useSupabaseAuth();
  return (
    isAuthenticated && (isAdmin || isWholesaler || isDreamscaper || isInvestor || isBuyer)
  );
}

export function OpenOfferStudioButton({
  dealId,
  lane,
  label = "Open Offer Studio",
  showIcon = true,
  stopPropagation = false,
  variant = "outline",
  className,
  size,
  ...buttonProps
}: OpenOfferStudioButtonProps) {
  const canOpen = useCanOpenOfferStudio();
  if (!canOpen) return null;

  const href = `/marketflow/offer-studio/${dealId}?lane=${lane}`;
  const testId = `button-open-offer-studio-${lane.toLowerCase()}-${dealId}`;

  return (
    <Link href={href} onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}>
      <Button
        variant={variant}
        size={size}
        className={className}
        data-testid={testId}
        {...buttonProps}
      >
        {showIcon && <Sparkles className="w-4 h-4 mr-2" />}
        {label}
      </Button>
    </Link>
  );
}
