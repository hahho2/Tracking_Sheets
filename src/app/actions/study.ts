"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const sourceSchema = z.object({ platform: z.string().max(80), url: z.string().url().max(2048), platformQuestionId: z.string().max(100).optional() });
// DSA records are created only through addCatalogueProblem, which binds them to a shared catalogue row.
const questionSchema = z.object({ title: z.string().trim().min(1).max(300), category: z.enum(["SQL", "Languages"]), topic: z.string().trim().min(1).max(120), language: z.string().max(100).optional(), difficulty: z.enum(["Easy", "Medium", "Hard"]), status: z.enum(["Done", "In Progress", "Not Started", "Skipped"]), sources: z.array(sourceSchema).max(20), notes: z.string().max(100000), codeSnippet: z.string().max(100000).optional(), codeLanguage: z.string().max(100).optional() });
const questionUpdateSchema = z.object({ status: z.enum(["Done", "In Progress", "Not Started", "Skipped"]).optional(), notes: z.string().max(100000).optional(), codeSnippet: z.string().max(100000).optional(), codeLanguage: z.string().max(100).optional() }).strict();
const importQuestionSchema = questionSchema.extend({ category: z.enum(["SQL", "Languages"]), sources: z.array(sourceSchema).max(1), reminderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });
const rejectManualDsa = (input: unknown) => {
  const category = input && typeof input === "object" && "category" in input ? String(input.category).trim().toUpperCase() : "";
  if (["DSA", "ALGORITHM", "ALGORITHMS"].includes(category)) throw new Error("Manual DSA question creation is disabled. Please select a problem from the shared catalogue.");
};

const toClient = (q: Awaited<ReturnType<typeof db.question.findMany>>[number] & { sources: { platform: string; url: string; platformQuestionId: string | null }[]; revisions: { id: string; date: Date; stage: number; difficulty: string; notes: string | null }[] }) => ({ ...q, createdAt: q.createdAt.toISOString(), lastActivityAt: q.lastActivityAt.toISOString(), nextDueDate: q.nextDueDate?.toISOString().slice(0, 10) ?? "", sources: q.sources.map(s => ({ ...s, platformQuestionId: s.platformQuestionId ?? undefined })), revisionHistory: q.revisions.map(r => ({ ...r, date: r.date.toISOString().slice(0, 10), difficulty: r.difficulty as "Easy" | "Medium" | "Hard", notes: r.notes ?? undefined })) });

export async function getStudyState() {
  const user = await requireUser();
  const [questions, settings] = await Promise.all([db.question.findMany({ where: { userId: user.id }, include: { sources: true, revisions: { orderBy: { date: "desc" } } }, orderBy: [{ lastActivityAt: "desc" }, { id: "desc" }] }), db.userSettings.findUnique({ where: { userId: user.id } })]);
  const activeDays = new Set(questions.flatMap(question => question.revisions.map(revision => revision.date.toISOString().slice(0, 10))));
  let streak = 0; for (let cursor = new Date(); activeDays.has(cursor.toISOString().slice(0, 10)); cursor.setDate(cursor.getDate() - 1)) streak++;
  const today = new Date().toISOString().slice(0, 10);
  return { questions: questions.map(toClient), settings: { name: user.fullName, userId: user.userId, timezone: settings?.timezone ?? "Asia/Kolkata", intervals: settings?.intervals ?? [1, 3, 7, 15, 30, 60], dailyTarget: settings?.dailyTarget ?? 5 }, todaySolvedCount: questions.reduce((count, question) => count + question.revisions.filter(revision => revision.date.toISOString().slice(0, 10) === today).length, 0), streak };
}

export async function createQuestion(input: unknown) {
  const user = await requireUser(); rejectManualDsa(input); const data = questionSchema.parse(input);
  const question = await db.question.create({ data: { ...data, userId: user.id, nextDueDate: new Date(Date.now() + 86400000), sources: { create: data.sources } } });
  revalidatePath("/"); return question.id;
}
export async function bulkCreateQuestions(input: unknown) {
  const user = await requireUser();
  const rows = z.array(importQuestionSchema).min(1).max(200).parse(input);
  await db.$transaction(rows.map(({ reminderDate, ...row }) => db.question.create({ data: { ...row, userId: user.id, nextDueDate: reminderDate ? new Date(`${reminderDate}T00:00:00.000Z`) : new Date(Date.now() + 86400000), sources: { create: row.sources } } })));
  revalidatePath("/");
  return { created: rows.length };
}
export async function updateQuestion(id: string, input: unknown) {
  const user = await requireUser(); rejectManualDsa(input); const data = questionUpdateSchema.parse(input);
  const result = await db.question.updateMany({ where: { id, userId: user.id }, data: { ...data, lastActivityAt: new Date() } }); if (!result.count) throw new Error("Question not found"); revalidatePath("/");
}
export async function removeQuestion(id: string) { const user = await requireUser(); const result = await db.question.deleteMany({ where: { id, userId: user.id } }); if (!result.count) throw new Error("Question not found"); revalidatePath("/"); }
export async function recordRevision(id: string, difficulty: "Easy" | "Medium" | "Hard", notes?: string) { const user = await requireUser(); await db.$transaction(async tx => { const question = await tx.question.findFirst({ where: { id, userId: user.id } }); if (!question) throw new Error("Question not found"); const settings = await tx.userSettings.findUnique({ where: { userId: user.id } }); const intervals = settings?.intervals ?? [1, 3, 7, 15, 30, 60]; const days = intervals[Math.min(question.revisionStage, intervals.length - 1)] ?? 7; await tx.revisionHistory.create({ data: { questionId: id, date: new Date(), stage: question.revisionStage, difficulty, notes } }); await tx.question.update({ where: { id }, data: { revisionStage: question.revisionStage + 1, nextDueDate: new Date(Date.now() + days * 86400000), lastActivityAt: new Date() } }); }); revalidatePath("/"); }
export async function rescheduleQuestion(id: string, dueDate: string) { const user = await requireUser(); const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(dueDate); const result = await db.question.updateMany({ where: { id, userId: user.id }, data: { nextDueDate: new Date(`${date}T00:00:00.000Z`) } }); if (!result.count) throw new Error("Question not found"); revalidatePath("/"); }
export async function saveSettings(input: unknown) { const user = await requireUser(); const data = z.object({ fullName: z.string().trim().min(2).max(100), timezone: z.string().min(1).max(100), intervals: z.array(z.number().int().positive()).min(1).max(12), dailyTarget: z.number().int().min(1).max(100) }).parse(input); await db.$transaction([db.user.update({ where: { id: user.id }, data: { fullName: data.fullName } }), db.userSettings.upsert({ where: { userId: user.id }, create: { userId: user.id, timezone: data.timezone, intervals: data.intervals, dailyTarget: data.dailyTarget }, update: { timezone: data.timezone, intervals: data.intervals, dailyTarget: data.dailyTarget } })]); revalidatePath("/"); }
