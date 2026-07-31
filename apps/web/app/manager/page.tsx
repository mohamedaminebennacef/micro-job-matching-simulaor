"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatCard } from "@/components/dashboard/shell";
import { useAuth } from "@/lib/auth-context";
import { listGigs } from "@/lib/api";
import type { GigResult } from "@/lib/api";
import { statusLabel, statusTone } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Users,
  ArrowUpRight,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<GigResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGigs()
      .then(setGigs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = gigs.length;
  const counts = {
    open: gigs.filter((g) => g.status === "Open").length,
    assigned: gigs.filter((g) => g.status === "Assigned").length,
    inProgress: gigs.filter((g) => g.status === "InProgress").length,
    pending: gigs.filter((g) => g.status === "PendingConfirmation").length,
    completed: gigs.filter((g) => g.status === "Completed").length,
  };
  const avgMatch =
    gigs.length > 0
      ? Math.round(
          gigs.reduce((sum, g) => sum + (g.candidates[0]?.matchPercent ?? 0), 0) / gigs.length
        )
      : 0;
  const recent = gigs.slice(0, 4);

  return (
    <ProtectedRoute allowedRoles={["MANAGER"]}>
      <DashboardLayout
        breadcrumb="Dashboard"
        title="Dashboard"
      >
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Open" value={loading ? "—" : counts.open} hint="Awaiting assignment" icon={Briefcase} />
            <StatCard label="Assigned" value={loading ? "—" : counts.assigned} hint="Awaiting student" icon={Clock} />
            <StatCard label="In Progress" value={loading ? "—" : counts.inProgress} hint="Being worked on" icon={CheckCircle2} />
            <StatCard label="Pending Confirmation" value={loading ? "—" : counts.pending} hint="Needs your review" icon={Users} />
            <StatCard label="Completed" value={loading ? "—" : counts.completed} hint="Finished gigs" icon={TrendingUp} />
          </div>

          {/* Chart + activity */}
          <div className="grid gap-4 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Match quality over time</h3>
                  <p className="text-xs text-slate-500">Average AI match score, last 30 days</p>
                </div>
                <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" /> {avgMatch}% avg</Badge>
              </div>
              <div className="relative mt-6 h-48">
                <svg viewBox="0 0 400 160" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(15 23 42)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="rgb(15 23 42)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,110 C40,90 80,100 120,70 C160,45 200,80 240,55 C280,30 320,50 360,25 L400,20 L400,160 L0,160 Z" fill="url(#chartGrad)" />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    d="M0,110 C40,90 80,100 120,70 C160,45 200,80 240,55 C280,30 320,50 360,25 L400,20"
                    fill="none"
                    stroke="rgb(15 23 42)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-slate-400">
                  <span>Wk 1</span><span>Wk 2</span><span>Wk 3</span><span>Wk 4</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Quick actions</h3>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Post a new gig", href: "/manager/gigs/create" as Route },
                  { label: "Review pending matches", href: "/manager/gigs" as Route },
                  { label: "View profile", href: "/manager/profile" as Route },
                  { label: "View history", href: "/manager/gigs" as Route },
                ].map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    {a.label} <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent gigs table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold">Recent gigs</h3>
                <p className="text-xs text-slate-500">Latest activity across your workspace</p>
              </div>
              <Link href="/manager/gigs">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="px-6 py-8 text-center text-sm text-slate-500">Loading...</div>
              ) : recent.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-500">
                  No gigs yet. Create your first gig to get started.
                </div>
              ) : (
                recent.map((gig, i) => {
                  const topMatch = gig.candidates[0];
                  const statusToneClass = statusTone(gig.status);
                  return (
                    <motion.div
                      key={gig.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={gig.gig.title} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{gig.gig.title}</p>
                          <p className="truncate text-xs text-slate-500">
                            {topMatch ? `${topMatch.student.name} · ${topMatch.matchPercent}%` : "No candidates"}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Badge variant="secondary" className={statusToneClass}>{statusLabel(gig.status)}</Badge>
                        <Link href={`/manager/gigs/${gig.id}` as Route}>
                          <Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal className="h-4 w-4" /></Button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
