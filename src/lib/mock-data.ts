export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Not Started" | "In Progress" | "Done" | "Skipped";
export type Category = "DSA" | "SQL" | "Languages";
export type Platform = "LeetCode" | "GeeksforGeeks" | "HackerRank" | "Striver" | "YouTube" | "Other";

export interface SourceLink {
  platform: Platform;
  externalId?: string;
  url: string;
}

export interface RevisionHistoryItem {
  revisionNumber: number;
  completedAt: string;
  scheduledFor: string;
  notes?: string;
}

export interface Question {
  id: string;
  title: string;
  category: Category;
  topic: string;
  subtopic?: string;
  language?: string;
  difficulty: Difficulty;
  status: Status;
  sources: SourceLink[];
  notesMarkdown?: string;
  nextRevisionDate?: string;
  revisionStep: number;
  lastActivityAt: string;
  createdAt: string;
  solvedAt?: string;
  revisionHistory: RevisionHistoryItem[];
}

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: "q-two-sum",
    title: "Two Sum",
    category: "DSA",
    topic: "Arrays & Hashing",
    difficulty: "Easy",
    status: "Done",
    sources: [
      {
        platform: "LeetCode",
        externalId: "#1",
        url: "https://leetcode.com/problems/two-sum/",
      },
    ],
    notesMarkdown: `### Optimal Hash Map Approach (O(n) Time, O(n) Space)
Instead of brute force checking all pairs ($O(n^2)$), use a single-pass hash map to store each number's value mapped to its index.

\`\`\`python
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
\`\`\`

**Key Pitfalls:**
- Remember to check for complement *before* adding the current number to avoid using the same index twice.
- Hash map lookup is average $O(1)$.`,
    nextRevisionDate: "2026-10-29",
    revisionStep: 3,
    lastActivityAt: "2026-10-28T10:30:00Z",
    createdAt: "2026-10-01T08:00:00Z",
    solvedAt: "2026-10-01T08:35:00Z",
    revisionHistory: [
      {
        revisionNumber: 2,
        completedAt: "2026-10-20T10:15:00Z",
        scheduledFor: "2026-10-20",
        notes: "Quick recall under 3 minutes. Clean hash map implementation.",
      },
      {
        revisionNumber: 1,
        completedAt: "2026-10-03T09:00:00Z",
        scheduledFor: "2026-10-03",
        notes: "First revision complete. Reviewed edge cases.",
      },
    ],
  },
  {
    id: "q-sql-joins",
    title: "SQL Department Top Three Salaries",
    category: "SQL",
    topic: "Window Functions & Joins",
    difficulty: "Medium",
    status: "In Progress",
    sources: [
      {
        platform: "LeetCode",
        externalId: "#185",
        url: "https://leetcode.com/problems/department-top-three-salaries/",
      },
    ],
    notesMarkdown: `### Window Function Approach (\`DENSE_RANK\`)
Use \`DENSE_RANK() OVER (PARTITION BY DepartmentId ORDER BY Salary DESC)\` to handle salary ties without skipping ranks.`,
    nextRevisionDate: "2026-10-28",
    revisionStep: 1,
    lastActivityAt: "2026-10-28T09:00:00Z",
    createdAt: "2026-10-27T14:00:00Z",
    revisionHistory: [],
  },
  {
    id: "q-reverse-linked-list",
    title: "Reverse Linked List",
    category: "DSA",
    topic: "Linked Lists",
    difficulty: "Easy",
    status: "Done",
    sources: [
      {
        platform: "LeetCode",
        externalId: "#206",
        url: "https://leetcode.com/problems/reverse-linked-list/",
      },
    ],
    notesMarkdown: `### Iterative 3-Pointer Technique
Maintain \`prev = None\`, \`curr = head\`, and temporarily store \`curr.next\`.
Time: $O(n)$, Space: $O(1)$.`,
    nextRevisionDate: "2026-10-31",
    revisionStep: 4,
    lastActivityAt: "2026-10-27T18:20:00Z",
    createdAt: "2026-09-15T12:00:00Z",
    solvedAt: "2026-09-15T12:20:00Z",
    revisionHistory: [
      {
        revisionNumber: 3,
        completedAt: "2026-10-15T14:00:00Z",
        scheduledFor: "2026-10-15",
      },
    ],
  },
  {
    id: "q-lru-cache",
    title: "LRU Cache (Least Recently Used)",
    category: "DSA",
    topic: "System Design & Lists",
    difficulty: "Hard",
    status: "Done",
    sources: [
      {
        platform: "LeetCode",
        externalId: "#146",
        url: "https://leetcode.com/problems/lru-cache/",
      },
    ],
    notesMarkdown: `Doubly Linked List + Hash Map to guarantee $O(1)$ \`get\` and \`put\`.`,
    nextRevisionDate: "2026-10-26",
    revisionStep: 2,
    lastActivityAt: "2026-10-25T11:10:00Z",
    createdAt: "2026-10-10T10:00:00Z",
    solvedAt: "2026-10-10T11:45:00Z",
    revisionHistory: [],
  },
  {
    id: "q-csharp-delegates",
    title: "C# Multicast Delegates & Events",
    category: "Languages",
    topic: "OOP & Advanced C#",
    language: "C#",
    difficulty: "Medium",
    status: "In Progress",
    sources: [
      {
        platform: "Other",
        url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/",
      },
    ],
    notesMarkdown: `Differences between \`Func<>\`, \`Action<>\`, and custom \`delegate\` signatures.`,
    nextRevisionDate: "2026-11-02",
    revisionStep: 1,
    lastActivityAt: "2026-10-26T16:00:00Z",
    createdAt: "2026-10-26T15:30:00Z",
    revisionHistory: [],
  },
  {
    id: "q-subsets",
    title: "Subsets (Power Set)",
    category: "DSA",
    topic: "Backtracking",
    difficulty: "Medium",
    status: "Done",
    sources: [
      {
        platform: "LeetCode",
        externalId: "#78",
        url: "https://leetcode.com/problems/subsets/",
      },
    ],
    nextRevisionDate: "2026-10-28",
    revisionStep: 2,
    lastActivityAt: "2026-10-24T14:00:00Z",
    createdAt: "2026-10-12T10:00:00Z",
    solvedAt: "2026-10-12T10:40:00Z",
    revisionHistory: [],
  },
];
