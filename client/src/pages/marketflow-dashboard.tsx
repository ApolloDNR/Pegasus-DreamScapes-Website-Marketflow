import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { UnderConstructionBadge, UnderConstructionBanner } from "@/components/under-construction";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import {
  DollarSign,
  TrendingUp,
  Bookmark,
  Clock,
  CheckCircle2,
  Eye,
  Handshake,
  Building2,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  PieChart,
  Activity,
} from "lucide-react";
import type { WholesaleDeal } from "@shared/schema";

export default function MarketflowDashboard() {
  return (
    <MarketplaceLayout>
      <InvestorDashboard />
    </MarketplaceLayout>
  );
}

interface SavedDeal {
  id: string;
  deal: Partial<WholesaleDeal> & { id: number; propertyAddress?: string };
  savedAt: Date;
  matchScore: number;
}

interface ActiveInvestment {
  id: string;
  dealTitle: string;
  dealId: string;
  amountInvested: number;
  stage: "negotiating" | "funded" | "in_progress" | "completed";
  lastUpdateDate: Date;
  roi?: number;
  imageUrl?: string;
}

interface ExitedDeal {
  id: string;
  dealTitle: string;
  dealId: string;
  amountInvested: number;
  amountReturned: number;
  roi: number;
  exitDate: Date;
}

const mockSavedDeals: SavedDeal[] = [
  {
    id: "1",
    deal: {
      id: 1,
      propertyAddress: "123 Oak Street",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      askingPrice: 145000,
      arv: 220000,
      propertyType: "Single Family",
      bedrooms: 3,
      bathrooms: "2",
      status: "approved",
    },
    savedAt: new Date(Date.now() - 86400000),
    matchScore: 92,
  },
  {
    id: "2",
    deal: {
      id: 2,
      propertyAddress: "456 Maple Ave",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      askingPrice: 225000,
      arv: 340000,
      propertyType: "Single Family",
      bedrooms: 4,
      bathrooms: "3",
      status: "approved",
    },
    savedAt: new Date(Date.now() - 172800000),
    matchScore: 85,
  },
];

const mockActiveInvestments: ActiveInvestment[] = [
  {
    id: "1",
    dealTitle: "789 Pine Road Flip",
    dealId: "3",
    amountInvested: 50000,
    stage: "in_progress",
    lastUpdateDate: new Date(Date.now() - 86400000 * 3),
    roi: 12,
  },
  {
    id: "2",
    dealTitle: "321 Elm Street BRRRR",
    dealId: "4",
    amountInvested: 75000,
    stage: "funded",
    lastUpdateDate: new Date(Date.now() - 86400000 * 7),
  },
];

const mockExitedDeals: ExitedDeal[] = [
  {
    id: "1",
    dealTitle: "555 Cedar Lane",
    dealId: "5",
    amountInvested: 40000,
    amountReturned: 52000,
    roi: 30,
    exitDate: new Date(Date.now() - 86400000 * 60),
  },
];

function InvestorDashboard() {
  const { user, isAuthenticated, profile } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("saved");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStageColor = (stage: ActiveInvestment["stage"]) => {
    switch (stage) {
      case "negotiating": return "border-amber-500/50 text-amber-600";
      case "funded": return "border-blue-500/50 text-blue-600";
      case "in_progress": return "border-primary/50 text-primary";
      case "completed": return "border-green-500/50 text-green-600";
    }
  };

  const getStageLabel = (stage: ActiveInvestment["stage"]) => {
    switch (stage) {
      case "negotiating": return "Negotiating";
      case "funded": return "Funded";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
    }
  };

  const totalInvested = mockActiveInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0) +
    mockExitedDeals.reduce((sum, inv) => sum + inv.amountInvested, 0);
  
  const totalReturns = mockExitedDeals.reduce((sum, inv) => sum + (inv.amountReturned - inv.amountInvested), 0);
  const averageROI = mockExitedDeals.length > 0 
    ? mockExitedDeals.reduce((sum, inv) => sum + inv.roi, 0) / mockExitedDeals.length 
    : 0;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" data-testid="text-dashboard-title">
          Investor Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your investments, saved deals, and portfolio performance.
        </p>
      </div>

      <UnderConstructionBanner 
        message="Investment tracking is currently using placeholder data. Real portfolio tracking coming soon."
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
                <p className="text-2xl font-bold" data-testid="text-total-invested">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <UnderConstructionBadge />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Deals</p>
                <p className="text-2xl font-bold" data-testid="text-active-deals">{mockActiveInvestments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>2 in progress</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Returns</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-total-returns">+{formatCurrency(totalReturns)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <UnderConstructionBadge />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. ROI</p>
                <p className="text-2xl font-bold" data-testid="text-avg-roi">{averageROI.toFixed(0)}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <span>From {mockExitedDeals.length} exited deal(s)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="saved" data-testid="tab-saved">
            <Bookmark className="w-4 h-4 mr-2" />
            Saved ({mockSavedDeals.length})
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active">
            <Activity className="w-4 h-4 mr-2" />
            Active ({mockActiveInvestments.length})
          </TabsTrigger>
          <TabsTrigger value="exited" data-testid="tab-exited">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Exited ({mockExitedDeals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-4">
          {mockSavedDeals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-primary/60" />
                </div>
                <h3 className="font-semibold mb-2">No Saved Deals Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Save deals you're interested in to track them and receive updates on price changes.
                </p>
                <Link href="/marketflow/deals">
                  <Button className="gap-2" data-testid="button-browse-deals-empty">
                    <Sparkles className="w-4 h-4" />
                    Explore Deals
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSavedDeals.map((saved) => (
                <Card key={saved.id} className="overflow-hidden" data-testid={`card-saved-${saved.id}`}>
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold">{saved.deal.propertyAddress}</h3>
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {saved.matchScore}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {saved.deal.city}, {saved.deal.state}
                    </p>
                    <div className="flex justify-between text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Ask</p>
                        <p className="font-semibold">{formatCurrency(saved.deal.askingPrice || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">ARV</p>
                        <p className="font-semibold">{formatCurrency(saved.deal.arv || 0)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/marketflow/deals/${saved.deal.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-saved-${saved.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/marketflow/deals/${saved.deal.id}/negotiate`} className="flex-1">
                        <Button size="sm" className="w-full" data-testid={`button-negotiate-saved-${saved.id}`}>
                          <Handshake className="w-4 h-4 mr-1" />
                          Negotiate
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {mockActiveInvestments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-blue-500/60" />
                </div>
                <h3 className="font-semibold mb-2">No Active Investments Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Your active investments and negotiations will appear here once you start engaging with deals.
                </p>
                <Link href="/marketflow/deals">
                  <Button className="gap-2" data-testid="button-browse-deals-active-empty">
                    <Target className="w-4 h-4" />
                    Find Investment Opportunities
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockActiveInvestments.map((investment) => (
                <Card key={investment.id} data-testid={`card-active-${investment.id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{investment.dealTitle}</h3>
                          <Badge variant="outline" className={getStageColor(investment.stage)}>
                            {getStageLabel(investment.stage)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Invested: {formatCurrency(investment.amountInvested)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Updated {investment.lastUpdateDate.toLocaleDateString()}
                          </span>
                        </div>
                        {investment.roi !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="text-green-600">+{investment.roi}% ROI</span>
                            </div>
                            <Progress value={investment.roi * 2} className="h-2" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/marketflow/deals/${investment.dealId}`}>
                          <Button variant="outline" size="sm" data-testid={`button-view-active-${investment.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        {investment.stage === "negotiating" && (
                          <Link href={`/marketflow/deals/${investment.dealId}/negotiate`}>
                            <Button size="sm" data-testid={`button-negotiate-active-${investment.id}`}>
                              <Handshake className="w-4 h-4 mr-1" />
                              Negotiate
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exited" className="space-y-4">
          {mockExitedDeals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500/60" />
                </div>
                <h3 className="font-semibold mb-2">No Completed Investments Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Your successfully completed investments and their returns will be tracked here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockExitedDeals.map((exited) => (
                <Card key={exited.id} data-testid={`card-exited-${exited.id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{exited.dealTitle}</h3>
                          <Badge className="bg-green-500">Exited</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Invested: {formatCurrency(exited.amountInvested)}</span>
                          <span>·</span>
                          <span>Returned: {formatCurrency(exited.amountReturned)}</span>
                          <span>·</span>
                          <span>Exited {exited.exitDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-2xl font-bold text-green-600">+{exited.roi}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card className="mt-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Portfolio Analytics
          </CardTitle>
          <CardDescription>
            Detailed portfolio insights and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <UnderConstructionBadge />
              <p className="text-sm text-muted-foreground mt-2">
                Advanced analytics dashboard coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
