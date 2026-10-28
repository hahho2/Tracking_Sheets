"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Search,
  SlidersHorizontal,
  Target,
  Terminal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  Database,
  Binary,
} from "lucide-react";
import { useAppStore, Question } from "@/lib/store";
import { cn, formatTimeAgo } from "@/lib/utils";
import { RescheduleModal } from "@/components/revisions/reschedule-modal";
import { MarkRevisedModal } from "@/components/revisions/mark-revised-modal";

export default function DashboardPage() {
  const router = useRouter();
  const {
    questions,
    settings,
    streak,
    todaySolvedCount,
    getRevisionItems,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState<Question | null>(null);
  const [markRevisedTarget, setMarkRevisedTarget] = useState<Question | null>(null);

  // Critical Business Rule ADR-005: Sort questions by lastActivityAt DESC
  const recentlyActive = [...questions].sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );

  // Dynamic Metrics
  const totalQuestions = questions.length;
  const doneCount = questions.filter((q) => q.status === "Done").length;
  const inProgressCount = questions.filter((q) => q.status === "In Progress").length;

  const revisionItems = getRevisionItems();
  const dueTodayItems = revisionItems.filter((i) => i.status === "Today");
  const overdueItems = revisionItems.filter((i) => i.status === "Overdue");
  const urgentQueue = [...overdueItems, ...dueTodayItems];

  // Category counts
  const dsaCount = questions.filter((q) => q.category === "DSA").length;
  const dsaDone = questions.filter((q) => q.category === "DSA" && q.status === "Done").length;
  const sqlCount = questions.filter((q) => q.category === "SQL").length;
  const sqlDone = questions.filter((q) => q.category === "SQL" && q.status === "Done").length;
  const langCount = questions.filter((q) => q.category === "Languages").length;
  const langDone = questions.filter((q) => q.category === "Languages" && q.status === "Done").length;

  const targetPercentage = Math.round(
    Math.min(100, (todaySolvedCount / Math.max(1, settings.dailyTarget)) * 100)
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/questions?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Greeting & Daily Target Card */}
      <section className="w-full rounded-2xl bg-surface-card neo-raised p-5 sm:p-6 flex flex-col gap-4 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <span>Welcome back, {settings.name}</span>
              <Sparkles className="w-5 h-5 text-amber-500 hidden sm:inline" />
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface neo-inset">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {streak}d streak
              </span>
            </div>
            <Link
              href="/questions/new"
              className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              + Add
            </Link>
          </div>
        </div>

        {/* Soft Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-surface neo-inset gap-2.5 transition-all focus-within:ring-2 focus-within:ring-primary/40">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems, topics, notes (press Enter)..."
              className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground font-medium"
            />
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0 cursor-pointer" />
          </div>
        </form>

        {/* Daily Target Progress Bar */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Target className="w-4 h-4 text-primary" />
              Daily Target
            </span>
            <span className="font-bold text-foreground">
              {todaySolvedCount} / {settings.dailyTarget} solved{" "}
              <span className="text-primary font-bold">({targetPercentage}%)</span>
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-surface neo-inset p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700 shadow-sm shadow-primary/50"
              style={{ width: `${targetPercentage}%` }}
            />
          </div>
        </div>
      </section>

      {totalQuestions === 0 && <Link href="/problems" className="block p-4 rounded-2xl bg-primary/10 border border-primary/20 text-sm font-bold text-primary">Browse the imported LeetCode catalogue and add a DSA problem to your tracker →</Link>}

      {/* 2. Key Metrics Matrix */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 w-full">
        {/* Total Catalog */}
        <div className="rounded-xl bg-surface-card neo-raised p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Catalog
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface neo-inset flex items-center justify-center text-primary">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              {totalQuestions}
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Logged problems
            </span>
          </div>
        </div>

        {/* Done / Solved */}
        <div className="rounded-xl bg-surface-card neo-raised p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Completed
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface neo-inset flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {doneCount}
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Done ({totalQuestions > 0 ? Math.round((doneCount / totalQuestions) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl bg-surface-card neo-raised p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface neo-inset flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {inProgressCount}
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Actively learning
            </span>
          </div>
        </div>

        {/* Due Today */}
        <div className="rounded-xl bg-surface-card neo-raised p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Due Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface neo-inset flex items-center justify-center text-primary">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              {dueTodayItems.length}
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Revisions pending
            </span>
          </div>
        </div>

        {/* Overdue */}
        <div className="rounded-xl bg-surface-card neo-raised p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Overdue
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface neo-inset flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {overdueItems.length}
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Past scheduled date
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-xl bg-surface-card neo-raised p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Streak
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface neo-inset flex items-center justify-center text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-500 tracking-tight">
              {streak}d
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Consecutive days
            </span>
          </div>
        </div>
      </section>

      {/* 3. Revisions Due Today (Queue) & Category Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Due Revisions Queue */}
        <section className="lg:col-span-2 rounded-2xl bg-surface-card neo-raised p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Priority Revision Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {urgentQueue.length} Due
              </span>
            </div>
            <Link
              href="/revisions"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {urgentQueue.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface neo-inset text-center flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <h4 className="text-sm font-bold text-foreground">
                  You are completely caught up!
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  No revisions are due today. Log a new problem or review upcoming items in the Revision Center.
                </p>
              </div>
            ) : (
              urgentQueue.slice(0, 4).map((item) => (
                <div
                  key={item.question.id}
                  className="p-3.5 rounded-xl bg-surface neo-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-primary/40"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg neo-raised flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold",
                        item.status === "Overdue"
                          ? "text-rose-500 border border-rose-500/30"
                          : "text-primary"
                      )}
                    >
                      {item.stageLabel}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/questions/${item.question.id}`}
                          className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {item.question.title}
                        </Link>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                            item.question.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : item.question.difficulty === "Medium"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          )}
                        >
                          {item.question.difficulty}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-card text-muted-foreground border border-border">
                          {item.question.category} &bull; {item.question.topic}
                        </span>
                        {item.status === "Overdue" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                            Overdue
                          </span>
                        )}
                      </div>
                      <span suppressHydrationWarning className="text-xs text-muted-foreground mt-0.5">
                        Due: {item.dueDate} &bull; Last active: {formatTimeAgo(item.question.lastActivityAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setRescheduleTarget(item.question)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground bg-surface-card border border-border transition-colors cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkRevisedTarget(item.question)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground neo-fab hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Mark Revised
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Track Mastery Progress */}
        <section className="rounded-2xl bg-surface-card neo-raised p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Tracks Progress
              </h2>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="flex flex-col gap-4">
            {/* DSA */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5 text-indigo-500" />
                  Data Structures &amp; Algorithms
                </span>
                <span className="font-bold text-foreground">
                  {dsaDone} / {dsaCount} ({dsaCount > 0 ? Math.round((dsaDone / dsaCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface neo-inset overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${dsaCount > 0 ? (dsaDone / dsaCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* SQL */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  SQL &amp; Database Design
                </span>
                <span className="font-bold text-foreground">
                  {sqlDone} / {sqlCount} ({sqlCount > 0 ? Math.round((sqlDone / sqlCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface neo-inset overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${sqlCount > 0 ? (sqlDone / sqlCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Languages */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                  Languages (C#, Python, Go)
                </span>
                <span className="font-bold text-foreground">
                  {langDone} / {langCount} ({langCount > 0 ? Math.round((langDone / langCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface neo-inset overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${langCount > 0 ? (langDone / langCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall completion</span>
            <span className="font-bold text-foreground">
              {totalQuestions > 0 ? Math.round((doneCount / totalQuestions) * 100) : 0}%
            </span>
          </div>
        </section>
      </div>

      {/* 4. Recently Worked Questions Table */}
      <section className="rounded-2xl bg-surface-card neo-raised p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Recently Worked Problems</span>
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Ordered by lastActivityAt DESC (Critical Business Rule ADR-005)
            </span>
          </div>
          <Link
            href="/questions"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Title</th>
                <th className="pb-3 font-bold">Track &amp; Topic</th>
                <th className="pb-3 font-bold">Difficulty</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Last Activity</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {recentlyActive.slice(0, 6).map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-surface/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/questions/${q.id}`)}
                >
                  <td className="py-3 pr-3 font-bold text-foreground group-hover:text-primary transition-colors">
                    {q.title}{" "}
                    {q.sources[0]?.platformQuestionId && (
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {q.sources[0].platformQuestionId}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface neo-inset text-muted-foreground">
                      {q.category} &bull; {q.topic}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        q.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : q.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "text-[11px] font-semibold flex items-center gap-1.5",
                        q.status === "Done"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : q.status === "In Progress"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          q.status === "Done"
                            ? "bg-emerald-500"
                            : q.status === "In Progress"
                            ? "bg-amber-500"
                            : "bg-muted-foreground"
                        )}
                      />
                      {q.status}
                    </span>
                  </td>
                  <td suppressHydrationWarning className="py-3 pr-3 text-muted-foreground">
                    {formatTimeAgo(q.lastActivityAt)}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/questions/${q.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors inline-block"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Modals */}
      <RescheduleModal
        question={rescheduleTarget}
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
      />
      <MarkRevisedModal
        question={markRevisedTarget}
        isOpen={Boolean(markRevisedTarget)}
        onClose={() => setMarkRevisedTarget(null)}
      />
    </div>
  );
}
