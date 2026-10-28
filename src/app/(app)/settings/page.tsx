"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  User,
  Sun,
  Moon,
  Laptop,
  Globe,
  RotateCcw,
  Target,
  Check,
  Save,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, addToast } = useAppStore();

  const mounted = true;
  const [name, setName] = useState(settings.name);
  const email = settings.userId ?? "";
  const [timezone, setTimezone] = useState(settings.timezone);
  const [intervals, setIntervals] = useState(settings.intervals.join(", "));
  const [dailyGoal, setDailyGoal] = useState(settings.dailyTarget);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedIntervals = intervals
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    updateSettings({
      name: name.trim() || settings.name,
      timezone,
      intervals: parsedIntervals.length > 0 ? parsedIntervals : settings.intervals,
      dailyTarget: Math.max(1, dailyGoal),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Settings &amp; Personal Preferences
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Configure your user profile, appearance theme, timezone boundaries,
          and spaced repetition algorithm intervals.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>Preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* 1. Profile Information */}
        <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Profile Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">User ID</label>
              <input
                type="text"
                disabled
                value={email}
                className="h-11 px-3.5 rounded-xl bg-surface neo-inset text-xs font-semibold text-muted-foreground border-none outline-none opacity-80 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* 2. Appearance & Theme */}
        <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            <span>Appearance &amp; Theme</span>
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Light Mode", icon: Sun },
              { id: "dark", label: "Dark Mode", icon: Moon },
              { id: "system", label: "System Sync", icon: Laptop },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = mounted && theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={cn(
                    "p-4 rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer",
                    isSelected
                      ? "bg-surface neo-inset ring-2 ring-primary text-primary font-bold shadow-sm"
                      : "bg-surface neo-inset text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Timezone & Daily Target */}
        <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span>Timezone &amp; Streak Calculation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">
                Timezone (Determines Midnight Rollover)
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none cursor-pointer"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (UTC+05:30)</option>
                <option value="UTC">UTC / GMT (UTC+00:00)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+09:00)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>Daily Problem Solving Target</span>
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10) || 1)}
                className="h-11 px-3.5 rounded-xl bg-surface neo-inset text-xs font-semibold text-foreground border-none outline-none"
              />
            </div>
          </div>
        </section>

        {/* 4. Spaced Repetition Algorithm Intervals */}
        <section className="p-6 rounded-2xl bg-surface-card neo-raised flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-primary" />
            <span>Spaced Repetition Algorithm Intervals</span>
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Comma-separated sequence of days added after each successful repetition (anchored on actual completion date).
          </p>

          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              value={intervals}
              onChange={(e) => setIntervals(e.target.value)}
              className="h-11 px-3.5 rounded-xl bg-surface neo-inset text-xs font-mono font-bold text-foreground border-none outline-none focus:ring-2 focus:ring-primary/40"
            />
            <span className="text-[10px] text-muted-foreground">
              Default: 1, 3, 7, 15, 30, 60 days
            </span>
          </div>
        </section>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold neo-fab hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
