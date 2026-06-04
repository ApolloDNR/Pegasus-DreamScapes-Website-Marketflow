import { useEffect, useRef, useState, useCallback } from "react";
import { portalServicesEnabled } from "@/lib/runtime-config";

interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const servicesEnabled = portalServicesEnabled();
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!servicesEnabled) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onConnect?.();
      };

      socket.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++;
            connect();
          }, reconnectInterval);
        }
      };

      socket.onerror = (error) => {
        onError?.(error);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
          onMessage?.(message);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socketRef.current = socket;
    } catch (err) {
      console.error("Failed to connect to WebSocket:", err);
    }
  }, [onMessage, onConnect, onDisconnect, onError, reconnectAttempts, reconnectInterval, servicesEnabled]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    socketRef.current?.close();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!servicesEnabled) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
      }));
    }
  }, [servicesEnabled]);

  useEffect(() => {
    if (!servicesEnabled) {
      disconnect();
      return;
    }

    connect();
    return () => disconnect();
  }, [connect, disconnect, servicesEnabled]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}

export function useNotificationSocket(userId: string | null) {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const subscribe = useCallback((sendFn: (msg: WebSocketMessage) => void) => {
    if (userIdRef.current) {
      sendFn({ type: "subscribe", payload: { userId: userIdRef.current } });
    }
  }, []);

  const { isConnected, sendMessage } = useWebSocket({
    onConnect: () => {
      subscribe(sendMessage);
    },
    onMessage: (message) => {
      if (message.type === "notification" || message.type === "offer_update" || message.type === "new_message" || message.type === "deal_update") {
        setNotifications((prev) => [message, ...prev].slice(0, 50));
      }
    },
  });

  // Re-subscribe when userId changes
  useEffect(() => {
    if (isConnected && userId) {
      sendMessage({ type: "subscribe", payload: { userId } });
    }
  }, [userId, isConnected, sendMessage]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    isConnected,
    notifications,
    clearNotifications,
  };
}
