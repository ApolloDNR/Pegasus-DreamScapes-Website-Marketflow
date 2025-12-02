import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DealflowLayout } from "@/components/dealflow-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Target,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  Folder,
  MessageSquare,
  HandshakeIcon,
  Home,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

export default function DealflowOffice() {
  const { user } = useAuth();

  const { data: capitalProjects = [] } = useQuery<any[]>({
    queryKey: ["/api/capital-projects"],
  });

  const { data: investmentOffers = [] } = useQuery<any[]>({
    queryKey: ["/api/my-investment-offers"],
  });

  const { data: committedInvestments = [] } = useQuery<any[]>({
    queryKey: ["/api/my-committed-investments"],
  });

  const { data: wholesaleDeals = [] } = useQuery<any[]>({
    queryKey: ["/api/wholesale-deals"],
  });

  const { data: dealMatches = [] } = useQuery<any[]>({
    queryKey: ["/api/my-deal-matches"],
  });

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDreamscaperMetrics = () => {
    const myProjects = capitalProjects.filter((p: any) => p.createdBy === user?.id);
    const totalGoal = myProjects.reduce((sum: number, p: any) => sum + (p.fundingGoal || 0), 0);
    const totalRaised = myProjects.reduce((sum: number, p: any) => sum + (p.amountRaised || 0), 0);
    
    return [
      { label: "Projects Launched", value: myProjects.length, icon: Building2, color: "text-blue-600" },
      { label: "Capital Goal", value: formatCurrency(totalGoal), icon: Target, color: "text-amber-600" },
      { label: "Capital Raised", value: formatCurrency(totalRaised), icon: DollarSign, color: "text-green-600" },
      { label: "Active Investors", value: committedInvestments.length, icon: Users, color: "text-purple-600" },
    ];
  };

  const getInvestorMetrics = () => {
    const totalDeployed = committedInvestments.reduce((sum: number, c: any) => sum + (c.committedAmount || 0), 0);
    const pendingOffers = investmentOffers.filter((o: any) => o.status === "PENDING").length;
    
    return [
      { label: "Total Deployed", value: formatCurrency(totalDeployed), icon: DollarSign, color: "text-green-600" },
      { label: "Active Investments", value: committedInvestments.length, icon: TrendingUp, color: "text-blue-600" },
      { label: "Pending Offers", value: pendingOffers, icon: Clock, color: "text-amber-600" },
      { label: "Portfolio Value", value: formatCurrency(totalDeployed * 1.1), icon: Target, color: "text-purple-600" },
    ];
  };

  const getWholesalerMetrics = () => {
    const myDeals = wholesaleDeals.filter((d: any) => d.postedBy === user?.id);
    const activeDeals = myDeals.filter((d: any) => d.status === "ACTIVE").length;
    const matchedDeals = dealMatches.filter((m: any) => 
      myDeals.some((d: any) => d.id === m.dealId)
    ).length;
    
    return [
      { label: "Deals Posted", value: myDeals.length, icon: FileText, color: "text-blue-600" },
      { label: "Active Deals", value: activeDeals, icon: Building2, color: "text-green-600" },
      { label: "Matched Deals", value: matchedDeals, icon: HandshakeIcon, color: "text-amber-600" },
      { label: "Assignment Fees", value: "$0", icon: DollarSign, color: "text-purple-600" },
    ];
  };

  const getBuyerMetrics = () => {
    const myMatches = dealMatches.filter((m: any) => m.interestedUserId === user?.id);
    const underContract = myMatches.filter((m: any) => m.status === "UNDER_CONTRACT").length;
    
    return [
      { label: "Saved Deals", value: myMatches.length, icon: Building2, color: "text-blue-600" },
      { label: "Offers Submitted", value: myMatches.length, icon: FileText, color: "text-amber-600" },
      { label: "Under Contract", value: underContract, icon: CheckCircle2, color: "text-green-600" },
      { label: "Closings", value: 0, icon: Home, color: "text-purple-600" },
    ];
  };

  const getMetrics = () => {
    if (user?.isStaff) return getDreamscaperMetrics();
    if (user?.isInvestor) return getInvestorMetrics();
    if (user?.isWholesaler) return getWholesalerMetrics();
    if (user?.isBuyer) return getBuyerMetrics();
    return getInvestorMetrics();
  };

  const metrics = getMetrics();

  const recentActivity = notifications.slice(0, 10).map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: new Date(n.createdAt).toLocaleDateString(),
    type: n.type,
    link: n.link,
  }));

  return (
    <DealflowLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">
            Welcome back, {user?.firstName || "there"}
          </h1>
          <p className="text-muted-foreground">
            Your Dreamscaper Dealflow Office
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} data-testid={`metric-card-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>Your recent activity and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-sm">Your activity will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity: any) => (
                        <div 
                          key={activity.id} 
                          className="flex gap-3 pb-4 border-b last:border-0"
                          data-testid={`activity-${activity.id}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === "success" ? "bg-green-500" :
                            activity.type === "warning" ? "bg-amber-500" :
                            activity.type === "error" ? "bg-red-500" :
                            "bg-blue-500"
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                          {activity.link && (
                            <Link href={activity.link}>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Messages
                    </CardTitle>
                    <CardDescription>Recent conversations</CardDescription>
                  </div>
                  <Link href="/dealflow/messages">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start a conversation with other members</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="w-5 h-5" />
                      File Vault
                    </CardTitle>
                    <CardDescription>Your documents & files</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-upload-file">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No files yet</p>
                  <p className="text-sm">Upload contracts, photos, and documents</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user?.isStaff && (
                  <Link href="/dealflow/deals/new-project">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-new-project">
                      <Building2 className="w-4 h-4 mr-2" />
                      Create New Project
                    </Button>
                  </Link>
                )}
                {user?.isWholesaler && (
                  <Link href="/dealflow/deals/new-deal">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-post-deal">
                      <FileText className="w-4 h-4 mr-2" />
                      Post a Deal
                    </Button>
                  </Link>
                )}
                <Link href="/dealflow/deals">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-browse-deals">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
                <Link href="/dealflow/community">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-community">
                    <Users className="w-4 h-4 mr-2" />
                    Join Community
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {(user?.isInvestor || user?.isStaff) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {user?.isStaff ? "Your Projects" : "Your Investments"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user?.isStaff ? (
                    capitalProjects.filter((p: any) => p.createdBy === user?.id).length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        <p>No projects yet</p>
                        <Link href="/dealflow/deals/new-project">
                          <Button variant="ghost" size="sm" className="text-primary">Create your first project</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {capitalProjects.filter((p: any) => p.createdBy === user?.id).slice(0, 3).map((project: any) => (
                          <div key={project.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                            <div>
                              <p className="font-medium text-sm">{project.title}</p>
                              <p className="text-xs text-muted-foreground">{project.status}</p>
                            </div>
                            <Badge variant="outline">{Math.round((project.amountRaised / project.fundingGoal) * 100)}%</Badge>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    committedInvestments.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        <p>No investments yet</p>
                        <Link href="/dealflow/deals">
                          <Button variant="ghost" size="sm" className="text-primary">Browse opportunities</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {committedInvestments.slice(0, 3).map((inv: any) => (
                          <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                            <div>
                              <p className="font-medium text-sm">{formatCurrency(inv.committedAmount)}</p>
                              <p className="text-xs text-muted-foreground">{inv.role}</p>
                            </div>
                            <Badge variant="outline">{inv.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DealflowLayout>
  );
}
