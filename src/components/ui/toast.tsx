"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = "border-emerald-500/40 text-emerald-500";
        const bgClass = "bg-surface-card/95";

        if (toast.type === "info") {
          Icon = Info;
          borderClass = "border-indigo-500/40 text-indigo-500";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          borderClass = "border-amber-500/40 text-amber-500";
        } else if (toast.type === "error") {
          Icon = AlertCircle;
          borderClass = "border-rose-500/40 text-rose-500";
        }

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto p-4 rounded-2xl neo-raised border flex items-start gap-3 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-3 fade-in duration-200",
              bgClass,
              borderClass
            )}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground leading-tight">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
