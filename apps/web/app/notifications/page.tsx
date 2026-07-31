"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/lib/use-notifications";
import { timeAgo, formatDate } from "@/lib/time";
import type { NotificationItem, NotificationType } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  CheckCheck,
  Trash2,
  ArrowRight,
  Inbox,
} from "lucide-react";

function typeMeta(type: NotificationType) {
  switch (type) {
    case "SUCCESS":
      return { Icon: CheckCircle2, className: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60" };
    case "WARNING":
      return { Icon: AlertTriangle, className: "text-amber-500 bg-amber-50 dark:bg-amber-950/60" };
    default:
      return { Icon: Info, className: "text-blue-500 bg-blue-50 dark:bg-blue-950/60" };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markRead, markAllRead, remove } = useNotifications();

  async function handleOpen(n: NotificationItem) {
    if (!n.read) await markRead(n.id);
    if (n.link) router.push(n.link as Route);
  }

  async function handleDelete(n: NotificationItem) {
    await remove(n.id);
    toast.success("Notification deleted");
  }

  return (
    <ProtectedRoute>
      <DashboardLayout
        breadcrumb="Notifications"
        title="Notifications"
        {...(unreadCount > 0
          ? {
              actions: (
                <Button
                  variant="outline"
                  className="gap-1.5 rounded-lg"
                  onClick={() => void markAllRead()}
                >
                  <CheckCheck className="h-4 w-4" /> Mark all as read
                </Button>
              ),
            }
          : {})}
      >
        <div className="mx-auto max-w-3xl space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No notifications"
              description="Updates about assignments, completions, and other gig activity will show up here."
            />
          ) : (
            notifications.map((n, i) => {
              const { Icon, className } = typeMeta(n.type);
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 transition-colors",
                    n.read
                      ? "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
                      : "border-blue-200/80 bg-blue-50/50 dark:border-blue-900/60 dark:bg-blue-950/30",
                  )}
                >
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", className)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px]",
                          n.read
                            ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                        )}
                      >
                        {n.read ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{n.message}</p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {timeAgo(n.createdAt)} · {formatDate(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {n.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => void handleOpen(n)}
                      >
                        Open <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete notification"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      onClick={() => void handleDelete(n)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
