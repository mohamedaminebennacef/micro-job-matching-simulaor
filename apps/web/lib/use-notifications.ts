"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteNotification,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "./api";
import { useAuth } from "./auth-context";

export function useNotifications() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const [items, count] = await Promise.all([
        listNotifications(),
        getUnreadNotificationCount(),
      ]);
      if (!mounted.current) return;
      setNotifications(items);
      setUnreadCount(count.count);
    } catch {
      // keep previous state
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (user && !authLoading) {
      void refresh();
    } else {
      setLoading(false);
    }
    return () => {
      mounted.current = false;
    };
  }, [user, authLoading, refresh]);

  const markRead = useCallback(async (id: string) => {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((cur) => cur.map((n) => (n.id === id ? updated : n)));
      setUnreadCount((cur) => Math.max(0, cur - 1));
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id);
        setNotifications((cur) => cur.filter((n) => n.id !== id));
        const target = notifications.find((n) => n.id === id);
        if (target && !target.read) {
          setUnreadCount((cur) => Math.max(0, cur - 1));
        }
      } catch {
        // ignore
      }
    },
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
    remove,
  };
}
