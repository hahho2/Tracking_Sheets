"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Code2, Database, Plus, X } from "lucide-react";

export function QuickAddMenu() {
  const [open, setOpen] = useState(false);
  return <div className="relative -top-5">
    {open && <div className="absolute bottom-14 left-1/2 w-56 -translate-x-1/2 rounded-2xl bg-surface-card p-2 shadow-xl neo-raised">
      <Link onClick={() => setOpen(false)} href="/questions/new?category=SQL" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-surface"><Database className="w-4 h-4 text-primary" />Add SQL Question</Link>
      <Link onClick={() => setOpen(false)} href="/questions/new?category=Languages" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-surface"><Code2 className="w-4 h-4 text-primary" />Add Language Question</Link>
      <Link onClick={() => setOpen(false)} href="/problems" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-surface"><BookOpen className="w-4 h-4 text-primary" />Browse DSA Catalogue</Link>
    </div>}
    <button type="button" onClick={() => setOpen(!open)} aria-label="Add question" className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center neo-fab active:scale-95 transition-all shadow-lg shadow-primary/40">{open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6 stroke-[2.5]" />}</button>
  </div>;
}
