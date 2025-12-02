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
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

export default function DealflowCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading: loadingCategories } = useQuery<CommunityCategory[]>({
    queryKey: ["/api/community/categories"],
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", selectedCategory],
    enabled: selectedCategory !== null,
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
    { label: "Paint color ROI", count: 24 },
    { label: "Curb appeal", count: 18 },
    { label: "Kitchen staging", count: 15 },
    { label: "Modern vs traditional", count: 12 }
  ];

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
                  <div 
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover-elevate cursor-pointer"
                  >
                    <span className="text-sm">{topic.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.count}
                    </Badge>
                  </div>
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
                    {selectedCategoryData && (
                      <>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(selectedCategoryData.name).split(' ').slice(1).join(' ')}`}>
                          {(() => {
                            const Icon = getCategoryIcon(selectedCategoryData.name);
                            return <Icon className={`w-5 h-5 ${getCategoryColor(selectedCategoryData.name).split(' ')[0]}`} />;
                          })()}
                        </div>
                        <div>
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
                      <Card key={post.id} className="hover-elevate" data-testid={`post-${post.id}`}>
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
                                    {new Date(post.createdAt).toLocaleDateString()}
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
                            <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-view-post-${post.id}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
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
