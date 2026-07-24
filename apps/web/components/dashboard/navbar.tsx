"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";

function getBreadcrumbs(pathname: string): string[] {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "));
}

function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-border">/</span>}
            <span className={i === crumbs.length - 1 ? "font-medium text-foreground" : ""}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{user?.email}</span>
        <Avatar
          name={user?.email ?? "User"}
          size="sm"
        />
      </div>
    </header>
  );
}

export { Navbar };
