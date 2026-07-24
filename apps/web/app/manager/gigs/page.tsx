"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/dashboard/shell";
import { listGigs } from "@/lib/api";
import type { GigResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Search, Filter, Plus, MoreHorizontal, Briefcase, Inbox } from "lucide-react";

function gigHref(id: string) {
  return `/manager/gigs/${id}` as const;
}

const toneMap: Record<string, string> = {
  Assigned: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Open: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Matching: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Completed: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
};

export default function GigHistory() {
  const [gigs, setGigs] = useState<GigResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    listGigs()
      .then(setGigs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = gigs;
    if (tab !== "all") {
      result = result.filter((g) => g.status.toLowerCase() === tab);
    }
    if (q) {
      const query = q.toLowerCase();
      result = result.filter(
        (g) =>
          g.gig.title.toLowerCase().includes(query) ||
          g.gig.location.toLowerCase().includes(query)
      );
    }
    return result;
  }, [gigs, tab, q]);

  return (
    <ProtectedRoute allowedRoles={["MANAGER"]}>
      <DashboardLayout
        breadcrumb="Gig History"
        title="Gig History"
        actions={
          <Link href="/manager/gigs/create">
            <Button className="rounded-lg bg-slate-900 hover:bg-slate-800">
              <Plus className="mr-1.5 h-4 w-4" /> New gig
            </Button>
          </Link>
        }
      >
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="rounded-xl">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Matching</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search gigs…"
                  className="h-9 w-56 rounded-lg pl-9"
                />
              </div>
              <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No gigs match"
              description="Try adjusting your filters or clear your search."
              action={<Button variant="outline" onClick={() => { setQ(""); setTab("all"); }}>Reset</Button>}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-slate-200/80 bg-slate-50/60 px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 md:grid dark:border-slate-800 dark:bg-slate-950/40">
                <span>Gig</span><span>Location</span><span>Duration</span><span>Rate</span><span>Status</span><span>Match</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((gig, i) => {
                  const topMatch = gig.candidates[0];
                  return (
                    <motion.div
                      key={gig.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 md:px-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <Link href={gigHref(gig.id)} className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <Briefcase className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{gig.gig.title}</p>
                          <p className="truncate text-xs text-slate-500 md:hidden">{gig.gig.location} · ${gig.gig.hourlyRate}/hr</p>
                        </div>
                      </Link>
                      <div className="hidden text-sm text-slate-600 md:block dark:text-slate-400">{gig.gig.location}</div>
                      <div className="hidden text-sm md:block">{gig.gig.durationHours}h</div>
                      <div className="hidden text-sm md:block">${gig.gig.hourlyRate}/hr</div>
                      <div className="hidden md:block">
                        <Badge variant="secondary" className={toneMap[gig.status] ?? toneMap.Open}>{gig.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-slate-500 md:block">
                          {topMatch ? `${topMatch.matchPercent}%` : "—"}
                        </span>
                        <Link href={gigHref(gig.id)}>
                          <Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal className="h-4 w-4" /></Button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
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
