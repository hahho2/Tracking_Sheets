import { ExternalLink, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AddToMyQuestions } from "@/components/catalogue/add-to-my-questions";

type Props = { searchParams: Promise<{ q?: string; difficulty?: string; tag?: string }> };

const tagsFor = (topics: string | null) => { try { return topics ? JSON.parse(topics) as string[] : []; } catch { return []; } };

export default async function ProblemCataloguePage({ searchParams }: Props) {
  const { q = "", difficulty = "", tag = "" } = await searchParams;
  const user = await requireUser();
  const [all, tracked] = await Promise.all([db.leetCodeProblem.findMany({ where: { category: "Algorithms" }, select: { id: true, frontendQuestionId: true, title: true, url: true, difficulty: true, topics: true }, orderBy: { frontendQuestionId: "asc" } }), db.question.findMany({ where: { userId: user.id, catalogueProblemId: { not: null } }, select: { id: true, catalogueProblemId: true } })]);
  const trackedByProblem = new Map(tracked.map(question => [question.catalogueProblemId, question.id]));
  const allTags = [...new Set(all.flatMap(problem => tagsFor(problem.topics)))].sort();
  const needle = q.trim().toLowerCase();
  const problems = all.filter(problem => {
    const tags = tagsFor(problem.topics);
    return (!needle || [problem.frontendQuestionId, problem.title, ...tags].some(value => value.toLowerCase().includes(needle))) && (!difficulty || problem.difficulty === difficulty) && (!tag || tags.includes(tag));
  }).slice(0, 100);

  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">DSA Problem Catalogue</h1><p className="text-xs text-muted-foreground mt-1">This shared catalogue is read-only. Add a private copy to My Questions to track your progress.</p></div><form className="p-4 rounded-2xl bg-surface-card neo-raised grid gap-3 md:grid-cols-[1fr_auto_auto]"><label className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-surface neo-inset"><Search className="w-4 h-4 text-muted-foreground"/><input name="q" defaultValue={q} placeholder="Search number, name, topic, or tag" className="w-full bg-transparent outline-none text-xs"/></label><select name="difficulty" defaultValue={difficulty} className="h-10 px-3 rounded-xl bg-surface neo-inset text-xs"><option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option></select><select name="tag" defaultValue={tag} className="h-10 max-w-48 px-3 rounded-xl bg-surface neo-inset text-xs"><option value="">All tags</option>{allTags.map(value=><option key={value}>{value}</option>)}</select><button className="md:col-span-3 justify-self-end px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold">Apply filters</button></form><p className="text-xs text-muted-foreground">Showing {problems.length} matching problems{problems.length === 100 ? " (first 100)" : ""}.</p><div className="space-y-2">{problems.map(problem=><article key={problem.frontendQuestionId} className="p-4 rounded-xl bg-surface-card neo-raised flex flex-col sm:flex-row sm:items-center gap-3"><span className="w-12 text-xs font-bold text-primary">#{problem.frontendQuestionId}</span><div className="flex-1"><a href={problem.url} target="_blank" rel="noreferrer" className="font-bold text-sm hover:text-primary">{problem.title} <ExternalLink className="inline w-3 h-3"/></a><div className="flex flex-wrap gap-1.5 mt-2">{tagsFor(problem.topics).map(value=><span key={value} className={value===problem.difficulty ? "px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary" : "px-2 py-0.5 rounded-full text-[10px] bg-surface neo-inset text-muted-foreground"}>{value}</span>)}</div></div><AddToMyQuestions problemId={problem.id} existingQuestionId={trackedByProblem.get(problem.id)}/></article>)}</div></div>;
}
