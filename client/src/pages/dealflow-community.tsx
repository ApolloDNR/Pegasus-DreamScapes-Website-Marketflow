import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Plus,
  Send,
  Loader2,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Building2,
  TrendingUp,
  Sparkles,
  Hash,
  ChevronRight,
  Flame,
  Star,
  Eye,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, AUTHENTICATED_QUERY_META } from "@/lib/queryClient";
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
  // Joined user info supplied by the community API
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
  useSEO({
    title: "MarketFlow Community",
    description: "Private MarketFlow community surface.",
    noIndex: true,
  });
  const { user, profile } = useSupabaseAuth();
  const client = useQueryClient();
  const subjectId = user?.id ?? null;
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeContent, setComposeContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch categories
  const { data: categoriesData = [], isError: categoriesError } = useQuery<CommunityCategory[]>({
    queryKey: ["/api/community/categories", subjectId],
    queryFn: async () => (await apiRequest("GET", "/api/community/categories")).json(),
    enabled: Boolean(subjectId),
    meta: AUTHENTICATED_QUERY_META,
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Fetch social feed
  const { data: feedData = [], isLoading: loadingFeed, isError: feedError } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/feed", subjectId],
    queryFn: async () => (await apiRequest("GET", "/api/community/feed")).json(),
    enabled: Boolean(subjectId),
    meta: AUTHENTICATED_QUERY_META,
  });
  const feedPosts = Array.isArray(feedData) ? feedData : [];

  // Fetch category-specific posts
  const { data: categoryPostsData = [], isLoading: loadingCategory, isError: categoryError } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", subjectId, selectedCategory],
    queryFn: async () => (
      await apiRequest("GET", `/api/community/posts?categoryId=${selectedCategory}`)
    ).json(),
    enabled: Boolean(subjectId) && selectedCategory !== null,
    meta: AUTHENTICATED_QUERY_META,
  });
  const categoryPosts = Array.isArray(categoryPostsData) ? categoryPostsData : [];

  // Fetch replies for selected post
  const { data: repliesData = [], isError: repliesError } = useQuery<CommunityReply[]>({
    queryKey: ["/api/community/posts", subjectId, selectedPost?.id, "replies"],
    queryFn: async () => (
      await apiRequest("GET", `/api/community/posts/${selectedPost?.id}/replies`)
    ).json(),
    enabled: Boolean(subjectId) && selectedPost !== null,
    meta: AUTHENTICATED_QUERY_META,
  });
  const replies = Array.isArray(repliesData) ? repliesData : [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      const categoryId = selectedCategory ?? categories[0]?.id;
      if (!subjectId || !categoryId) throw new Error("A signed-in member and category are required");
      const res = await apiRequest("POST", "/api/community/posts", {
        categoryId,
        content: composeContent,
      });
      return res.json();
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["/api/community/feed", subjectId], exact: true });
      if (selectedCategory !== null) {
        client.invalidateQueries({
          queryKey: ["/api/community/posts", subjectId, selectedCategory],
          exact: true,
        });
      }
      toast({ title: "Posted!", description: "Your post is now live." });
      setComposeOpen(false);
      setComposeContent("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    },
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!subjectId) throw new Error("Authentication required");
      const res = await apiRequest("POST", `/api/community/posts/${postId}/like`);
      return res.json();
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["/api/community/feed", subjectId], exact: true });
      if (selectedCategory !== null) {
        client.invalidateQueries({ queryKey: ["/api/community/posts", subjectId, selectedCategory], exact: true });
      }
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!subjectId) throw new Error("Authentication required");
      const res = await apiRequest("POST", `/api/community/posts/${postId}/bookmark`);
      return res.json();
    },
    onSuccess: (data) => {
      client.invalidateQueries({ queryKey: ["/api/community/feed", subjectId], exact: true });
      if (selectedCategory !== null) {
        client.invalidateQueries({ queryKey: ["/api/community/posts", subjectId, selectedCategory], exact: true });
      }
      toast({
        title: data.bookmarked ? "Saved!" : "Removed",
        description: data.bookmarked ? "Added to your bookmarks" : "Removed from bookmarks",
      });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!subjectId || !selectedPost) throw new Error("Authentication required");
      const res = await apiRequest("POST", `/api/community/posts/${selectedPost.id}/replies`, {
        content: replyContent,
      });
      return res.json();
    },
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ["/api/community/posts", subjectId, selectedPost?.id, "replies"],
        exact: true,
      });
      client.invalidateQueries({ queryKey: ["/api/community/feed", subjectId], exact: true });
      setReplyContent("");
      toast({ title: "Reply posted!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post reply", variant: "destructive" });
    },
  });

  const displayPosts = useMemo(
    () =>
      (selectedCategory === null ? feedPosts : categoryPosts).map((post) => ({
        ...post,
        authorName: post.authorName || "Member",
        authorRole: post.authorRole || "MarketFlow member",
        authorAvatar: post.authorAvatar,
        likeCount: post.likeCount || 0,
        replyCount: post.replyCount || 0,
        viewCount: post.viewCount || 0,
        shareCount: post.shareCount || 0,
      })),
    [selectedCategory, feedPosts, categoryPosts],
  );

  // Filter posts by search
  const filteredPosts = displayPosts.filter((post) =>
    searchQuery === "" ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trendingTopics = useMemo(() => {
    const counts = new Map<string, number>();
    displayPosts.forEach((post) => {
      post.tags?.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count, trending: false }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((topic, index) => ({ ...topic, trending: index === 0 }));
  }, [displayPosts]);

  const featuredMembers = useMemo(() => {
    const members = new Map<string, { name: string; role: string; posts: number }>();
    displayPosts.forEach((post) => {
      const key = post.userId || post.authorName || "member";
      const existing = members.get(key);
      members.set(key, {
        name: post.authorName || "Member",
        role: post.authorRole || "MarketFlow member",
        posts: (existing?.posts || 0) + 1,
      });
    });
    return Array.from(members.values())
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 3);
  }, [displayPosts]);

  const handleShare = (post: CommunityPost) => {
    navigator.clipboard.writeText(`${window.location.origin}/marketflow/community?post=${post.id}`);
    toast({ title: "Link copied!", description: "Share this post with others" });
  };

  const getCategoryBadgeColor = (categoryId: number) => {
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
    ];
    return colors[categoryId % colors.length];
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || "Uncategorized";
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  const canCompose = Boolean(subjectId && (selectedCategory ?? categories[0]?.id));
  const communityError = categoriesError || feedError || (selectedCategory !== null && categoryError);

  if (!subjectId || communityError) {
    return (
      <MarketplaceLayout>
        <div className="mx-auto max-w-3xl py-12">
          <Card role="status">
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Community unavailable</h1>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                {!subjectId
                  ? "Sign in with an approved MarketFlow identity to load this private community."
                  : "The private community could not be loaded. No empty feed is being inferred from that error."}
              </p>
            </CardContent>
          </Card>
        </div>
      </MarketplaceLayout>
    );
  }

  // Post Card Component
  const PostCard = ({ post }: { post: CommunityPost }) => (
    <Card className="hover:bg-secondary/30 transition-colors" data-testid={`post-${post.id}`}>
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
                  <span key={i} className="text-xs text-primary">
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
                      <p className="font-medium text-sm">Linked opportunity</p>
                      <p className="text-xs text-muted-foreground">Click to view project details</p>
                      <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-xs">
                        Linked record
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
    <MarketplaceLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">MarketFlow Community</h1>
          <p className="text-muted-foreground">
            Share deals, ask questions, and connect with investors, Dreamscapers, and partners
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Compose Box */}
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-secondary/50 px-4 py-2.5 text-left transition-colors enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => setComposeOpen(true)}
                    disabled={!canCompose}
                    data-testid="compose-trigger"
                  >
                    <span className="text-muted-foreground text-sm">Share a deal, ask a question, or post an update...</span>
                  </button>
                </div>
                {!canCompose && (
                  <p className="mt-3 text-xs text-muted-foreground" role="status">
                    Posting is unavailable because no community category is configured.
                  </p>
                )}
              </CardContent>
            </Card>

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
            {loadingFeed || loadingCategory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">No posts yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Be the first to start the conversation!</p>
                  <Button onClick={() => setComposeOpen(true)} disabled={!canCompose}>
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

            {trendingTopics.length > 0 && (
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
            )}

            {featuredMembers.length > 0 && (
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
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg"
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
                          {member.posts} posts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                  {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{profile?.display_name || user?.email?.split("@")[0] || "User"}</p>
                <Badge variant="secondary" className="text-xs">Private beta</Badge>
              </div>
            </div>
            
            <Textarea
              placeholder="What's happening in your real estate world?"
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base"
              value={composeContent}
              onChange={(e) => setComposeContent(e.target.value)}
              data-testid="compose-content"
            />

            <Separator />

            <div className="flex items-center justify-end">
              <Button 
                onClick={() => createPostMutation.mutate()}
                disabled={!canCompose || !composeContent.trim() || createPostMutation.isPending}
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
                      {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
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
                {repliesError ? (
                  <p className="text-center text-sm py-4" role="status">
                    Replies unavailable
                  </p>
                ) : replies.length === 0 ? (
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </MarketplaceLayout>
  );
}
