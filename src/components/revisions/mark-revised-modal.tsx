"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Sparkles, BrainCircuit } from "lucide-react";
import { useAppStore, Question, Difficulty } from "@/lib/store";
import { cn } from "@/lib/utils";

interface MarkRevisedModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MarkRevisedModal({ question, isOpen, onClose }: MarkRevisedModalProps) {
  const { markRevised } = useAppStore();
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [notes, setNotes] = useState<string>("");

  if (!isOpen || !question) return null;

  const handleConfirm = () => {
    markRevised(question.id, difficulty, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-surface-card neo-raised border border-border p-6 flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface neo-inset flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                Complete Revision Stage {question.revisionStage}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Rate your active recall for &quot;{question.title}&quot;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Difficulty / Recall Confidence Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground">
            How was your recall difficulty?
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "Easy" as Difficulty, label: "Easy", desc: "Instantly recalled" },
              { id: "Medium" as Difficulty, label: "Medium", desc: "Recalled with effort" },
              { id: "Hard" as Difficulty, label: "Hard", desc: "Needed solution hint" },
            ].map((d) => {
              const isSelected = difficulty === d.id;
              const borderClass = isSelected
                ? d.id === "Easy"
                  ? "ring-2 ring-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : d.id === "Medium"
                  ? "ring-2 ring-amber-500 text-amber-600 dark:text-amber-400"
                  : "ring-2 ring-rose-500 text-rose-600 dark:text-rose-400"
                : "text-muted-foreground hover:text-foreground";

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={cn(
                    "p-3 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer bg-surface neo-inset",
                    borderClass
                  )}
                >
                  <span className="text-xs font-bold">{d.label}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {d.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recall Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground">
            Recall Notes or Reflections (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Remembered the two-pointer condition quickly, but tripped on empty array edge case..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="p-3 rounded-xl bg-surface neo-inset text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none"
          />
        </div>

        {/* Spaced repetition boost notice */}
        <div className="p-3 rounded-xl bg-surface neo-inset border border-border/60 text-[11px] text-muted-foreground flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            Marking this revision advances your mastery stage to <strong className="text-foreground">R{question.revisionStage + 1}</strong> and extends your daily study streak!
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-surface hover:bg-surface/80 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground neo-fab hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            Confirm Revision
          </button>
        </div>
      </div>
    </div>
  );
}
