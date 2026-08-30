import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Handshake, 
  TrendingUp,
  Info,
  ExternalLink,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, AUTHENTICATED_QUERY_META } from "@/lib/queryClient";
import { isKnownSpaPath } from "@shared/spa-routes";

export interface Notification {
  id: string | number;
  type: "deal_update" | "offer_received" | "offer_accepted" | "counter_offer" | "message" | "jv_request" | "document" | "system";
  title: string;
  message: string;
  dealId?: string;
  dealType?: string;
  senderId?: string;
  senderName?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

export function NotificationBell({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", userId],
    queryFn: async () => (await apiRequest("GET", "/api/notifications")).json(),
    enabled: !!userId,
    refetchInterval: 30000,
    meta: AUTHENTICATED_QUERY_META,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) throw new Error("Authentication required");
      return apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId], exact: true });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Authentication required");
      return apiRequest("POST", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId], exact: true });
    },
  });

  const displayNotifications: Notification[] = notifications || [];

  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;

  if (!userId) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                data-testid="button-mark-all-read"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          <SheetDescription>
            {isError
              ? "Your private notifications could not be loaded."
              : unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2 pr-4">
            {isError ? (
              <div className="py-8 text-center" role="status">
                <BellOff className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Notifications unavailable</p>
                <p className="mt-1 text-sm text-muted-foreground">Your private notifications could not be loaded.</p>
              </div>
            ) : isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading notifications…</div>
            ) : displayNotifications.length > 0 ? (
              displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markReadMutation.mutate(String(notification.id))}
                  onClose={() => setIsOpen(false)}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <BellOff className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
  onClose,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onClose: () => void;
}) {
  const icons: Record<Notification["type"], React.ReactNode> = {
    deal_update: <TrendingUp className="w-4 h-4 text-blue-500" />,
    offer_received: <DollarSign className="w-4 h-4 text-green-500" />,
    offer_accepted: <Check className="w-4 h-4 text-green-500" />,
    counter_offer: <TrendingUp className="w-4 h-4 text-amber-500" />,
    message: <MessageSquare className="w-4 h-4 text-blue-500" />,
    jv_request: <Handshake className="w-4 h-4 text-primary" />,
    document: <FileText className="w-4 h-4 text-gray-500" />,
    system: <Info className="w-4 h-4 text-gray-500" />,
  };

  const priorityColors = {
    low: "",
    normal: "",
    high: "border-l-2 border-l-amber-500",
    urgent: "border-l-2 border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead();
    }
    if (notification.actionUrl && isKnownSpaPath(notification.actionUrl)) {
      window.location.href = notification.actionUrl;
      onClose();
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        notification.isRead 
          ? "bg-muted/30" 
          : "bg-card hover:bg-muted/50"
      } ${priorityColors[notification.priority || "normal"]}`}
      onClick={handleClick}
      data-testid={`notification-${notification.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {icons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm ${notification.isRead ? "" : "font-semibold"}`}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {notification.senderName && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  from {notification.senderName}
                </span>
              </>
            )}
          </div>
        </div>
        {notification.actionUrl && isKnownSpaPath(notification.actionUrl) && (
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </div>
    </div>
  );
}

export function NotificationPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-4" role="status">
          <p className="text-sm font-medium">Notification preferences are not available yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No settings are shown as saved until a persistent preferences service is available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isError } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", userId],
    queryFn: async () => (await apiRequest("GET", "/api/notifications")).json(),
    enabled: !!userId,
    refetchInterval: 30000,
    meta: AUTHENTICATED_QUERY_META,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) throw new Error("Authentication required");
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId], exact: true });
    },
    [queryClient, userId]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) throw new Error("Authentication required");
    await apiRequest("POST", "/api/notifications/mark-all-read");
    queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId], exact: true });
  }, [queryClient, userId]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isError,
  };
}
