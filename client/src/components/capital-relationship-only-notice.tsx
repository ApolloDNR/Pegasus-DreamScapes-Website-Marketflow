import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CapitalRelationshipOnlyNoticeProps {
  backPath?: string;
  backLabel?: string;
}

export function CapitalRelationshipOnlyNotice({
  backPath = "/marketflow/capital",
  backLabel = "Back to projects",
}: CapitalRelationshipOnlyNoticeProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-xl border-2 border-primary/20" data-testid="card-capital-offer-retired">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Relationship information only</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="leading-relaxed text-muted-foreground">
            Capital Offer Studio is not an active transaction surface. MarketFlow does not accept
            funds, offers, allocations, or commitments here, and nothing on this route creates an
            agreement or promises a review outcome.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            A separate introduction form is available if you want to share relationship context.
            Any response or future conversation is discretionary.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/capital#capital-introduction" className="sm:flex-1">
              <Button className="w-full" data-testid="button-capital-relationship-info">
                Continue to relationship introduction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={backPath} className="sm:flex-1">
              <Button variant="outline" className="w-full" data-testid="button-back-from-capital-offer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
