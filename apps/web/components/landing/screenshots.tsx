import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeUp, stagger } from "./motion";
import { MockField } from "./mock-field";

function ShotForm() {
  return (
    <div className="space-y-3">
      <MockField label="Title" value="Distribute flyers — Career Fair" />
      <MockField label="Location" value="Campus Center, Hall B" />
      <div className="grid grid-cols-2 gap-2">
        <MockField label="Duration" value="3 hrs" />
        <MockField label="Pay" value="€12 / hr" />
      </div>
      <div className="rounded-lg bg-slate-900 text-white text-xs py-2 text-center font-medium">
        Post & Match
      </div>
    </div>
  );
}

function ShotProcessing() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-900 animate-spin" />
        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-slate-900" />
      </div>
      <div className="text-sm font-medium text-slate-900">
        Analyzing 128 profiles…
      </div>
      <div className="w-full space-y-2">
        {[80, 55, 30].map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ShotLeaderboard() {
  const rows = [
    { name: "Amina R.", score: 95, best: true },
    { name: "Léo M.", score: 88 },
    { name: "Priya S.", score: 82 },
  ];

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={r.name}
          className={`flex items-center gap-3 rounded-xl p-2.5 border ${
            r.best
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-100"
          }`}
        >
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              r.best ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {r.name[0]}
          </div>
          <div className="flex-1 text-sm font-medium">{r.name}</div>
          {r.best && (
            <Badge className="bg-emerald-400/20 text-emerald-300 border-0 text-[10px]">
              Best
            </Badge>
          )}
          <div className="text-sm font-semibold tabular-nums">{r.score}%</div>
        </div>
      ))}
    </div>
  );
}

const shots = [
  { title: "Campus gig form", node: <ShotForm /> },
  { title: "AI processing", node: <ShotProcessing /> },
  { title: "Ranked leaderboard", node: <ShotLeaderboard /> },
];

export function Screenshots() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Badge className="bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 border rounded-full px-3">
          Product tour
        </Badge>
        <h2 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
          A closer look at the CampusGigs dashboard.
        </h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {shots.map((s) => (
          <motion.div key={s.title} variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-15px_rgba(15,23,42,0.15)] overflow-hidden hover:shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25)] hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/60">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="p-5 min-h-[240px]">{s.node}</div>
              <div className="px-5 pb-5 pt-1">
                <div className="text-sm font-medium text-slate-900">
                  {s.title}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
