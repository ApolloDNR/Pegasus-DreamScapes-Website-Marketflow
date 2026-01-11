import { createContext, useContext, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSocket } from "@/hooks/use-websocket";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { queryClient } from "@/lib/queryClient";

interface NotificationContextValue {
  notifications: Array<{ type: string; payload?: any }>;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  isConnected: false,
});

export function useNotificationContext() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const { notifications, isConnected } = useNotificationSocket(user?.id || null);

  const showNotificationToast = useCallback((notification: { type: string; payload?: any }) => {
    const { type, payload } = notification;

    switch (type) {
      case "offer_update":
        toast({
          title: "Offer Update",
          description: `Your offer status changed to ${payload?.status || "updated"}`,
          duration: 5000,
        });
        break;
      case "new_message":
        toast({
          title: "New Message",
          description: payload?.subject || "You received a new message",
          duration: 5000,
        });
        break;
      case "deal_update":
        toast({
          title: "Deal Update",
          description: `${payload?.propertyAddress || "A deal"} status changed to ${payload?.status || "updated"}`,
          duration: 5000,
        });
        break;
      case "notification":
        toast({
          title: payload?.title || "Notification",
          description: payload?.message || "You have a new notification",
          duration: 5000,
        });
        break;
      default:
        break;
    }
  }, [toast]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      showNotificationToast(latestNotification);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    }
  }, [notifications, showNotificationToast]);

  return (
    <NotificationContext.Provider value={{ notifications, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
}
