import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const nav = [
    { label: "How it works", href: "#how" },
    { label: "Features", href: "#features" },
    { label: "Tech", href: "#tech" },
    { label: "Docs", href: "#footer" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-slate-900">
            CampusGigs
          </span>
          <Badge
            variant="secondary"
            className="ml-1 hidden sm:inline-flex text-[10px] font-medium bg-slate-100 text-slate-600 border-0"
          >
            beta
          </Badge>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="hover:text-slate-900 transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-slate-600"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
            >
              Get Started
              <span className="ml-1 h-3.5 w-3.5">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
