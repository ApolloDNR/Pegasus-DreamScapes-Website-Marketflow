import { useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Star, 
  Loader2,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  Shield,
  Award,
  Calendar,
  BarChart3,
  ThumbsUp,
  ArrowLeft,
  Send
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, UserReview } from "@shared/schema";

interface UserStats {
  userId: string;
  totalDealsCompleted: number;
  totalDealsValue: number;
  totalInvested: number;
  totalReturns: number;
  avgReturnRate: string;
  avgOverallRating: string;
  totalReviews: number;
  dealsListed: number;
  projectsFunded: number;
  communityPosts: number;
  responseRate: string;
  avgResponseTime: string;
  badges: string[];
  verificationLevel: string;
  memberSince: string;
  lastActiveAt: string;
}

interface UserProfile extends User {
  roles?: string[];
  stats?: UserStats;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return (first + last).toUpperCase() || "U";
};

const getRatingStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star 
      key={i} 
      className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
    />
  ));
};

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");

  const validUserId = userId || "";

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["user-profile", validUserId],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as [string, string];
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["user-stats", validUserId],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as [string, string];
      const res = await fetch(`/api/users/${id}/stats`);
      if (!res.ok) throw new Error("Failed to fetch user stats");
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: reviews = [] } = useQuery<UserReview[]>({
    queryKey: ["user-reviews", validUserId],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as [string, string];
      const res = await fetch(`/api/users/${id}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch user reviews");
      return res.json();
    },
    enabled: !!userId,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/reviews", {
        revieweeId: userId,
        overallRating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Your review has been posted successfully.",
      });
      setWriteReviewOpen(false);
      setReviewTitle("");
      setReviewContent("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["user-reviews", validUserId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/dealflow/office">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dealflow
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const verificationBadge = stats?.verificationLevel === "premium" 
    ? { icon: Award, color: "bg-amber-100 text-amber-700", label: "Premium Member" }
    : stats?.verificationLevel === "verified"
    ? { icon: Shield, color: "bg-blue-100 text-blue-700", label: "Verified" }
    : { icon: CheckCircle2, color: "bg-slate-100 text-slate-700", label: "Basic Member" };

  const avgRating = parseFloat(stats?.avgOverallRating || "0");

  return (
    <div className="min-h-screen pt-20 bg-stone">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/dealflow/office">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="sleek-card lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={profile.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold" data-testid="text-profile-name">
                  {profile.firstName} {profile.lastName}
                </h1>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={verificationBadge.color}>
                    <verificationBadge.icon className="w-3 h-3 mr-1" />
                    {verificationBadge.label}
                  </Badge>
                </div>

                {profile.roles && profile.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mt-3">
                    {profile.roles.map((role, i) => (
                      <Badge key={i} variant="outline" className="text-xs capitalize">
                        {role.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-4">
                  {getRatingStars(Math.round(avgRating))}
                  <span className="ml-1 text-sm font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({stats?.totalReviews || 0} reviews)
                  </span>
                </div>

                {stats?.memberSince && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member since {formatDate(stats.memberSince)}
                  </p>
                )}

                {!isOwnProfile && isAuthenticated && (
                  <div className="flex gap-2 mt-6 w-full">
                    <Link href={`/dealflow/messages?to=${userId}`} className="flex-1">
                      <Button variant="outline" className="w-full" data-testid="button-message">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                    <Button onClick={() => setWriteReviewOpen(true)} className="flex-1" data-testid="button-write-review">
                      <Star className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="sleek-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-2xl font-bold text-primary">{stats?.totalDealsCompleted || 0}</p>
                    <p className="text-sm text-muted-foreground">Deals Completed</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(stats?.totalDealsValue || 0)}</p>
                    <p className="text-sm text-muted-foreground">Deal Volume</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-2xl font-bold text-primary">{stats?.projectsFunded || 0}</p>
                    <p className="text-sm text-muted-foreground">Projects Funded</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-2xl font-bold text-primary">{stats?.avgReturnRate || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">Avg Return</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-3 rounded bg-background flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{formatCurrency(stats?.totalInvested || 0)}</p>
                      <p className="text-xs text-muted-foreground">Total Invested</p>
                    </div>
                  </div>
                  <div className="p-3 rounded bg-background flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{formatCurrency(stats?.totalReturns || 0)}</p>
                      <p className="text-xs text-muted-foreground">Total Returns</p>
                    </div>
                  </div>
                  <div className="p-3 rounded bg-background flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{stats?.responseRate || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">Response Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews ({reviews.length})</TabsTrigger>
                <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <Card className="sleek-card">
                  <CardHeader>
                    <CardTitle className="text-base">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(stats?.badges || []).map((badge, i) => (
                        <Badge key={i} className="bg-gradient-to-r from-primary/20 to-accent/20">
                          <Award className="w-3 h-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                      {(!stats?.badges || stats.badges.length === 0) && (
                        <p className="text-sm text-muted-foreground">No badges earned yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="sleek-card">
                  <CardHeader>
                    <CardTitle className="text-base">Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Deals Listed</span>
                      <span className="font-medium">{stats?.dealsListed || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Community Posts</span>
                      <span className="font-medium">{stats?.communityPosts || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Response Time</span>
                      <span className="font-medium">{stats?.avgResponseTime || "N/A"}</span>
                    </div>
                    {stats?.lastActiveAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Active</span>
                        <span className="font-medium">{formatDate(stats.lastActiveAt)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-4">
                {reviews.length === 0 ? (
                  <Card className="sleek-card">
                    <CardContent className="py-12 text-center">
                      <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Reviews Yet</h3>
                      <p className="text-muted-foreground">
                        {isOwnProfile 
                          ? "Complete some transactions to receive reviews" 
                          : "Be the first to leave a review!"}
                      </p>
                      {!isOwnProfile && isAuthenticated && (
                        <Button className="mt-4" onClick={() => setWriteReviewOpen(true)}>
                          <Star className="w-4 h-4 mr-2" />
                          Write a Review
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="sleek-card" data-testid={`review-${review.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>R</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getRatingStars(review.overallRating)}
                            </div>
                            {review.title && (
                              <h4 className="font-medium">{review.title}</h4>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {review.content}
                            </p>
                            {review.transactionRole && (
                              <Badge variant="outline" className="mt-2 text-xs capitalize">
                                {review.transactionRole}
                              </Badge>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(review.createdAt)}
                            </p>
                            
                            {review.response && (
                              <div className="mt-4 p-3 rounded bg-secondary/30">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Response:</p>
                                <p className="text-sm">{review.response}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-4">
                <Card className="sleek-card">
                  <CardContent className="py-8 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Activity Timeline Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Track transaction history and activity here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={writeReviewOpen} onOpenChange={setWriteReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience working with {profile.firstName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className="focus:outline-none"
                    data-testid={`star-${i + 1}`}
                  >
                    <Star 
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        i < reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-title">Title (optional)</Label>
              <input
                id="review-title"
                type="text"
                placeholder="Summarize your experience"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
                data-testid="input-review-title"
              />
            </div>
            <div>
              <Label htmlFor="review-content">Your Review</Label>
              <Textarea
                id="review-content"
                placeholder="Describe your experience working with this person..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="mt-1 min-h-[120px]"
                data-testid="textarea-review-content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWriteReviewOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => submitReviewMutation.mutate()} 
              disabled={submitReviewMutation.isPending || !reviewContent}
              data-testid="button-submit-review"
            >
              {submitReviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
