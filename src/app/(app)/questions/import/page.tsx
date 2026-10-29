"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Upload, ArrowLeft, Download, CheckCircle2, X } from "lucide-react";
import { bulkCreateQuestions } from "@/app/actions/study";
import { useAppStore } from "@/lib/store";

type Category = "SQL" | "Languages";
type PreviewRow = { title: string; topic: string; difficulty: "Easy" | "Medium" | "Hard"; status: "Not Started" | "In Progress" | "Done" | "Skipped"; language?: string; notes: string; sourceUrl?: string; codeSnippet?: string; reminderDate?: string };
const text = (value: unknown) => typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
const reminderDate = (value: unknown) => {
  if (typeof value === "number") { const date = XLSX.SSF.parse_date_code(value); return date ? `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}` : ""; }
  return text(value);
};

export default function ImportQuestionsPage() {
  const inputRef = useRef<HTMLInputElement>(null); const { refreshStudyState } = useAppStore();
  const [category, setCategory] = useState<Category>("SQL"); const [fileName, setFileName] = useState(""); const [rows, setRows] = useState<PreviewRow[]>([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [success, setSuccess] = useState("");
  async function selectFile(file?: File) {
    setError(""); setSuccess(""); setRows([]); setFileName("");
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name) || file.size > 5 * 1024 * 1024) { setError("Choose one .xlsx file smaller than 5 MB."); return; }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" }); const first = workbook.Sheets[workbook.SheetNames[0]];
      const headerRow = XLSX.utils.sheet_to_json<unknown[]>(first, { header: 1 }).findIndex(row => row.some(cell => text(cell).toLowerCase() === "title"));
      if (headerRow < 0) throw new Error("The sheet needs a header row containing title, topic, and difficulty.");
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(first, { defval: "", range: headerRow });
      const parsed = raw.map(row => ({ title: text(row.title), topic: text(row.topic), difficulty: text(row.difficulty) as PreviewRow["difficulty"], status: (text(row.status) || "Not Started") as PreviewRow["status"], language: text(row.language) || undefined, notes: text(row.notes), sourceUrl: text(row.source_url) || undefined, codeSnippet: text(row.code_snippet) || undefined, reminderDate: reminderDate(row.reminder_date) || undefined }));
      if (!parsed.length || parsed.length > 200) throw new Error("The sheet must contain between 1 and 200 data rows.");
      const invalid = parsed.find(row => !row.title || !row.topic || !["Easy", "Medium", "Hard"].includes(row.difficulty) || !["Not Started", "In Progress", "Done", "Skipped"].includes(row.status) || (category === "Languages" && !row.language) || (row.reminderDate && !/^\d{4}-\d{2}-\d{2}$/.test(row.reminderDate)));
      if (invalid) throw new Error("Each row needs title, topic, Easy/Medium/Hard difficulty, a valid status, a language for Language imports, and a YYYY-MM-DD reminder date when supplied.");
      setRows(parsed); setFileName(file.name);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "This workbook could not be read."); }
  }
  async function importRows() {
    if (!rows.length || busy) return; setBusy(true); setError("");
    try { const result = await bulkCreateQuestions(rows.map(row => ({ ...row, category, language: category === "Languages" ? row.language : undefined, sources: row.sourceUrl ? [{ platform: "Excel import", url: row.sourceUrl }] : [] }))); await refreshStudyState(); setSuccess(`${result.created} questions added to My Questions.`); }
    catch { setError("Import failed. Your file is still selected; correct it and try again."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-4xl space-y-6"><div className="flex items-center justify-between"><Link href="/questions/new" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Back to Add Question</Link><Link href="/questions" className="text-xs font-bold text-primary hover:underline">My Questions</Link></div><section className="rounded-2xl bg-surface-card p-6 neo-raised space-y-5"><div><h1 className="text-2xl font-bold">Bulk upload questions</h1><p className="mt-1 text-xs text-muted-foreground">Import up to 200 private SQL or programming-language questions from one Excel sheet. DSA questions must be added from the catalogue.</p></div><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => { setCategory("SQL"); setRows([]); setFileName(""); }} className={`rounded-xl p-3 text-xs font-bold ${category === "SQL" ? "bg-primary text-primary-foreground" : "bg-surface neo-inset text-muted-foreground"}`}>SQL questions</button><button type="button" onClick={() => { setCategory("Languages"); setRows([]); setFileName(""); }} className={`rounded-xl p-3 text-xs font-bold ${category === "Languages" ? "bg-primary text-primary-foreground" : "bg-surface neo-inset text-muted-foreground"}`}>Language questions</button></div><div className="flex flex-wrap gap-3"><a href={category === "SQL" ? "/templates/codetrack-sql-import-template.xlsx" : "/templates/codetrack-language-import-template.xlsx"} download className="inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs font-bold neo-inset hover:text-primary"><Download className="w-4 h-4" />Download {category === "SQL" ? "SQL" : "Language"} sample</a><span className="self-center text-xs text-muted-foreground">Required columns: title, topic, difficulty</span></div><div role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }} onClick={() => inputRef.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void selectFile(event.dataTransfer.files[0]); }} className="cursor-pointer rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5 p-8 text-center hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"><FileSpreadsheet className="mx-auto mb-3 w-8 h-8 text-primary" /><p className="text-sm font-bold">Drop an Excel file here or click to browse</p><p className="mt-1 text-xs text-muted-foreground">.xlsx only · maximum 5 MB · one sheet</p><input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={event => void selectFile(event.target.files?.[0])} /></div>{fileName && <div className="flex items-center justify-between rounded-xl bg-surface p-3 text-xs"><span className="truncate font-semibold">{fileName} · {rows.length} valid rows</span><button onClick={() => { setRows([]); setFileName(""); }} className="p-1 text-muted-foreground hover:text-rose-500" aria-label="Remove selected file"><X className="w-4 h-4" /></button></div>}{rows.length > 0 && <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-xs"><thead className="bg-surface"><tr><th className="p-3">Title</th><th className="p-3">Topic</th><th className="p-3">Difficulty</th><th className="p-3">Status</th></tr></thead><tbody>{rows.slice(0, 5).map((row, index) => <tr key={`${row.title}-${index}`} className="border-t border-border/50"><td className="p-3">{row.title}</td><td className="p-3">{row.topic}</td><td className="p-3">{row.difficulty}</td><td className="p-3">{row.status}</td></tr>)}</tbody></table>{rows.length > 5 && <p className="p-3 text-xs text-muted-foreground">Showing the first 5 of {rows.length} rows.</p>}</div>}{error && <p className="text-xs text-rose-500" role="alert">{error}</p>}{success && <p className="flex items-center gap-2 text-xs text-emerald-500" role="status"><CheckCircle2 className="w-4 h-4" />{success}</p>}<div className="flex justify-end gap-3"><Link href="/questions/new" className="rounded-xl bg-surface px-4 py-2.5 text-xs font-bold neo-inset">Cancel</Link><button type="button" disabled={!rows.length || busy || !!success} onClick={() => void importRows()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"><Upload className="w-4 h-4" />{busy ? "Importing…" : "Import questions"}</button></div></section></div>;
}
