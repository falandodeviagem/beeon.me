import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export function useNotifications() {
  const utils = trpc.useUtils();
  const [pollingInterval, setPollingInterval] = useState(30000); // 30 seconds

  // Fetch unread count with polling
  const { data: unreadCount = 0 } = trpc.notification.unreadCount.useQuery(
    undefined,
    {
      refetchInterval: pollingInterval,
      refetchOnWindowFocus: true,
    }
  );

  // Fetch notifications list
  const { data: notifications = [], isLoading } = trpc.notification.list.useQuery(
    { limit: 20 },
    {
      refetchInterval: pollingInterval,
      refetchOnWindowFocus: true,
    }
  );

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.unreadCount.invalidate();
      utils.notification.list.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.unreadCount.invalidate();
      utils.notification.list.invalidate();
    },
  });

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  };

  // Show browser notification
  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
        tag: "beeonme-notification",
        requireInteraction: false,
      });
    }
  };

  // Monitor for new notifications and show browser notification
  useEffect(() => {
    let previousCount = unreadCount;

    return () => {
      if (unreadCount > previousCount && unreadCount > 0) {
        const newNotifications = notifications.filter((n) => !n.isRead).slice(0, unreadCount - previousCount);
        
        if (newNotifications.length > 0 && document.hidden) {
          // Only show browser notification if tab is not focused
          const latest = newNotifications[0];
          showBrowserNotification(latest.title, latest.message);
        }
      }
      previousCount = unreadCount;
    };
  }, [unreadCount, notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
    showBrowserNotification,
  };
}
