"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: Route;
}

const managerNav: NavItem[] = [
  { label: "Dashboard", href: "/manager" },
  { label: "Create Gig", href: "/manager/gigs/create" },
  { label: "Gig History", href: "/manager/gigs" },
  { label: "Profile", href: "/manager/profile" },
];

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student" },
  { label: "Assigned Gigs", href: "/student/assigned" },
  { label: "History", href: "/student/history" },
  { label: "Profile", href: "/student/profile" },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const nav = user?.role === "MANAGER" ? managerNav : studentNav;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href={user?.role === "MANAGER" ? "/manager" : "/student"}>
          <span className="text-lg font-bold gradient-text">CampusGigs</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active =
            item.href === `/${user?.role}`
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <p className="mb-2 truncate px-3 text-xs text-muted-foreground">
          {user?.email}
        </p>
        <button
          onClick={signOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
