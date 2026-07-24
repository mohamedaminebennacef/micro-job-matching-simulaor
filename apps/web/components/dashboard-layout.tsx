"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardShell } from "@/components/dashboard/shell";
import type { ReactNode } from "react";

export function DashboardLayout({
  children,
  breadcrumb,
  title,
  actions,
}: {
  children: ReactNode;
  breadcrumb?: string;
  title?: string;
  actions?: ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <DashboardShell {...(breadcrumb != null ? { breadcrumb } : {})} {...(title != null ? { title } : {})} {...(actions != null ? { actions } : {})}>
      {children}
    </DashboardShell>
  );
}
