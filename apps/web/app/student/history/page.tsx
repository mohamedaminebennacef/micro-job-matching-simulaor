"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/dashboard/shell";
import { listGigs } from "@/lib/api";
import type { GigResult } from "@/lib/api";
import { statusLabel, statusTone } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { History, MapPin, Clock, DollarSign, Calendar, Inbox } from "lucide-react";
import Link from "next/link";

export default function StudentHistory() {
  const [gigs, setGigs] = useState<GigResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGigs()
      .then((result) => setGigs(result.filter((g) => g.status === "Completed")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <DashboardLayout
        breadcrumb="History"
        title="Gig history"
        actions={
          <Link href="/student">
            <Button variant="outline" className="rounded-lg">Dashboard</Button>
          </Link>
        }
      >
        <div className="space-y-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No completed gigs yet"
              description="Gigs you finish will show up here after the manager confirms completion."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-slate-200/80 bg-slate-50/60 px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 md:grid dark:border-slate-800 dark:bg-slate-950/40">
                <span>Gig</span><span>Manager</span><span>Duration</span><span>Rate</span><span>Completed</span><span>Status</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {gigs.map((gig, i) => (
                  <motion.div
                    key={gig.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr] md:items-center md:gap-4 md:px-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{gig.gig.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 md:hidden">{gig.gig.location}</p>
                    </div>
                    <div className="hidden text-sm text-slate-600 md:block dark:text-slate-400">{gig.manager.name}</div>
                    <div className="hidden text-sm md:block">{gig.gig.durationHours}h</div>
                    <div className="hidden text-sm md:block">${gig.gig.hourlyRate}/hr</div>
                    <div className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
                      <Calendar className="h-3.5 w-3.5" />
                      {gig.completedAt ? new Date(gig.completedAt).toLocaleDateString() : "—"}
                    </div>
                    <div className="hidden md:block">
                      <Badge variant="secondary" className={statusTone(gig.status)}>{statusLabel(gig.status)}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/80 px-6 py-3 text-xs text-slate-500 dark:border-slate-800">
                <span>Showing {gigs.length} completed {gigs.length === 1 ? "gig" : "gigs"}</span>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
