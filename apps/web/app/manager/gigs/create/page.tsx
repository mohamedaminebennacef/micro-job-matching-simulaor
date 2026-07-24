"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChipInput } from "@/components/ui/chip-input";
import { Avatar } from "@/components/ui/avatar";
import { assignGig as apiAssignGig, createGig as apiCreateGig } from "@/lib/api";
import type { GigResult, CandidateScore } from "@/lib/api";
import { Sparkles, Trophy, ChevronRight, ChevronLeft, MapPin, Clock, DollarSign, CheckCircle } from "lucide-react";

const STEPS = ["Basics", "Requirements", "Logistics", "Review"];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function scoreTone(pct: number) {
  if (pct >= 80) return { text: "text-emerald-600", bar: "bg-gradient-to-r from-emerald-400 to-emerald-600", chip: "bg-emerald-50 text-emerald-700" };
  if (pct >= 55) return { text: "text-amber-600", bar: "bg-gradient-to-r from-amber-400 to-amber-500", chip: "bg-amber-50 text-amber-700" };
  return { text: "text-rose-600", bar: "bg-gradient-to-r from-rose-400 to-rose-500", chip: "bg-rose-50 text-rose-700" };
}

const AVATAR_GRADIENTS = ["from-violet-500 to-indigo-600", "from-sky-500 to-cyan-600", "from-fuchsia-500 to-pink-600", "from-emerald-500 to-teal-600", "from-orange-500 to-amber-600"];

const LOADING_STEPS = ["Retrieving student profiles", "Analyzing skills", "Comparing gig requirements", "Ranking candidates", "Finalizing recommendations"];

function AiLoadingPanel() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % LOADING_STEPS.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-[28rem] flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="relative">
        <motion.div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg" animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/40 to-sky-500/40 blur-xl" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">AI Analysis</p>
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.3 }} className="text-sm font-medium">
              {LOADING_STEPS[step]}…
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-1.5 pt-2">
          {LOADING_STEPS.map((_, i) => (
            <motion.span key={i} className="h-1 rounded-full bg-slate-900" animate={{ width: i === step ? 24 : 6, opacity: i === step ? 1 : 0.2 }} transition={{ duration: 0.4 }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CandidateCard({ candidate, rank, isBest, isTied, isAssigned, isPending, isGigAssigned, onAssign }: {
  candidate: CandidateScore; rank: number; isBest: boolean; isTied: boolean; isAssigned: boolean; isPending: boolean; isGigAssigned: boolean; onAssign: (id: string) => void;
}) {
  const pct = candidate.matchPercent;
  const tone = scoreTone(pct);
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -2 }} className={`group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${isBest ? "ring-1 ring-slate-900/10" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold tabular-nums text-slate-400">#{String(rank + 1).padStart(2, "0")}</span>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[rank % AVATAR_GRADIENTS.length]} text-sm font-semibold text-white shadow-sm`}>{initials(candidate.student.name)}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{candidate.student.name}</p>
                {isTied && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Tied</span>}
                {isAssigned && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">✓ Assigned</span>}
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">{candidate.student.major}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className={`text-2xl font-semibold tabular-nums leading-none ${tone.text}`}>{pct}</span>
              <span className="ml-0.5 text-xs font-medium text-slate-400">%</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className={`h-full rounded-full ${tone.bar}`} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {candidate.student.skills.slice(0, 4).map((s) => (
              <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{s}</span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{candidate.justification}</p>
          {!isGigAssigned && (
            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={() => onAssign(candidate.student.id)} disabled={isPending} className={`h-8 rounded-lg px-3.5 text-xs font-medium transition-all ${isBest ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}>
                Assign gig →
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const emptyGig = { title: "", description: "", location: "", durationHours: 2, hourlyRate: 18, requiredSkills: [] as string[], preferredInterests: [] as string[] };

export default function CreateGigPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyGig);
  const [result, setResult] = useState<GigResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmAssign, setConfirmAssign] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const topCandidates = useMemo(() => result?.candidates.slice(0, 5) ?? [], [result]);
  const topScore = topCandidates[0]?.matchPercent ?? 0;
  const tiedLeaders = useMemo(() => topCandidates.filter((c) => c.matchPercent === topScore), [topCandidates, topScore]);
  const lowAlignment = topCandidates.length > 0 && topCandidates.every((c) => c.matchPercent < 30);

  const totalEst = form.durationHours * form.hourlyRate;

  function handleChange(field: keyof typeof emptyGig, value: string | number | string[]) {
    setForm((cur) => ({ ...cur, [field]: value }));
  }

  async function submitGig(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const gig = await apiCreateGig({ title: form.title, description: form.description, location: form.location, durationHours: Number(form.durationHours), hourlyRate: Number(form.hourlyRate) });
        setResult(gig);
        toast("Gig created! AI matching complete.", "success");
      } catch {
        setResult(null);
        setError("Could not save the gig. Make sure the API is running and the database is connected.");
        toast("Failed to create gig.", "error");
      }
    });
  }

  function handleAssignClick(studentId: string) { setConfirmAssign(studentId); }

  async function confirmAssignGig() {
    if (!result || !confirmAssign) return;
    const studentId = confirmAssign;
    setConfirmAssign(null);
    setError(null);
    startTransition(async () => {
      try {
        const gig = await apiAssignGig(result.id, studentId);
        setResult(gig);
        toast("Gig assigned successfully!", "success");
      } catch {
        setError("Unable to assign the gig right now. Check the API service and try again.");
        toast("Failed to assign gig.", "error");
      }
    });
  }

  function resetForm() { setResult(null); setError(null); setForm(emptyGig); setStep(0); }

  const stepComplete = [!!(form.title && form.description && form.location), form.requiredSkills.length > 0 || form.preferredInterests.length > 0, form.durationHours > 0 && form.hourlyRate > 0, step === 3];

  return (
    <ProtectedRoute allowedRoles={["MANAGER"]}>
      <DashboardLayout breadcrumb="Create Gig" title="Post a campus gig">
        <ConfirmDialog open={confirmAssign !== null} title="Assign Gig" message="Are you sure you want to assign this gig to this student?" onConfirm={confirmAssignGig} onCancel={() => setConfirmAssign(null)} />

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Wizard sidebar */}
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Steps</p>
                <ol className="mt-4 space-y-1">
                  {STEPS.map((label, i) => (
                    <li key={label}>
                      <button onClick={() => i <= step} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${i === step ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900" : stepComplete[i] ? "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800" : "text-slate-400 cursor-default"}`}>
                        <span className={`grid h-6 w-6 place-items-center rounded-lg text-[11px] font-semibold ${i === step ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900" : stepComplete[i] ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                          {stepComplete[i] && i < step ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                        </span>
                        {label}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Summary panel */}
              {(form.title || form.location) && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Summary</p>
                  {form.title && <p className="mt-2 truncate text-sm font-semibold">{form.title}</p>}
                  {form.location && <p className="mt-0.5 truncate text-xs text-slate-500">{form.location}</p>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{form.durationHours}h</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">${form.hourlyRate}/hr</span>
                  </div>
                  {totalEst > 0 && (
                    <div className="mt-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">Estimated total</p>
                      <p className="mt-1 text-2xl font-semibold">${totalEst}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </aside>

          {/* Main area */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Form panel */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {result && (
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400">Active gig</p>
                    <button type="button" onClick={resetForm} className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">← New gig</button>
                  </div>
                )}

                <h2 className="text-base font-semibold">{STEPS[step]}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {step === 0 && "Give your gig a title and describe the task."}
                  {step === 1 && "Add skills and interests to improve matching."}
                  {step === 2 && "Set the hours, rate, and location."}
                  {step === 3 && "Review everything before submitting."}
                </p>

                <form onSubmit={step === 3 ? submitGig : undefined} className="mt-6 space-y-5">
                  {step === 0 && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Title</Label>
                        <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Help move lab equipment" className="rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Location</Label>
                        <Input value={form.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="Science Hall, Room 204" className="rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Description</Label>
                        <Textarea rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Describe the task — what needs doing, any specific skills required, and what success looks like…" className="rounded-lg" />
                      </div>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Required skills</Label>
                        <ChipInput value={form.requiredSkills} onChange={(v) => handleChange("requiredSkills", v)} placeholder="Add a skill…" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Preferred interests</Label>
                        <ChipInput value={form.preferredInterests} onChange={(v) => handleChange("preferredInterests", v)} placeholder="Add an interest…" />
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Duration (hours)</Label>
                        <Input type="number" value={form.durationHours} onChange={(e) => handleChange("durationHours", Number(e.target.value))} min={1} className="rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Hourly rate ($)</Label>
                        <Input type="number" value={form.hourlyRate} onChange={(e) => handleChange("hourlyRate", Number(e.target.value))} min={1} className="rounded-lg" />
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="space-y-4 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/50">
                      <div><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Title</p><p className="mt-1 text-sm font-medium">{form.title || "—"}</p></div>
                      <div><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Location</p><p className="mt-1 text-sm font-medium">{form.location || "—"}</p></div>
                      <div><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Description</p><p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{form.description || "—"}</p></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Duration</p><p className="mt-1 text-sm font-semibold">{form.durationHours}h</p></div>
                        <div><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Rate</p><p className="mt-1 text-sm font-semibold">${form.hourlyRate}/hr</p></div>
                        <div><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Total</p><p className="mt-1 text-sm font-semibold">${totalEst}</p></div>
                      </div>
                      {form.requiredSkills.length > 0 && <div><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Skills</p><div className="mt-1 flex flex-wrap gap-1.5">{form.requiredSkills.map((s) => <span key={s} className="rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">{s}</span>)}</div></div>}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {step > 0 ? (
                      <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="rounded-lg gap-1.5"><ChevronLeft className="h-4 w-4" /> Back</Button>
                    ) : <div />}
                    {step < 3 ? (
                      <Button type="button" onClick={() => setStep((s) => s + 1)} className="rounded-lg gap-1.5 bg-slate-900 hover:bg-slate-800">Continue <ChevronRight className="h-4 w-4" /></Button>
                    ) : (
                      <Button type="submit" disabled={isPending} className="rounded-lg bg-slate-900 hover:bg-slate-800">
                        {isPending ? "Analyzing…" : "Generate AI matches"}
                      </Button>
                    )}
                  </div>

                  <AnimatePresence>{error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg bg-rose-50 px-4 py-3 text-xs leading-relaxed text-rose-700 dark:bg-rose-950 dark:text-rose-400">{error}</motion.p>}</AnimatePresence>
                </form>

                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/50">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Active gig</p>
                      <p className="text-sm font-semibold">{result.gig.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{result.gig.location}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium shadow-sm dark:bg-slate-900">{result.gig.durationHours}h</span>
                        <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium shadow-sm dark:bg-slate-900">${result.gig.hourlyRate}/hr</span>
                        <Badge variant="secondary" className={result.status === "Assigned" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"}>{result.status}</Badge>
                      </div>
                      {result.selectedCandidate && (
                        <div className="mt-4 rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Assigned to</p>
                          <p className="mt-0.5 text-sm font-semibold">{result.selectedCandidate.student.name}</p>
                          <p className="text-xs text-slate-500">{result.selectedCandidate.student.major}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Leaderboard panel */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Leaderboard</p>
                    <h2 className="text-base font-semibold">Candidates</h2>
                    <p className="text-xs text-slate-500">
                      Ranked by match percentage.
                      {result && result.candidates.length > 5 && <span className="ml-1 text-slate-400">Top 5 of {result.candidates.length}.</span>}
                    </p>
                  </div>
                  {lowAlignment && result && <Badge className="shrink-0 bg-rose-50 text-[10px] font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-400">Low alignment</Badge>}
                </div>
                <Separator className="mt-5" />

                <AnimatePresence mode="wait">
                  {isPending && !result ? (
                    <AiLoadingPanel key="loading" />
                  ) : result ? (
                    <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-3">
                      {lowAlignment && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-rose-50 px-4 py-3 text-xs leading-relaxed text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                          <span className="font-semibold">Low candidate alignment.</span> None of the available students closely match this role.
                        </motion.div>
                      )}
                      {!lowAlignment && tiedLeaders.length > 1 && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                          <span className="font-semibold">Tie at the top.</span> {tiedLeaders.length} candidates scored {topScore}% — pick manually.
                        </motion.div>
                      )}

                      {!lowAlignment && tiedLeaders.length <= 1 && result.candidates[0] && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-lg">
                          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/30 to-sky-500/30 blur-3xl" />
                          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-3xl" />
                          <div className="relative flex items-center gap-2">
                            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur"><Trophy className="h-3 w-3" /> Best match</span>
                          </div>
                          <div className="relative mt-5 flex items-start gap-4">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[0]} text-base font-semibold text-white shadow-lg`}>{initials(result.candidates[0].student.name)}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-lg font-semibold text-white">{result.candidates[0].student.name}</p>
                              <p className="mt-0.5 text-xs text-white/60">{result.candidates[0].student.major}</p>
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {result.candidates[0].student.skills.slice(0, 4).map((s) => <span key={s} className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur">{s}</span>)}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-4xl font-semibold tabular-nums leading-none text-white">{topScore}<span className="text-lg font-medium text-white/50">%</span></div>
                            </div>
                          </div>
                          <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${topScore}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400" />
                          </div>
                          <p className="relative mt-4 text-xs leading-relaxed text-white/70">{result.candidates[0].justification}</p>
                          {result.status !== "Assigned" && (
                            <div className="relative mt-5 flex justify-end">
                              <Button type="button" onClick={() => result.candidates[0] && handleAssignClick(result.candidates[0].student.id)} disabled={isPending} className="h-9 rounded-lg bg-white px-4 text-xs font-semibold text-slate-900 hover:bg-white/90">Assign gig →</Button>
                            </div>
                          )}
                        </motion.div>
                      )}

                      <motion.div layout className="space-y-3">
                        {topCandidates.filter((c) => lowAlignment || !(tiedLeaders.length <= 1 && c === result.candidates[0])).map((candidate) => {
                          const isTiedLeader = tiedLeaders.length > 1 && candidate.matchPercent === topScore;
                          const rank = topCandidates.indexOf(candidate);
                          return <CandidateCard key={candidate.student.id} candidate={candidate} rank={rank} isBest={false} isTied={isTiedLeader} isAssigned={result.assignedStudentId === candidate.student.id} isPending={isPending} isGigAssigned={result.status === "Assigned"} onAssign={handleAssignClick} />;
                        })}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[28rem] flex-col items-center justify-center gap-5 text-center">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                        <Sparkles className="h-7 w-7 text-slate-400" />
                      </div>
                      <div className="max-w-[280px] space-y-1.5">
                        <p className="text-sm font-semibold">No candidates yet</p>
                        <p className="text-xs leading-relaxed text-slate-500">Complete the form to trigger the AI matching engine.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
