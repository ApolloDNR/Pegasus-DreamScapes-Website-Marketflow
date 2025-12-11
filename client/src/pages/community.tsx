import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Hammer, 
  DollarSign, 
  BookOpen, 
  ChevronRight, 
  Plus,
  Eye,
  MessageCircle,
  Clock,
  Pin,
  Lock,
  Search,
  ArrowLeft
} from "lucide-react";
import type { CommunityCategory, CommunityPost, CommunityReply } from "@shared/schema";

const postSchema = z.object({
  categoryId: z.number().min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters")
});

const replySchema = z.object({
  content: z.string().min(10, "Reply must be at least 10 characters")
});

type PostFormData = z.infer<typeof postSchema>;
type ReplyFormData = z.infer<typeof replySchema>;

const categoryIcons: Record<string, any> = {
  deals: TrendingUp,
  construction: Hammer,
  finance: DollarSign,
  education: BookOpen,
  general: MessageSquare
};

const categoryColors: Record<string, string> = {
  deals: "bg-emerald-100 text-emerald-800",
  construction: "bg-amber-100 text-amber-800",
  finance: "bg-blue-100 text-blue-800",
  education: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800"
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function CommunityPage() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading: loadingCategories } = useQuery<CommunityCategory[]>({
    queryKey: ["/api/community/categories"]
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/community/posts?categoryId=${selectedCategory}`
        : "/api/community/posts";
      const res = await fetch(url);
      return res.json();
    }
  });

  const { data: currentPost, isLoading: loadingPost } = useQuery<CommunityPost>({
    queryKey: ["/api/community/posts", selectedPost],
    enabled: !!selectedPost
  });

  const { data: replies = [], isLoading: loadingReplies } = useQuery<CommunityReply[]>({
    queryKey: ["/api/community/posts", selectedPost, "replies"],
    enabled: !!selectedPost
  });

  const postForm = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      categoryId: 0,
      title: "",
      content: ""
    }
  });

  const replyForm = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: ""
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      return apiRequest("POST", "/api/community/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setShowNewPostDialog(false);
      postForm.reset();
      toast({ title: "Post Created", description: "Your discussion has been posted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post. Please try again.", variant: "destructive" });
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: async (data: ReplyFormData) => {
      return apiRequest("POST", `/api/community/posts/${selectedPost}/replies`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost, "replies"] });
      replyForm.reset();
      toast({ title: "Reply Posted", description: "Your reply has been added to the discussion." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post reply. Please try again.", variant: "destructive" });
    }
  });

  const filteredPosts = posts.filter(post => 
    searchQuery === "" || 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryById = (id: number) => categories.find(c => c.id === id);

  if (selectedPost && currentPost) {
    const category = getCategoryById(currentPost.categoryId);
    const IconComponent = category ? categoryIcons[category.slug] || MessageSquare : MessageSquare;

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
        <div className="bg-primary/5 border-b">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedPost(null)}
              className="mb-4"
              data-testid="button-back-to-community"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
            
            <div className="flex items-start gap-4">
              {currentPost.isPinned && (
                <Pin className="w-5 h-5 text-primary mt-1" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {category && (
                    <Badge className={categoryColors[category.slug] || "bg-gray-100"} data-testid="badge-category">
                      <IconComponent className="w-3 h-3 mr-1" />
                      {category.name}
                    </Badge>
                  )}
                  {currentPost.isLocked && (
                    <Badge variant="secondary">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-serif font-bold text-foreground" data-testid="text-post-title">
                  {currentPost.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {currentPost.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {currentPost.replyCount} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(currentPost.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-foreground whitespace-pre-wrap" data-testid="text-post-content">
                {currentPost.content}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Replies ({replies.length})
            </h3>

            {loadingReplies ? (
              <div className="text-center py-8 text-muted-foreground">Loading replies...</div>
            ) : replies.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No replies yet. Be the first to respond!
                </CardContent>
              </Card>
            ) : (
              replies.map((reply) => (
                <Card key={reply.id} data-testid={`card-reply-${reply.id}`}>
                  <CardContent className="pt-4">
                    <p className="text-foreground whitespace-pre-wrap">{reply.content}</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(reply.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {isAuthenticated && !currentPost.isLocked ? (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Post a Reply</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...replyForm}>
                    <form onSubmit={replyForm.handleSubmit((data) => createReplyMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={replyForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Share your thoughts..."
                                className="min-h-[120px]"
                                {...field}
                                data-testid="input-reply-content"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={createReplyMutation.isPending}
                        data-testid="button-submit-reply"
                      >
                        {createReplyMutation.isPending ? "Posting..." : "Post Reply"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : currentPost.isLocked ? (
              <Card className="mt-6 bg-muted/50">
                <CardContent className="py-6 text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  This thread is locked and no longer accepting replies.
                </CardContent>
              </Card>
            ) : (
              <Card className="mt-6 bg-muted/50">
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground mb-4">Sign in to join the discussion</p>
                  <Button asChild>
                    <a href="/api/login" data-testid="link-login-to-reply">Sign In</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="bg-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="text-page-title">
                Community Hub
              </h1>
              <p className="text-muted-foreground">
                Connect with investors, wholesalers, and industry professionals
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={selectedCategory === null ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                  data-testid="button-category-all"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  All Discussions
                </Button>
                {categories.map((category) => {
                  const IconComponent = categoryIcons[category.slug] || MessageSquare;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                      data-testid={`button-category-${category.slug}`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {isAuthenticated && (
              <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4" data-testid="button-new-post">
                    <Plus className="w-4 h-4 mr-2" />
                    New Discussion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Start a New Discussion</DialogTitle>
                    <DialogDescription>
                      Share your questions, insights, or experiences with the community.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...postForm}>
                    <form onSubmit={postForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={postForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={(val) => field.onChange(Number(val))}
                              value={field.value ? String(field.value) : ""}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={postForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="What's on your mind?"
                                {...field}
                                data-testid="input-post-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={postForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Share your thoughts, questions, or experiences..."
                                className="min-h-[150px]"
                                {...field}
                                data-testid="input-post-content"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={createPostMutation.isPending} data-testid="button-submit-post">
                          {createPostMutation.isPending ? "Posting..." : "Post Discussion"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </aside>

          <main className="flex-1">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>

            {loadingPosts ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading discussions...
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Discussions Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "No discussions match your search." 
                      : "Be the first to start a conversation!"}
                  </p>
                  {isAuthenticated && !searchQuery && (
                    <Button onClick={() => setShowNewPostDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Start a Discussion
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => {
                  const category = getCategoryById(post.categoryId);
                  const IconComponent = category ? categoryIcons[category.slug] || MessageSquare : MessageSquare;
                  
                  return (
                    <Card 
                      key={post.id} 
                      className="hover-elevate cursor-pointer transition-all"
                      onClick={() => setSelectedPost(post.id)}
                      data-testid={`card-post-${post.id}`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center min-w-[60px] text-center">
                            <span className="text-lg font-semibold text-foreground">{post.replyCount || 0}</span>
                            <span className="text-xs text-muted-foreground">replies</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {post.isPinned && (
                                <Pin className="w-4 h-4 text-primary shrink-0" />
                              )}
                              {category && (
                                <Badge className={`${categoryColors[category.slug] || "bg-gray-100"} text-xs`}>
                                  {category.name}
                                </Badge>
                              )}
                              {post.isLocked && (
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                            <h3 className="font-semibold text-foreground truncate pr-4" data-testid={`text-post-title-${post.id}`}>
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.viewCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(post.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
