import "dotenv/config";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const source = process.argv[2];
if (!source || !fs.existsSync(source) || !source.endsWith(".json")) throw new Error("Pass the absolute path to leetcode_problems.json.");
const problems = JSON.parse(fs.readFileSync(source, "utf8"));
if (!Array.isArray(problems)) throw new Error("Expected a JSON array of problems.");
const rows = [];
for (const problem of problems) {
  const id = String(problem.frontendQuestionId ?? "");
  if (!/^\d+$/.test(id) || !problem.title || !problem.url) continue;
  const difficulty = String(problem.difficulty ?? "Unknown");
  const topics = Array.isArray(problem.topics) ? problem.topics : [];
  rows.push({ frontendQuestionId: id, title: String(problem.title), titleSlug: String(problem.titleSlug ?? id), url: String(problem.url), difficulty, paidOnly: Boolean(problem.paidOnly), category: problem.category ? String(problem.category) : null, acceptanceRate: problem.acceptance_rate ? String(problem.acceptance_rate) : null, topics: JSON.stringify([...new Set([...topics, difficulty])]) });
}
const db = new PrismaClient();
const { count: imported } = await db.leetCodeProblem.createMany({ data: rows, skipDuplicates: true });
await db.$disconnect(); console.log(`Imported ${imported} public LeetCode problem records.`);
