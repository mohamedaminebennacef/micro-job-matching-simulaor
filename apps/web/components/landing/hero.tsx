import { motion } from "framer-motion";
import { Sparkles, Zap, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "./motion";
import { MockField } from "./mock-field";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp}>
            <Badge
              variant="secondary"
              className="rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm py-1 px-3"
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              AI matching, live on campus
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.05]"
          >
            Find the right student for every{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              campus gig
            </span>{" "}
            in seconds.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed"
          >
            CampusGigs uses AI to instantly match campus jobs with the most
            suitable student candidates — no manual searching, just ranked
            recommendations delivered in seconds.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md h-12 px-6"
            >
              Get Started
              <span className="ml-2 h-4 w-4">→</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl h-12 px-6 border-slate-200 bg-white hover:bg-slate-50"
            >
              See How It Works
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex items-center gap-6 text-sm text-slate-500"
          >
            <div className="flex -space-x-2">
              {[
                "from-indigo-400 to-violet-500",
                "from-emerald-400 to-teal-500",
                "from-amber-400 to-orange-500",
                "from-fuchsia-400 to-pink-500",
              ].map((g, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-br ${g}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="ml-2">Trusted by 40+ campus teams</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1,
          }}
          className="relative"
        >
          <HeroMock />
        </motion.div>
      </div>
    </section>
  );
}

function HeroMock() {
  const candidates = [
    { name: "Amina R.", role: "3rd yr · Events club", score: 95, best: true },
    { name: "Léo M.", role: "2nd yr · Logistics", score: 88 },
    { name: "Priya S.", role: "4th yr · Volunteer lead", score: 82 },
    {
      name: "Kenji T.",
      role: "1st yr · Library asst.",
      score: 74,
    },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-indigo-100/60 via-violet-100/40 to-transparent rounded-3xl blur-2xl -z-10" />

      <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          <div className="ml-3 text-xs text-slate-400 font-mono">
            app.campusgigs.io/dashboard
          </div>
        </div>

        <div className="p-6 grid grid-cols-5 gap-4">
          <div className="col-span-2 space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              New Gig
            </div>
            <MockField label="Title" value="Event setup — Library open day" />
            <MockField label="Location" value="Main Library, Floor 2" />
            <div className="grid grid-cols-2 gap-2">
              <MockField label="Duration" value="4 hrs" />
              <MockField label="Pay" value="€14 / hr" />
            </div>
            <div className="mt-2 rounded-lg bg-slate-900 text-white text-xs py-2.5 text-center font-medium shadow-sm flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Match candidates
            </div>
          </div>

          <div className="col-span-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ranked candidates
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border text-[10px] font-medium">
                AI ranked
              </Badge>
            </div>
            {candidates.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                  c.best
                    ? "bg-gradient-to-r from-slate-900 to-slate-800 border-slate-800 text-white shadow-md"
                    : "bg-white border-slate-100 hover:border-slate-200 transition"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                    c.best ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      c.best ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {c.name}
                  </div>
                  <div
                    className={`text-xs ${c.best ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {c.role}
                  </div>
                </div>
                {c.best && (
                  <Badge className="bg-emerald-400/20 text-emerald-300 border-0 text-[10px] font-medium">
                    Best match
                  </Badge>
                )}
                <div
                  className={`text-sm font-semibold tabular-nums ${
                    c.best ? "text-white" : "text-slate-900"
                  }`}
                >
                  {c.score}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute -left-6 top-32 hidden lg:block"
      >
        <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur px-4 py-3 shadow-lg flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Zap className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Avg. match time</div>
            <div className="text-sm font-semibold text-slate-900">1.8s</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.6 }}
        className="absolute -right-4 -bottom-6 hidden lg:block"
      >
        <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur px-4 py-3 shadow-lg flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Match quality</div>
            <div className="text-sm font-semibold text-slate-900">
              95% confidence
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
