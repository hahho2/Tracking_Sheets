"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  History,
  Layers,
  Copy,
  Check,
  CalendarDays,
  Bookmark,
  FileText,
  Sparkles,
} from "lucide-react";
import { useAppStore, Question, Status } from "@/lib/store";
import { cn, formatDate, formatTimeAgo } from "@/lib/utils";
import { RescheduleModal } from "@/components/revisions/reschedule-modal";
import { MarkRevisedModal } from "@/components/revisions/mark-revised-modal";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { questions, updateQuestion, addToast } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const question =
    questions.find((q) => q.id === id) || questions[0];

  const handleCopyCode = () => {
    if (!question?.codeSnippet) return;
    navigator.clipboard.writeText(question.codeSnippet);
    setCopied(true);
    addToast("Code Copied!", "Snippet copied to clipboard.", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (newStatus: Status) => {
    if (!question) return;
    updateQuestion(question.id, { status: newStatus });
  };

  if (!question) {
    return (
      <div className="p-12 rounded-2xl bg-surface-card neo-raised text-center flex flex-col items-center gap-3">
        <h2 className="text-base font-bold text-foreground">Problem not found</h2>
        <Link href="/questions" className="text-xs text-primary font-bold hover:underline">
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
          <span>{question.category}</span>
          <span>&rsaquo;</span>
          <span>{question.topic}</span>
        </div>
      </div>

      {/* 2. Hero Information Card (Stitch Component) */}
      <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                  question.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : question.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                )}
              >
                {question.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface neo-inset text-muted-foreground">
                {question.category} &bull; {question.topic}
              </span>
              {question.language && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-primary border border-primary/20">
                  {question.language}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {question.title}
            </h1>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <select
              value={question.status}
              onChange={(e) => handleStatusChange(e.target.value as Status)}
              className={cn(
                "h-10 px-3.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer bg-surface neo-inset",
                question.status === "Done"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : question.status === "In Progress"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              )}
            >
              <option value="Done">✓ Completed (Done)</option>
              <option value="In Progress">⏳ In Progress</option>
              <option value="Not Started">○ Not Started</option>
              <option value="Skipped">⊘ Skipped</option>
            </select>
          </div>
        </div>

        {/* Source links */}
        {question.sources.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground font-semibold">
              Sources:
            </span>
            {question.sources.map((s, idx) => (
              <a
                key={idx}
                href={s.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>{s.platform}</span>
                {s.platformQuestionId && (
                  <span className="text-muted-foreground">
                    {s.platformQuestionId}
                  </span>
                )}
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* 3. Spaced Repetition Schedule Banner */}
      <section className="p-5 rounded-2xl bg-surface-card neo-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface neo-inset flex items-center justify-center text-primary shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Next Scheduled Revision:
              </span>
              <span className="text-xs font-extrabold text-primary">
                {question.nextDueDate || "Due Today"}
              </span>
            </div>
            <span suppressHydrationWarning className="text-[11px] text-muted-foreground">
              Current Stage: R{question.revisionStage} &bull; Last active: {formatTimeAgo(question.lastActivityAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowRescheduleModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-surface neo-inset transition-colors cursor-pointer"
          >
            Reschedule
          </button>
          <button
            type="button"
            onClick={() => setShowReviseModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground neo-fab hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            Mark Revised
          </button>
        </div>
      </section>

      {/* 4. Notes & Intuition */}
      <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span>Intuition &amp; Key Notes</span>
        </h2>
        <div className="p-4 rounded-xl bg-surface neo-inset text-xs text-foreground leading-relaxed whitespace-pre-wrap font-medium">
          {question.notes || "No notes recorded for this question yet."}
        </div>
      </section>

      {/* 5. Code Solution Block */}
      {question.codeSnippet && (
        <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <span>Optimal Solution ({question.codeLanguage || "Code"})</span>
            </h2>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface neo-inset text-xs font-semibold text-foreground hover:text-primary transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl bg-surface neo-inset p-4 overflow-x-auto border border-border/50">
            <pre className="font-mono text-xs text-foreground leading-relaxed">
              <code>{question.codeSnippet}</code>
            </pre>
          </div>
        </section>
      )}

      {/* 6. Immutable Revision History Timeline (ADR-007) */}
      <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <span>Revision History</span>
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            {question.revisionHistory.length} Completed
          </span>
        </div>

        {question.revisionHistory.length === 0 ? (
          <div className="p-6 rounded-xl bg-surface neo-inset text-center text-xs text-muted-foreground">
            No revision repetitions recorded yet. Click &quot;Mark Revised&quot; above to log your first review!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {question.revisionHistory.map((h, i) => (
              <div
                key={h.id || i}
                className="p-3.5 rounded-xl bg-surface neo-inset flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-surface-card neo-raised flex items-center justify-center text-primary text-xs font-bold">
                    R{h.stage}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">
                      Completed on {h.date}
                    </span>
                    {h.notes && (
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        &quot;{h.notes}&quot;
                      </span>
                    )}
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
        )}
      </section>

      {/* Modals */}
      <RescheduleModal
        question={question}
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
      />
      <MarkRevisedModal
        question={question}
        isOpen={showReviseModal}
        onClose={() => setShowReviseModal(false)}
      />
    </div>
  );
}
