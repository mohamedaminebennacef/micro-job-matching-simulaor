"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  Briefcase,
  FileText,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
}

const managerNav: NavItem[] = [
  { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
  { label: "Create Gig", href: "/manager/gigs/create", icon: PlusCircle },
  { label: "Gig History", href: "/manager/gigs", icon: History },
  { label: "Profile", href: "/manager/profile", icon: User },
];

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "Assigned Gigs", href: "/student/assigned", icon: Briefcase },
  { label: "History", href: "/student/history", icon: FileText },
  { label: "Profile", href: "/student/profile", icon: User },
];

function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const nav = user?.role === "MANAGER" ? managerNav : studentNav;
  const homeHref = user?.role === "MANAGER" ? "/manager" : "/student";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Link href={homeHref as Route}>
          <span className="text-lg font-bold gradient-text">CampusGigs</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {nav.map((item) => {
          const isActive =
            item.href === homeHref
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-semibold text-white">
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {user?.role === "MANAGER" ? "Manager" : "Student"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export { Sidebar };
