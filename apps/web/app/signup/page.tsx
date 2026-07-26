"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Briefcase,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<"student" | "manager">("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, role === "manager" ? "MANAGER" : "STUDENT");
      toast.success("Account created! Welcome to CampusGigs.");
      router.replace(role === "manager" ? "/manager" : "/student");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Start matching in under 60 seconds.
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

          <div className="my-5 flex items-center gap-3">
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first">First name</Label>
                <Input
                  id="first"
                  placeholder="Alex"
                  className="rounded-lg"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last">Last name</Label>
                <Input
                  id="last"
                  placeholder="Kim"
                  className="rounded-lg"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email2">School email</Label>
              <Input
                id="email2"
                type="email"
                placeholder="alex@university.edu"
                className="rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw">Password</Label>
              <Input
                id="pw"
                type="password"
                placeholder="At least 6 characters"
                className="rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="ml-1.5 h-4 w-4" />}
            </Button>
            <p className="text-center text-[11px] text-slate-400">
              By continuing you agree to our Terms & Privacy Policy.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-900 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>

        <p className="text-[11px] text-slate-400">© 2026 CampusGigs.</p>
      </div>

      {/* Right — visual */}
      <div className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(217,164,65,0.3),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.35),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/70 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
              at 40+ universities
            </div>
            <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
              Post a gig. Get ranked students. Assign in one click.
            </h2>
            <p className="max-w-sm text-sm text-white/60">
              Our AI reads job requirements, weighs 30+ signals per student, and
              returns a leaderboard in seconds.
            </p>
            <div className="grid gap-2 pt-4">
              {[
                "No manual screening",
                "Explainable match reasoning",
                "One-click assignment",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-white/80"
                >
                  <Check className="h-4 w-4 text-emerald-400" /> {f}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
