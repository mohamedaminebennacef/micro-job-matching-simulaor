"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ─── Types ─────────────────────────────────────────────── */
type GigInput = {
  title: string;
  description: string;
  location: string;
  durationHours: number;
  hourlyRate: number;
};
type StudentProfile = {
  id: string;
  name: string;
  major: string;
  skills: string[];
  interests: string[];
};
type CandidateScore = {
  student: StudentProfile;
  matchPercent: number;
  justification: string;
};
type GigResult = {
  id: string;
  status: "Open" | "Assigned";
  gig: GigInput;
  candidates: CandidateScore[];
  assignedStudentId?: string;
  selectedCandidate?: CandidateScore;
};

const emptyGig: GigInput = {
  title: "",
  description: "",
  location: "",
  durationHours: 2,
  hourlyRate: 18,
};

/* ─── Helpers ────────────────────────────────────────────── */
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function scoreTone(pct: number) {
  if (pct >= 80)
    return {
      text: "text-emerald-600",
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
      chip: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
    };
  if (pct >= 55)
    return {
      text: "text-amber-600",
      bar: "bg-gradient-to-r from-amber-400 to-amber-500",
      chip: "bg-amber-50 text-amber-700 ring-amber-200/60",
    };
  return {
    text: "text-rose-600",
    bar: "bg-gradient-to-r from-rose-400 to-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-200/60",
  };
}

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-sky-500 to-cyan-600",
  "from-fuchsia-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
];

/* ─── Field ────────────────────────────────────────── */
function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium text-neutral-600 tracking-tight"
      >
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={type === "number" ? 1 : undefined}
          step={type === "number" ? "any" : undefined}
          className={`w-full rounded-lg bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none ring-1 ring-inset ring-neutral-200/70 transition-all duration-150 hover:bg-white hover:ring-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-900/80 ${
            prefix ? "pl-8" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* ─── Loading States ────────────────────────────────────── */
const LOADING_STEPS = [
  "Retrieving student profiles",
  "Analyzing skills",
  "Comparing gig requirements",
  "Ranking candidates",
  "Finalizing recommendations",
];

function AiLoadingPanel() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => (s + 1) % LOADING_STEPS.length),
      900,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[28rem] flex-col items-center justify-center gap-8 px-6 text-center"
    >
      <div className="relative">
        <motion.div
          className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 shadow-lg shadow-neutral-900/20"
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/40 to-sky-500/40 blur-xl"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          AI Analysis
        </p>
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-neutral-900"
            >
              {LOADING_STEPS[step]}…
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-1.5 pt-2">
          {LOADING_STEPS.map((_, i) => (
            <motion.span
              key={i}
              className="h-1 rounded-full bg-neutral-900"
              animate={{
                width: i === step ? 24 : 6,
                opacity: i === step ? 1 : 0.2,
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Candidate Card ─────────────────────────────────── */
function CandidateCard({
  candidate,
  rank,
  isBest,
  isTied,
  isAssigned,
  isPending,
  isGigAssigned,
  onAssign,
}: {
  candidate: CandidateScore;
  rank: number;
  isBest: boolean;
  isTied: boolean;
  isAssigned: boolean;
  isPending: boolean;
  isGigAssigned: boolean;
  onAssign: (id: string) => void;
}) {
  const gradient = AVATAR_GRADIENTS[rank % AVATAR_GRADIENTS.length];
  const pct = candidate.matchPercent;
  const tone = scoreTone(pct);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_28px_rgba(0,0,0,0.08)] ${
        isBest ? "ring-1 ring-neutral-900/10" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold tabular-nums text-neutral-400">
            #{String(rank + 1).padStart(2, "0")}
          </span>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-sm font-semibold text-white shadow-sm`}
          >
            {initials(candidate.student.name)}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {candidate.student.name}
                </p>
                {isTied && (
                  <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    Tied
                  </span>
                )}
                {isAssigned && (
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    ✓ Assigned
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-neutral-500">
                {candidate.student.major}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span
                className={`text-2xl font-semibold tabular-nums leading-none ${tone.text}`}
              >
                {pct}
              </span>
              <span className="ml-0.5 text-xs font-medium text-neutral-400">
                %
              </span>
            </div>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${tone.bar}`}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {candidate.student.skills.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700"
              >
                {s}
              </span>
            ))}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            {candidate.justification}
          </p>

          {!isGigAssigned && (
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => onAssign(candidate.student.id)}
                disabled={isPending}
                className={`h-8 rounded-lg px-3.5 text-xs font-medium transition-all ${
                  isBest
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                }`}
              >
                Assign gig →
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ────────────────────────────────────── */
export default function Home() {
  const [form, setForm] = useState<GigInput>(emptyGig);
  const [result, setResult] = useState<GigResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const topCandidates = useMemo(
    () => result?.candidates.slice(0, 5) ?? [],
    [result],
  );
  const topScore = topCandidates[0]?.matchPercent ?? 0;
  const tiedLeaders = useMemo(
    () => topCandidates.filter((c) => c.matchPercent === topScore),
    [topCandidates, topScore],
  );
  const lowAlignment =
    topCandidates.length > 0 && topCandidates.every((c) => c.matchPercent < 30);

  function handleChange(field: keyof GigInput, value: string | number) {
    setForm((cur) => ({ ...cur, [field]: value }));
  }

  async function submitGig(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/gigs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            durationHours: Number(form.durationHours),
            hourlyRate: Number(form.hourlyRate),
          }),
        });
        if (!res.ok) throw new Error("Backend request failed");
        setResult((await res.json()) as GigResult);
      } catch {
        setResult(null);
        setError(
          "Could not save the gig. Make sure the API is running and the database is connected.",
        );
      }
    });
  }

  async function assignGig(studentId: string) {
    if (!result) return;
    setError(null);
    if (result.id === "local-simulation") {
      const selected = result.candidates.find(
        (c) => c.student.id === studentId,
      );
      if (selected)
        setResult({
          ...result,
          status: "Assigned",
          assignedStudentId: studentId,
          selectedCandidate: selected,
        });
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/gigs/${result.id}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId }),
        });
        if (!res.ok) throw new Error("Unable to assign gig");
        setResult((await res.json()) as GigResult);
      } catch {
        setError(
          "Unable to assign the gig right now. Check the API service and try again.",
        );
      }
    });
  }

  function resetForm() {
    setResult(null);
    setError(null);
    setForm(emptyGig);
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      <main className="relative mx-auto max-w-[1880px] px-8 py-10 lg:py-14">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 shadow-md shadow-neutral-900/20">
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-neutral-900">
                CampusGigs
              </p>
              <p className="text-xs text-neutral-500">AI Micro-Job Matching</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-neutral-200/60 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-neutral-600">
              Matching engine online
            </span>
          </div>
        </motion.header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,800px)_minmax(0,1fr)]">
          {/* LEFT: Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Card className="rounded-2xl ring-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.06)]">
              <CardHeader className="space-y-1 px-7 pb-2 pt-7">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                    Step 01
                  </p>
                  {result && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
                    >
                      ← New gig
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                  Post a campus gig
                </h2>
                <p className="text-sm text-neutral-500">
                  Fill in the details and we'll instantly rank the top student
                  matches.
                </p>
              </CardHeader>

              <CardContent className="px-7 pb-7 pt-5">
                <form onSubmit={submitGig} className="space-y-4">
                  <Field
                    id="title"
                    label="Title"
                    value={form.title}
                    onChange={(v) => handleChange("title", v)}
                    placeholder="Help move lab equipment"
                  />
                  <Field
                    id="location"
                    label="Location"
                    value={form.location}
                    onChange={(v) => handleChange("location", v)}
                    placeholder="Science Hall, Room 204"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      id="duration"
                      label="Duration (hours)"
                      type="number"
                      value={form.durationHours}
                      onChange={(v) => handleChange("durationHours", Number(v))}
                    />
                    <Field
                      id="rate"
                      label="Hourly rate"
                      type="number"
                      value={form.hourlyRate}
                      onChange={(v) => handleChange("hourlyRate", Number(v))}
                      prefix="$"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="description"
                      className="text-xs font-medium tracking-tight text-neutral-600"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Describe the task — what needs doing, any specific skills required, and what success looks like…"
                      className="w-full resize-none rounded-lg bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none ring-1 ring-inset ring-neutral-200/70 transition-all duration-150 hover:bg-white hover:ring-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-900/80"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      id="submit-gig-btn"
                      disabled={isPending}
                      className="group relative w-full overflow-hidden rounded-xl bg-neutral-900 py-6 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-200 hover:bg-neutral-800 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_12px_28px_rgba(0,0,0,0.2)] disabled:opacity-60"
                    >
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="relative flex items-center justify-center gap-2">
                        {isPending ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Analyzing candidates…
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.188-.398a2.25 2.25 0 001.423-1.423L16.5 15.75l.398 1.188a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.188.398a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            Generate AI matches
                          </>
                        )}
                      </span>
                    </Button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        id="error-banner"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg bg-rose-50 px-4 py-3 text-xs leading-relaxed text-rose-700"
                      >
                        ⚠ {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 rounded-xl bg-neutral-50 p-5"
                    >
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Active gig
                      </p>
                      <p className="text-sm font-semibold text-neutral-900">{result.gig.title}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{result.gig.location}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 shadow-sm">
                          {result.gig.durationHours}h
                        </span>
                        <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 shadow-sm">
                          ${result.gig.hourlyRate}/hr
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                            result.status === "Assigned"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>
                      {result.selectedCandidate && (
                        <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                            Assigned to
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                            {result.selectedCandidate.student.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {result.selectedCandidate.student.major}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT: Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Card className="rounded-2xl ring-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.06)]">
              <CardHeader className="px-7 pb-2 pt-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                      Step 02
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                      Candidate leaderboard
                    </h2>
                    <p className="text-sm text-neutral-500">
                      Ranked highest to lowest match percentage.
                      {result && result.candidates.length > 5 && (
                        <span className="ml-1 text-neutral-400">
                          Top 5 of {result.candidates.length}.
                        </span>
                      )}
                    </p>
                  </div>
                  {lowAlignment && result && (
                    <Badge
                      id="low-alignment-badge"
                      className="shrink-0 bg-rose-50 text-[10px] font-medium text-rose-700 hover:bg-rose-50"
                    >
                      ⚠ Low alignment
                    </Badge>
                  )}
                </div>
                <Separator className="mt-6 bg-neutral-100" />
              </CardHeader>

              <CardContent className="px-7 pb-7 pt-4">
                <AnimatePresence mode="wait">
                  {isPending && !result ? (
                    <AiLoadingPanel key="loading" />
                  ) : result ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      {lowAlignment && (
                        <motion.div
                          id="low-alignment-banner"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl bg-rose-50 px-4 py-3 text-xs leading-relaxed text-rose-700"
                        >
                          <span className="font-semibold">Low candidate alignment.</span>{" "}
                          None of the available students closely match this role. Consider
                          broadening the description or widening the talent pool.
                        </motion.div>
                      )}

                      {!lowAlignment && tiedLeaders.length > 1 && (
                        <motion.div
                          id="tie-notice"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800"
                        >
                          <span className="font-semibold">Tie at the top.</span>{" "}
                          {tiedLeaders.length} candidates scored {topScore}% — pick manually below.
                        </motion.div>
                      )}

                      {!lowAlignment && tiedLeaders.length <= 1 && result.candidates[0] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
                        >
                          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/30 to-sky-500/30 blur-3xl" />
                          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-3xl" />

                          <div className="relative flex items-center gap-2">
                            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                              ★ Best match
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                              Rank #01
                            </span>
                          </div>

                          <div className="relative mt-5 flex items-start gap-4">
                            <div
                              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[0]} text-base font-semibold text-white shadow-lg`}
                            >
                              {initials(result.candidates[0].student.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-lg font-semibold text-white">
                                {result.candidates[0].student.name}
                              </p>
                              <p className="mt-0.5 text-xs text-white/60">
                                {result.candidates[0].student.major}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {result.candidates[0].student.skills.slice(0, 4).map((s) => (
                                  <span
                                    key={s}
                                    className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-4xl font-semibold tabular-nums leading-none text-white">
                                {topScore}
                                <span className="text-lg font-medium text-white/50">%</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${topScore}%` }}
                              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400"
                            />
                          </div>

                          <p className="relative mt-4 text-xs leading-relaxed text-white/70">
                            {result.candidates[0].justification}
                          </p>

                          {result.status !== "Assigned" && (
                            <div className="relative mt-5 flex justify-end">
                              <Button
                                type="button"
                                onClick={() => result.candidates[0] && assignGig(result.candidates[0].student.id)}
                                disabled={isPending}
                                className="h-9 rounded-lg bg-white px-4 text-xs font-semibold text-neutral-900 hover:bg-white/90"
                              >
                                Assign gig →
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      )}

                      <motion.div layout className="space-y-3">
                        {topCandidates
                          .filter(
                            (c) =>
                              lowAlignment ||
                              !(tiedLeaders.length <= 1 && c === result.candidates[0]),
                          )
                          .map((candidate) => {
                            const isTiedLeader =
                              tiedLeaders.length > 1 &&
                              candidate.matchPercent === topScore;
                            const rank = topCandidates.indexOf(candidate);
                            return (
                              <CandidateCard
                                key={candidate.student.id}
                                candidate={candidate}
                                rank={rank}
                                isBest={false}
                                isTied={isTiedLeader}
                                isAssigned={
                                  result.assignedStudentId === candidate.student.id
                                }
                                isPending={isPending}
                                isGigAssigned={result.status === "Assigned"}
                                onAssign={assignGig}
                              />
                            );
                          })}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      id="leaderboard-empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex min-h-[28rem] flex-col items-center justify-center gap-5 text-center"
                    >
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200">
                          <svg
                            className="h-7 w-7 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="max-w-[280px] space-y-1.5">
                        <p className="text-sm font-semibold text-neutral-900">
                          No candidates yet
                        </p>
                        <p className="text-xs leading-relaxed text-neutral-500">
                          Post a gig on the left to trigger the AI matching engine and see
                          ranked candidates here.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}