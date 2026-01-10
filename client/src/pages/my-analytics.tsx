import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { DealAnalyticsDashboard } from "@/components/deal-analytics-dashboard";
import { NegotiationAnalytics } from "@/components/negotiation-analytics";
import { PortfolioScenarioPlanner } from "@/components/portfolio-scenario";
import { AIDealCuration } from "@/components/ai-deal-curation";
import { CollaborativeWatchlists } from "@/components/collaborative-watchlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, Link } from "wouter";
import { 
  BarChart3, 
  TrendingUp, 
  Calculator, 
  Sparkles, 
  Users,
  Target,
  LogIn,
  Info
} from "lucide-react";
import { useEffect } from "react";

export default function MyAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const userId = user?.id || "demo-user";
  const isDemoMode = !isAuthenticated;

  useEffect(() => {
    document.title = "My Analytics | MarketFlow";
  }, []);

  if (isLoading) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {isDemoMode && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800" data-testid="demo-banner">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Demo Mode - Sample Data
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500">
                  Sign in to see your personalized analytics and save your preferences.
                </p>
              </div>
              <Link href="/login">
                <Button size="sm" data-testid="link-login">
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-analytics">
              <BarChart3 className="w-8 h-8 text-primary" />
              My Analytics
              {isDemoMode && (
                <Badge variant="secondary" className="text-xs">Demo</Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Track your performance and discover opportunities
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-grid" data-testid="analytics-tabs">
            <TabsTrigger value="dashboard" className="gap-2" data-testid="tab-dashboard">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="negotiations" className="gap-2" data-testid="tab-negotiations">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Negotiations</span>
            </TabsTrigger>
            <TabsTrigger value="ai-picks" className="gap-2" data-testid="tab-ai-picks">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Picks</span>
            </TabsTrigger>
            <TabsTrigger value="watchlists" className="gap-2" data-testid="tab-watchlists">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Watchlists</span>
            </TabsTrigger>
            <TabsTrigger value="scenario" className="gap-2" data-testid="tab-scenario">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Scenarios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DealAnalyticsDashboard userId={userId} />
          </TabsContent>

          <TabsContent value="negotiations">
            <NegotiationAnalytics userId={userId} />
          </TabsContent>

          <TabsContent value="ai-picks">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AIDealCuration 
                  userId={userId}
                  onViewDeal={(dealId, dealType) => {
                    setLocation(`/marketflow/${dealType}/${dealId}`);
                  }}
                />
              </div>
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="w-5 h-5 text-amber-500" />
                      Personalization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      The more you interact with deals, the smarter our AI recommendations become.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Deals viewed</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Deals saved</span>
                        <span className="font-medium">24</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Feedback given</span>
                        <span className="font-medium">12</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="watchlists">
            <CollaborativeWatchlists userId={userId} />
          </TabsContent>

          <TabsContent value="scenario">
            <PortfolioScenarioPlanner />
          </TabsContent>
        </Tabs>
      </div>
    </MarketplaceLayout>
  );
}
