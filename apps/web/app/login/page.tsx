"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Trophy, Zap, GraduationCap, Briefcase, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<"manager" | "student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const user = await res.json();
        router.replace(user.role === "MANAGER" ? "/manager" : "/student");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2 bg-white text-slate-900">
      {/* Left — form */}
      <div className="flex flex-col p-6 lg:p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">CampusGigs</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center"
        >
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to your workspace to continue.
          </p>

          {/* Role selector cards */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            {[
              {
                id: "student" as const,
                icon: GraduationCap,
                title: "Student",
                desc: "Find campus gigs",
              },
              {
                id: "manager" as const,
                icon: Briefcase,
                title: "Manager",
                desc: "Post & assign gigs",
              },
            ].map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`group relative rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-slate-900 bg-slate-50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {active && (
                    <div className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-slate-900 text-white">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}
                  <r.icon className="h-5 w-5 text-slate-700" />
                  <p className="mt-2 text-sm font-medium">{r.title}</p>
                  <p className="text-[11px] text-slate-500">{r.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="my-6 flex items-center gap-3">
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                className="rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="ml-1.5 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-slate-900 hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>

        <p className="text-[11px] text-slate-400">© 2026 CampusGigs. All rights reserved.</p>
      </div>

      {/* Right — visual */}
      <div className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.35),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(217,164,65,0.25),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Sparkles className="h-4 w-4 text-amber-400" /> Trusted by 40+ campus teams
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Best match found</p>
                  <p className="text-xs text-white/50">Amina R. · 95% fit</p>
                </div>
                <div className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  +12% vs. avg
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Zap className="h-3.5 w-3.5 text-indigo-300" /> AI evaluating 24 candidates…
              </div>
              <div className="mt-3 space-y-2">
                {[92, 88, 84].map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-white/10" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${v}%` }}
                        transition={{ delay: 0.9 + i * 0.15, duration: 0.8 }}
                        className="h-full bg-white/60"
                      />
                    </div>
                    <span className="w-8 text-right text-xs tabular-nums text-white/60">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <blockquote className="max-w-md">
            <p className="text-lg font-medium leading-snug text-white/90">
              &quot;We filled a semester&apos;s worth of gigs in under an hour. The matches were shockingly on-point.&quot;
            </p>
            <footer className="mt-3 text-xs text-white/50">
              Campus Manager · ETH Zürich
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
