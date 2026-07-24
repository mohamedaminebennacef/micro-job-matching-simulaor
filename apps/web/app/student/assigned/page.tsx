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
import { MapPin, Clock, DollarSign, User, Calendar, Briefcase } from "lucide-react";

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
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No gigs yet"
            description="Complete your profile to start getting matched to campus gigs."
            action={<Button>Complete profile</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {gigs.map((g, i) => (
              <motion.article
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{g.gig.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Avatar name={g.gig.title} size="sm" className="h-4 w-4" />
                      <span className="truncate">{g.gig.location}</span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={g.status === "Assigned" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"}
                  >
                    {g.status}
                  </Badge>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <Item icon={MapPin} label="Location" value={g.gig.location} />
                  <Item icon={Clock} label="Hours" value={`${g.gig.durationHours}h`} />
                  <Item icon={Calendar} label="Rate" value={`$${g.gig.hourlyRate}/hr`} />
                  <Item icon={DollarSign} label="Total" value={`$${g.gig.durationHours * g.gig.hourlyRate}`} />
                </dl>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    Created {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg">Details</Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
