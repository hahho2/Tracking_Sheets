"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  SlidersHorizontal,
  ExternalLink,
  Code2,
  CheckCircle2,
  Clock,
  CircleDashed,
  RotateCcw,
  Sparkles,
  Trash2,
  Filter,
} from "lucide-react";
import { useAppStore, Category, Status, Difficulty } from "@/lib/store";
import { cn, formatTimeAgo } from "@/lib/utils";

export default function QuestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const { questions, updateQuestion, deleteQuestion } = useAppStore();
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recently_active" | "title" | "difficulty">("recently_active");

  // Extract all unique topics
  const allTopics = useMemo(() => {
    const set = new Set(questions.map((q) => q.topic));
    return ["All", ...Array.from(set)];
  }, [questions]);

  // Filter & Sort
  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        const matchesSearch =
          q.title.toLowerCase().includes(search.toLowerCase()) ||
          q.topic.toLowerCase().includes(search.toLowerCase()) ||
          (q.notes && q.notes.toLowerCase().includes(search.toLowerCase())) ||
          q.sources.some((s) => s.platformQuestionId?.toLowerCase().includes(search.toLowerCase()));

        const matchesCategory =
          selectedCategory === "All" || q.category === selectedCategory;
        const matchesStatus =
          selectedStatus === "All" || q.status === selectedStatus;
        const matchesDifficulty =
          selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
        const matchesTopic =
          selectedTopic === "All" || q.topic === selectedTopic;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesDifficulty &&
          matchesTopic
        );
      })
      .sort((a, b) => {
        if (sortBy === "recently_active") {
          return (
            new Date(b.lastActivityAt).getTime() -
            new Date(a.lastActivityAt).getTime()
          );
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "difficulty") {
          const diffMap: Record<Difficulty, number> = {
            Easy: 1,
            Medium: 2,
            Hard: 3,
          };
          return diffMap[a.difficulty] - diffMap[b.difficulty];
        }
        return 0;
      });
  }, [
    questions,
    search,
    selectedCategory,
    selectedStatus,
    selectedDifficulty,
    selectedTopic,
    sortBy,
  ]);

  const handleStatusChange = (id: string, newStatus: Status) => {
    updateQuestion(id, { status: newStatus });
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <span>My Questions Library</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface neo-inset font-bold text-primary">
              {filteredQuestions.length}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your DSA, SQL, and language problem catalog with spaced repetition schedules.
          </p>
        </div>

        <Link
          href="/questions/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold neo-fab hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </Link>
      </div>

      {/* 2. Category Selector Tabs (Stitch Component) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["All", "DSA", "SQL", "Languages"] as const).map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                isSelected
                  ? "bg-surface neo-inset ring-2 ring-primary text-primary shadow-sm"
                  : "bg-surface-card neo-raised text-muted-foreground hover:text-foreground"
              )}
            >
              {cat === "All" ? "All Tracks" : cat}
            </button>
          );
        })}
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface-card neo-raised flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <div className="flex items-center w-full h-10 px-3.5 rounded-xl bg-surface neo-inset gap-2.5 transition-all focus-within:ring-2 focus-within:ring-primary/40">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems, topics, notes, platform IDs..."
              className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Topic Dropdown */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="h-10 px-3 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none cursor-pointer"
          >
            <option value="All">All Topics</option>
            {allTopics
              .filter((t) => t !== "All")
              .map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 px-3 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Done">Done</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Started">Not Started</option>
            <option value="Skipped">Skipped</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recently_active" | "title" | "difficulty")}
            className="h-10 px-3 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none cursor-pointer"
          >
            <option value="recently_active">Recently Active</option>
            <option value="title">Alphabetical</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>
      </div>

      {/* 4. Question Table & List */}
      <div className="rounded-2xl bg-surface-card neo-raised p-5 flex flex-col gap-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 rounded-xl bg-surface neo-inset text-center flex flex-col items-center justify-center gap-3">
            <Code2 className="w-10 h-10 text-muted-foreground opacity-60" />
            <h3 className="text-sm font-bold text-foreground">
              No questions found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Your personal tracker is empty. Browse the imported LeetCode catalogue to add a problem here.
            </p>
            <div className="mt-2 flex gap-2">
              <Link href="/problems" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold neo-fab">Browse catalogue</Link>
              <Link href="/questions/new" className="px-4 py-2 rounded-xl bg-surface-card neo-raised text-xs font-bold">Add Question</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Title &amp; Source</th>
                  <th className="pb-3 font-bold">Category &amp; Topic</th>
                  <th className="pb-3 font-bold">Difficulty</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Revision Due</th>
                  <th className="pb-3 font-bold">Last Active</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredQuestions.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-surface/40 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/questions/${q.id}`)}
                  >
                    {/* Title */}
                    <td className="py-3.5 pr-3 font-bold text-foreground group-hover:text-primary transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm leading-tight flex items-center gap-1.5">
                          {q.title}
                          {q.sources[0]?.url && (
                            <a
                              href={q.sources[0].url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-primary inline-flex items-center"
                              title={`Open on ${q.sources[0].platform}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </span>
                        {q.sources[0]?.platform && (
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {q.sources[0].platform}{" "}
                            {q.sources[0].platformQuestionId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category & Topic */}
                    <td className="py-3.5 pr-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface neo-inset text-muted-foreground">
                        {q.category} &bull; {q.topic}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 pr-3">
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

                    {/* Status Toggle Dropdown */}
                    <td className="py-3.5 pr-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value as Status)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[11px] font-bold border-none outline-none cursor-pointer bg-surface neo-inset",
                          q.status === "Done"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : q.status === "In Progress"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        )}
                      >
                        <option value="Done">✓ Done</option>
                        <option value="In Progress">⏳ In Progress</option>
                        <option value="Not Started">○ Not Started</option>
                        <option value="Skipped">⊘ Skipped</option>
                      </select>
                    </td>

                    {/* Revision Due */}
                    <td className="py-3.5 pr-3">
                      <span className="text-[11px] font-semibold text-foreground">
                        {q.nextDueDate || "Not scheduled"}
                      </span>
                      <span className="text-[10px] block text-muted-foreground">
                        Stage: R{q.revisionStage}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td suppressHydrationWarning className="py-3.5 pr-3 text-muted-foreground">
                      {formatTimeAgo(q.lastActivityAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/questions/${q.id}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete problem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
