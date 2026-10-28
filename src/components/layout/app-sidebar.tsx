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
  Flame,
  Settings,
  PlusCircle,
  FolderGit2,
  Library,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export function AppSidebar() {
  const pathname = usePathname();
  const { questions, getRevisionItems, todaySolvedCount, settings } = useAppStore();

  const revisionItems = getRevisionItems();
  const dueCount = revisionItems.filter(
    (item) => item.status === "Today" || item.status === "Overdue"
  ).length;

  const targetPercentage = Math.round(
    Math.min(100, (todaySolvedCount / Math.max(1, settings.dailyTarget)) * 100)
  );

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Questions",
      href: "/questions",
      icon: Code2,
      badge: `${questions.length}`,
    },
    {
      label: "Problem Catalogue",
      href: "/problems",
      icon: Library,
    },
    {
      label: "Revision Center",
      href: "/revisions",
      icon: CalendarClock,
      badge: `${dueCount} due`,
      highlight: dueCount > 0,
    },
    {
      label: "Analytics & Stats",
      href: "/stats",
      icon: BarChart3,
    },
    {
      label: "Activity & Streaks",
      href: "/activity",
      icon: Flame,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/40 bg-background/50 backdrop-blur-md p-4 space-y-6">
      {/* Brand Badge */}
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <FolderGit2 className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground tracking-tight">
            CodeTrack Workspace
          </span>
          <span className="text-[10px] text-muted-foreground">Personal Track</span>
        </div>
      </div>

      {/* Quick Add Action Card */}
      {!pathname.startsWith("/problems") && <div className="p-3.5 rounded-2xl bg-surface-card neo-raised flex flex-col gap-2">
        <span className="text-xs font-semibold text-foreground">
          Study Session
        </span>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Log problems solved and capture rich notes for revision.
        </p>
        <Link
          href="/questions/new"
          className="mt-1 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold neo-fab hover:brightness-105 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Question</span>
        </Link>
      </div>}

      {/* Main Navigation Links */}
      <nav className="flex flex-col space-y-1.5 flex-1">
        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Menu
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-surface neo-inset text-primary font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-card/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold transition-transform",
                    item.highlight
                      ? "bg-amber-500/15 text-amber-500 border border-amber-500/25"
                      : "bg-surface neo-inset text-muted-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Daily Progress Widget */}
      <div className="p-3.5 rounded-2xl bg-surface neo-inset flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">Today Goal</span>
          <span className="font-bold text-primary">{targetPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-border/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
            style={{ width: `${targetPercentage}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {todaySolvedCount} of {settings.dailyTarget} daily questions solved
        </span>
      </div>
    </aside>
  );
}
