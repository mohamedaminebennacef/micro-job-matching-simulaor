"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/dashboard/shell";
import { listGigs } from "@/lib/api";
import type { GigResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Calendar, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  Assigned: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Open: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

function Item({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="min-w-0">
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
  const [openGig, setOpenGig] = useState<GigResult | null>(null);

  useEffect(() => {
    listGigs()
      .then(setGigs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          description="Complete your profile to start getting matched to campus gigs."
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
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{g.gig.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Avatar name={g.gig.title} size="sm" className="h-3.5 w-3.5" />
                      <span className="truncate">{g.gig.location}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={statusStyles[g.status] ?? ""}>
                    {g.status}
                  </Badge>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Item icon={MapPin} label="Location" value={g.gig.location} />
                  <Item icon={Clock} label="Hours" value={`${g.gig.durationHours}h`} />
                  <Item icon={Calendar} label="Rate" value={`$${g.gig.hourlyRate}/hr`} />
                  <Item icon={DollarSign} label="Total" value={`$${g.gig.durationHours * g.gig.hourlyRate}`} />
                </dl>

                {g.gig.skills && g.gig.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {g.gig.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">{s}</span>
                    ))}
                    {g.gig.skills.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{g.gig.skills.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setOpenGig(g)}>Details</Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <Dialog open={openGig !== null} onOpenChange={(o) => !o && setOpenGig(null)}>
          <DialogContent className="sm:max-w-lg">
            {openGig && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={statusStyles[openGig.status] ?? ""}>{openGig.status}</Badge>
                    <span className="text-xs text-slate-500">{new Date(openGig.createdAt).toLocaleDateString()}</span>
                  </div>
                  <DialogTitle className="mt-2 text-left text-lg">{openGig.gig.title}</DialogTitle>
                  <DialogDescription className="text-left">{openGig.gig.location}</DialogDescription>
                </DialogHeader>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{openGig.gig.description}</p>

                <dl className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 p-4 text-sm dark:border-slate-800">
                  <Item icon={MapPin} label="Location" value={openGig.gig.location} />
                  <Item icon={Clock} label="Hours" value={`${openGig.gig.durationHours}h`} />
                  <Item icon={Calendar} label="Rate" value={`$${openGig.gig.hourlyRate}/hr`} />
                  <Item icon={DollarSign} label="Total" value={`$${openGig.gig.durationHours * openGig.gig.hourlyRate}`} />
                </dl>

                {openGig.gig.skills && openGig.gig.skills.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">Skills</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {openGig.gig.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="rounded-md font-normal">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  {openGig.gig.schedule && (
                    <p className="text-slate-500"><span className="text-[11px] uppercase tracking-wider">Schedule</span> · {openGig.gig.schedule}</p>
                  )}
                  {openGig.gig.contact && (
                    <p className="text-slate-500"><span className="text-[11px] uppercase tracking-wider">Contact</span> · {openGig.gig.contact}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" className="rounded-lg" onClick={() => setOpenGig(null)}>Close</Button>
                  <Button
                    className="rounded-lg bg-slate-900 hover:bg-slate-800"
                    onClick={() => {
                      toast.success("Attendance confirmed", { description: openGig.gig.title });
                      setOpenGig(null);
                    }}
                  >
                    Confirm attendance
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
