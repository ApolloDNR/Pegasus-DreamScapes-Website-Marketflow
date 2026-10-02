import { createContext, useContext } from "react";

interface NotificationContextValue {
  notifications: Array<{ type: string; payload?: any }>;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  isConnected: false,
});

const launchSafeNotificationContext: NotificationContextValue = {
  notifications: [],
  isConnected: false,
};

export function useNotificationContext() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Real-time delivery is disabled until the socket upgrade can bind a
  // verified server-side principal. The notification bell continues to poll
  // its authenticated HTTP endpoints, so users retain a safe launch path.
  return (
    <NotificationContext.Provider value={launchSafeNotificationContext}>
      {children}
    </NotificationContext.Provider>
  );
}
