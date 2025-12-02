import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DealflowLayout } from "@/components/dealflow-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Users,
  Plus,
  Send,
  Clock,
  Lock,
  Loader2,
  Search,
  Briefcase,
  Hammer,
  DollarSign,
  GraduationCap,
  Sparkles,
  Heart,
  MessageCircle,
  ThumbsUp,
  Eye,
  Palette,
  TrendingUp,
  ArrowRight,
  Pin,
  Flame,
  Star,
  ArrowLeft,
  Share2,
  Bookmark,
  MoreHorizontal,
  Reply
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface CommunityCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  isLocked?: boolean;
  postCount?: number;
}

interface CommunityPost {
  id: number;
  categoryId: number;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  createdAt: string;
  replyCount?: number;
  likeCount?: number;
  viewCount?: number;
  isPinned?: boolean;
  isHot?: boolean;
}

interface CommunityReply {
  id: number;
  postId: number;
  content: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  createdAt: string;
  likeCount?: number;
}

export default function DealflowCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useQuery<CommunityCategory[]>({
    queryKey: ["/api/community/categories"],
  });

  const { data: postsData = [], isLoading: loadingPosts } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", selectedCategory],
    enabled: selectedCategory !== null,
  });
  
  const posts = Array.isArray(postsData) ? postsData : [];

  const { data: replies = [], isLoading: loadingReplies, refetch: refetchReplies } = useQuery<CommunityReply[]>({
    queryKey: ["/api/community/posts", selectedPost?.id, "replies"],
    enabled: selectedPost !== null,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/community/posts", {
        categoryId: selectedCategory,
        title: newPostTitle,
        content: newPostContent,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Post Created",
        description: "Your post has been published.",
      });
      setNewPostOpen(false);
      setNewPostTitle("");
      setNewPostContent("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/community/posts/${selectedPost?.id}/replies`, {
        content: replyContent,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchReplies();
      toast({
        title: "Reply Posted",
        description: "Your reply has been added to the discussion.",
      });
      setReplyContent("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const handleLikePost = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed like" : "Liked!",
      description: isLiked ? "You removed your like" : "You liked this post",
    });
  };

  const handleBookmarkPost = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed bookmark" : "Bookmarked!",
      description: isBookmarked ? "Removed from saved" : "Added to your saved posts",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Discussion link copied to clipboard",
    });
  };

  const filteredPosts = posts.filter((post) =>
    searchQuery === "" || 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (name: string) => {
    if (name.includes("Design") || name.includes("Aesthetic")) return Palette;
    if (name.includes("Deal")) return Briefcase;
    if (name.includes("Construction") || name.includes("Rehab")) return Hammer;
    if (name.includes("Financing") || name.includes("Lending")) return DollarSign;
    if (name.includes("Education") || name.includes("Learning")) return GraduationCap;
    if (name.includes("Dreamscaper") || name.includes("General")) return Sparkles;
    if (name.includes("Market")) return TrendingUp;
    return MessageSquare;
  };

  const getCategoryColor = (name: string) => {
    if (name.includes("Design") || name.includes("Aesthetic")) return "text-pink-500 bg-pink-100 dark:bg-pink-950";
    if (name.includes("Deal")) return "text-blue-500 bg-blue-100 dark:bg-blue-950";
    if (name.includes("Construction") || name.includes("Rehab")) return "text-orange-500 bg-orange-100 dark:bg-orange-950";
    if (name.includes("Financing") || name.includes("Lending")) return "text-green-500 bg-green-100 dark:bg-green-950";
    if (name.includes("Education") || name.includes("Learning")) return "text-purple-500 bg-purple-100 dark:bg-purple-950";
    if (name.includes("Market")) return "text-cyan-500 bg-cyan-100 dark:bg-cyan-950";
    return "text-primary bg-primary/10";
  };

  const canAccessCategory = (category: CommunityCategory) => {
    if (category.name === "Dreamscapers Only" || category.isLocked) {
      return user?.isStaff;
    }
    return true;
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  const trendingTopics = [
    { label: "Paint color ROI", count: 24, categoryId: categories.find(c => c.name.includes("Design"))?.id },
    { label: "Curb appeal", count: 18, categoryId: categories.find(c => c.name.includes("Design"))?.id },
    { label: "Kitchen staging", count: 15, categoryId: categories.find(c => c.name.includes("Rehab") || c.name.includes("Construction"))?.id },
    { label: "Modern vs traditional", count: 12, categoryId: categories.find(c => c.name.includes("Design"))?.id }
  ];

  const handleTrendingClick = (topic: typeof trendingTopics[0]) => {
    if (topic.categoryId) {
      setSelectedCategory(topic.categoryId);
      setSearchQuery(topic.label);
    }
    toast({
      title: `Searching: ${topic.label}`,
      description: "Showing related discussions",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (selectedPost) {
    return (
      <DealflowLayout>
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedPost(null)}
            className="mb-4"
            data-testid="button-back-to-posts"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discussions
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {selectedPost.authorName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h1 className="text-2xl font-serif font-bold">{selectedPost.title}</h1>
                        {selectedPost.isPinned && (
                          <Badge variant="outline">
                            <Pin className="w-3 h-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {selectedPost.isHot && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                            <Flame className="w-3 h-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{selectedPost.authorName || "Anonymous"}</span>
                        {selectedPost.authorRole && (
                          <Badge variant="secondary" className="text-xs">{selectedPost.authorRole}</Badge>
                        )}
                        <span>·</span>
                        <span>{formatTimeAgo(selectedPost.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-6">
                    {selectedPost.content}
                  </p>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleLikePost}
                        className={isLiked ? "text-red-500" : ""}
                        data-testid="button-like-post"
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                        {(selectedPost.likeCount || 0) + (isLiked ? 1 : 0)}
                      </Button>
                      <Button variant="ghost" size="sm" data-testid="button-reply-count">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {replies.length || selectedPost.replyCount || 0} replies
                      </Button>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {selectedPost.viewCount || 0} views
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleBookmarkPost}
                        data-testid="button-bookmark-post"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current text-amber-500" : ""}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleShare}
                        data-testid="button-share-post"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Reply className="w-5 h-5" />
                    Add Your Reply
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.firstName?.[0] || "Y"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                        data-testid="input-reply-content"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => createReplyMutation.mutate()}
                          disabled={createReplyMutation.isPending || !replyContent.trim()}
                          data-testid="button-submit-reply"
                        >
                          {createReplyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {replies.length > 0 ? `${replies.length} Replies` : "No replies yet"}
                </h3>
                
                {loadingReplies ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </CardContent>
                  </Card>
                ) : replies.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Be the first to reply!</p>
                      <p className="text-sm">Share your thoughts and join the discussion</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {replies.map((reply) => (
                      <Card key={reply.id} data-testid={`reply-${reply.id}`}>
                        <CardContent className="py-4">
                          <div className="flex gap-3">
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                {reply.authorName?.[0] || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{reply.authorName || "Anonymous"}</span>
                                {reply.authorRole && (
                                  <Badge variant="secondary" className="text-xs">{reply.authorRole}</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {reply.content}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {reply.likeCount || 0}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                  <Reply className="w-3 h-3 mr-1" />
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">About This Discussion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted</span>
                    <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author</span>
                    <span>{selectedPost.authorName || "Anonymous"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Replies</span>
                    <span>{replies.length || selectedPost.replyCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span>{selectedPost.viewCount || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">More Discussions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {posts.filter(p => p.id !== selectedPost.id).slice(0, 3).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="w-full text-left p-2 rounded-lg bg-secondary/30 hover-elevate text-sm"
                      data-testid={`related-post-${post.id}`}
                    >
                      <p className="font-medium line-clamp-1">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{post.replyCount || 0} replies</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DealflowLayout>
    );
  }

  return (
    <DealflowLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold mb-1">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow Dreamscapers, investors, and operators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingCategories ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="divide-y">
                    {categories.map((category) => {
                      const hasAccess = canAccessCategory(category);
                      const IconComponent = getCategoryIcon(category.name);
                      const colorClasses = getCategoryColor(category.name);
                      const isSelected = selectedCategory === category.id;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => hasAccess && setSelectedCategory(category.id)}
                          disabled={!hasAccess}
                          className={`w-full text-left p-3 transition-all ${
                            isSelected 
                              ? "bg-primary/10 border-l-2 border-primary" 
                              : "hover:bg-secondary/50"
                          } ${!hasAccess ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          data-testid={`category-${category.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses.split(' ').slice(1).join(' ')}`}>
                              <IconComponent className={`w-4 h-4 ${colorClasses.split(' ')[0]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm flex items-center gap-2">
                                <span className="truncate">{category.name}</span>
                                {category.isLocked && (
                                  <Lock className="w-3 h-3 shrink-0" />
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {category.postCount || 0} discussions
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingTopics.map((topic, i) => (
                  <button 
                    key={i}
                    onClick={() => handleTrendingClick(topic)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover-elevate cursor-pointer text-left"
                    data-testid={`trending-topic-${i}`}
                  >
                    <span className="text-sm">{topic.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.count}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {selectedCategory === null ? (
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-pink-50 via-amber-50/50 to-pink-50 dark:from-pink-950/30 dark:via-amber-950/20 dark:to-pink-950/30 border-pink-200/50 dark:border-pink-800/30">
                  <CardContent className="py-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-amber-400 flex items-center justify-center shadow-lg">
                        <Palette className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-serif font-bold mb-2">Design & Aesthetics</h2>
                        <p className="text-muted-foreground mb-3">
                          Discuss renovation styles, property staging, curb appeal, and the visual elements that maximize property value.
                        </p>
                        <Button 
                          onClick={() => {
                            const designCategory = categories.find(c => 
                              c.name.includes("Design") || c.name.includes("Aesthetic")
                            );
                            if (designCategory) {
                              setSelectedCategory(designCategory.id);
                            }
                          }}
                          className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600"
                          data-testid="button-design-topic"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Explore Design Discussions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.slice(0, 4).map((category) => {
                    const hasAccess = canAccessCategory(category);
                    const IconComponent = getCategoryIcon(category.name);
                    const colorClasses = getCategoryColor(category.name);
                    
                    return (
                      <Card 
                        key={category.id}
                        className={`hover-elevate cursor-pointer ${!hasAccess ? "opacity-60" : ""}`}
                        onClick={() => hasAccess && setSelectedCategory(category.id)}
                        data-testid={`topic-card-${category.id}`}
                      >
                        <CardContent className="py-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses.split(' ').slice(1).join(' ')}`}>
                              <IconComponent className={`w-6 h-6 ${colorClasses.split(' ')[0]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{category.name}</h3>
                                {!hasAccess && <Lock className="w-3 h-3" />}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {category.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {category.postCount || 0} discussions
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Join the Conversation</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a topic from the sidebar to browse discussions or start a new thread
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedCategory(null)}
                      data-testid="button-back-to-topics"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    {selectedCategoryData && (
                      <>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(selectedCategoryData.name).split(' ').slice(1).join(' ')}`}>
                          {(() => {
                            const Icon = getCategoryIcon(selectedCategoryData.name);
                            return <Icon className={`w-5 h-5 ${getCategoryColor(selectedCategoryData.name).split(' ')[0]}`} />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <h2 className="font-semibold">{selectedCategoryData.name}</h2>
                          <p className="text-sm text-muted-foreground">{selectedCategoryData.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-posts"
                      />
                    </div>
                    <Button onClick={() => setNewPostOpen(true)} data-testid="button-new-post">
                      <Plus className="w-4 h-4 mr-2" />
                      Start Discussion
                    </Button>
                  </div>
                </div>

                {loadingPosts ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                    </CardContent>
                  </Card>
                ) : filteredPosts.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Discussions Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to start a conversation in this topic
                      </p>
                      <Button onClick={() => setNewPostOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Start Discussion
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredPosts.map((post) => (
                      <Card 
                        key={post.id} 
                        className="hover-elevate cursor-pointer"
                        onClick={() => setSelectedPost(post)}
                        data-testid={`post-${post.id}`}
                      >
                        <CardContent className="py-4">
                          <div className="flex gap-4">
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {post.authorName?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold truncate">{post.title}</h3>
                                    {post.isPinned && (
                                      <Badge variant="outline" className="shrink-0 text-xs">
                                        <Pin className="w-3 h-3 mr-1" />
                                        Pinned
                                      </Badge>
                                    )}
                                    {post.isHot && (
                                      <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 shrink-0 text-xs">
                                        <Flame className="w-3 h-3 mr-1" />
                                        Hot
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">{post.authorName || "Anonymous"}</span>
                                    {post.authorRole && (
                                      <Badge variant="secondary" className="ml-2 text-xs">{post.authorRole}</Badge>
                                    )}
                                    <span className="mx-2">·</span>
                                    {formatTimeAgo(post.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {post.replyCount || 0} replies
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  {post.likeCount || 0} likes
                                </span>
                                {post.viewCount && post.viewCount > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    {post.viewCount} views
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a Discussion</DialogTitle>
            <DialogDescription>
              Share your thoughts, ask questions, or spark a conversation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Give your discussion a title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                data-testid="input-post-title"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="What would you like to discuss?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={5}
                data-testid="input-post-content"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPostOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createPostMutation.mutate()}
              disabled={createPostMutation.isPending || !newPostTitle || !newPostContent}
              data-testid="button-submit-post"
            >
              {createPostMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Discussion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DealflowLayout>
  );
}
