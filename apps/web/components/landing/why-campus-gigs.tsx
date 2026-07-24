import { motion } from "framer-motion";
import { Clock, Target, Workflow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    icon: Clock,
    title: "Save time",
    desc: "Cut manual candidate screening from hours to seconds.",
  },
  {
    icon: Target,
    title: "Better matches",
    desc: "AI evaluates candidates objectively against the gig.",
  },
  {
    icon: Workflow,
    title: "Simple workflow",
    desc: "Three steps: post, match, assign — nothing else.",
  },
];

export function WhyCampusGigs() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="grid lg:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          >
            <Card className="rounded-2xl border-slate-200/80 bg-gradient-to-br from-white to-slate-50/70 shadow-sm h-full">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <it.icon className="h-6 w-6 text-slate-800" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
                  {it.title}
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{it.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
