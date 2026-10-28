"use server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const tagsFor = (topics: string | null) => { try { return topics ? JSON.parse(topics) as string[] : []; } catch { return []; } };

export async function addCatalogueProblem(problemId: string) {
  const user = await requireUser();
  const id = z.string().uuid().parse(problemId);
  const problem = await db.leetCodeProblem.findUnique({ where: { id } });
  if (!problem || problem.category !== "Algorithms") return { error: "This DSA catalogue problem is no longer available." };
  const topic = tagsFor(problem.topics).find(tag => tag !== problem.difficulty) ?? "General";
  try {
    const question = await db.question.create({ data: { userId: user.id, catalogueProblemId: problem.id, title: problem.title, category: "DSA", topic, difficulty: problem.difficulty, status: "Not Started", sources: { create: { platform: "LeetCode", platformQuestionId: problem.frontendQuestionId, url: problem.url } } } });
    revalidatePath("/problems"); revalidatePath("/questions"); revalidatePath("/dashboard");
    return { questionId: question.id, added: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await db.question.findUnique({ where: { userId_catalogueProblemId: { userId: user.id, catalogueProblemId: id } }, select: { id: true } });
      return { questionId: existing?.id, added: false };
    }
    return { error: "Unable to add this problem. Please try again." };
  }
}

