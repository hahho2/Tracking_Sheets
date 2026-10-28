"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { useAppStore, Question } from "@/lib/store";
import { cn } from "@/lib/utils";

interface RescheduleModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RescheduleModal({ question, isOpen, onClose }: RescheduleModalProps) {
  const { rescheduleRevision } = useAppStore();
  const [selectedOffset, setSelectedOffset] = useState<number>(3);
  const [customDate, setCustomDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  if (!isOpen || !question) return null;

  const today = new Date();
  const computePresetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const handleConfirm = () => {
    let finalDate = customDate;
    if (!finalDate) {
      finalDate = computePresetDate(selectedOffset);
    }
    rescheduleRevision(question.id, finalDate, reason.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-surface-card neo-raised border border-border p-6 flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface neo-inset flex items-center justify-center text-primary">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                Reschedule Revision
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Adjust next review date for &quot;{question.title}&quot;
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

        {/* Quick Presets (Stitch Screen 11) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground">
            Quick Interval Presets
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "+1 Day", days: 1, desc: "Tomorrow" },
              { label: "+3 Days", days: 3, desc: "Quick follow-up" },
              { label: "+7 Days", days: 7, desc: "1 Week" },
            ].map((p) => {
              const isSelected = !customDate && selectedOffset === p.days;
              return (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => {
                    setSelectedOffset(p.days);
                    setCustomDate("");
                  }}
                  className={cn(
                    "p-3 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer",
                    isSelected
                      ? "bg-surface neo-inset ring-2 ring-primary text-primary font-bold shadow-sm"
                      : "bg-surface neo-inset text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-xs">{p.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Calendar Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Or Pick Exact Date</span>
          </label>
          <input
            type="date"
            min={today.toISOString().split("T")[0]}
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setSelectedOffset(0);
            }}
            className="h-10 px-3.5 rounded-xl bg-surface neo-inset text-xs font-medium text-foreground outline-none"
          />
        </div>

        {/* Optional Reason */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground">
            Reason for Rescheduling (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Focus on mock interview prep today..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 px-3.5 rounded-xl bg-surface neo-inset text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Note / Info */}
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-600 dark:text-indigo-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Rescheduling preserves your previous revision history and adapts your spaced repetition timeline seamlessly.
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
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
