import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSocket } from "@/hooks/use-websocket";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { Bell, MessageSquare, DollarSign, FileText } from "lucide-react";

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
    }
  }, [notifications, showNotificationToast]);

  return <>{children}</>;
}
