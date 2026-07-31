"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-context";
import { getProfile } from "@/lib/api";
import type { UserProfile } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ManagerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRoles={["MANAGER"]}>
      <DashboardLayout breadcrumb="Profile" title="Your profile">
        {loading ? (
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
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
                    <Avatar name={user?.email ?? "Manager"} size="lg" className="h-20 w-20 border-4 border-white shadow-md dark:border-slate-900" />
                    <div className="pb-1 min-w-0">
                      <p className="truncate text-lg font-semibold">{user?.email?.split("@")[0]}</p>
                      <Badge variant="secondary" className="mt-1">Manager</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold">Account Details</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Email</span>
                    <span className="text-sm font-medium">{profile?.email ?? user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Role</span>
                    <span className="text-sm font-medium">Manager</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Member Since</span>
                    <span className="text-sm font-medium">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold">Activity</h2>
                <p className="mt-2 text-sm text-slate-500">
                  As a manager, you can create gigs, review AI-ranked candidates,
                  and assign student workers.
                </p>
              </section>

              <div className="flex justify-end">
                <Button className="rounded-lg bg-slate-900 hover:bg-slate-800">Save changes</Button>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold">Profile completion</p>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-semibold">100<span className="text-base text-slate-400">%</span></span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
