import { motion } from "framer-motion";
import {
  Clipboard,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp, stagger } from "./motion";

const steps = [
  {
    icon: Clipboard,
    title: "Post a gig",
    desc: "Manager enters title, description, location, duration and hourly pay in one clean form.",
  },
  {
    icon: Sparkles,
    title: "AI analysis",
    desc: "Backend fetches student profiles, builds a prompt and computes compatibility scores.",
  },
  {
    icon: Trophy,
    title: "Ranked candidates",
    desc: "See a ranked leaderboard with the Best Match highlighted at the top of the list.",
  },
  {
    icon: CheckCircle2,
    title: "Assign instantly",
    desc: "Manager clicks Assign Gig — the job becomes assigned immediately, no back-and-forth.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Badge className="bg-violet-50 text-violet-700 border-violet-100 border rounded-full px-3">
          How it works
        </Badge>
        <h2 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
          From posted gig to assigned student in four steps.
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          A workflow so simple it fits on a single screen.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
      >
        {steps.map((s, i) => (
          <motion.div key={s.title} variants={fadeUp} className="relative">
            <Card className="h-full rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-sm">
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900 tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </CardContent>
            </Card>
            {i < steps.length - 1 && (
              <ChevronRight className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 h-5 w-5 text-slate-300" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
