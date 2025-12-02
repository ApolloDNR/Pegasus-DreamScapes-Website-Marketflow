import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DealflowLayout } from "@/components/dealflow-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MessageSquare, 
  Users,
  Plus,
  Send,
  Clock,
  Loader2,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Building2,
  TrendingUp,
  Sparkles,
  Globe,
  Hash,
  X,
  ChevronRight,
  Flame,
  Star,
  ThumbsUp,
  Eye,
  Reply,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface CommunityCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface CommunityPost {
  id: number;
  categoryId: number;
  userId: string;
  title?: string;
  content: string;
  postType?: string;
  images?: string[];
  linkedProjectId?: number;
  linkedDealId?: number;
  tags?: string[];
  mentions?: string[];
  likeCount?: number;
  shareCount?: number;
  bookmarkCount?: number;
  isPinned?: boolean;
  viewCount?: number;
  replyCount?: number;
  createdAt: string;
  // Joined user info (from mock data)
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
}

interface CommunityReply {
  id: number;
  postId: number;
  content: string;
  userId: string;
  authorName?: string;
  authorRole?: string;
  createdAt: string;
  likeCount?: number;
}

export default function DealflowCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeContent, setComposeContent] = useState("");
  const [composeImages, setComposeImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  const { data: categoriesData = [] } = useQuery<CommunityCategory[]>({
    queryKey: ["/api/community/categories"],
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Fetch social feed
  const { data: feedData = [], isLoading: loadingFeed, refetch: refetchFeed } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/feed"],
  });
  const feedPosts = Array.isArray(feedData) ? feedData : [];

  // Fetch category-specific posts
  const { data: categoryPostsData = [] } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", selectedCategory],
    enabled: selectedCategory !== null,
  });
  const categoryPosts = Array.isArray(categoryPostsData) ? categoryPostsData : [];

  // Fetch replies for selected post
  const { data: repliesData = [], refetch: refetchReplies } = useQuery<CommunityReply[]>({
    queryKey: ["/api/community/posts", selectedPost?.id, "replies"],
    enabled: selectedPost !== null,
  });
  const replies = Array.isArray(repliesData) ? repliesData : [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/community/posts", {
        categoryId: categories[0]?.id || 1,
        content: composeContent,
        postType: composeImages.length > 0 ? "image" : "text",
        images: composeImages,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/feed"] });
      toast({ title: "Posted!", description: "Your post is now live." });
      setComposeOpen(false);
      setComposeContent("");
      setComposeImages([]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    },
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/community/posts/${postId}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/feed"] });
      refetchFeed();
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/community/posts/${postId}/bookmark`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.bookmarked ? "Saved!" : "Removed",
        description: data.bookmarked ? "Added to your bookmarks" : "Removed from bookmarks",
      });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPost) return;
      const res = await apiRequest("POST", `/api/community/posts/${selectedPost.id}/replies`, {
        content: replyContent,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchReplies();
      refetchFeed();
      setReplyContent("");
      toast({ title: "Reply posted!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post reply", variant: "destructive" });
    },
  });

  // Mock data for richer display when API data is minimal
  const enrichPost = (post: CommunityPost): CommunityPost => ({
    ...post,
    authorName: post.authorName || "Dreamscaper",
    authorRole: post.authorRole || "Investor",
    authorAvatar: post.authorAvatar,
    likeCount: post.likeCount || Math.floor(Math.random() * 50),
    replyCount: post.replyCount || Math.floor(Math.random() * 20),
    viewCount: post.viewCount || Math.floor(Math.random() * 200),
    shareCount: post.shareCount || Math.floor(Math.random() * 10),
  });

  const displayPosts = (activeTab === "feed" ? feedPosts : categoryPosts).map(enrichPost);

  // Filter posts by search
  const filteredPosts = displayPosts.filter((post) =>
    searchQuery === "" ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trending topics
  const trendingTopics = [
    { tag: "FixAndFlip", count: 156, trending: true },
    { tag: "DistressedDeals", count: 98 },
    { tag: "DesignROI", count: 87 },
    { tag: "CurbAppeal", count: 64 },
    { tag: "KitchenStaging", count: 52 },
  ];

  // Featured members
  const featuredMembers = [
    { name: "Marcus Chen", role: "Top Investor", avatar: "", deals: 24 },
    { name: "Sarah Williams", role: "Dreamscaper", avatar: "", deals: 18 },
    { name: "Alex Thompson", role: "Wholesaler", avatar: "", deals: 32 },
  ];

  const handleShare = (post: CommunityPost) => {
    navigator.clipboard.writeText(`${window.location.origin}/dealflow/community?post=${post.id}`);
    toast({ title: "Link copied!", description: "Share this post with others" });
  };

  const getCategoryBadgeColor = (categoryId: number) => {
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
    ];
    return colors[categoryId % colors.length];
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || "General";
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  // Post Card Component
  const PostCard = ({ post }: { post: CommunityPost }) => (
    <Card className="hover:bg-secondary/30 transition-colors cursor-pointer" data-testid={`post-${post.id}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12">
            {post.authorAvatar && <AvatarImage src={post.authorAvatar} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {(post.authorName || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{post.authorName}</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {post.authorRole}
              </Badge>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatTime(post.createdAt)}</span>
              {post.isPinned && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-xs">
                  <Star className="w-3 h-3 mr-1" /> Pinned
                </Badge>
              )}
            </div>

            {/* Category badge */}
            <Badge 
              variant="outline" 
              className={`mt-1 text-xs ${getCategoryBadgeColor(post.categoryId)}`}
            >
              <Hash className="w-3 h-3 mr-1" />
              {getCategoryName(post.categoryId)}
            </Badge>

            {/* Title if exists */}
            {post.title && (
              <h3 
                className="font-semibold mt-2 text-base hover:text-primary transition-colors"
                onClick={() => setSelectedPost(post)}
              >
                {post.title}
              </h3>
            )}

            {/* Content */}
            <p 
              className="mt-2 text-sm leading-relaxed whitespace-pre-wrap"
              onClick={() => setSelectedPost(post)}
            >
              {post.content.length > 280 ? `${post.content.slice(0, 280)}...` : post.content}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-primary hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className={`mt-3 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {post.images.slice(0, 4).map((img, i) => (
                  <div 
                    key={i} 
                    className="aspect-video bg-secondary rounded-lg overflow-hidden"
                  >
                    <img 
                      src={img} 
                      alt={`Post image ${i + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Linked Project Card */}
            {post.linkedProjectId && (
              <Link href={`/dealflow/project/${post.linkedProjectId}`}>
                <Card className="mt-3 hover-elevate">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Investment Opportunity</p>
                      <p className="text-xs text-muted-foreground">Click to view project details</p>
                      <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-xs">
                        Open for Investment
                      </Badge>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Engagement Actions */}
            <div className="flex items-center gap-1 mt-3 -ml-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-red-500 gap-1.5 px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  likeMutation.mutate(post.id);
                }}
                data-testid={`like-${post.id}`}
              >
                <Heart className="w-4 h-4" />
                <span className="text-xs">{post.likeCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary gap-1.5 px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPost(post);
                }}
                data-testid={`comment-${post.id}`}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">{post.replyCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-green-500 gap-1.5 px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(post);
                }}
                data-testid={`share-${post.id}`}
              >
                <Share2 className="w-4 h-4" />
                <span className="text-xs">{post.shareCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-amber-500 gap-1.5 px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  bookmarkMutation.mutate(post.id);
                }}
                data-testid={`bookmark-${post.id}`}
              >
                <Bookmark className="w-4 h-4" />
              </Button>

              <div className="flex-1" />
              
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3" /> {post.viewCount}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare(post)}>
                <LinkIcon className="w-4 h-4 mr-2" /> Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => bookmarkMutation.mutate(post.id)}>
                <Bookmark className="w-4 h-4 mr-2" /> Save post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DealflowLayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Compose Box */}
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user?.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className="flex-1 bg-secondary/50 rounded-full px-4 py-2.5 cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => setComposeOpen(true)}
                    data-testid="compose-trigger"
                  >
                    <span className="text-muted-foreground text-sm">Share a deal, ask a question, or post an update...</span>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground gap-2"
                    onClick={() => setComposeOpen(true)}
                  >
                    <ImageIcon className="w-4 h-4 text-green-500" />
                    Photo
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground gap-2"
                    onClick={() => setComposeOpen(true)}
                  >
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Project
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground gap-2"
                    onClick={() => setComposeOpen(true)}
                  >
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    Deal
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feed Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="feed" className="gap-2" data-testid="tab-feed">
                  <Globe className="w-4 h-4" /> For You
                </TabsTrigger>
                <TabsTrigger value="following" className="gap-2" data-testid="tab-following">
                  <Users className="w-4 h-4" /> Following
                </TabsTrigger>
                <TabsTrigger value="trending" className="gap-2" data-testid="tab-trending">
                  <Flame className="w-4 h-4" /> Trending
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Category Filter */}
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="whitespace-nowrap"
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="whitespace-nowrap"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* Posts Feed */}
            {loadingFeed ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">No posts yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Be the first to start the conversation!</p>
                  <Button onClick={() => setComposeOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search posts..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="search-posts"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between hover:bg-secondary/50 p-2 -mx-2 rounded-lg cursor-pointer transition-colors"
                      onClick={() => setSearchQuery(topic.tag)}
                      data-testid={`trending-${topic.tag}`}
                    >
                      <div>
                        <p className="font-medium text-sm flex items-center gap-1">
                          #{topic.tag}
                          {topic.trending && <Flame className="w-3 h-3 text-red-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{topic.count} posts</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Members */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Top Contributors
                </h3>
                <div className="space-y-3">
                  {featuredMembers.map((member, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 hover:bg-secondary/50 p-2 -mx-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {member.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {member.deals} deals
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Members
                </Button>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Hash className="w-5 h-5 text-primary" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Button
                      key={cat.id}
                      variant="ghost"
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <span className="truncate">{cat.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.firstName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                <Badge variant="secondary" className="text-xs">Public</Badge>
              </div>
            </div>
            
            <Textarea
              placeholder="What's happening in your real estate world?"
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base"
              value={composeContent}
              onChange={(e) => setComposeContent(e.target.value)}
              data-testid="compose-content"
            />

            {composeImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {composeImages.map((img, i) => (
                  <div key={i} className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => setComposeImages(imgs => imgs.filter((_, j) => j !== i))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setComposeImages([...composeImages, reader.result as string]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Hash className="w-5 h-5 text-primary" />
                </Button>
              </div>
              
              <Button 
                onClick={() => createPostMutation.mutate()}
                disabled={!composeContent.trim() || createPostMutation.isPending}
                data-testid="submit-post"
              >
                {createPostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-0">
            <DialogTitle className="sr-only">Post Detail</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <ScrollArea className="flex-1 -mx-6 px-6">
              {/* Original Post */}
              <div className="flex gap-3 pb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {(selectedPost.authorName || "U")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{selectedPost.authorName}</span>
                    <Badge variant="secondary" className="text-xs">{selectedPost.authorRole}</Badge>
                    <span className="text-xs text-muted-foreground">· {formatTime(selectedPost.createdAt)}</span>
                  </div>
                  {selectedPost.title && (
                    <h2 className="font-semibold text-lg mt-2">{selectedPost.title}</h2>
                  )}
                  <p className="mt-2 whitespace-pre-wrap">{selectedPost.content}</p>
                  
                  {selectedPost.images && selectedPost.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {selectedPost.images.map((img, i) => (
                        <div key={i} className="aspect-video bg-secondary rounded-lg overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> {selectedPost.likeCount || 0} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> {replies.length} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {selectedPost.viewCount || 0} views
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reply Input */}
              <div className="py-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user?.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && replyContent.trim()) {
                          replyMutation.mutate();
                        }
                      }}
                      data-testid="reply-input"
                    />
                    <Button 
                      size="icon"
                      disabled={!replyContent.trim() || replyMutation.isPending}
                      onClick={() => replyMutation.mutate()}
                      data-testid="submit-reply"
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Replies */}
              <div className="py-4 space-y-4">
                {replies.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No replies yet. Be the first to comment!
                  </p>
                ) : (
                  replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-secondary text-xs font-semibold">
                          {(reply.authorName || "U")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{reply.authorName || "User"}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                            <ThumbsUp className="w-3 h-3 mr-1" /> Like
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                            <Reply className="w-3 h-3 mr-1" /> Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </DealflowLayout>
  );
}
