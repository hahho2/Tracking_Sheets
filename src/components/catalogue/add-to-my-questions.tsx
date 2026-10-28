"use client";
import { useState } from "react";
import Link from "next/link";
import { addCatalogueProblem } from "@/app/actions/catalogue";
import { useAppStore } from "@/lib/store";

export function AddToMyQuestions({ problemId, existingQuestionId }: { problemId: string; existingQuestionId?: string }) {
  const { refreshStudyState } = useAppStore();
  const [questionId, setQuestionId] = useState(existingQuestionId); const [adding, setAdding] = useState(false); const [error, setError] = useState("");
  async function add() { setAdding(true); setError(""); try { const result = await addCatalogueProblem(problemId); if (result.error) setError(result.error); else { setQuestionId(result.questionId); await refreshStudyState(); } } finally { setAdding(false); } }
  if (questionId) return <Link href={`/questions/${questionId}`} className="shrink-0 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 text-xs font-bold">Added ✓</Link>;
  return <div className="shrink-0 text-right"><button onClick={add} disabled={adding} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-60">{adding ? "Adding…" : "Add to My Questions"}</button>{error && <p className="mt-1 max-w-40 text-[10px] text-rose-500">{error}</p>}</div>;
}
