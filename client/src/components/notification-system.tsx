import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  X, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Handshake, 
  TrendingUp,
  AlertCircle,
  Info,
  ExternalLink,
  Settings,
  Trash2,
  MoreVertical
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
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

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  dealUpdates: boolean;
  offerAlerts: boolean;
  messageAlerts: boolean;
  weeklyDigest: boolean;
}

export function NotificationBell({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", userId],
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest("POST", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const mockNotifications: Notification[] = notifications || [
    {
      id: "1",
      type: "offer_received",
      title: "New Offer Received",
      message: "Sarah Connor submitted an offer of $185,000 on 123 Main St",
      dealId: "deal-1",
      dealType: "wholesale",
      senderName: "Sarah Connor",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      actionUrl: "/marketflow/deals/deal-1",
      priority: "high",
    },
    {
      id: "2",
      type: "counter_offer",
      title: "Counter Offer",
      message: "Mike Johnson countered with $175,000 on 456 Oak Ave",
      dealId: "deal-2",
      dealType: "wholesale",
      senderName: "Mike Johnson",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      actionUrl: "/marketflow/negotiate/deal-2",
      priority: "normal",
    },
    {
      id: "3",
      type: "jv_request",
      title: "JV Partnership Request",
      message: "Alex Chen wants to partner on a wholesale deal",
      senderName: "Alex Chen",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      priority: "normal",
    },
    {
      id: "4",
      type: "message",
      title: "New Message",
      message: "You have a new message about the Atlanta property",
      senderName: "Lisa Park",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      actionUrl: "/messages",
      priority: "low",
    },
  ];

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

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
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2 pr-4">
            {mockNotifications.length > 0 ? (
              mockNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markReadMutation.mutate(notification.id)}
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
    jv_request: <Handshake className="w-4 h-4 text-purple-500" />,
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
    if (notification.actionUrl) {
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
        {notification.actionUrl && (
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </div>
    </div>
  );
}

export function NotificationPreferences() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    dealUpdates: true,
    offerAlerts: true,
    messageAlerts: true,
    weeklyDigest: false,
  });

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <PreferenceToggle
            label="Email Notifications"
            description="Receive notifications via email"
            checked={settings.emailNotifications}
            onToggle={() => handleToggle("emailNotifications")}
          />
          <PreferenceToggle
            label="Push Notifications"
            description="Browser push notifications"
            checked={settings.pushNotifications}
            onToggle={() => handleToggle("pushNotifications")}
          />
          <PreferenceToggle
            label="Deal Updates"
            description="Alerts when deals you're watching change"
            checked={settings.dealUpdates}
            onToggle={() => handleToggle("dealUpdates")}
          />
          <PreferenceToggle
            label="Offer Alerts"
            description="Notifications for new offers and counters"
            checked={settings.offerAlerts}
            onToggle={() => handleToggle("offerAlerts")}
          />
          <PreferenceToggle
            label="Message Alerts"
            description="New message notifications"
            checked={settings.messageAlerts}
            onToggle={() => handleToggle("messageAlerts")}
          />
          <PreferenceToggle
            label="Weekly Digest"
            description="Weekly summary of market activity"
            checked={settings.weeklyDigest}
            onToggle={() => handleToggle("weeklyDigest")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover-elevate"
      onClick={onToggle}
    >
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className={`w-10 h-6 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      } relative`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? "left-5" : "left-1"
        }`} />
      </div>
    </div>
  );
}

export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", userId],
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await apiRequest("POST", `/api/notifications/${notificationId}/read`);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    [queryClient]
  );

  const markAllAsRead = useCallback(async () => {
    await apiRequest("POST", "/api/notifications/read-all");
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  }, [queryClient]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
