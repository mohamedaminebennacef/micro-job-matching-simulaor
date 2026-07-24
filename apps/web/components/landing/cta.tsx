import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 lg:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-8 py-20 text-center shadow-[0_30px_80px_-30px_rgba(15,23,42,0.6)]"
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-fuchsia-500 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight max-w-3xl mx-auto">
            Ready to see AI match campus jobs instantly?
          </h2>
          <p className="mt-5 text-lg text-slate-300 max-w-xl mx-auto">
            Launch the CampusGigs simulator, post your first gig, and get a
            ranked shortlist in under two seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl h-12 px-6 shadow-lg"
              >
                Launch CampusGigs
                <span className="ml-2 h-4 w-4">→</span>
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl h-12 px-6 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              View on GitHub
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
