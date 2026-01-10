import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Share2, 
  Plus, 
  FolderOpen, 
  MoreVertical,
  UserPlus,
  Link,
  Copy,
  Sparkles,
  MessageSquare,
  Eye,
  Trash2,
  Edit,
  Crown,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SharedWatchlist {
  id: string;
  name: string;
  description?: string;
  color: string;
  dealCount: number;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  collaborators: {
    id: string;
    name: string;
    avatar?: string;
    role: "viewer" | "editor";
  }[];
  isOwner: boolean;
  canEdit: boolean;
  createdAt: string;
  updatedAt: string;
  aiSummary?: string;
}

interface WatchlistDeal {
  id: string;
  title: string;
  address: string;
  dealType: string;
  addedBy: {
    id: string;
    name: string;
  };
  addedAt: string;
  notes?: string;
  matchScore?: number;
}

export function CollaborativeWatchlists({ userId }: { userId?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedList, setSelectedList] = useState<SharedWatchlist | null>(null);

  const { data: watchlists, isLoading } = useQuery<SharedWatchlist[]>({
    queryKey: ["/api/watchlists/shared", userId],
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/watchlists/shared", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlists/shared"] });
      setShowCreateDialog(false);
      setNewListName("");
      toast({ title: "Watchlist created", description: "Your new shared watchlist is ready" });
    },
  });

  const mockWatchlists: SharedWatchlist[] = watchlists || [
    {
      id: "1",
      name: "Hot Wholesale Deals",
      description: "Best wholesale opportunities this week",
      color: "#F59E0B",
      dealCount: 12,
      owner: { id: "user1", name: "John Smith", avatar: undefined },
      collaborators: [
        { id: "user2", name: "Sarah Connor", role: "editor" },
        { id: "user3", name: "Mike Johnson", role: "viewer" },
      ],
      isOwner: true,
      canEdit: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiSummary: "12 deals with average 23% ROI potential. 3 deals marked urgent.",
    },
    {
      id: "2",
      name: "Atlanta Multifamily",
      color: "#3B82F6",
      dealCount: 5,
      owner: { id: "user2", name: "Sarah Connor" },
      collaborators: [
        { id: "user1", name: "John Smith", role: "editor" },
      ],
      isOwner: false,
      canEdit: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiSummary: "5 multifamily properties in Atlanta metro. Best opportunity: 4-unit near Midtown.",
    },
  ];

  if (!userId) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Sign in to create and share watchlists with partners
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <WatchlistSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Shared Watchlists
          </h3>
          <p className="text-sm text-muted-foreground">
            Collaborate with partners on deal curation
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-create-watchlist">
              <Plus className="w-4 h-4 mr-1" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shared Watchlist</DialogTitle>
              <DialogDescription>
                Create a new watchlist to share deals with your partners
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Watchlist name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                data-testid="input-watchlist-name"
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(newListName)}
                disabled={!newListName.trim() || createMutation.isPending}
                data-testid="button-confirm-create"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockWatchlists.map((list) => (
          <WatchlistCard
            key={list.id}
            watchlist={list}
            onSelect={() => setSelectedList(list)}
          />
        ))}
      </div>

      {selectedList && (
        <WatchlistDetailDialog
          watchlist={selectedList}
          open={!!selectedList}
          onClose={() => setSelectedList(null)}
        />
      )}
    </div>
  );
}

function WatchlistCard({
  watchlist,
  onSelect,
}: {
  watchlist: SharedWatchlist;
  onSelect: () => void;
}) {
  const { toast } = useToast();

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/watchlist/${watchlist.id}`);
    toast({ title: "Link copied", description: "Share link copied to clipboard" });
  };

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all"
      onClick={onSelect}
      data-testid={`card-watchlist-${watchlist.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: watchlist.color }}
            />
            <CardTitle className="text-base">{watchlist.name}</CardTitle>
            {watchlist.isOwner && (
              <Crown className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyShareLink(); }}>
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </DropdownMenuItem>
              {watchlist.isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {watchlist.description && (
          <CardDescription>{watchlist.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{watchlist.dealCount} deals</span>
          </div>
          <div className="flex -space-x-2">
            <Avatar className="w-6 h-6 border-2 border-background">
              <AvatarImage src={watchlist.owner.avatar} />
              <AvatarFallback className="text-xs">
                {watchlist.owner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {watchlist.collaborators.slice(0, 3).map((collab) => (
              <Avatar key={collab.id} className="w-6 h-6 border-2 border-background">
                <AvatarImage src={collab.avatar} />
                <AvatarFallback className="text-xs">
                  {collab.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {watchlist.collaborators.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs">+{watchlist.collaborators.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {watchlist.aiSummary && (
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{watchlist.aiSummary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WatchlistDetailDialog({
  watchlist,
  open,
  onClose,
}: {
  watchlist: SharedWatchlist;
  open: boolean;
  onClose: () => void;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: deals } = useQuery<WatchlistDeal[]>({
    queryKey: ["/api/watchlists/shared", watchlist.id, "deals"],
    enabled: open,
  });

  const mockDeals: WatchlistDeal[] = deals || [
    {
      id: "deal1",
      title: "123 Main St Flip",
      address: "123 Main St, Atlanta, GA",
      dealType: "wholesale",
      addedBy: { id: "user1", name: "John" },
      addedAt: new Date().toISOString(),
      matchScore: 92,
    },
    {
      id: "deal2",
      title: "456 Oak Ave Rental",
      address: "456 Oak Ave, Marietta, GA",
      dealType: "wholesale",
      addedBy: { id: "user2", name: "Sarah" },
      addedAt: new Date().toISOString(),
      notes: "Great cash flow potential",
      matchScore: 85,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: watchlist.color }}
            />
            <DialogTitle>{watchlist.name}</DialogTitle>
          </div>
          <DialogDescription>
            {watchlist.dealCount} deals shared with {watchlist.collaborators.length + 1} people
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Collaborators</h4>
            {watchlist.isOwner && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowInvite(!showInvite)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Invite
              </Button>
            )}
          </div>

          {showInvite && (
            <div className="flex gap-2">
              <Input
                placeholder="Email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                data-testid="input-invite-email"
              />
              <Button size="sm" data-testid="button-send-invite">
                Send
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <Avatar className="w-5 h-5">
                <AvatarImage src={watchlist.owner.avatar} />
                <AvatarFallback className="text-xs">
                  {watchlist.owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{watchlist.owner.name}</span>
              <Badge variant="secondary" className="text-xs">Owner</Badge>
            </div>
            {watchlist.collaborators.map((collab) => (
              <div 
                key={collab.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
              >
                <Avatar className="w-5 h-5">
                  <AvatarImage src={collab.avatar} />
                  <AvatarFallback className="text-xs">
                    {collab.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{collab.name}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {collab.role}
                </Badge>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Deals in this list</h4>
            <div className="space-y-2">
              {mockDeals.map((deal) => (
                <div 
                  key={deal.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{deal.title}</h5>
                      {deal.matchScore && (
                        <Badge variant="outline" className="text-xs">
                          {deal.matchScore}% match
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{deal.address}</p>
                    {deal.notes && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {deal.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Added by {deal.addedBy.name}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WatchlistSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
