import { LockKeyhole, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AIDealCuration({
  userId,
}: {
  userId?: string;
  onViewDeal: (dealId: string, dealType: string) => void;
}) {
  return (
    <Card className="border-dashed" data-testid="state-curated-deals-unavailable">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          Curated recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center sm:flex-row sm:text-left">
          <LockKeyhole className="h-7 w-7 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">
              {userId
                ? "Curated recommendations are not available in this release."
                : "Sign in is required for private recommendation features."}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Pegasus does not currently calculate match scores, confidence, urgency, or personalized deal recommendations. No inferred recommendation is shown without a reviewed data source and feedback workflow.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CurationInsightsBadge(_props: { insightCount: number }) {
  return null;
}
