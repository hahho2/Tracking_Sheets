"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  RotateCcw,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Check,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAppStore, Question } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import { RescheduleModal } from "@/components/revisions/reschedule-modal";
import { MarkRevisedModal } from "@/components/revisions/mark-revised-modal";

type RevisionTab =
  | "all_due"
  | "today"
  | "overdue"
  | "tomorrow"
  | "upcoming"
  | "history";

export default function RevisionCenterPage() {
  const { questions, getRevisionItems } = useAppStore();
  const [activeTab, setActiveTab] = useState<RevisionTab>("all_due");
  const [rescheduleTarget, setRescheduleTarget] = useState<Question | null>(null);
  const [markRevisedTarget, setMarkRevisedTarget] = useState<Question | null>(null);

  const items = getRevisionItems();

  const todayItems = items.filter((i) => i.status === "Today");
  const overdueItems = items.filter((i) => i.status === "Overdue");
  const tomorrowItems = items.filter((i) => i.status === "Tomorrow");
  const upcomingItems = items.filter((i) => i.status === "Upcoming");
  const allDueItems = [...overdueItems, ...todayItems];

  // Aggregated revision history across all questions
  const allHistory = questions.flatMap((q) =>
    q.revisionHistory.map((h) => ({
      ...h,
      questionTitle: q.title,
      questionId: q.id,
      category: q.category,
    }))
  ).sort((a, b) => (b.date > a.date ? 1 : -1));

  const getFilteredItems = () => {
    switch (activeTab) {
      case "all_due":
        return allDueItems;
      case "today":
        return todayItems;
      case "overdue":
        return overdueItems;
      case "tomorrow":
        return tomorrowItems;
      case "upcoming":
        return upcomingItems;
      default:
        return allDueItems;
    }
  };

  const displayList = getFilteredItems();

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <span>Revision Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface neo-inset font-bold text-primary">
              {allDueItems.length} Due Now
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dynamic timezone-aware spaced repetition engine (ADR-006). Never miss an active recall curve.
          </p>
        </div>
      </div>

      {/* 2. Revision Metric Cards (Stitch Component) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Due Today */}
        <div
          onClick={() => setActiveTab("today")}
          className={cn(
            "rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:-translate-y-0.5",
            activeTab === "today"
              ? "bg-surface neo-inset ring-2 ring-primary"
              : "bg-surface-card neo-raised"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Due Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface neo-inset flex items-center justify-center text-primary">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              {todayItems.length}
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Immediate action
            </span>
          </div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setActiveTab("overdue")}
          className={cn(
            "rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:-translate-y-0.5",
            activeTab === "overdue"
              ? "bg-surface neo-inset ring-2 ring-rose-500"
              : "bg-surface-card neo-raised"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Overdue
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface neo-inset flex items-center justify-center text-rose-500">
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

        {/* Tomorrow */}
        <div
          onClick={() => setActiveTab("tomorrow")}
          className={cn(
            "rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:-translate-y-0.5",
            activeTab === "tomorrow"
              ? "bg-surface neo-inset ring-2 ring-amber-500"
              : "bg-surface-card neo-raised"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Tomorrow
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface neo-inset flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {tomorrowItems.length}
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Upcoming tomorrow
            </span>
          </div>
        </div>

        {/* Upcoming */}
        <div
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:-translate-y-0.5",
            activeTab === "upcoming"
              ? "bg-surface neo-inset ring-2 ring-emerald-500"
              : "bg-surface-card neo-raised"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Upcoming
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface neo-inset flex items-center justify-center text-emerald-500">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {upcomingItems.length}
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium">
              Next 60 days
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all_due" as RevisionTab, label: "All Due Now", count: allDueItems.length },
          { id: "today" as RevisionTab, label: "Today", count: todayItems.length },
          { id: "overdue" as RevisionTab, label: "Overdue", count: overdueItems.length },
          { id: "tomorrow" as RevisionTab, label: "Tomorrow", count: tomorrowItems.length },
          { id: "upcoming" as RevisionTab, label: "Upcoming", count: upcomingItems.length },
          { id: "history" as RevisionTab, label: "Completed History", count: allHistory.length },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2",
                isSelected
                  ? "bg-surface neo-inset ring-2 ring-primary text-primary shadow-sm"
                  : "bg-surface-card neo-raised text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-extrabold",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface neo-inset text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Active List of Revisions or History */}
      <div className="rounded-2xl bg-surface-card neo-raised p-5 flex flex-col gap-4">
        {activeTab === "history" ? (
          /* History View */
          allHistory.length === 0 ? (
            <div className="p-12 rounded-xl bg-surface neo-inset text-center text-xs text-muted-foreground">
              No completed revisions logged yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allHistory.map((h, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface neo-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-card neo-raised flex items-center justify-center text-primary text-xs font-bold">
                      R{h.stage}
                    </div>
                    <div className="flex flex-col">
                      <Link
                        href={`/questions/${h.questionId}`}
                        className="text-xs font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {h.questionTitle}
                      </Link>
                      <span className="text-[11px] text-muted-foreground">
                        {h.category} &bull; Completed on {h.date}
                        {h.notes ? ` — "${h.notes}"` : ""}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold self-start sm:self-auto",
                      h.difficulty === "Easy"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : h.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}
                  >
                    Recall: {h.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : /* Queue View */
        displayList.length === 0 ? (
          <div className="p-12 rounded-xl bg-surface neo-inset text-center flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">
              No revisions in this filter
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              All caught up! Keep practicing new problems to feed your spaced repetition curve.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayList.map((item) => (
              <div
                key={item.question.id}
                className="p-4 rounded-xl bg-surface neo-inset flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl neo-raised flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold",
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
                          "px-2 py-0.5 rounded text-[10px] font-bold border",
                          item.question.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : item.question.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        )}
                      >
                        {item.question.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-card text-muted-foreground border border-border">
                        {item.question.category} &bull; {item.question.topic}
                      </span>
                      {item.status === "Overdue" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                          Overdue
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      Due Date: <strong className="text-foreground">{item.dueDate}</strong> &bull; Total revisions completed: {item.question.revisionHistory.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setRescheduleTarget(item.question)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-surface-card border border-border transition-colors cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkRevisedTarget(item.question)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground neo-fab hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Mark Revised
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
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
