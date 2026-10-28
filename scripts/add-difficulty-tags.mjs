import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const problems = await db.leetCodeProblem.findMany({ select: { id: true, difficulty: true, topics: true } });
for (let index = 0; index < problems.length; index += 100) {
  await Promise.all(problems.slice(index, index + 100).map(problem => {
    let tags = [];
    try { tags = problem.topics ? JSON.parse(problem.topics) : []; } catch { /* replace invalid legacy tag payload */ }
    const nextTags = [...new Set([...tags, problem.difficulty])];
    return db.leetCodeProblem.update({ where: { id: problem.id }, data: { topics: JSON.stringify(nextTags) } });
  }));
}
await db.$disconnect();
console.log(`Added difficulty tags to ${problems.length} problems.`);
