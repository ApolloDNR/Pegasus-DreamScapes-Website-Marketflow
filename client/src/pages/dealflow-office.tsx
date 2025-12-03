import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DealflowLayout } from "@/components/dealflow-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NegotiationHistoryDialog } from "@/components/negotiation-history";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Target,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Upload,
  Folder,
  MessageSquare,
  HandshakeIcon,
  Home,
  Sparkles,
  Heart,
  Flame,
  Star,
  Bell,
  Zap,
  Eye,
  Bookmark,
  Activity,
  BarChart3,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  Scale,
  ArrowRightLeft,
  X,
  Check,
  Percent
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface SavedDealBookmark {
  id: number;
  userId: string;
  dealType: string;
  dealId: number;
  action: string;
  createdAt: string;
  deal?: {
    id: number;
    title?: string;
    propertyAddress?: string;
    city?: string;
    status?: string;
  };
}

interface Notification {
  id: number;
  title: string;
  message?: string;
  type: string;
  link?: string;
  createdAt: string;
  isRead: boolean;
}

interface CapitalProject {
  id: number;
  title: string;
  fundingGoal: number;
  amountRaised: number;
  status: string;
  createdBy: string;
  projectedReturn?: string;
  investorCount?: number;
  images?: string[];
}

interface DealNegotiation {
  id: number;
  dealType: string;
  dealId: number;
  initiatorId: string;
  responderId: string;
  structureType: string;
  proposedAmount?: number;
  status: string;
  createdAt: string;
}

export default function DealflowOffice() {
  const { user } = useAuth();
  const [selectedNegotiationId, setSelectedNegotiationId] = useState<number | null>(null);
  const [negotiationHistoryOpen, setNegotiationHistoryOpen] = useState(false);

  const { data: capitalProjects = [] } = useQuery<CapitalProject[]>({
    queryKey: ["/api/capital-projects"],
  });

  const { data: investmentOffers = [] } = useQuery<any[]>({
    queryKey: ["/api/my-investment-offers"],
  });

  const { data: committedInvestments = [] } = useQuery<any[]>({
    queryKey: ["/api/my-committed-investments"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: unreadMessages = { count: 0 } } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
  });

  // Fetch user's negotiations
  const { data: myNegotiations = [] } = useQuery<DealNegotiation[]>({
    queryKey: ["/api/my-negotiations"],
  });

  // Fetch real saved deals
  const { data: savedDealsData = [] } = useQuery<SavedDealBookmark[]>({
    queryKey: ["/api/deals/saved"],
  });

  // Transform saved deals for display
  const savedDeals = savedDealsData.map((bookmark) => {
    const title = bookmark.deal?.title || bookmark.deal?.propertyAddress || `Deal #${bookmark.dealId}`;
    return {
      id: bookmark.dealId,
      title,
      matchScore: Math.floor(Math.random() * 15) + 85,
      status: bookmark.action === "like" ? "hot" : "saved",
      dealType: bookmark.dealType,
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const openProjects = capitalProjects.filter(p => p.status === "OPEN_FOR_INVESTMENT");
  const totalOpportunityValue = openProjects.reduce((sum, p) => sum + (p.fundingGoal - p.amountRaised), 0);

  const weeklyPulse = {
    newDeals: openProjects.length,
    totalInvestors: capitalProjects.reduce((sum, p) => sum + (p.investorCount || 0), 0),
    activeConversations: unreadMessages.count,
    matchRate: 87,
    trending: "up" as const
  };

  const topMatches = capitalProjects
    .filter(p => p.status === "OPEN_FOR_INVESTMENT")
    .slice(0, 3)
    .map(p => ({
      ...p,
      matchScore: Math.floor(Math.random() * 15) + 85
    }));

  const recentActivity = [
    {
      id: 1,
      type: "match",
      title: "New Deal Match",
      description: "Pacific Heights Victorian matches your criteria at 96%",
      time: "2 hours ago",
      icon: Heart,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      link: "/dealflow/deals"
    },
    {
      id: 2,
      type: "message",
      title: "Message from Alex Thompson",
      description: "Regarding the Broadway Craftsman opportunity",
      time: "4 hours ago",
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      link: "/dealflow/messages"
    },
    {
      id: 3,
      type: "investment",
      title: "Investment Confirmed",
      description: "Berkeley Hills Craftsman reached 100% funding",
      time: "1 day ago",
      icon: CheckCircle2,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      link: "/dealflow/deals"
    },
    {
      id: 4,
      type: "community",
      title: "Reply to Your Post",
      description: "Marcus Chen commented on paint color discussion",
      time: "2 days ago",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      link: "/dealflow/community"
    }
  ];

  return (
    <DealflowLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-1">
                Welcome back, {user?.firstName || "there"}
              </h1>
              <p className="text-muted-foreground">
                Your investment command center
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dealflow/deals">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Matches
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dealflow/messages">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                  {unreadMessages.count > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white">{unreadMessages.count}</Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-amber-500/5 to-primary/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <Activity className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Weekly Pulse</h3>
                  <p className="text-sm text-muted-foreground">Your dealflow activity this week</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{weeklyPulse.newDeals}</p>
                  <p className="text-xs text-muted-foreground">New Deals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{weeklyPulse.totalInvestors}</p>
                  <p className="text-xs text-muted-foreground">Active Investors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{weeklyPulse.matchRate}%</p>
                  <p className="text-xs text-muted-foreground">Match Rate</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-lg font-semibold text-green-600">+12%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs Last Week</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card data-testid="metric-deals">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Open Opportunities</p>
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{openProjects.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalOpportunityValue)} available
              </p>
            </CardContent>
          </Card>

          <Card data-testid="metric-saved">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Saved Matches</p>
                <div className="w-9 h-9 rounded-lg bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{savedDeals.length}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                2 hot deals
              </p>
            </CardContent>
          </Card>

          <Card data-testid="metric-investments">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Active Investments</p>
                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{committedInvestments.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {investmentOffers.filter((o: any) => o.status === "PENDING").length} pending
              </p>
            </CardContent>
          </Card>

          <Card data-testid="metric-notifications">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Notifications</p>
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{notifications.filter(n => !n.isRead).length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {unreadMessages.count} unread messages
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Top Matches For You
                    </CardTitle>
                    <CardDescription>Deals aligned with your investment profile</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dealflow/deals">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {topMatches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No matches yet</p>
                    <p className="text-sm">Complete your profile to get personalized matches</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topMatches.map((project) => (
                      <Link key={project.id} href={`/dealflow/project/${project.id}`}>
                        <div 
                          className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover-elevate cursor-pointer"
                          data-testid={`match-${project.id}`}
                        >
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                            {project.images && project.images[0] ? (
                              <img src={project.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-8 h-8 text-primary/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold truncate">{project.title}</h4>
                              {project.status === "OPEN_FOR_INVESTMENT" && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-xs shrink-0">
                                  Open
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {formatCurrency(project.fundingGoal)}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {project.projectedReturn}
                              </span>
                            </div>
                            <Progress 
                              value={(project.amountRaised / project.fundingGoal) * 100} 
                              className="h-1.5 mt-2" 
                            />
                          </div>
                          <div className="text-center shrink-0">
                            <div className="relative w-14 h-14">
                              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                                <circle
                                  cx="18" cy="18" r="15"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  className="text-secondary"
                                />
                                <circle
                                  cx="18" cy="18" r="15"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeDasharray={`${project.matchScore} ${100 - project.matchScore}`}
                                  strokeLinecap="round"
                                  className="text-green-500"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-600">
                                {project.matchScore}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Match</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Activity Feed
                    </CardTitle>
                    <CardDescription>Recent updates and notifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <Link 
                            key={activity.id} 
                            href={activity.link}
                            className="flex gap-3 group cursor-pointer p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                            data-testid={`activity-${activity.id}`}
                          >
                            <div className={`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center shrink-0`}>
                              <Icon className={`w-5 h-5 ${activity.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                {activity.title}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {activity.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bookmark className="w-5 h-5 text-amber-500" />
                    Saved Deals
                  </CardTitle>
                  <Badge variant="secondary">{savedDeals.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {savedDeals.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No saved deals yet</p>
                    <Button variant="ghost" size="sm" className="text-primary underline" asChild>
                      <Link href="/dealflow/deals">Browse marketplace</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedDeals.map((deal) => (
                      <Link 
                        key={deal.id} 
                        href="/dealflow/deals"
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        data-testid={`saved-deal-${deal.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{deal.title}</p>
                            <div className="flex items-center gap-1">
                              {deal.status === "hot" && (
                                <Flame className="w-3 h-3 text-red-500" />
                              )}
                              {deal.status === "new" && (
                                <Star className="w-3 h-3 text-amber-500" />
                              )}
                              {deal.status === "popular" && (
                                <Users className="w-3 h-3 text-blue-500" />
                              )}
                              <span className="text-xs text-muted-foreground capitalize">{deal.status}</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          className={`shrink-0 ${
                            deal.matchScore >= 90 
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" 
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          }`}
                        >
                          {deal.matchScore}%
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Scale className="w-5 h-5 text-blue-500" />
                    My Negotiations
                  </CardTitle>
                  <Badge variant="secondary">{myNegotiations.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {myNegotiations.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <Scale className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No active negotiations</p>
                    <p className="text-xs mt-1">Make offers on deals to start negotiating</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {myNegotiations.slice(0, 5).map((negotiation) => {
                        const isFromMe = user && negotiation.initiatorId === user.id;
                        const needsAction = negotiation.status === "pending" && !isFromMe;

                        return (
                          <div
                            key={negotiation.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedNegotiationId(negotiation.id);
                              setNegotiationHistoryOpen(true);
                            }}
                            data-testid={`negotiation-${negotiation.id}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                negotiation.structureType === "debt" 
                                  ? "bg-blue-100 dark:bg-blue-950" 
                                  : "bg-purple-100 dark:bg-purple-950"
                              }`}>
                                {negotiation.structureType === "debt" ? (
                                  <DollarSign className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Percent className="w-4 h-4 text-purple-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {negotiation.dealType.replace("_", " ")} #{negotiation.dealId}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {negotiation.status === "pending" && <Clock className="w-3 h-3" />}
                                  {negotiation.status === "accepted" && <Check className="w-3 h-3 text-green-500" />}
                                  {negotiation.status === "declined" && <X className="w-3 h-3 text-red-500" />}
                                  {negotiation.status === "countered" && <ArrowRightLeft className="w-3 h-3 text-blue-500" />}
                                  <span className="capitalize">{negotiation.status}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {needsAction && (
                                <Badge className="bg-amber-500 text-white text-xs">Action</Badge>
                              )}
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild data-testid="button-browse-deals">
                  <Link href="/dealflow/deals">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Find New Matches
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild data-testid="button-community">
                  <Link href="/dealflow/community">
                    <Users className="w-4 h-4 mr-2" />
                    Join Discussion
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild data-testid="button-messages">
                  <Link href="/dealflow/messages">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Messages
                    {unreadMessages.count > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">{unreadMessages.count}</Badge>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-amber-500/10 border-primary/20">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Boost Your Profile</h4>
                    <p className="text-xs text-muted-foreground">Get better matches</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete your investor preferences to receive personalized deal recommendations.
                </p>
                <Button size="sm" className="w-full" data-testid="button-complete-profile">
                  Complete Profile
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-5 h-5" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex flex-col items-center justify-center text-blue-600 shrink-0">
                      <span className="text-xs font-medium">DEC</span>
                      <span className="text-sm font-bold leading-none">5</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">Investor Webinar</p>
                      <p className="text-xs text-muted-foreground">Q4 Market Outlook</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex flex-col items-center justify-center text-amber-600 shrink-0">
                      <span className="text-xs font-medium">DEC</span>
                      <span className="text-sm font-bold leading-none">12</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">New Deals Drop</p>
                      <p className="text-xs text-muted-foreground">5 properties</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedNegotiationId && (
        <NegotiationHistoryDialog
          open={negotiationHistoryOpen}
          onOpenChange={setNegotiationHistoryOpen}
          negotiationId={selectedNegotiationId}
          dealTitle={`Negotiation #${selectedNegotiationId}`}
        />
      )}
    </DealflowLayout>
  );
}
