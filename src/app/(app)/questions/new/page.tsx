"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Code2,
  Link2,
  FileText,
  Save,
} from "lucide-react";
import { useAppStore, Category, Difficulty, Status, QuestionSource } from "@/lib/store";
import { cn } from "@/lib/utils";

type ManualCategory = Exclude<Category, "DSA">;

const TOPICS_BY_CATEGORY: Record<ManualCategory, string[]> = {
  SQL: [
    "SELECT & Basic Filtering",
    "Aggregate Functions & GROUP BY",
    "Window Functions & Joins",
    "Subqueries & CTEs",
    "Database Indexing & Optimization",
    "Table Schema Design",
  ],
  Languages: [
    "OOP & Advanced C#",
    "Python Concurrency & Asyncio",
    "Go Routines & Channels",
    "TypeScript Generics & Types",
    "Memory Management & Pointers",
  ],
};

export default function AddQuestionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addQuestion } = useAppStore();

  // Form State
  const [title, setTitle] = useState(searchParams.get("title") ?? "");
  const requestedCategory = searchParams.get("category");
  const [category, setCategory] = useState<ManualCategory>(requestedCategory === "Languages" ? "Languages" : "SQL");
  const [topic, setTopic] = useState(searchParams.get("topic") ?? TOPICS_BY_CATEGORY[requestedCategory === "Languages" ? "Languages" : "SQL"][0]);
  const [language, setLanguage] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>((searchParams.get("difficulty") as Difficulty) || "Medium");
  const [status, setStatus] = useState<Status>("Not Started");

  // Sources
  const [sources, setSources] = useState<QuestionSource[]>([
    { platform: "LeetCode", platformQuestionId: searchParams.get("number") ?? "", url: searchParams.get("url") ?? "" },
  ]);

  // Notes & Code
  const [notes, setNotes] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("Python");

  // Revision
  const [saving, setSaving] = useState(false);

  const handleAddSource = () => {
    setSources((prev) => [
      ...prev,
      { platform: "LeetCode", platformQuestionId: "", url: "" },
    ]);
  };

  const handleRemoveSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSourceChange = (
    index: number,
    field: keyof QuestionSource,
    value: string
  ) => {
    setSources((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleCategoryChange = (newCat: ManualCategory) => {
    setCategory(newCat);
    setTopic(TOPICS_BY_CATEGORY[newCat][0]);
  };

  const handleSave = async (addAnother: boolean = false) => {
    if (saving) return;
    if (!title.trim()) {
      alert("Please enter a question title.");
      return;
    }

    setSaving(true);
    try {
      const createdId = await addQuestion({
        title: title.trim(),
        category,
        topic,
        language: category === "Languages" ? language || "C#" : undefined,
        difficulty,
        status,
        sources: sources.filter((s) => s.url.trim() || s.platformQuestionId?.trim()),
        notes: notes.trim(),
        codeSnippet: codeSnippet.trim() || undefined,
        codeLanguage,
      });

      if (addAnother) {
        setTitle("");
        setSources([{ platform: sources[0]?.platform || "LeetCode", platformQuestionId: "", url: "" }]);
        setNotes("");
        setCodeSnippet("");
      } else router.push(`/questions/${createdId}`);
    } catch {
      alert("Unable to save this question. Your form has not been cleared.");
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Library</span>
        </Link>
        <span className="text-xs font-semibold text-muted-foreground">
          <Link href="/questions/import" className="text-primary hover:underline">Bulk upload from Excel</Link>
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Title & Category Hero Box */}
        <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">
              Problem Title *
            </label>
            <input
              type="text"
              placeholder="e.g. SQL Rank Scores, C# async patterns..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 px-4 rounded-xl bg-surface neo-inset text-sm font-semibold text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          {/* Track / Category Selector (Stitch Component) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-foreground">
              Category Track *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["SQL", "Languages"] as const).map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "p-3.5 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer",
                      isSelected
                        ? "bg-surface neo-inset ring-2 ring-primary text-primary font-bold shadow-sm"
                        : "bg-surface neo-inset text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-xs font-bold">{cat}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {cat === "SQL"
                        ? "Database Queries"
                        : "Language Nuances"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">Looking for DSA problems? <Link href="/problems" className="font-bold underline">Browse DSA Problems</Link>.</p>

          {/* Topic & Language Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">
                Topic *
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none cursor-pointer"
              >
                {TOPICS_BY_CATEGORY[category].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {category === "Languages" ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  Language *
                </label>
                <input
                  type="text"
                  placeholder="e.g. C#, Python, Go, Rust..."
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-11 px-3.5 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  Difficulty *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Easy", "Medium", "Hard"] as const).map((diff) => {
                    const isSelected = difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={cn(
                          "h-11 rounded-xl text-xs font-bold transition-all cursor-pointer bg-surface neo-inset",
                          isSelected
                            ? diff === "Easy"
                              ? "ring-2 ring-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : diff === "Medium"
                              ? "ring-2 ring-amber-500 text-amber-600 dark:text-amber-400"
                              : "ring-2 ring-rose-500 text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-foreground">
              Current Solving Status *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Done", "In Progress", "Not Started", "Skipped"] as const).map(
                (st) => {
                  const isSelected = status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={cn(
                        "h-10 rounded-xl text-xs font-bold transition-all cursor-pointer bg-surface neo-inset",
                        isSelected
                          ? "ring-2 ring-primary text-primary font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {st === "Done"
                        ? "✓ Done"
                        : st === "In Progress"
                        ? "⏳ In Progress"
                        : st === "Not Started"
                        ? "○ Not Started"
                        : "⊘ Skipped"}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* Sources Section */}
        <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span>External Sources &amp; References</span>
            </h2>
            <button
              type="button"
              onClick={handleAddSource}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Link</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {sources.map((src, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-surface neo-inset"
              >
                <div className="sm:col-span-3">
                  <select
                    value={src.platform}
                    onChange={(e) =>
                      handleSourceChange(index, "platform", e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-lg bg-surface-card text-xs font-semibold text-foreground border border-border outline-none cursor-pointer"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="Striver">Striver Sheet</option>
                    <option value="NeetCode">NeetCode</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Problem ID (#123)"
                    value={src.platformQuestionId || ""}
                    onChange={(e) =>
                      handleSourceChange(index, "platformQuestionId", e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-lg bg-surface-card text-xs text-foreground placeholder:text-muted-foreground border border-border outline-none"
                  />
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={src.url}
                    onChange={(e) =>
                      handleSourceChange(index, "url", e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-lg bg-surface-card text-xs text-foreground placeholder:text-muted-foreground border border-border outline-none"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  {sources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(index)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notes & Solution Code */}
        <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>Problem Notes &amp; Key Intuition</span>
          </h2>

          <textarea
            rows={4}
            placeholder="Record edge cases, optimal approach intuition, time & space complexities..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 rounded-xl bg-surface neo-inset text-xs text-foreground placeholder:text-muted-foreground border-none outline-none resize-none leading-relaxed"
          />

          {/* Optional Code Snippet */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-primary" />
                Solution Code Block
              </span>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-surface neo-inset text-[11px] font-semibold text-foreground border-none outline-none cursor-pointer"
              >
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="C#">C#</option>
                <option value="SQL">SQL</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Go">Go</option>
              </select>
            </div>
            <textarea
              rows={6}
              placeholder="Paste code solution here..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full p-4 rounded-xl bg-surface neo-inset font-mono text-xs text-foreground placeholder:text-muted-foreground border-none outline-none resize-none leading-relaxed"
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link
            href="/questions"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-surface neo-inset text-center transition-colors cursor-pointer"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-primary bg-surface neo-inset hover:bg-surface/80 transition-all cursor-pointer"
          >
            {saving ? "Saving…" : "Save & Add Another"}
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground neo-fab hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving…" : "Save Problem"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
