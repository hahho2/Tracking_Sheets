"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Terminal,
  Search,
  Plus,
  Moon,
  Sun,
  Flame,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { logout } from "@/app/actions/auth";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { streak } = useAppStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const mounted = true;

  const getPageTitle = () => {
    if (!pathname) return "Dashboard";
    if (pathname.startsWith("/questions/new")) return "Add New Question";
    if (pathname.startsWith("/questions/")) return "Problem Details";
    if (pathname.startsWith("/questions")) return "My Questions";
    if (pathname.startsWith("/revisions")) return "Revision Center";
    if (pathname.startsWith("/stats")) return "Analytics & Stats";
    if (pathname.startsWith("/activity")) return "Activity & Streaks";
    if (pathname.startsWith("/settings")) return "Settings & Preferences";
    return "Dashboard";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / Dynamic Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-card neo-raised flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                CodeTrack
              </span>
              <span className="text-sm font-bold text-foreground leading-tight">
                {getPageTitle()}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search (visible on tablet/desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center w-80 lg:w-96"
        >
          <div className="relative w-full flex items-center h-10 px-3.5 rounded-xl bg-surface neo-inset gap-2.5 transition-all focus-within:ring-2 focus-within:ring-primary/40">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems, topics, notes..."
              className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground font-medium"
            />
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-pointer hover:text-foreground" />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Streak pill */}
          <Link
            href="/activity"
            title={`Current Streak: ${streak} Active Days`}
            className="h-9 px-3 rounded-full bg-surface neo-inset flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-foreground tracking-tight">
              {streak}d
            </span>
          </Link>

          {/* Add Question Button */}
          {!pathname.startsWith("/problems") && <Link href="/questions/new" className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold neo-fab hover:brightness-110 active:scale-95 transition-all"><Plus className="w-4 h-4" /><span>Add Question</span></Link>}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-xl bg-surface-card neo-raised flex items-center justify-center text-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* User Profile avatar */}
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center neo-raised hover:scale-105 transition-transform"
          >
            <User className="w-4 h-4" />
          </Link>
          <button onClick={() => void logout()} className="text-xs font-bold text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </div>
    </header>
  );
}
