"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useNotifications } from "@/lib/use-notifications";
import { timeAgo } from "@/lib/time";
import type { NotificationItem, NotificationType } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, Inbox } from "lucide-react";

function typeIcon(type: NotificationType) {
  switch (type) {
    case "SUCCESS":
      return { Icon: CheckCircle2, className: "text-emerald-500" };
    case "WARNING":
      return { Icon: AlertTriangle, className: "text-amber-500" };
    default:
      return { Icon: Info, className: "text-blue-500" };
  }
}

function NotificationRow({
  notification,
  onOpen,
}: {
  notification: NotificationItem;
  onOpen: (n: NotificationItem) => void;
}) {
  const { Icon, className } = typeIcon(notification.type);

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
        !notification.read && "bg-slate-50 dark:bg-slate-800/50",
      )}
    >
      <div className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 dark:bg-slate-800", className)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{notification.title}</p>
          <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(notification.createdAt)}</span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {notification.message}
        </p>
      </div>
      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
    </button>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const latest = notifications.slice(0, 8);

  function handleOpen(n: NotificationItem) {
    if (!n.read) void markRead(n.id);
    if (n.link) {
      router.push(n.link as Route);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-[11px] text-slate-500">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => void markAllRead()}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="-mx-0 my-0" />
        <div className="max-h-96 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="space-y-2 px-2 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : latest.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <Inbox className="h-6 w-6 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">No notifications yet</p>
              <p className="mt-0.5 text-xs text-slate-400">Updates about your gigs will appear here.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {latest.map((n) => (
                <NotificationRow key={n.id} notification={n} onOpen={handleOpen} />
              ))}
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="-mx-0 my-0" />
        <div className="p-2">
          <Link
            href="/notifications"
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
