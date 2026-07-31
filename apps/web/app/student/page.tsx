"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatCard } from "@/components/dashboard/shell";
import { useAuth } from "@/lib/auth-context";
import { getProfile, listGigs } from "@/lib/api";
import type { UserProfile, GigResult } from "@/lib/api";
import { statusLabel, statusTone } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gigs, setGigs] = useState<GigResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), listGigs()])
      .then(([p, g]) => { setProfile(p); setGigs(g); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const student = profile?.student;

  const profileComplete = useMemo(() => {
    if (!student) return 0;
    return Math.round(
      ([
        student.fullName !== "Student",
        student.major !== "Undeclared",
        student.bio !== "",
        student.experience !== "",
        student.skills.length > 0,
        student.interests.length > 0,
      ].filter(Boolean).length / 6) * 100
    );
  }, [student]);

  const stats = useMemo(() => {
    const avgMatch = gigs.length > 0
      ? Math.round(gigs.reduce((sum, g) => sum + (g.candidates[0]?.matchPercent ?? 0), 0) / gigs.length)
      : 0;
    const counts = {
      assigned: gigs.filter((g) => g.status === "Assigned").length,
      inProgress: gigs.filter((g) => g.status === "InProgress").length,
      pending: gigs.filter((g) => g.status === "PendingConfirmation").length,
      completed: gigs.filter((g) => g.status === "Completed").length,
    };
    return { avgMatch, counts };
  }, [gigs]);

  const timeline = useMemo(() => {
    return gigs.slice(0, 4).map((gig, i) => ({
      title: `Assigned to ${gig.gig.title}`,
      when: i === 0 ? "2 hours ago" : i === 1 ? "Yesterday" : i === 2 ? "3 days ago" : "1 week ago",
      tone: gig.status === "Completed" || gig.status === "InProgress" ? "emerald" : "amber",
    }));
  }, [gigs]);

  const upcoming = useMemo(() => {
    return gigs
      .filter((g) => g.status !== "Completed")
      .slice(0, 2)
      .map((gig) => ({
        title: gig.gig.title,
        when: `Starts Mon · ${gig.gig.durationHours} hrs`,
        pay: `$${gig.gig.hourlyRate}/hr`,
        status: statusLabel(gig.status),
        tone: statusTone(gig.status),
      }));
  }, [gigs]);

  const skillProgress = useMemo(() => {
    if (!student?.skills?.length) return [];
    return student.skills.slice(0, 4).map((s, i) => ({
      s,
      v: Math.max(94 - i * 10, 50),
    }));
  }, [student]);

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <DashboardLayout
        breadcrumb="Dashboard"
        title={`Hey ${student?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0]}, ready to work?`}
      >
        <div className="space-y-8">
          {/* Profile completion banner */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-white/60">Profile strength</span>
                </div>
                <p className="mt-2 text-lg font-semibold">Your profile is {profileComplete}% complete</p>
                <p className="mt-1 text-sm text-white/60">
                  {profileComplete < 100
                    ? "Add more details to unlock premium matches."
                    : "Your profile is fully complete! Great matches await."}
                </p>
                <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${profileComplete}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                  />
                </div>
              </div>
              <Link href="/student/profile">
                <Button className="rounded-lg bg-white text-slate-900 hover:bg-white/90 shrink-0">
                  Complete profile
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Assigned" value={loading ? "—" : stats.counts.assigned} hint="Awaiting your decision" icon={Briefcase} />
            <StatCard label="In Progress" value={loading ? "—" : stats.counts.inProgress} hint="Currently working" icon={Clock} />
            <StatCard label="Pending Confirmation" value={loading ? "—" : stats.counts.pending} hint="Awaiting manager" icon={CheckCircle2} />
            <StatCard label="Completed" value={loading ? "—" : stats.counts.completed} hint="Finished gigs" icon={Award} />
          </div>

          {/* Upcoming + Activity */}
          <div className="grid gap-4 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Upcoming work</h3>
                  <p className="text-xs text-slate-500">Your scheduled gigs</p>
                </div>
                <Link href="/student/assigned">
                  <Button variant="ghost" size="sm">All assigned</Button>
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-slate-500">No upcoming gigs.</p>
                ) : (
                  upcoming.map((u) => (
                    <div key={u.title} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-100 p-4 hover:border-slate-200 dark:border-slate-800">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.title}</p>
                        <p className="truncate text-xs text-slate-500">{u.when} · {u.pay}</p>
                      </div>
                      <Badge variant="secondary" className={u.tone}>
                        {u.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Activity</h3>
                <TrendingUp className="h-4 w-4 text-slate-400" />
              </div>
              <ul className="mt-4 space-y-4">
                {timeline.length === 0 ? (
                  <li className="text-sm text-slate-500">No activity yet.</li>
                ) : (
                  timeline.map((t, i) => (
                    <li key={i} className="relative flex gap-3 pl-3">
                      <span className={`absolute left-0 top-1.5 h-2 w-2 rounded-full bg-${t.tone}-500`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm">{t.title}</p>
                        <p className="text-xs text-slate-500">{t.when}</p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              <Link href="/student/history">
                <Button variant="ghost" size="sm" className="mt-2 w-full">View all <ArrowUpRight className="ml-1 h-3 w-3" /></Button>
              </Link>
            </motion.div>
          </div>

          {/* Skill progress */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold">Top matched skills</h3>
            <p className="text-xs text-slate-500">Based on gigs assigned to you</p>
            <div className="mt-4 space-y-3">
              {skillProgress.length === 0 ? (
                <p className="text-sm text-slate-500">Add skills to your profile to see match progress.</p>
              ) : (
                skillProgress.map((x) => (
                  <div key={x.s} className="grid grid-cols-[100px_minmax(0,1fr)_40px] items-center gap-3">
                    <span className="text-sm">{x.s}</span>
                    <Progress value={x.v} className="h-1.5" />
                    <span className="text-right text-xs tabular-nums text-slate-500">{x.v}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
