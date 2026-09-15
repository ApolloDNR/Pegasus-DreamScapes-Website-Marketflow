import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PrivateDataErrorProps = {
  title: string;
  description: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  testId: string;
  className?: string;
};

export function PrivateDataError({
  title,
  description,
  onRetry,
  isRetrying = false,
  testId,
  className,
}: PrivateDataErrorProps) {
  return (
    <Card
      className={`border-destructive/40 ${className ?? ""}`}
      role="alert"
      data-testid={testId}
    >
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
        <AlertCircle className="h-6 w-6 shrink-0 text-destructive" aria-hidden="true" />
        <div className="flex-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            disabled={isRetrying}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
