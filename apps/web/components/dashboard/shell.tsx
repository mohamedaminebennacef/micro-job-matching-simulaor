"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Briefcase,
  ChevronsUpDown,
  Command,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type Role = "MANAGER" | "STUDENT";

const managerNav = [
  { title: "Dashboard", href: "/manager" as Route, icon: LayoutDashboard },
  { title: "Create Gig", href: "/manager/gigs/create" as Route, icon: PlusCircle },
  { title: "Gig History", href: "/manager/gigs" as Route, icon: History },
  { title: "Profile", href: "/manager/profile" as Route, icon: User },
];

const studentNav = [
  { title: "Dashboard", href: "/student" as Route, icon: LayoutDashboard },
  { title: "Assigned Gigs", href: "/student/assigned" as Route, icon: Briefcase },
  { title: "History", href: "/student/history" as Route, icon: History },
  { title: "Profile", href: "/student/profile" as Route, icon: User },
];

export function DashboardShell({
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
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const role: Role = user?.role ?? "MANAGER";
  const nav = role === "MANAGER" ? managerNav : studentNav;
  const homeHref = role === "MANAGER" ? "/manager" : "/student";

  useEffect(() => {
    const t = typeof window !== "undefined" && localStorage.getItem("cg_theme");
    if (t === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("cg_theme", next);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200/80 px-5 dark:border-slate-800">
          <Link href={homeHref as Route} className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-sm dark:from-white dark:to-slate-300 dark:text-slate-900">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">CampusGigs</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                {role === "MANAGER" ? "Manager" : "Student"} Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4", active ? "" : "text-slate-400 group-hover:text-slate-600")} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 p-3">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold">Pro tips</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Add detailed skills to gigs for sharper AI matches.
            </p>
          </div>
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="z-40 isolate flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/70 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/50 lg:px-8">
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
              <Link href={homeHref as Route} className="hover:text-slate-900 dark:hover:text-white">
                CampusGigs
              </Link>
              {breadcrumb && (
                <>
                  <span>/</span>
                  <span className="text-slate-900 dark:text-white font-medium">{breadcrumb}</span>
                </>
              )}
            </div>
            <div className="relative ml-auto max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search gigs, students, skills…"
                className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 pr-16 text-sm shadow-none focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 md:flex dark:border-slate-700 dark:bg-slate-800">
                <Command className="h-3 w-3" /> K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Avatar name={user?.email ?? "User"} size="sm" />
                  <span className="hidden text-sm font-medium md:block">{user?.email?.split("@")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.email?.split("@")[0]}</span>
                    <span className="text-xs text-slate-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`${homeHref}/profile` as Route)}>
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Page header — scrolls with content */}
          {(title || actions) && (
            <div className="border-b border-slate-200/80 bg-white/40 px-4 py-6 dark:border-slate-800 dark:bg-slate-900/30 lg:px-8">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  {title && (
                    <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
                  )}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
              </div>
            </div>
          )}

          {/* Content */}
          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 pb-24 lg:p-8"
          >
            {children}
          </motion.main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white/90 px-2 py-2 backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
          {nav.slice(0, 4).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium",
                  active ? "text-slate-900 dark:text-white" : "text-slate-400"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: string; positive?: boolean };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 transition-colors">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        {trend && (
          <Badge
            variant="secondary"
            className={cn(
              "font-medium",
              trend.positive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
            )}
          >
            {trend.value}
          </Badge>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </motion.div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-slate-100 to-white text-slate-500 shadow-xs dark:from-slate-800 dark:to-slate-900">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
