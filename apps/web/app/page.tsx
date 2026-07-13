"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
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
const AVATAR_GRADIENTS = [
  "from-primary to-indigo-700",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-amber-400 via-orange-500 to-red-500",
  "from-sky-400 via-blue-500 to-indigo-650",
  "from-rose-400 via-pink-500 to-fuchsia-600",
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function scoreColor(pct: number) {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 55) return "text-amber-600";
  return "text-rose-600";
}

function scoreGradient(pct: number) {
  if (pct >= 80) return "from-emerald-500 to-teal-500";
  if (pct >= 55) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-pink-500";
}

/* ─── Input Field ────────────────────────────────────────── */
function Field({
  id, label, value, onChange, placeholder, type = "text", prefix,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  type?: string; prefix?: string;
}) {
  return (
    <div className="group flex flex-col gap-2">
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">
            {prefix}
          </span>
        )}
        <input
          id={id} required type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={type === "number" ? 1 : undefined}
          step={type === "number" ? "any" : undefined}
          className={`
            w-full rounded-2xl border border-slate-200 bg-slate-50
            px-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400
            outline-none transition-all duration-200
            hover:border-slate-350 hover:bg-slate-100/50
            focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10
            ${prefix ? "pl-9" : ""}
          `}
        />
      </div>
    </div>
  );
}

/* ─── Score Ring ─────────────────────────────────────────── */
function ScoreRing({ pct }: { pct: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none" strokeWidth="5"
          strokeLinecap="round"
          stroke={pct >= 80 ? "#10b981" : pct >= 55 ? "#f59e0b" : "#ef4444"}
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <span className={`absolute text-sm font-black tabular-nums ${scoreColor(pct)}`}>
        {pct}%
      </span>
    </div>
  );
}

/* ─── Candidate Card ─────────────────────────────────────── */
function CandidateCard({
  candidate, rank, isBest, isTied, isAssigned, isPending, isGigAssigned, onAssign,
}: {
  candidate: CandidateScore; rank: number;
  isBest: boolean; isTied: boolean; isAssigned: boolean;
  isPending: boolean; isGigAssigned: boolean;
  onAssign: (id: string) => void;
}) {
  const gradient = AVATAR_GRADIENTS[rank % AVATAR_GRADIENTS.length];
  const pct = candidate.matchPercent;

  return (
    <article
      className={`
        animate-fade-up relative overflow-hidden rounded-2xl border p-5 transition-all duration-300
        ${isBest && !isTied
          ? "border-gray-200 bg-gradient-to-br from-primary/5 via-indigo-50/10 to-transparent shadow-[0_4px_22px_rgba(20,20,30,0.04)]"
          : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50"}
        ${isAssigned ? "border-emerald-200 bg-emerald-50/30" : ""}
      `}
    >
      {/* Top: rank pill */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
          ${rank === 0 ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}
        >
          {rank === 0 ? "★ TOP PICK" : `#${rank + 1}`}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {isBest && !isTied && (
            <Badge className="border-primary/25 bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Best Match
            </Badge>
          )}
          {isTied && (
            <Badge className="border-amber-200 bg-amber-50 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
              Tied
            </Badge>
          )}
          {isAssigned && (
            <Badge className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              ✓ Assigned
            </Badge>
          )}
        </div>
      </div>

      {/* Middle: Avatar + info + ring */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-lg`}>
          {initials(candidate.student.name)}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-slate-900">{candidate.student.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{candidate.student.major}</p>

          {/* Skills chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {candidate.student.skills.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] text-slate-600">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Score ring */}
        <ScoreRing pct={pct} />
      </div>

      {/* Score progress bar */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${scoreGradient(pct)} transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Justification */}
      <p className="mt-3.5 text-xs leading-relaxed text-slate-600">
        {candidate.justification}
      </p>

      {/* Assign */}
      {!isGigAssigned && (
        <div className="mt-4">
          <Button
            type="button" size="sm" variant="outline"
            id={`assign-${candidate.student.id}`}
            onClick={() => onAssign(candidate.student.id)}
            disabled={isPending}
            className={`rounded-xl border h-8 px-4 text-xs font-semibold transition-all duration-200
              ${rank === 0
                ? "border-primary/25 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}
              disabled:opacity-40`}
          >
            Assign Gig →
          </Button>
        </div>
      )}
    </article>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function Home() {
  const [form, setForm] = useState<GigInput>(emptyGig);
  const [result, setResult] = useState<GigResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const topCandidates = useMemo(() => result?.candidates.slice(0, 5) ?? [], [result]);
  const topScore = topCandidates[0]?.matchPercent ?? 0;
  const tiedLeaders = useMemo(() => topCandidates.filter((c) => c.matchPercent === topScore), [topCandidates, topScore]);
  const lowAlignment = topCandidates.length > 0 && topCandidates.every((c) => c.matchPercent < 30);

  function handleChange(field: keyof GigInput, value: string | number) {
    setForm((cur) => ({ ...cur, [field]: value }));
  }

  async function submitGig(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/gigs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, durationHours: Number(form.durationHours), hourlyRate: Number(form.hourlyRate) }),
        });
        if (!res.ok) throw new Error("Backend request failed");
        setResult((await res.json()) as GigResult);
      } catch {
        setResult(null);
        setError("Could not save the gig. Make sure the API is running and the database is connected.");
      }
    });
  }

  async function assignGig(studentId: string) {
    if (!result) return;
    setError(null);
    if (result.id === "local-simulation") {
      const selected = result.candidates.find((c) => c.student.id === studentId);
      if (selected) setResult({ ...result, status: "Assigned", assignedStudentId: studentId, selectedCandidate: selected });
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
        setError("Unable to assign the gig right now. Check the API service and try again.");
      }
    });
  }

  function resetForm() {
    setResult(null);
    setError(null);
    setForm(emptyGig);
  }

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <main className="relative mx-auto max-w-[90rem] px-6 py-16 lg:px-10">

        {/* ── Header ── */}
        <header className="mb-14">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">CampusGigs</h1>
              <p className="text-sm text-slate-500">Micro-Job Matching Simulator</p>
            </div>
          </div>
        </header>

        {/* ── Two-column grid ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">

          {/* ── LEFT: Gig Form ── */}
          <Card className="border-gray-200 bg-white shadow-md">
            <CardHeader className="px-8 pb-0 pt-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    Step 1
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">Post a Campus Gig</h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Fill in the details and we'll instantly rank 5 student candidates.
                  </p>
                </div>
                {result && (
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={resetForm}
                    className="shrink-0 rounded-xl text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    ← New gig
                  </Button>
                )}
              </div>
            </CardHeader>

            <Separator className="mx-8 mt-7 mb-7 w-auto opacity-45" />

            <CardContent className="px-8 pb-8">
              <form id="gig-form" onSubmit={submitGig}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="gig-title" label="Gig title" value={form.title} onChange={(v) => handleChange("title", v)} placeholder="Help move lab equipment" />
                  <Field id="gig-location" label="Location" value={form.location} onChange={(v) => handleChange("location", v)} placeholder="Science Hall, Room 204" />
                  <Field id="gig-duration" label="Duration (hours)" type="number" value={String(form.durationHours)} onChange={(v) => handleChange("durationHours", Number(v))} />
                  <Field id="gig-rate" label="Hourly pay" type="number" value={String(form.hourlyRate)} onChange={(v) => handleChange("hourlyRate", Number(v))} prefix="$" />
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <label htmlFor="gig-description" className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Description
                  </label>
                  <textarea
                    id="gig-description" required rows={5} value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe the task in detail — what needs to be done, any specific skills required, and what success looks like…"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-350 hover:bg-slate-100/50 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="mt-7">
                  <Button
                    type="submit" id="submit-gig-btn" disabled={isPending}
                    className="w-full rounded-2xl bg-primary py-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:brightness-110 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2.5">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Matching candidates…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>⚡</span> Start Matching
                      </span>
                    )}
                  </Button>
                </div>

                {error && (
                  <p id="error-banner" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs leading-relaxed text-amber-800">
                    ⚠ {error}
                  </p>
                )}
              </form>

              {/* Active gig summary */}
              {result && (
                <div className="mt-8 animate-fade-in rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Active Gig</p>
                  <p className="text-base font-bold text-slate-900">{result.gig.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{result.gig.location}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                      {result.gig.durationHours}h duration
                    </span>
                    <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                      ${result.gig.hourlyRate}/hr
                    </span>
                    <span className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                      result.status === "Assigned"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-primary/20 bg-primary/10 text-primary"
                    }`}>
                      {result.status}
                    </span>
                  </div>

                  {result.selectedCandidate && (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Assigned to</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">{result.selectedCandidate.student.name}</p>
                      <p className="text-xs text-slate-500">{result.selectedCandidate.student.major}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── RIGHT: Leaderboard ── */}
          <Card className="border-gray-200 bg-white shadow-md">
            <CardHeader className="px-8 pb-0 pt-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    Step 2
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">Candidate Leaderboard</h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Ranked from highest to lowest match percentage.
                    {result && result.candidates.length > 5 && (
                      <span className="ml-1 text-slate-400">Showing top 5 of {result.candidates.length}.</span>
                    )}
                  </p>
                </div>
                {lowAlignment && result && (
                  <Badge id="low-alignment-badge" className="shrink-0 border-rose-200 bg-rose-50 text-rose-700 text-[10px]">
                    ⚠ Low Alignment
                  </Badge>
                )}
              </div>
            </CardHeader>

            <Separator className="mx-8 mt-7 mb-5 w-auto opacity-45" />

            <CardContent className="px-8 pb-8">
              {result ? (
                <div className="space-y-4">
                  {/* Tie notice */}
                  {tiedLeaders.length > 1 && (
                    <div id="tie-notice" className="animate-fade-in rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs leading-relaxed text-amber-800">
                      <span className="font-bold">Tie at the top!</span> Both leaders scored {topScore}% — pick manually below.
                    </div>
                  )}

                  {/* Best match spotlight */}
                  {tiedLeaders.length <= 1 && result.candidates[0] && (
                    <div className="animate-scale-in mb-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/5 via-indigo-50/10 to-white p-6 shadow-[0_4px_22px_rgba(20,20,30,0.04)]">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">★ Best Match</span>
                        <div className="h-px flex-1 bg-primary/10" />
                      </div>
                      <div className="flex items-start gap-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[0]} text-base font-black text-white shadow-lg`}>
                          {initials(result.candidates[0].student.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-black text-slate-900">{result.candidates[0].student.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{result.candidates[0].student.major}</p>
                          <p className="mt-3 text-xs leading-relaxed text-slate-600">{result.candidates[0].justification}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-4xl font-black tabular-nums ${scoreColor(topScore)}`}>{topScore}</span>
                          <span className="block text-xs font-semibold text-slate-400">%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top 5 candidates */}
                  {topCandidates.map((candidate, index) => (
                    <CandidateCard
                      key={candidate.student.id}
                      candidate={candidate}
                      rank={index}
                      isBest={index === 0}
                      isTied={tiedLeaders.length > 1 && candidate.matchPercent === topScore}
                      isAssigned={result.assignedStudentId === candidate.student.id}
                      isPending={isPending}
                      isGigAssigned={result.status === "Assigned"}
                      onAssign={assignGig}
                    />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div
                  id="leaderboard-empty-state"
                  className="flex min-h-[28rem] flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                    <svg className="h-9 w-9 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-400">No candidates yet</p>
                    <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-slate-500">
                      Post a gig on the left to trigger the matching engine and see ranked candidates here.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
