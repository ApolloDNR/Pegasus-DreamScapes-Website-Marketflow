import { Link } from "wouter";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  LockKeyhole,
  Network,
  ShieldCheck,
} from "lucide-react";

export default function MarketflowDashboard() {
  useSEO({
    title: "MarketFlow Dashboard",
    description:
      "Private MarketFlow operating surface for reviewed opportunities and buyer/operator routing.",
    noIndex: true,
  });

  return (
    <MarketplaceLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden border-primary/20 bg-card">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="p-8 sm:p-10 lg:p-12">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/30 bg-primary/10">
                      <LockKeyhole className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Private beta
                    </Badge>
                  </div>

                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    MarketFlow dashboard
                  </p>
                  <h1 className="mb-5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                    Live dealflow only appears after review.
                  </h1>
                  <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    This dashboard is held behind the MarketFlow review process. Pegasus
                    does not publish sample inventory, fake portfolio returns, or placeholder
                    match data as if it were live opportunity flow.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/marketflow/access">
                      <Button
                        size="lg"
                        className="min-h-[48px] w-full gap-2 rounded-sm px-7 text-xs font-semibold uppercase tracking-[0.16em] sm:w-auto"
                        data-testid="button-marketflow-dashboard-access"
                      >
                        Request Access
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/marketflow">
                      <Button
                        size="lg"
                        variant="outline"
                        className="min-h-[48px] w-full rounded-sm px-7 text-xs font-semibold uppercase tracking-[0.16em] sm:w-auto"
                        data-testid="button-marketflow-dashboard-overview"
                      >
                        MarketFlow Overview
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="border-t border-border/60 bg-muted/25 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                  <div className="grid gap-4">
                    {[
                      {
                        icon: ShieldCheck,
                        title: "Reviewed opportunities",
                        text: "No public deal list until the property, source, numbers, and lane have been reviewed.",
                      },
                      {
                        icon: Network,
                        title: "Buyer/operator routing",
                        text: "Buyer/operators submit criteria. Capital partners submit investment criteria. Those are not the same thing.",
                      },
                      {
                        icon: BarChart3,
                        title: "Real metrics only",
                        text: "Match scores, portfolio status, and capital-stack reads stay hidden unless they are backed by stored data.",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-sm border border-border/70 bg-background/70 p-5"
                      >
                        <item.icon className="mb-4 h-5 w-5 text-primary" />
                        <h2 className="mb-2 font-serif text-xl font-semibold tracking-tight">
                          {item.title}
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketplaceLayout>
  );
}
