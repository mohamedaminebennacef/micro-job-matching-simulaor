import { motion } from "framer-motion";
import { Zap, Target, Users, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { k: "1.8s", v: "Avg. match time", icon: Zap, color: "from-emerald-500 to-teal-500" },
  { k: "95%", v: "Match confidence", icon: Target, color: "from-indigo-500 to-violet-500" },
  { k: "40+", v: "Campus pilots", icon: Users, color: "from-fuchsia-500 to-pink-500" },
  { k: "12k", v: "Gigs matched", icon: BarChart3, color: "from-amber-500 to-orange-500" },
];

export function WhatIs() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 border rounded-full px-3">
            What is CampusGigs
          </Badge>
          <h2 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
            AI-powered micro-job matching, built for campuses.
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            CampusGigs is a proof-of-concept platform where campus managers can
            post short-term jobs — moving equipment, organizing events,
            distributing flyers, assisting departments — and get instantly matched
            with the best students.
          </p>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Instead of scrolling through profiles, the system analyzes the job
            description against available student profiles and produces a ranked
            list of the best candidates in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((s) => (
            <Card
              key={s.v}
              className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition"
            >
              <CardContent className="p-6">
                <div
                  className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}
                >
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                  {s.k}
                </div>
                <div className="text-sm text-slate-500 mt-1">{s.v}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
