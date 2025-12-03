import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Bell, 
  Check, 
  X, 
  ExternalLink, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  MessageSquare,
  DollarSign,
  Target,
  Milestone,
  HandshakeIcon,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import type { Notification } from "@shared/schema";

const typeIcons: Record<string, any> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: X,
  message: MessageSquare,
  deal_update: TrendingUp,
  milestone: Target,
  offer: HandshakeIcon,
  investment: DollarSign,
};

const typeColors: Record<string, string> = {
  info: "text-blue-500 bg-blue-500/10",
  success: "text-green-500 bg-green-500/10",
  warning: "text-amber-500 bg-amber-500/10",
  error: "text-red-500 bg-red-500/10",
  message: "text-purple-500 bg-purple-500/10",
  deal_update: "text-emerald-500 bg-emerald-500/10",
  milestone: "text-primary bg-primary/10",
  offer: "text-amber-600 bg-amber-500/10",
  investment: "text-green-600 bg-green-500/10",
};

const categoryLabels: Record<string, string> = {
  all: "All",
  message: "Messages",
  deal_update: "Deals",
  milestone: "Milestones",
  offer: "Offers",
};

function NotificationItem({ 
  notification, 
  onClick 
}: { 
  notification: Notification; 
  onClick: () => void;
}) {
  const Icon = typeIcons[notification.type] || Info;
  const colorClass = typeColors[notification.type] || "text-blue-500 bg-blue-500/10";
  const [textColor, bgColor] = colorClass.split(" ");

  return (
    <div
      className={`flex gap-3 p-3 cursor-pointer transition-all hover-elevate rounded-lg mx-2 mb-1 ${
        !notification.isRead ? "bg-accent/50" : "hover:bg-accent/20"
      }`}
      onClick={onClick}
      data-testid={`notification-item-${notification.id}`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${textColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="flex-shrink-0 mt-1.5">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
          {notification.link && (
            <span className="text-[10px] text-primary flex items-center gap-0.5">
              View <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [, setLocation] = useLocation();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      setOpen(false);
      setLocation(notification.link);
    }
  };

  const count = unreadCount?.count ?? 0;

  const filteredNotifications = notifications.filter(n => 
    activeTab === "all" || n.type === activeTab
  );

  const categoryCounts = {
    all: notifications.length,
    message: notifications.filter(n => n.type === "message").length,
    deal_update: notifications.filter(n => n.type === "deal_update").length,
    milestone: notifications.filter(n => n.type === "milestone").length,
    offer: notifications.filter(n => n.type === "offer").length,
  };
  
  const categoryUnreadCounts = {
    all: notifications.filter(n => !n.isRead).length,
    message: notifications.filter(n => n.type === "message" && !n.isRead).length,
    deal_update: notifications.filter(n => n.type === "deal_update" && !n.isRead).length,
    milestone: notifications.filter(n => n.type === "milestone" && !n.isRead).length,
    offer: notifications.filter(n => n.type === "offer" && !n.isRead).length,
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="button-notification-bell"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground animate-pulse"
            >
              {count > 99 ? "99+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" data-testid="notification-center">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Notification Center</h4>
                <p className="text-xs text-muted-foreground">
                  {count > 0 ? `${count} unread` : "All caught up!"}
                </p>
              </div>
            </div>
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs h-7"
                data-testid="button-mark-all-read"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex overflow-x-auto border-b px-2 py-1 gap-1">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(key)}
              className={`text-xs h-7 px-2.5 shrink-0 ${
                activeTab === key 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent"
              }`}
              data-testid={`notification-tab-${key}`}
            >
              {label}
              {categoryUnreadCounts[key as keyof typeof categoryUnreadCounts] > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-4 p-0 text-[10px] justify-center">
                  {categoryUnreadCounts[key as keyof typeof categoryUnreadCounts]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        
        <ScrollArea className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <div className="w-14 h-14 rounded-full bg-accent/50 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 opacity-50" />
                </div>
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-0.5">
                  {activeTab === "all" ? "You're all caught up!" : `No ${categoryLabels[activeTab]?.toLowerCase()} yet`}
                </p>
              </div>
            ) : (
              <div className="py-2">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        
        <div className="border-t p-2">
          <Link href="/dealflow/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs justify-center" data-testid="button-view-all-notifications">
              View All Notifications
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
