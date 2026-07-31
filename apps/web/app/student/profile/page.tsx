"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile } from "@/lib/api";
import { toast } from "sonner";
import type { StudentProfile } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ChipInput } from "@/components/ui/chip-input";
import { Camera, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</Label>
      {children}
    </div>
  );
}

function Check({ label, done }: { label: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`grid h-4 w-4 place-items-center rounded-full text-[9px] ${done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
        {done ? "✓" : "•"}
      </span>
      <span className={done ? "text-slate-600 dark:text-slate-300" : "text-slate-500"}>{label}</span>
    </li>
  );
}

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState(2027);
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [preferredWorkTypes, setPreferredWorkTypes] = useState<string[]>([]);

  useEffect(() => {
    getProfile()
      .then((p) => {
        const s = p.student;
        if (s) {
          setProfile(s);
          setFullName(s.fullName);
          setMajor(s.major);
          setGraduationYear(s.graduationYear);
          setBio(s.bio);
          setExperience(s.experience);
          setSkills(s.skills);
          setInterests(s.interests);
          setAvailability(s.availability ?? "");
          setPreferredWorkTypes(s.preferredWorkTypes);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const profileComplete = profile
    ? Math.round(
        ([
          fullName !== "Student",
          major !== "Undeclared",
          bio !== "",
          experience !== "",
          skills.length > 0,
          interests.length > 0,
        ].filter(Boolean).length / 6) * 100
      )
    : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({
        fullName, major, graduationYear, bio, experience,
        skills, interests,
        availability: availability || null,
        preferredWorkTypes,
      });
      setProfile(updated);
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <DashboardLayout breadcrumb="Profile" title="Your profile">
        {loading ? (
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Main form */}
            <div className="space-y-6">
              {/* Header card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400" />
                <div className="px-6 pb-6">
                  <div className="-mt-10 flex items-end gap-4">
                    <div className="relative">
                      <Avatar name={fullName || "Student"} size="lg" className="h-20 w-20 border-4 border-white shadow-md dark:border-slate-900" />
                      <button className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-900" aria-label="Change photo">
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="pb-1 min-w-0">
                      <p className="truncate text-lg font-semibold">{fullName || "Student"}</p>
                      <p className="text-sm text-slate-500">{major || "No major set"} · {graduationYear}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basics */}
                <Section title="About you">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="rounded-lg" />
                  </Field>
                  <Field label="Graduation year">
                    <Input type="number" value={graduationYear} onChange={(e) => setGraduationYear(Number(e.target.value))} className="rounded-lg" />
                  </Field>
                  <Field label="Major">
                    <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Computer Science" className="rounded-lg" />
                  </Field>
                </div>
                <Field label="Bio">
                  <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="rounded-lg" />
                </Field>
                <Field label="Experience">
                  <Textarea rows={3} value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Previous work, projects, volunteering..." className="rounded-lg" />
                </Field>
              </Section>

              {/* Skills */}
              <Section title="Skills">
                <ChipInput value={skills} onChange={setSkills} placeholder="Add a skill…" />
              </Section>

              {/* Interests */}
              <Section title="Interests">
                <ChipInput value={interests} onChange={setInterests} placeholder="Add an interest…" />
              </Section>

              {/* Availability */}
              <Section title="Availability">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Hours per week">
                    <Input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Weekdays 9am-5pm" className="rounded-lg" />
                  </Field>
                  <Field label="Preferred work types">
                    <ChipInput value={preferredWorkTypes} onChange={setPreferredWorkTypes} placeholder="Add a work type…" />
                  </Field>
                </div>
              </Section>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="rounded-lg bg-slate-900 hover:bg-slate-800">
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="lg:sticky lg:top-4 space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold">Profile completion</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-semibold">{profileComplete}<span className="text-base text-slate-400">%</span></span>
                    </div>
                    <Progress value={profileComplete} className="mt-3 h-1.5" />
                  </div>
                  <ul className="mt-5 space-y-2 text-xs">
                    <Check label="Basics complete" done={fullName !== "Student" && major !== "Undeclared"} />
                    <Check label="Skills added" done={skills.length > 0} />
                    <Check label="Bio written" done={bio !== ""} />
                    <Check label="Experience added" done={experience !== ""} />
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/60">This week</p>
                  <p className="mt-2 text-2xl font-semibold">{skills.length} skills</p>
                  <p className="mt-1 text-xs text-white/60">In your profile</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
