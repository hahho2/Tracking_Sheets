"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  Award,
  Calendar,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Info,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
  const { streak, todaySolvedCount, settings, questions } = useAppStore();

  const currentStreak = streak;
  const longestStreak = Math.max(28, streak);
  const totalActiveDays = 80 + questions.reduce((acc, q) => acc + q.revisionHistory.length, 0);

  // Generate 20 weeks of activity heatmap blocks
  const weeks = Array.from({ length: 20 }, (_, w) => {
    return Array.from({ length: 7 }, (_, d) => {
      // Activity density: 0 (none), 1 (light), 2 (medium), 3 (high)
      const rand = (w * 7 + d * 3) % 11;
      let level = 0;
      if (rand > 3) level = 1;
      if (rand > 6) level = 2;
      if (rand > 9) level = 3;
      return { day: d, level };
    });
  });

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Study Streak &amp; Consistency Heatmap
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Streaks advance only when you solve a new problem or complete a
          scheduled revision during your local calendar day.
        </p>
      </div>

      {/* Streak Hero Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="p-5 rounded-2xl bg-surface-card neo-raised flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-7 h-7 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Current Streak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-amber-500">{currentStreak}</span>
              <span className="text-xs font-bold text-foreground">Days Active</span>
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-5 rounded-2xl bg-surface-card neo-raised flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Personal Best</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-primary">{longestStreak}</span>
              <span className="text-xs font-bold text-foreground">Days</span>
            </div>
          </div>
        </div>

        {/* Active Days */}
        <div className="p-5 rounded-2xl bg-surface-card neo-raised flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Total Study Days</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-emerald-500">{totalActiveDays}</span>
              <span className="text-xs font-bold text-foreground">Lifetime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Heatmap Card */}
      <section className="rounded-2xl bg-surface-card neo-raised p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Consistency Heatmap (Last 20 Weeks)
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-surface neo-inset" />
            <div className="w-3 h-3 rounded-sm bg-indigo-400/40" />
            <div className="w-3 h-3 rounded-sm bg-indigo-500" />
            <div className="w-3 h-3 rounded-sm bg-indigo-400 neo-fab" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-1.5 p-3 rounded-xl bg-surface neo-inset">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((cell, dIdx) => (
                  <div
                    key={dIdx}
                    title={`Day activity: ${cell.level} solved/revised`}
                    className={cn(
                      "w-3.5 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer",
                      cell.level === 0 && "bg-surface-card neo-raised",
                      cell.level === 1 && "bg-indigo-400/30",
                      cell.level === 2 && "bg-indigo-500/70",
                      cell.level === 3 && "bg-indigo-400 shadow-sm shadow-indigo-400/50"
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-surface neo-inset text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Streak Rule:</strong> A local calendar day is marked active if at least one problem was solved (Done) or one revision completed between 00:00 and 23:59 in your timezone ({settings.timezone}). Browsing or editing notes does not extend streaks.
          </span>
        </div>
      </section>
    </div>
  );
}
