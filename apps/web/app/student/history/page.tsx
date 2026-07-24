"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/dashboard/shell";
import { listGigs } from "@/lib/api";
import type { GigResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { History, MapPin, Clock, DollarSign, Calendar, Inbox } from "lucide-react";
import Link from "next/link";


const toneMap: Record<string, string> = {
  Assigned: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Open: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Completed: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
};

export default function StudentHistory() {
  const [gigs, setGigs] = useState<GigResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    listGigs()
      .then(setGigs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? gigs : gigs.filter((g) => g.status.toLowerCase() === tab);

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
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="rounded-xl">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No gigs yet"
              description="Your assigned gigs will show up here."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-slate-200/80 bg-slate-50/60 px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 md:grid dark:border-slate-800 dark:bg-slate-950/40">
                <span>Gig</span><span>Location</span><span>Duration</span><span>Rate</span><span>Date</span><span>Status</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((gig, i) => (
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
                    <div className="hidden items-center gap-1.5 text-sm text-slate-600 md:flex dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {gig.gig.location}
                    </div>
                    <div className="hidden text-sm md:block">{gig.gig.durationHours}h</div>
                    <div className="hidden text-sm md:block">${gig.gig.hourlyRate}/hr</div>
                    <div className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(gig.createdAt).toLocaleDateString()}
                    </div>
                    <div className="hidden md:block">
                      <Badge variant="secondary" className={toneMap[gig.status] ?? toneMap.Open}>{gig.status}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/80 px-6 py-3 text-xs text-slate-500 dark:border-slate-800">
                <span>Showing {filtered.length} of {gigs.length}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7">Previous</Button>
                  <Button variant="outline" size="sm" className="h-7">Next</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
