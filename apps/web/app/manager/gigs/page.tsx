"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/dashboard/shell";
import { confirmCompletion, listGigs } from "@/lib/api";
import type { GigResult } from "@/lib/api";
import { statusLabel, statusTone } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Filter, Plus, MoreHorizontal, Briefcase, Inbox, CheckCheck } from "lucide-react";

function gigHref(id: string) {
  return `/manager/gigs/${id}` as const;
}

function assignedStudentName(gig: GigResult): string | null {
  if (!gig.assignedStudentId) return null;
  return gig.candidates.find((c) => c.student.id === gig.assignedStudentId)?.student.name ?? null;
}

export default function GigHistory() {
  const [gigs, setGigs] = useState<GigResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    listGigs()
      .then(setGigs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleConfirm(gig: GigResult) {
    setConfirmingId(gig.id);
    try {
      const updated = await confirmCompletion(gig.id);
      setGigs((cur) => cur.map((g) => (g.id === updated.id ? updated : g)));
      toast.success("Completion confirmed");
    } catch {
      toast.error("Failed to confirm completion.");
    } finally {
      setConfirmingId(null);
    }
  }

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
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="inprogress">In Progress</TabsTrigger>
                <TabsTrigger value="pendingcompletion">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
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
                <span>Gig</span><span>Location</span><span>Student</span><span>Status</span><span>Match</span><span></span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((gig, i) => {
                  const topMatch = gig.candidates[0];
                  const studentName = assignedStudentName(gig);
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
                          <p className="truncate text-xs text-slate-500 md:hidden">
                            {gig.gig.location} · {gig.gig.durationHours}h · ${gig.gig.hourlyRate}/hr
                          </p>
                          <p className="hidden text-xs text-slate-500 md:hidden">
                            {gig.status === "Completed" && gig.completedAt
                              ? `Completed ${new Date(gig.completedAt).toLocaleDateString()}`
                              : ""}
                          </p>
                        </div>
                      </Link>
                      <div className="hidden text-sm text-slate-600 md:block dark:text-slate-400">{gig.gig.location}</div>
                      <div className="hidden text-sm md:block">
                        {studentName ?? <span className="text-slate-400">—</span>}
                      </div>
                      <div className="hidden md:block">
                        <Badge variant="secondary" className={statusTone(gig.status)}>{statusLabel(gig.status)}</Badge>
                      </div>
                      <div className="hidden text-xs text-slate-500 md:block">
                        {topMatch ? `${topMatch.matchPercent}%` : "—"}
                      </div>
                      <div className="flex items-center gap-3">
                        {gig.status === "PendingConfirmation" && (
                          <Button
                            size="sm"
                            className="rounded-lg bg-amber-600 hover:bg-amber-700 gap-1.5"
                            disabled={confirmingId === gig.id}
                            onClick={() => handleConfirm(gig)}
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            {confirmingId === gig.id ? "Confirming..." : "Confirm Completion"}
                          </Button>
                        )}
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
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
