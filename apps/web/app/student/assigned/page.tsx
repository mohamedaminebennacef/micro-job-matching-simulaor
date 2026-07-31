"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/dashboard/shell";
import { acceptAssignment, completeAssignment, declineAssignment, listGigs } from "@/lib/api";
import type { GigResult } from "@/lib/api";
import { statusLabel, statusTone } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Calendar, Briefcase, CheckCircle2, XCircle, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Item({ icon: Icon, label, value, className }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; className?: string }) {
  return (
    <div className={cn("min-w-0 py-3", className)}>
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

export default function AssignedGigs() {
  const [gigs, setGigs] = useState<GigResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openGig, setOpenGig] = useState<GigResult | null>(null);

  useEffect(() => {
    listGigs()
      .then((result) => setGigs(result.filter((g) => g.status !== "Completed" && g.status !== "Open")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function applyGig(updated: GigResult) {
    setGigs((cur) =>
      updated.status === "Open"
        ? cur.filter((g) => g.id !== updated.id)
        : cur.map((g) => (g.id === updated.id ? updated : g)),
    );
    setOpenGig((cur) => (cur && cur.id === updated.id ? updated : cur));
  }

  async function runAction(g: GigResult, action: "accept" | "decline" | "complete") {
    setPendingId(g.id);
    try {
      const updated =
        action === "accept"
          ? await acceptAssignment(g.id)
          : action === "decline"
            ? await declineAssignment(g.id)
            : await completeAssignment(g.id);
      applyGig(updated);
      toast.success(
        action === "accept"
          ? "Gig accepted — now in progress"
          : action === "decline"
            ? "Gig declined"
            : "Marked for completion",
      );
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <DashboardLayout breadcrumb="Assigned Gigs" title="Assigned gigs">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No gigs yet"
            description="When a manager assigns you a gig, it will show up here for you to accept."
            action={
              <Link href="/student/profile">
                <Button>Complete profile</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {gigs.map((g, i) => (
              <motion.article
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{g.gig.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Avatar name={g.gig.title} size="sm" className="h-3.5 w-3.5" />
                      <span className="truncate">{g.gig.location}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={statusTone(g.status)}>
                    {statusLabel(g.status)}
                  </Badge>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {g.gig.description}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Item icon={MapPin} label="Location" value={g.gig.location} className="py-2" />
                  <Item icon={Clock} label="Hours" value={`${g.gig.durationHours}h`} className="py-2" />
                  <Item icon={Calendar} label="Rate" value={`$${g.gig.hourlyRate}/hr`} className="py-2" />
                  <Item icon={DollarSign} label="Total" value={`$${g.gig.durationHours * g.gig.hourlyRate}`} className="py-2" />
                </dl>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider">Manager</span> · {g.manager.name}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider">Assigned</span> · {new Date(g.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {g.status === "Assigned" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400"
                        disabled={pendingId === g.id}
                        onClick={() => runAction(g, "decline")}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-lg bg-slate-900 hover:bg-slate-800 gap-1.5"
                        disabled={pendingId === g.id}
                        onClick={() => runAction(g, "accept")}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                      </Button>
                    </>
                  )}
                  {g.status === "InProgress" && (
                    <Button
                      size="sm"
                      className="rounded-lg bg-slate-900 hover:bg-slate-800 gap-1.5"
                      disabled={pendingId === g.id}
                      onClick={() => runAction(g, "complete")}
                    >
                      <Flag className="h-3.5 w-3.5" /> Mark as Completed
                    </Button>
                  )}
                  {g.status === "PendingConfirmation" && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">Awaiting manager confirmation</span>
                  )}
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setOpenGig(g)}>Details</Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <Dialog open={openGig !== null} onOpenChange={(o) => !o && setOpenGig(null)}>
          <DialogContent className="sm:max-w-xl">
            {openGig && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={statusTone(openGig.status)}>{statusLabel(openGig.status)}</Badge>
                    <span className="text-xs text-slate-500">Assigned {new Date(openGig.createdAt).toLocaleDateString()}</span>
                  </div>
                  <DialogTitle className="mt-2 text-left text-lg">{openGig.gig.title}</DialogTitle>
                  <DialogDescription className="text-left">
                    {openGig.gig.location} · Posted by {openGig.manager.name}
                  </DialogDescription>
                </DialogHeader>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{openGig.gig.description}</p>

                <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1 rounded-xl border border-slate-100 p-4 text-sm dark:border-slate-800">
                  <Item icon={MapPin} label="Location" value={openGig.gig.location} className="py-2" />
                  <Item icon={Clock} label="Hours" value={`${openGig.gig.durationHours}h`} className="py-2" />
                  <Item icon={Calendar} label="Rate" value={`$${openGig.gig.hourlyRate}/hr`} className="py-2" />
                  <Item icon={DollarSign} label="Total" value={`$${openGig.gig.durationHours * openGig.gig.hourlyRate}`} className="py-2" />
                </dl>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {openGig.gig.skills && openGig.gig.skills.length > 0 ? openGig.gig.skills.map((s) => (
                      <span key={s} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{s}</span>
                    )) : (
                      <p className="text-sm text-slate-400 italic">No skills listed</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-sm pt-2">
                  <p className="text-slate-500">
                    <span className="text-[11px] uppercase tracking-wider">Schedule</span>
                    {openGig.gig.schedule ? (
                      <> · {openGig.gig.schedule}</>
                    ) : (
                      <span className="ml-1 text-slate-400 italic">Not specified</span>
                    )}
                  </p>
                  <p className="text-slate-500">
                    <span className="text-[11px] uppercase tracking-wider">Contact</span>
                    {openGig.gig.contact ? (
                      <> · {openGig.gig.contact}</>
                    ) : (
                      <span className="ml-1 text-slate-400 italic">Not specified</span>
                    )}
                  </p>
                </div>

                <DialogFooter>
                  <Button variant="outline" className="rounded-lg" onClick={() => setOpenGig(null)}>Close</Button>
                  {openGig.status === "Assigned" && (
                    <>
                      <Button
                        variant="outline"
                        className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 gap-1.5"
                        disabled={pendingId === openGig.id}
                        onClick={() => runAction(openGig, "decline")}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </Button>
                      <Button
                        className="rounded-lg bg-slate-900 hover:bg-slate-800 gap-1.5"
                        disabled={pendingId === openGig.id}
                        onClick={() => runAction(openGig, "accept")}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                      </Button>
                    </>
                  )}
                  {openGig.status === "InProgress" && (
                    <Button
                      className="rounded-lg bg-slate-900 hover:bg-slate-800 gap-1.5"
                      disabled={pendingId === openGig.id}
                      onClick={() => runAction(openGig, "complete")}
                    >
                      <Flag className="h-3.5 w-3.5" /> Mark as Completed
                    </Button>
                  )}
                  {openGig.status === "PendingConfirmation" && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">Awaiting manager confirmation</span>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
