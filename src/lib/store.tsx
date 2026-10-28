"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createQuestion, getStudyState, recordRevision, removeQuestion, rescheduleQuestion, saveSettings, updateQuestion as saveQuestion } from "@/app/actions/study";

export type Category = "DSA" | "SQL" | "Languages";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Done" | "In Progress" | "Not Started" | "Skipped";

export interface QuestionSource {
  platform: string;
  url: string;
  platformQuestionId?: string;
}

export interface RevisionHistoryItem {
  id: string;
  date: string;
  stage: number;
  difficulty: "Easy" | "Medium" | "Hard";
  notes?: string;
}

export interface Question {
  id: string;
  title: string;
  category: Category;
  topic: string;
  language?: string;
  difficulty: Difficulty;
  status: Status;
  sources: QuestionSource[];
  notes: string;
  codeSnippet?: string;
  codeLanguage?: string;
  lastActivityAt: string;
  createdAt: string;
  revisionStage: number; // 0 = not scheduled, 1 = R1, 2 = R2, etc.
  nextDueDate: string; // ISO date string YYYY-MM-DD
  revisionHistory: RevisionHistoryItem[];
}

export interface UserSettings {
  name: string;
  email: string;
  userId?: string;
  timezone: string;
  intervals: number[];
  dailyTarget: number;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "warning" | "error";
}

interface AppStoreContextType {
  questions: Question[];
  settings: UserSettings;
  toasts: Toast[];
  streak: number;
  todaySolvedCount: number;
  addQuestion: (q: Omit<Question, "id" | "createdAt" | "lastActivityAt" | "revisionHistory" | "revisionStage" | "nextDueDate">) => Promise<string>;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  markRevised: (questionId: string, difficulty: Difficulty, notes?: string) => void;
  rescheduleRevision: (questionId: string, newDueDate: string, reason?: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  addToast: (title: string, description?: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
  refreshStudyState: () => Promise<void>;
  getRevisionItems: () => {
    question: Question;
    status: "Today" | "Overdue" | "Tomorrow" | "Upcoming";
    dueDate: string;
    stageLabel: string;
  }[];
}

const DEFAULT_SETTINGS: UserSettings = {
  name: "",
  email: "",
  timezone: "Asia/Kolkata",
  intervals: [1, 3, 7, 15, 30, 60],
  dailyTarget: 5,
};

function getIsoDate(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

const DEMO_QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "Two Sum",
    category: "DSA",
    topic: "Arrays & Hashing",
    difficulty: "Easy",
    status: "Done",
    sources: [
      {
        platform: "LeetCode",
        url: "https://leetcode.com/problems/two-sum",
        platformQuestionId: "#1",
      },
      {
        platform: "NeetCode",
        url: "https://neetcode.io/problems/two-integer-sum",
      },
    ],
    notes:
      "Use a hash map to store previously seen numbers and their indices. Key check: target - currentNum in map -> return [map[target - currentNum], i]. Runs in O(n) time and O(n) space.",
    codeSnippet: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    codeLanguage: "Python",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 120000).toISOString(),
    revisionStage: 3,
    nextDueDate: getIsoDate(0), // Due Today
    revisionHistory: [
      {
        id: "h1",
        date: new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0],
        stage: 2,
        difficulty: "Easy",
        notes: "Quick recall of hash map approach, solved in 3 mins.",
      },
      {
        id: "h2",
        date: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0],
        stage: 1,
        difficulty: "Easy",
        notes: "First revision after initial solve.",
      },
    ],
  },
  {
    id: "q2",
    title: "SQL Department Top Three Salaries",
    category: "SQL",
    topic: "Window Functions & Joins",
    difficulty: "Medium",
    status: "In Progress",
    sources: [
      {
        platform: "LeetCode",
        url: "https://leetcode.com/problems/department-top-three-salaries",
        platformQuestionId: "#185",
      },
    ],
    notes:
      "A high earner in a department is an employee whose salary is in the top three unique salaries. Use DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) <= 3.",
    codeSnippet: `WITH RankedSalaries AS (
    SELECT 
        d.name AS Department,
        e.name AS Employee,
        e.salary AS Salary,
        DENSE_RANK() OVER (
            PARTITION BY e.departmentId 
            ORDER BY e.salary DESC
        ) AS rnk
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
)
SELECT Department, Employee, Salary
FROM RankedSalaries
WHERE rnk <= 3;`,
    codeLanguage: "SQL",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 3600000).toISOString(),
    revisionStage: 1,
    nextDueDate: getIsoDate(0), // Due Today
    revisionHistory: [],
  },
  {
    id: "q3",
    title: "Reverse Linked List",
    category: "DSA",
    topic: "Linked Lists",
    difficulty: "Easy",
    status: "Done",
    sources: [
      {
        platform: "LeetCode",
        url: "https://leetcode.com/problems/reverse-linked-list",
        platformQuestionId: "#206",
      },
    ],
    notes:
      "Maintain prev (None) and curr (head). In loop: next_temp = curr.next, curr.next = prev, prev = curr, curr = next_temp. Return prev.",
    codeSnippet: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head: ListNode | None) -> ListNode | None:
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
    codeLanguage: "Python",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 43200000).toISOString(),
    revisionStage: 2,
    nextDueDate: getIsoDate(-2), // Overdue by 2 days
    revisionHistory: [
      {
        id: "h3",
        date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
        stage: 1,
        difficulty: "Easy",
      },
    ],
  },
  {
    id: "q4",
    title: "C# Multicast Delegates & Events",
    category: "Languages",
    topic: "OOP & Advanced C#",
    language: "C#",
    difficulty: "Medium",
    status: "In Progress",
    sources: [
      {
        platform: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/how-to-combine-delegates-multicast-delegates",
      },
    ],
    notes:
      "Multicast delegates hold references to more than one method using += operator. When invoked, they call each method in order. Be cautious when return types are non-void (only last method result returns).",
    codeSnippet: `public delegate void Notify(string message);

public class ProcessBusinessLogic
{
    public event Notify? ProcessCompleted;

    public void StartProcess()
    {
        Console.WriteLine("Process Started!");
        // Trigger event
        ProcessCompleted?.Invoke("Process Finished Successfully.");
    }
}`,
    codeLanguage: "C#",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000).toISOString(),
    revisionStage: 1,
    nextDueDate: getIsoDate(1), // Tomorrow
    revisionHistory: [],
  },
  {
    id: "q5",
    title: "LRU Cache (Least Recently Used)",
    category: "DSA",
    topic: "System Design & Lists",
    difficulty: "Hard",
    status: "Done",
    sources: [
      {
        platform: "LeetCode",
        url: "https://leetcode.com/problems/lru-cache",
        platformQuestionId: "#146",
      },
    ],
    notes:
      "Combines a Hash Map for O(1) key lookups and a Doubly Linked List for O(1) node eviction/promotion. Most recently used node kept near Head, least recently used evicted from Tail.",
    codeSnippet: `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head, self.tail = Node(), Node()
        self.head.next = self.tail
        self.tail.prev = self.head`,
    codeLanguage: "Python",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 172800000).toISOString(),
    revisionStage: 4,
    nextDueDate: getIsoDate(5), // Upcoming
    revisionHistory: [
      {
        id: "h4",
        date: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
        stage: 1,
        difficulty: "Hard",
      },
      {
        id: "h5",
        date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
        stage: 2,
        difficulty: "Medium",
      },
      {
        id: "h6",
        date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
        stage: 3,
        difficulty: "Easy",
      },
    ],
  },
];

const AppStoreContext = createContext<AppStoreContextType | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [streak, setStreak] = useState(0);
  const [todaySolvedCount, setTodaySolvedCount] = useState(0);

  const refreshStudyState = useCallback(async () => {
    const { questions, settings, streak, todaySolvedCount } = await getStudyState();
      setQuestions(questions as Question[]);
      setSettings({ ...settings, email: "" });
      setStreak(streak);
      setTodaySolvedCount(todaySolvedCount);
  }, []);

  useEffect(() => {
    getStudyState().then(({ questions, settings, streak, todaySolvedCount }) => {
      setQuestions(questions as Question[]);
      setSettings({ ...settings, email: "" });
      setStreak(streak);
      setTodaySolvedCount(todaySolvedCount);
    }).catch(() => {});
  }, []);

  // Save changes
  const persistQuestions = (newQ: Question[]) => setQuestions(newQ);

  const persistSettings = (newS: UserSettings) => setSettings(newS);

  const addToast = (title: string, description?: string, type: Toast["type"] = "success") => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addQuestion = async (
    q: Omit<Question, "id" | "createdAt" | "lastActivityAt" | "revisionHistory" | "revisionStage" | "nextDueDate">
  ): Promise<string> => {
    const id = await createQuestion(q);
    const now = new Date().toISOString();
    const newQ: Question = {
      ...q,
      id,
      createdAt: now,
      lastActivityAt: now,
      revisionStage: 1,
      nextDueDate: getIsoDate(1), // First revision in 1 day
      revisionHistory: [],
    };
    persistQuestions([newQ, ...questions]);
    addToast("Problem Created!", `"${q.title}" added with first revision scheduled for tomorrow.`, "success");
    return id;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    void saveQuestion(id, updates);
    const updated = questions.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          ...updates,
          lastActivityAt: new Date().toISOString(),
        };
      }
      return q;
    });
    persistQuestions(updated);
    addToast("Saved", "Question updated successfully.", "info");
  };

  const deleteQuestion = (id: string) => {
    void removeQuestion(id);
    const target = questions.find((q) => q.id === id);
    const updated = questions.filter((q) => q.id !== id);
    persistQuestions(updated);
    addToast("Problem Removed", target ? `"${target.title}" was removed.` : "Problem deleted.", "warning");
  };

  const markRevised = (questionId: string, difficulty: Difficulty, notes?: string) => {
    void recordRevision(questionId, difficulty, notes);
    const nowIso = new Date().toISOString();
    const today = getIsoDate(0);

    const updated = questions.map((q) => {
      if (q.id === questionId) {
        const nextStage = q.revisionStage + 1;
        // Determine interval in days from settings
        const intervalIndex = Math.min(q.revisionStage, settings.intervals.length - 1);
        const daysToAdd = settings.intervals[intervalIndex] || 7;
        const nextDate = getIsoDate(daysToAdd);

        const newHistoryItem: RevisionHistoryItem = {
          id: "rev_" + Date.now(),
          date: today,
          stage: q.revisionStage,
          difficulty,
          notes,
        };

        return {
          ...q,
          revisionStage: nextStage,
          nextDueDate: nextDate,
          lastActivityAt: nowIso,
          revisionHistory: [newHistoryItem, ...q.revisionHistory],
        };
      }
      return q;
    });

    persistQuestions(updated);
    setTodaySolvedCount((c) => Math.min(c + 1, settings.dailyTarget));
    const target = questions.find((q) => q.id === questionId);
    addToast(
      "Revision Completed! 🎉",
      `"${target?.title || "Problem"}" marked as revised. Next review scheduled in ${
        settings.intervals[Math.min(target?.revisionStage || 1, settings.intervals.length - 1)]
      } days.`,
      "success"
    );
  };

  const rescheduleRevision = (questionId: string, newDueDate: string, reason?: string) => {
    void rescheduleQuestion(questionId, newDueDate);
    const updated = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          nextDueDate: newDueDate,
          lastActivityAt: new Date().toISOString(),
        };
      }
      return q;
    });

    persistQuestions(updated);
    const target = questions.find((q) => q.id === questionId);
    addToast(
      "Revision Rescheduled",
      `"${target?.title || "Problem"}" moved to ${newDueDate}.${reason ? ` (${reason})` : ""}`,
      "info"
    );
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const merged = { ...settings, ...newSettings };
    void saveSettings({ fullName: merged.name, timezone: merged.timezone, intervals: merged.intervals, dailyTarget: merged.dailyTarget });
    persistSettings(merged);
    addToast("Preferences Saved", "Your settings and intervals have been updated.", "success");
  };

  const getRevisionItems = () => {
    const today = getIsoDate(0);
    const tomorrow = getIsoDate(1);

    return questions
      .filter((q) => q.nextDueDate)
      .map((q) => {
        let status: "Today" | "Overdue" | "Tomorrow" | "Upcoming" = "Upcoming";
        if (q.nextDueDate < today) {
          status = "Overdue";
        } else if (q.nextDueDate === today) {
          status = "Today";
        } else if (q.nextDueDate === tomorrow) {
          status = "Tomorrow";
        }

        return {
          question: q,
          status,
          dueDate: q.nextDueDate,
          stageLabel: `R${q.revisionStage}`,
        };
      })
      .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));
  };

  return (
    <AppStoreContext.Provider
      value={{
        questions,
        settings,
        toasts,
        streak,
        todaySolvedCount,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        markRevised,
        rescheduleRevision,
        updateSettings,
        addToast,
        removeToast,
        refreshStudyState,
        getRevisionItems,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppStoreProvider");
  }
  return context;
}
