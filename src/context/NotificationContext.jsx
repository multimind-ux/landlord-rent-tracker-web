import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../api";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(Number(data.unread_count || 0));
    } catch {
      // A 401 is handled by the Axios interceptor; other failures can wait
      // for the next poll interval.
    }
  }, []);

  const loadLatest = useCallback(async () => {
    setLoadingLatest(true);
    try {
      const { data } = await api.get("/notifications", {
        params: { limit: 6 },
      });
      setLatest(data);
    } finally {
      setLoadingLatest(false);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 60000);
    return () => window.clearInterval(interval);
  }, [refreshUnreadCount]);

  const markRead = useCallback(
    async (id) => {
      await api.post(`/notifications/${id}/read`);
      setLatest((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
      refreshUnreadCount();
    },
    [refreshUnreadCount]
  );

  const markAllRead = useCallback(async () => {
    await api.post("/notifications/read-all");
    setLatest((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        latest,
        loadingLatest,
        refreshUnreadCount,
        loadLatest,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }
  return context;
}
