import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { fadeUp, stagger } from "./motion";

const tech = [
  "Next.js",
  "NestJS",
  "TypeScript",
  "Prisma",
  "Supabase",
  "PostgreSQL",
  "Tailwind CSS",
  "shadcn/ui",
  "Groq AI",
  "Render",
  "Vercel",
  "GitHub Actions",
];

export function TechStack() {
  return (
    <section id="tech" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 border rounded-full px-3">
          Tech stack
        </Badge>
        <h2 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
          Built on a modern, dependable foundation.
        </h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="mt-12 flex flex-wrap items-center justify-center gap-3"
      >
        {tech.map((t) => (
          <motion.span
            key={t}
            variants={fadeUp}
            whileHover={{ y: -3 }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition"
          >
            {t}
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
}
