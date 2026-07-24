import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Users,
  Trophy,
  LayoutDashboard,
  Rocket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp, stagger } from "./motion";

const features = [
  {
    icon: Sparkles,
    title: "AI matching",
    desc: "Instant, intelligent candidate ranking powered by a Groq-hosted model.",
  },
  {
    icon: Zap,
    title: "Fast decisions",
    desc: "Results generated within seconds — no waiting, no manual sifting.",
  },
  {
    icon: Users,
    title: "Student profiles",
    desc: "Rich profiles analyze skills, interests, availability and past experience.",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "Beautiful ranked candidate interface with a highlighted Best Match.",
  },
  {
    icon: LayoutDashboard,
    title: "Modern dashboard",
    desc: "Simple, intuitive management interface built for campus managers.",
  },
  {
    icon: Rocket,
    title: "Deployment ready",
    desc: "Ships with Next.js, NestJS, Prisma, Supabase, Render and Vercel.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 border rounded-full px-3">
            Features
          </Badge>
          <h2 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
            Everything you need to run gigs on campus.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Thoughtful defaults, minimal setup, and a dashboard your managers
            will actually enjoy.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <Card className="h-full rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                    <f.icon className="h-5 w-5 text-slate-700 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
