"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getGig, assignGig, confirmCompletion } from "@/lib/api";
import { statusLabel, statusTone } from "@/lib/status";
import { toast } from "sonner";
import type { GigResult, CandidateScore } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Star, MapPin, Clock, CheckCircle2, ChevronDown } from "lucide-react";

const CANDIDATE_TONES = [
  "from-amber-400 to-amber-500",
  "from-indigo-400 to-indigo-500",
  "from-emerald-400 to-emerald-500",
  "from-rose-400 to-rose-500",
  "from-violet-400 to-violet-500",
];

function MatchRing({ value }: { value: number }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="rgba(255,255,255,0.1)" fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none"
          stroke="url(#ringGrad)" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (value / 100) * c }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/50">match</p>
        </div>
      </div>
    </div>
  );
}

export default function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gig, setGig] = useState<GigResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmAssign, setConfirmAssign] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    getGig(params.id as string)
      .then(setGig)
      .catch(() => router.replace("/manager/gigs"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const topCandidate = useMemo(() => gig?.candidates[0], [gig]);
  const restCandidates = useMemo(() => gig?.candidates.slice(1) ?? [], [gig]);
  const canAssign = gig?.status === "Open";

  function handleAssignClick(studentId: string) {
    setConfirmAssign(studentId);
  }

  async function confirmAssignGig() {
    if (!gig || !confirmAssign) return;
    const studentId = confirmAssign;
    setConfirmAssign(null);
    setAssigning(studentId);
    try {
      const updated = await assignGig(gig.id, studentId);
      setGig(updated);
        toast.success("Gig assigned successfully!");
      } catch {
        toast.error("Failed to assign gig.");
    } finally {
      setAssigning(null);
    }
  }

  async function handleConfirmCompletion() {
    if (!gig) return;
    setConfirming(true);
    try {
      const updated = await confirmCompletion(gig.id);
      setGig(updated);
      toast.success("Completion confirmed — gig is complete.");
    } catch {
      toast.error("Failed to confirm completion.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["MANAGER"]}>
      <DashboardLayout
        breadcrumb="Leaderboard"
        title={gig?.gig.title ?? "Leaderboard"}
        actions={
          <>
            <Select defaultValue="score">
              <SelectTrigger className="w-40 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Sort: Match score</SelectItem>
                <SelectItem value="avail">Sort: Availability</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      >
        <ConfirmDialog
          open={confirmAssign !== null}
          title="Assign Gig"
          message="Are you sure you want to assign this gig to this student?"
          onConfirm={confirmAssignGig}
          onCancel={() => setConfirmAssign(null)}
        />

        {loading ? (
          <div className="space-y-8">
            <div className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        ) : !gig ? null : (
          <div className="space-y-8">
            {/* Gig status bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className={statusTone(gig.status)}>{statusLabel(gig.status)}</Badge>
                {gig.assignedStudentId && (
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Assigned to{" "}
                    <span className="font-medium">
                      {gig.candidates.find((c) => c.student.id === gig.assignedStudentId)?.student.name ?? "—"}
                    </span>
                  </span>
                )}
                {gig.status === "Completed" && gig.completedAt && (
                  <span className="text-sm text-slate-500">
                    Completed on {new Date(gig.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {gig.status === "PendingConfirmation" && (
                <Button
                  className="rounded-lg bg-amber-600 hover:bg-amber-700 gap-1.5"
                  disabled={confirming}
                  onClick={handleConfirmCompletion}
                >
                  <CheckCircle2 className="h-4 w-4" /> {confirming ? "Confirming..." : "Confirm Completion"}
                </Button>
              )}
            </div>

            {/* Top match spotlight */}
            {topCandidate && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white shadow-xl"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,164,65,0.25),transparent_50%)]" />
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="relative grid gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                  <div className="relative">
                    <MatchRing value={topCandidate.matchPercent} />
                    <div className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-slate-950 bg-amber-500 text-white shadow-lg">
                      <Trophy className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/20">
                        <Sparkles className="mr-1 h-3 w-3" /> Best match
                      </Badge>
                      <span className="text-xs text-white/50">Ranked #1 of {gig.candidates.length}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight">{topCandidate.student.name}</h2>
                    <p className="text-sm text-white/60">{topCandidate.student.major}</p>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
                      {topCandidate.justification}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {topCandidate.student.skills.map((s) => (
                        <span key={s} className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {canAssign ? (
                      <Button
                        className="rounded-lg bg-white text-slate-900 hover:bg-white/90"
                        onClick={() => handleAssignClick(topCandidate.student.id)}
                        disabled={assigning === topCandidate.student.id}
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" /> {assigning === topCandidate.student.id ? "Assigning..." : "Assign"}
                      </Button>
                    ) : gig.assignedStudentId === topCandidate.student.id ? (
                      <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Assigned
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Runner-ups */}
            {restCandidates.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {restCandidates.map((candidate, i) => {
                  const rank = i + 2;
                  const tone = CANDIDATE_TONES[rank % CANDIDATE_TONES.length];
                  return (
                    <motion.article
                      key={candidate.student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative">
                            <Avatar name={candidate.student.name} size="default" />
                            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-slate-900 text-[9px] font-semibold text-white dark:border-slate-900 dark:bg-white dark:text-slate-900">
                              #{rank}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{candidate.student.name}</p>
                            <p className="truncate text-xs text-slate-500">{candidate.student.major}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold tabular-nums">{candidate.matchPercent}<span className="text-sm text-slate-400">%</span></p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">match</p>
                        </div>
                      </div>

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.matchPercent}%` }}
                          transition={{ delay: 0.2 + i * 0.1, duration: 0.9, ease: "easeOut" }}
                          className="h-full rounded-full bg-slate-900 dark:bg-white"
                        />
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{candidate.justification}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {candidate.student.skills.map((s) => (
                          <span key={s} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{s}</span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                        {gig.assignedStudentId === candidate.student.id && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Assigned
                          </span>
                        )}
                        <div className="flex gap-2 ml-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleAssignClick(candidate.student.id)}
                            disabled={!canAssign || assigning === candidate.student.id}
                          >
                            Details <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                          {canAssign && (
                            <Button
                              size="sm"
                              className="rounded-lg bg-slate-900 hover:bg-slate-800"
                              onClick={() => handleAssignClick(candidate.student.id)}
                              disabled={assigning === candidate.student.id}
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
