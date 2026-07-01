"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";

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

const fallbackCandidates: CandidateScore[] = [
  {
    student: {
      id: "local-1",
      name: "Maya Thompson",
      major: "History",
      skills: ["Archiving", "Organization"],
      interests: ["libraries", "campus history"],
    },
    matchPercent: 95,
    justification:
      "Strong archival background and a history major make this a natural fit.",
  },
  {
    student: {
      id: "local-2",
      name: "Amina Hassan",
      major: "Business Administration",
      skills: ["Scheduling", "Logistics"],
      interests: ["operations", "people"],
    },
    matchPercent: 82,
    justification:
      "Reliable logistics and organization skills fit most campus support work.",
  },
  {
    student: {
      id: "local-3",
      name: "Sofia Alvarez",
      major: "Biology",
      skills: ["Lab support", "Attention to detail"],
      interests: ["research", "inventory"],
    },
    matchPercent: 74,
    justification:
      "Detail-oriented work and lab support experience transfer well to odd jobs.",
  },
  {
    student: {
      id: "local-4",
      name: "Noah Kim",
      major: "Design",
      skills: ["Canva", "Flyer layout"],
      interests: ["marketing", "branding"],
    },
    matchPercent: 58,
    justification:
      "A solid option when the job needs communication or visual polish.",
  },
  {
    student: {
      id: "local-5",
      name: "Ethan Park",
      major: "Computer Science",
      skills: ["React", "Debugging"],
      interests: ["automation", "hackathons"],
    },
    matchPercent: 40,
    justification:
      "Technically strong, but the profile is less aligned with hands-on campus errands.",
  },
];

export default function Home() {
  const [form, setForm] = useState<GigInput>(emptyGig);
  const [result, setResult] = useState<GigResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const topScore = result?.candidates[0]?.matchPercent ?? 0;
  const topCandidate = result?.candidates[0];
  const tiedLeaders = useMemo(() => {
    if (!result?.candidates.length) {
      return [] as CandidateScore[];
    }

    return result.candidates.filter(
      (candidate) => candidate.matchPercent === topScore,
    );
  }, [result, topScore]);

  const lowAlignment = result
    ? result.candidates.every((candidate) => candidate.matchPercent < 30)
    : false;

  function handleChange(field: keyof GigInput, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitGig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/gigs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            durationHours: Number(form.durationHours),
            hourlyRate: Number(form.hourlyRate),
          }),
        });

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = (await response.json()) as GigResult;
        setResult(data);
        return;
      } catch {
        setResult({
          id: "local-simulation",
          status: "Open",
          gig: form,
          candidates: fallbackCandidates,
        });
        setError(
          "Running in local simulation mode because the API is not reachable yet.",
        );
      }
    });
  }

  async function assignGig(studentId: string) {
    if (!result) {
      return;
    }

    setError(null);

    if (result.id === "local-simulation") {
      const selectedCandidate = result.candidates.find(
        (candidate) => candidate.student.id === studentId,
      );
      if (!selectedCandidate) {
        return;
      }

      setResult({
        ...result,
        status: "Assigned",
        assignedStudentId: studentId,
        selectedCandidate,
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/gigs/${result.id}/assign`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ studentId }),
          },
        );

        if (!response.ok) {
          throw new Error("Unable to assign gig");
        }

        const data = (await response.json()) as GigResult;
        setResult(data);
      } catch {
        setError(
          "Unable to assign the gig right now. Check the API service and try again.",
        );
      }
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-white text-slate-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form
            onSubmit={submitGig}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2
                  className="text-2xl font-semibold text-slate-900"
                >
                  Create a Campus Gig
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Gig title"
                value={form.title}
                onChange={(value) => handleChange("title", value)}
                placeholder="Need help moving lab equipment"
              />
              <Field
                label="Location"
                value={form.location}
                onChange={(value) => handleChange("location", value)}
                placeholder="Science Hall, Room 204"
              />
              <Field
                label="Duration (hours)"
                type="number"
                value={String(form.durationHours)}
                onChange={(value) =>
                  handleChange("durationHours", Number(value))
                }
              />
              <Field
                label="Hourly pay"
                type="number"
                value={String(form.hourlyRate)}
                onChange={(value) => handleChange("hourlyRate", Number(value))}
                prefix="$"
              />
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                placeholder="Detailed job description, success criteria, and any special constraints."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
              >
                {isPending ? "Matching..." : "Start matching"}
              </button>
              <p className="text-xs text-slate-500">
                The API can be replaced with Supabase persistence and an LLM
                prompt later.
              </p>
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {error}
              </p>
            ) : null}
          </form>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2
                  className="text-2xl font-semibold text-slate-900"
                >
                  Leaderboard
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Candidates are sorted automatically from strongest match to
                  weakest.
                </p>
              </div>
              {lowAlignment ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-900">
                  Low candidate alignment detected
                </span>
              ) : null}
            </div>

            {result ? (
              <div className="space-y-4">
                {tiedLeaders.length > 1 ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
                    Tie detected at the top. Manager can manually pick between
                    the leaders.
                  </div>
                ) : null}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-blue-600">
                        Best match
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {topCandidate?.student.name ?? "No candidate found"}
                      </h3>
                    </div>
                    <div className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                      {topCandidate?.matchPercent ?? 0}%
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {topCandidate?.justification ??
                      "No candidate summary available yet."}
                  </p>
                </div>

                <div className="space-y-3">
                  {result.candidates.map((candidate, index) => {
                    const isBest = index === 0;
                    const isAssigned =
                      result.assignedStudentId === candidate.student.id;

                    return (
                      <article
                        key={candidate.student.id}
                        className={`rounded-xl border p-4 transition ${isBest ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-semibold text-slate-900">
                                {candidate.student.name}
                              </h4>
                              {isBest ? (
                                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                                  Best Match
                                </span>
                              ) : null}
                              {isAssigned ? (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
                                  Assigned
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">
                              {candidate.student.major} ·{" "}
                              {candidate.student.skills.join(" • ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-semibold text-slate-900">
                              {candidate.matchPercent}%
                            </div>
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                              match
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {candidate.justification}
                        </p>
                        <button
                          type="button"
                          onClick={() => assignGig(candidate.student.id)}
                          className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                          disabled={isPending || result.status === "Assigned"}
                        >
                          Assign Gig
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[28rem] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm leading-7 text-slate-500">
                Submit a gig to populate the matching chamber. The leaderboard,
                justification snippet, and assign action will fill in instantly.
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-500">
            {prefix}
          </span>
        ) : null}
        <input
          required
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${prefix ? "pl-8" : ""}`}
        />
      </div>
    </label>
  );
}
