"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Code2,
  CalendarClock,
  BarChart3,
} from "lucide-react";
import { QuickAddMenu } from "@/components/layout/quick-add-menu";

export function MobileNav() {
  const pathname = usePathname();

  const isCurrent = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50 px-4 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all",
            isCurrent("/dashboard")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </Link>

        {/* Questions */}
        <Link
          href="/questions"
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all",
            isCurrent("/questions") && pathname !== "/questions/new"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Code2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Questions</span>
        </Link>

        {/* Center Floating Plus Action */}
        <QuickAddMenu />

        {/* Revisions */}
        <Link
          href="/revisions"
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative",
            isCurrent("/revisions")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarClock className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Revisions</span>
          <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-amber-500" />
        </Link>

        {/* Stats */}
        <Link
          href="/stats"
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all",
            isCurrent("/stats")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Stats</span>
        </Link>
      </div>
    </nav>
  );
}
