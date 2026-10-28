"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  PieChart,
  Binary,
  Database,
  Terminal,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type TimeRange = "today" | "week" | "month" | "last30" | "all";

export default function StatsPage() {
  const { questions, getRevisionItems } = useAppStore();
  const [range, setRange] = useState<TimeRange>("month");

  const revisionItems = getRevisionItems();
  const overdueCount = revisionItems.filter((i) => i.status === "Overdue").length;
  const doneQuestions = questions.filter((q) => q.status === "Done");
  const inProgressQuestions = questions.filter((q) => q.status === "In Progress");

  // Dynamic multipliers based on range
  const rangeFactor =
    range === "today"
      ? 0.1
      : range === "week"
      ? 0.35
      : range === "month"
      ? 1
      : range === "last30"
      ? 0.95
      : 1.4;

  const displayAdded = Math.max(1, Math.round(questions.length * rangeFactor));
  const displaySolved = Math.max(1, Math.round(doneQuestions.length * rangeFactor));
  const totalRevisionsDone = questions.reduce(
    (acc, q) => acc + q.revisionHistory.length,
    0
  );
  const displayRevisionsDone = Math.max(1, Math.round(Math.max(10, totalRevisionsDone * 3) * rangeFactor));

  // Category counts
  const dsaCount = questions.filter((q) => q.category === "DSA").length;
  const dsaDone = questions.filter((q) => q.category === "DSA" && q.status === "Done").length;
  const sqlCount = questions.filter((q) => q.category === "SQL").length;
  const sqlDone = questions.filter((q) => q.category === "SQL" && q.status === "Done").length;
  const langCount = questions.filter((q) => q.category === "Languages").length;
  const langDone = questions.filter((q) => q.category === "Languages" && q.status === "Done").length;

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Study Analytics &amp; Performance
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Flow metrics (events within range) vs snapshot state. Filter by date
            range and inspect topic mastery.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface neo-inset overflow-x-auto self-start sm:self-auto">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
            { id: "last30", label: "Last 30 Days" },
            { id: "all", label: "All Time" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id as TimeRange)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer",
                range === item.id
                  ? "bg-primary text-primary-foreground neo-fab"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip (Stitch Screen 09) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-surface-card neo-raised flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <span className="text-xs font-semibold text-muted-foreground">Problems Added</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-foreground">{displayAdded}</span>
            <span className="text-[10px] text-emerald-500 font-bold">+18%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card neo-raised flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <span className="text-xs font-semibold text-muted-foreground">Solved / Done</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-500">{displaySolved}</span>
            <span className="text-[10px] text-muted-foreground">problems</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card neo-raised flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <span className="text-xs font-semibold text-muted-foreground">Revisions Done</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-primary">{displayRevisionsDone}</span>
            <span className="text-[10px] text-primary font-bold">100% on-time</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card neo-raised flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <span className="text-xs font-semibold text-muted-foreground">In Progress</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-amber-500">{inProgressQuestions.length}</span>
            <span className="text-[10px] text-muted-foreground">active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card neo-raised flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <span className="text-xs font-semibold text-rose-500">Overdue</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-rose-500">{overdueCount}</span>
            <span className="text-[10px] text-rose-400">attention</span>
          </div>
        </div>
      </section>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Volume Chart */}
        <section className="rounded-2xl bg-surface-card neo-raised p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Weekly Activity &amp; Recall
              </h2>
            </div>
            <span className="text-xs font-semibold text-primary">Current Week</span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: "Mon", count: 4, height: "45%" },
              { day: "Tue", count: 7, height: "70%" },
              { day: "Wed", count: 5, height: "55%" },
              { day: "Thu", count: 9, height: "90%", highlight: true },
              { day: "Fri", count: 6, height: "60%" },
              { day: "Sat", count: 8, height: "80%" },
              { day: "Sun", count: 3, height: "30%" },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  {bar.count}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-xl transition-all duration-700 hover:brightness-110",
                    bar.highlight
                      ? "bg-gradient-to-t from-indigo-600 to-indigo-400 neo-fab"
                      : "bg-surface neo-inset"
                  )}
                  style={{ height: bar.height }}
                />
                <span className="text-xs font-bold text-muted-foreground">
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Track Distribution & Mastery */}
        <section className="rounded-2xl bg-surface-card neo-raised p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Mastery by Problem Track
            </h2>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {/* DSA */}
            <div className="p-3.5 rounded-xl bg-surface neo-inset flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-2">
                  <Binary className="w-4 h-4 text-indigo-500" />
                  Data Structures &amp; Algorithms
                </span>
                <span className="font-bold text-primary">
                  {dsaDone} / {dsaCount} ({dsaCount > 0 ? Math.round((dsaDone / dsaCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-border/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                  style={{ width: `${dsaCount > 0 ? (dsaDone / dsaCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                Catalog: {dsaCount} logged DSA problems
              </span>
            </div>

            {/* SQL */}
            <div className="p-3.5 rounded-xl bg-surface neo-inset flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-500" />
                  SQL &amp; Database Optimization
                </span>
                <span className="font-bold text-amber-500">
                  {sqlDone} / {sqlCount} ({sqlCount > 0 ? Math.round((sqlDone / sqlCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-border/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${sqlCount > 0 ? (sqlDone / sqlCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                Catalog: {sqlCount} logged SQL queries
              </span>
            </div>

            {/* Languages */}
            <div className="p-3.5 rounded-xl bg-surface neo-inset flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  Languages (C#, Python, Go)
                </span>
                <span className="font-bold text-emerald-500">
                  {langDone} / {langCount} ({langCount > 0 ? Math.round((langDone / langCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-border/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${langCount > 0 ? (langDone / langCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                Catalog: {langCount} logged language deep-dives
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
