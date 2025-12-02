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
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function DealflowCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading: loadingCategories } = useQuery<any[]>({
    queryKey: ["/api/community/categories"],
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery<any[]>({
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

  const filteredPosts = posts.filter((post: any) =>
    searchQuery === "" || 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (name: string) => {
    if (name.includes("Deal")) return Briefcase;
    if (name.includes("Construction") || name.includes("Rehab")) return Hammer;
    if (name.includes("Financing") || name.includes("Lending")) return DollarSign;
    if (name.includes("Education") || name.includes("Learning")) return GraduationCap;
    if (name.includes("Dreamscaper")) return Sparkles;
    return MessageSquare;
  };

  const canAccessCategory = (category: any) => {
    if (category.name === "Dreamscapers Only") {
      return user?.isStaff;
    }
    return true;
  };

  return (
    <DealflowLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow Dreamscapers, investors, and operators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
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
                    {categories.map((category: any) => {
                      const hasAccess = canAccessCategory(category);
                      const IconComponent = getCategoryIcon(category.name);
                      return (
                        <button
                          key={category.id}
                          onClick={() => hasAccess && setSelectedCategory(category.id)}
                          disabled={!hasAccess}
                          className={`w-full text-left p-4 hover-elevate transition-colors ${
                            selectedCategory === category.id ? "bg-secondary" : ""
                          } ${!hasAccess ? "opacity-50 cursor-not-allowed" : ""}`}
                          data-testid={`category-${category.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm flex items-center gap-2">
                                {category.name}
                                {category.name === "Dreamscapers Only" && (
                                  <Lock className="w-3 h-3" />
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {category.description}
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
          </div>

          <div className="lg:col-span-3">
            {selectedCategory === null ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Topic</h3>
                  <p className="text-muted-foreground">
                    Choose a topic from the sidebar to view discussions
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-posts"
                    />
                  </div>
                  <Button onClick={() => setNewPostOpen(true)} data-testid="button-new-post">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
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
                      <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to start a discussion in this topic
                      </p>
                      <Button onClick={() => setNewPostOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map((post: any) => (
                      <Card key={post.id} className="hover-elevate" data-testid={`post-${post.id}`}>
                        <CardContent className="py-4">
                          <div className="flex gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {post.authorName?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h3 className="font-semibold">{post.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {post.authorName || "Anonymous"} • {new Date(post.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge variant="outline">{post.replyCount || 0} replies</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {post.content}
                              </p>
                            </div>
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
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share your thoughts with the community
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Post title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                data-testid="input-post-title"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="What's on your mind?"
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
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DealflowLayout>
  );
}
