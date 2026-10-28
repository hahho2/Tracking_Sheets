# CodeTrack — Development Plan
> **Multi-user Coding Progress & Revision Tracker** | Next.js + Node.js | V1: Manual question entry  
> **Companion Architecture Docs:** [Techstack.md](.agents/Techstack.md) | [decision.md](decision.md)

---

## 1. Product Goal
Build a responsive web app where each user independently tracks DSA, SQL, and programming-language questions, saves source links and rich notes, schedules and completes revisions, and monitors progress and study streaks.

### Confirmed V1 Decisions
- **Multi-user:** Registration, login, account isolation, and user-specific preferences.
- **Hierarchy:** Category → Topic → Question.
  - Categories: DSA, SQL, Languages.
  - Languages may have language-specific topics (e.g., C# → OOP).
- **Question Statuses:** `Not Started`, `In Progress`, `Done`, `Skipped`.
- **Question Creation:** Manual only; external source links supported. Automatic URL metadata fetching is out of scope for V1.
- **Sources:** LeetCode, GeeksforGeeks, HackerRank, Striver, YouTube, Other; support multiple source links per question, with optional source-platform question IDs.
- **Notes:** Rich text with headings, lists, code blocks, links, images, and formatted explanations.
- **Revisions:** Manual and automatic schedules, immutable completed history, and configurable next revision.
- **Default Ordering:** Recently worked/revised questions first, descending by `lastActivityAt`.
- **Analytics:** Today, Week, Month and custom-range filters; questions added/completed, revisions completed/due, pending questions, overdue, category/topic performance.
- **Appearance:** Light, Dark, System; mobile and desktop layouts.
- **Streak:** One active day when one or more questions or revisions are completed.
- **Deployment:** Online, responsive, authenticated, production-ready.

---

## 2. Technology Stack

| Area | Choice |
| :--- | :--- |
| **UI** | Next.js App Router, React, TypeScript |
| **Server** | Next.js Route Handlers / Server Actions (Node.js runtime); no separate Express server for V1 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | Auth.js or compatible managed authentication; confirm provider before implementation |
| **Validation** | Zod, shared server-side schemas |
| **Rich Notes** | Tiptap + code blocks/syntax highlighting |
| **Charts** | Recharts |
| **Image Storage** | Private object storage with authenticated upload/access |
| **Deployment** | Vercel + managed PostgreSQL and storage |
| **Testing** | Vitest, React Testing Library, Playwright |

> **Note:** Lock compatible dependency versions during implementation; do not blindly assume the latest APIs.

---

## 3. Sitemap and Routing

```
/
├── (auth)/
│   ├── login
│   ├── register
│   ├── forgot-password
│   └── reset-password
├── onboarding
└── (app)/
    ├── dashboard
    ├── questions/
    │   ├── new
    │   └── [id]                # details and edit action
    ├── revisions/
    │   └── history            # may also be a tab
    ├── stats/
    ├── activity/
    ├── settings/
    └── profile/
```

### Shared UI Specifications
- **Desktop:** Fixed ~240px sidebar, header with search, page title, Add Question CTA, theme switch, and account menu.
- **Mobile:** Accessible collapsible menu / bottom navigation; responsive cards in place of wide tables.
- **Shared Reusable Components:** Status badge/select, topic picker, question row/card, source-link editor, Tiptap editor, revision card, date picker, filters, charts, empty/loading/error states, and confirmation dialogs.
- **Design Language:** Minimalist productivity UI, Geist/Inter typography, 8px spacing rhythm, restrained blue/indigo accent, semantic status colors, 8–12px corner radius, high contrast, and keyboard support.

---

## 4. Wireframes (Low Fidelity)
*These frames define layout and content placement, not final visual styling.*

### 4.1 Login
```
+---------------------------------------------------+
|                   <> CodeTrack                    |
|  +---------------------------------------------+  |
|  | Welcome back                                |  |
|  | Email               [____________________]  |  |
|  | Password            [_________________ eye] |  |
|  | [ ] Remember me          Forgot password?  |  |
|  |               [ Sign in ]                  |  |
|  |                 Create account              |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
```
*Registration: name, email, password, confirm password. Forgot/reset password and first-login onboarding use the same auth visual system. Onboarding collects preferred languages/categories, timezone, revision mode, daily target, and theme; optional sections can be skipped.*

### 4.2 Dashboard
```
+--------------+--------------------------------------------------------+
| CodeTrack    | Dashboard                         [+ Add Question]     |
| Dashboard    | [Total] [Done] [In Progress] [Due] [Overdue] [Streak]  |
| Questions    |                                                        |
| Revisions    | Recently Worked                Today's Revisions      |
| Stats        | Two Sum          Revised now    SQL Joins   [Revise] |
| Activity     | C# Delegates     Notes edited   Two Sum     [Revise] |
| Settings     |                                                        |
|              | Category Progress            Study Activity         |
|              | DSA / SQL / Languages        Heatmap / Goal         |
+--------------+--------------------------------------------------------+
```
*Show recent questions newest meaningful activity first, regardless of category; overdue items should be visible prominently but not confused with pending unsolved questions.*

### 4.3 My Questions
```
+-----------------------------------------------------------------------+
| My Questions                                         [+ Add Question] |
| [Search...] [All/DSA/SQL/Languages] [Topic] [Status] [Source] [Sort]  |
| Default sort: Recently Active (descending)                            |
| Title         Platform ID  Category  Topic     Status  Last Activity   |
| Two Sum       LC #1        DSA       Arrays    Done    Revised 10:30  |
| SQL JOIN      —            SQL       Joins     WIP     Edited 09:00   |
| Reverse Array —            DSA       Arrays    Done    Done yesterday |
+-----------------------------------------------------------------------+
```
*Support filter combinations, pagination/infinite loading, stable sorting, and preservation of filters when navigating back. On mobile, represent each question as a stacked card.*

### 4.4 Add / Edit Question
```
+-------------------------------------------------------------------+
| Add Question                                             [Cancel] |
| Title*                   [____________________________________]    |
| Category* [DSA v]  Topic* [Arrays v]  Difficulty [Easy v]          |
| Status [Not Started v]  Language [conditional]                   |
| Source platform [LeetCode v]  Platform Question ID [________]     |
| Source URL [________________________________________________]     |
| [+ Add another source]                                            |
| Notes                                                              |
| [B] [I] [Heading] [List] [Code] [Link] [Image]                   |
| +-------------------------------------------------------------+   |
| | Approach, code, key learning, mistakes...                    |   |
| +-------------------------------------------------------------+   |
| Revision: [Enable]  [Automatic / Manual] [Next Date]              |
|                        [Save & Add Another] [Save Question]       |
+-------------------------------------------------------------------+
```
*Save & Add Another resets the question-specific fields and optionally retains category, topic and source for fast repeated entry. Show validation, duplicate warnings and unsaved-change confirmation.*

### 4.5 Question Detail
```
+------------------------------------------------------------------+
| DSA / Arrays / Two Sum                           [Edit] [More]    |
| Two Sum                    [Easy] [Done] [LeetCode #1]            |
| [Open source link]     Added / solved / last activity              |
| Notes                                   [Edit Notes]              |
| +--------------------------------------------------------------+  |
| | Rich content / code / links / images                         |  |
| +--------------------------------------------------------------+  |
| Next Revision: 29 Oct       [Mark Revised] [Reschedule]          |
| Revision History: Rev 2 / Rev 1 (newest first)                    |
| Activity Timeline: status changed, notes edited, revised         |
+------------------------------------------------------------------+
```

### 4.6 Revision Center
```
+------------------------------------------------------------------+
| Revision Center                                                  |
| [Today 5] [Overdue 3] [Tomorrow 4] [Upcoming 12]                |
| Tabs: All Due | Today | Overdue | Tomorrow | Upcoming | History |
|       Pending Questions                                          |
| Two Sum — DSA / Arrays — Rev 3          [Revise] [Reschedule]    |
| SQL Joins — SQL / Joins — Rev 1         [Revise] [Reschedule]    |
+------------------------------------------------------------------+
```
*Due order: oldest overdue first, then today; future sorted by nearest due date. The completion dialog accepts optional notes; the reschedule dialog selects a new date. Revision History is newest completed first.*

### 4.7 My Stats
```
+------------------------------------------------------------------+
| My Stats    [Today] [Week] [Month] [Custom dates] [Category]     |
| [Added] [Completed] [Revisions Done] [Pending] [Overdue]         |
| Completions over time          | Completed by category           |
| Line graph                     | Bar chart                       |
| Status distribution            | Revision completion            |
| Topic progress                 | Source breakdown               |
+------------------------------------------------------------------+
```

### 4.8 Activity, Settings and Profile
```
Activity: [Current streak] [Longest streak] [Active days] [Goal]
          [Calendar heatmap] [Weekly trend]

Settings: Profile | Appearance | Timezone | Revision intervals |
          Daily target | Data export | Account/Security

Profile:  [Avatar] [Name] [Joined date] [Question totals] [Streak]
```

---

## 5. Page-by-Page Requirements and Acceptance Criteria

### 5.1 Login, Register, Reset Password
- Sign in/register with validation and accessible inline errors.
- Password show/hide; secure, rate-limited auth endpoints; safe password-reset handling.
- Authenticated users redirected to dashboard, or onboarding on first login.
- Never disclose account existence through reset-password response.

### 5.2 Onboarding
- Preferred categories/languages, timezone, auto/manual revisions, default intervals, daily question/revision goal and theme.
- User can revise preferences later; optional inputs skippable.

### 5.3 Dashboard
- Cards: total questions, Done, In Progress, pending, due today, overdue, streak.
- Recently worked questions descending by last meaningful activity.
- Due today actions, upcoming revisions, category progress and small heatmap.
- All dashboard cards link to appropriate filtered views.

### 5.4 My Questions
- Search by title, optional platform ID and tags; filter by category/topic/status/difficulty/source.
- Default order `lastActivityAt DESC`, `id DESC`; configurable alternate sorts.
- Preserve filter and sort URL/search params on back navigation.
- Supports edit, archive, delete with confirmation and pagination.
- Empty, loading and error states.

### 5.5 Add/Edit Question
- Required title, category, topic; optional subtopic/language, difficulty, source links, platform number, tags and rich notes.
- Status defaults to `Not Started`.
- No auto-fetch from URLs in V1; validate and store links manually.
- When `Done`, allow automatic first revision or manual selection; for other statuses, user may optionally schedule study reminders separately if implemented later.
- Save & Add Another supports several entries on one day.
- Duplicate warning based on user + normalized source/platform ID and likely title matches; do not automatically merge unrelated records.

### 5.6 Question Detail
- Read/edit full metadata, source links, notes, status and revision information.
- Notes auto-save or explicit save with visible status and safe conflict behavior; successful notes edits update last activity.
- Revision history and activity timeline shown newest first.

### 5.7 Revision Center
- Tabs: Today, Overdue, Tomorrow, Upcoming, Completed History, Pending Questions.
- Mark Revised saves occurrence and schedules next; repeat-click safe.
- Reschedule affects future due date, never erases completed history.
- Distinguish pending unsolved questions from overdue revisions.

### 5.8 My Stats
- Filters: Today, Yesterday, Last 7 Days, Month, Last 30 Days, Custom, categories/topics.
- Questions added by creation timestamp; completed by actual done event; revisions by completed timestamp.
- Distinguish flow metrics (events within range) from snapshot counts (status at end of range).
- Support time-series charts, category/topic/status breakdown, source breakdown and no-data states.

### 5.9 Activity/Streak
- Show current/longest streak, daily goal, heatmap and weekly trend.
- A local calendar day is active if at least one question was completed or one revision completed.
- Viewing, note editing, opening app and filtering do not extend streak.

### 5.10 Settings/Profile
- Name, email, theme, timezone, default category, default question sort, revision configuration and daily target.
- Export and deletion flows can follow core MVP if necessary.

---

## 6. Revision Engine (Business Rules)

### Default Automatic Spacing
- **Suggested intervals:** 1, 3, 7, 15, 30, 60 days (configurable per user).
- **Trigger:** Initial `Done` date triggers scheduling of first revision, unless user explicitly selects manual.
- **Interval Advancement:** On successful completion, write history and compute the next date from actual completion date, using next interval; avoid immediate overdue chaining.
- **Manual Mode:** Allows selecting any next date. Switching modes must not destroy history.
- **Rescheduling:** A revision can be rescheduled; keep an audit event of the change.
- **History Immutability:** Completed history is append-only; protect against duplicate submissions with transactions/idempotency.
- **Timezone Awareness:** Timezone-aware local dates determine Today, Overdue, Tomorrow, Upcoming.
- **Exclusions:** Paused/archived/skipped questions do not automatically create fresh revisions unless explicitly re-enabled.

### Revision States
| View / State | Definition |
| :--- | :--- |
| **Today** | Open scheduled occurrence due today in user's timezone |
| **Overdue** | Open occurrence due before today |
| **Tomorrow** | Open occurrence due next local date |
| **Upcoming** | Open occurrence due after tomorrow |
| **Completed** | Occurrence successfully completed with completion timestamp |
| **Pending Questions** | Questions still `Not Started` or `In Progress`; a separate concept |

> **Critical:** Do not persist dynamic labels *Today*, *Tomorrow*, or *Overdue* as static database states.

---

## 7. Recently Active Question Ordering (Critical)

Store `UserQuestion.lastActivityAt` (UTC). Update this whenever the user meaningfully works on a question:
1. First creation.
2. Status change.
3. Successful completion (`Done`).
4. Completed revision.
5. Saved note edit.
6. Explicitly recorded study session, if implemented.

*Do not update from page views, filters, merely opening an editor, or background revision-date recalculations. Manual due-date changes may appear in audit history but should not move the question up unless treated as a meaningful study session.*

### Default Query
```sql
SELECT *
FROM "UserQuestions"
WHERE "userId" = :currentUserId AND "archivedAt" IS NULL
ORDER BY "lastActivityAt" DESC, "id" DESC
LIMIT :pageSize;
```

### Ordering Example
| Last Event | Question | Position |
| :--- | :--- | :---: |
| Revision completed today 10:30 | Two Sum | 1 |
| Notes edited today 09:00 | SQL Joins | 2 |
| Question completed yesterday | Reverse Array | 3 |

---

## 8. Database Model
Use UUID primary keys, UTC event timestamps, local-date derivation via user timezone, proper foreign keys, and indexes.

### Entities and Fields
| Entity | Selected Fields |
| :--- | :--- |
| **User** | `id`, `name`, `email`, auth provider credentials/reference, `createdAt` |
| **UserSettings** | `userId`, `timezone`, `theme`, `revisionMode`, `revisionIntervals`, `dailyGoal`, `defaultSort` |
| **Category** | `id`, `name`, `slug`, `ownerId` (nullable) |
| **Topic** | `id`, `categoryId`, `parentTopicId` (nullable), `ownerId` (nullable), `name` |
| **Question** | `id`, `title`, `categoryId`, `topicId`, `difficulty`, `createdBy` |
| **Source** | `id`, `platform`, `externalQuestionId` (nullable), `label`, `url` |
| **QuestionSource** | `questionId`, `sourceId`, `isPrimary` |
| **UserQuestion** | `id`, `userId`, `questionId`, `status`, `createdAt`, `solvedAt` (nullable), `lastActivityAt`, `archivedAt` (nullable) |
| **QuestionNote** | `id`, `userQuestionId`, `contentJson`, `updatedAt` |
| **RevisionSchedule**| `id`, `userQuestionId`, `mode`, `stepIndex`, `nextDueDate`, `pausedAt` (nullable) |
| **RevisionOccurrence** | `id`, `scheduleId`, `revisionNumber`, `originallyDueDate`, `currentDueDate`, `status`, `completedAt` (nullable), `notes` (nullable) |
| **RevisionAudit** | `id`, `occurrenceId`, `eventType`, `oldDueDate`, `newDueDate`, `occurredAt` |
| **ActivityEvent** | `id`, `userId`, `userQuestionId`, `eventType`, `occurredAt`, `payloadJson` (nullable) |
| **Attachment** | `id`, `userId`, `noteId`, `storageKey`, `mimeType`, `bytes` |
| **Tag / UserQuestionTag** | `userId`-scoped tags and link entities |

### Decisions to Enforce
- Unique `(userId, questionId)` on `UserQuestion`; if the same catalog question can be studied in multiple tracks, revisit that uniqueness explicitly.
- Unique normalized `(platform, externalQuestionId)` only where a stable external ID is actually available.
- Index by user/status/activity, schedule/due date, activity completion timestamp.
- User notes, sources, attachments, and revision operations must be scoped through their owning `UserQuestion`.
- Server must authorize every action; don't rely on hiding UI controls.
- Preserve completion and revision history when a question is reopened; use activity events to compute historical metrics accurately.
- A completed revision history entry is immutable except for a documented correction process.

---

## 9. Proposed Server Endpoints

| Endpoint | Function |
| :--- | :--- |
| `POST /api/questions` | Create question + user record + sources + notes |
| `GET /api/questions` | Filter/search/order/paginate owned questions |
| `GET /api/questions/:id` | Read owned question and related data |
| `PATCH /api/questions/:id` | Update details/status/notes |
| `DELETE /api/questions/:id` | Archive or confirmed delete |
| `GET /api/revisions` | Return due queues and history |
| `POST /api/revisions/:id/complete` | Transactionally complete and schedule next |
| `PATCH /api/revisions/:id` | Change next due date |
| `GET /api/stats` | Date-filtered analytics |
| `GET /api/activity` | Streak and calendar heatmap |
| `PATCH /api/settings` | User preferences |

*Auth routes depend on selected auth provider. Validation and authorization must be handled on the server regardless of client-side checks.*

---

## 10. Suggested Project Structure

```
src/
  app/
    (auth)/
      login/
      register/
      forgot-password/
      reset-password/
    onboarding/
    (app)/
      dashboard/
      questions/
        new/
        [id]/
      revisions/
      stats/
      activity/
      settings/
      profile/
    api/
      questions/
      revisions/
      stats/
      activity/
  components/
    layout/
    questions/
    revisions/
    editor/
    charts/
    ui/
  lib/
    auth/
    db/
    revisions/
    stats/
    validation/
    timezone/
  server/
    repositories/
    services/
  types/
prisma/
  schema.prisma
  migrations/
tests/
  unit/
  integration/
  e2e/
```

---

## 11. Implementation Milestones

### Phase 1 — Foundation and Auth
- [ ] Scaffold Next.js App Router + TypeScript project.
- [ ] Configure Tailwind, shadcn/ui and light/dark/system theme.
- [ ] Configure PostgreSQL, Prisma and migrations.
- [ ] Choose and implement auth solution, registration/login/password reset.
- [ ] Protect app routes and user-scoped data.
- [ ] Build shared sidebar, top bar, responsive layout and basic empty states.
- [ ] Create onboarding/profile/settings baseline.
> **Done when:** Two accounts can log in separately and cannot read or modify each other's data.

### Phase 2 — Question Tracking
- [ ] Category/topic/language management.
- [ ] Add/edit question forms (manual only).
- [ ] Support multiple platform links + optional external question IDs.
- [ ] Status/difficulty/tag fields; optional duplicate detection.
- [ ] Questions list filters, search, pagination and recently active sort.
- [ ] Question detail screen and activity timeline.
- [ ] Implement Save & Add Another workflow.
> **Done when:** A user can enter multiple questions on one day; a recently edited or worked question appears at the top of their list.

### Phase 3 — Rich Text Notes
- [ ] Tiptap with headings, lists, links, code blocks and syntax highlighting.
- [ ] Safe image upload, owner checks and private storage.
- [ ] Handle notes saving, unsaved state, sanitization and length limits.
- [ ] Update question activity only after meaningful saved edits.
> **Done when:** Rich notes persist, render safely, and can be edited on desktop and mobile.

### Phase 4 — Revision System
- [ ] Auto/manual schedule settings.
- [ ] Date-based queues: Today, Overdue, Tomorrow, Upcoming.
- [ ] Complete revision modal with optional notes.
- [ ] Transactional next scheduling and append-only history.
- [ ] Reschedule dialog and audit trail.
- [ ] Separate Pending Questions tab.
- [ ] User-local timezone and midnight edge cases.
> **Done when:** Completed revision moves the question to the top, records exactly one completion, and creates the next correct date.

### Phase 5 — Dashboard, Stats, Streak
- [ ] Dashboard summary cards, recently active list and today's revisions.
- [ ] Custom date filters and category/topic analytics.
- [ ] Time-series, status/category/source charts.
- [ ] Activity event aggregation, streak, longest streak and heatmap.
- [ ] Consistent historical metric definitions and empty states.
> **Done when:** Counts are reproducible from stored events and changing the date range updates all relevant metrics consistently.

### Phase 6 — Hardening and Launch
- [ ] Unit tests for scheduling, streaks, and statistics.
- [ ] Integration tests for DB transactions and user authorization.
- [ ] End-to-end tests for onboarding → question entry → revision → stats.
- [ ] Accessibility review: keyboard, labels, contrast, focus and validation.
- [ ] Responsive QA at 390, 768 and 1440px.
- [ ] Validate uploads, URLs, rate limits and security headers.
- [ ] Add error monitoring, backup/restore plan, migrations and deployment secrets.
- [ ] Deploy to Vercel and managed PostgreSQL; test production flows.
> **Done when:** Production supports real multi-user usage without leaking data or losing revision history.

---

## 12. Test Scenarios (Must Pass)

1. User A cannot access User B's question, attachment, notes or revision by guessing IDs.
2. Creating multiple questions on the same day succeeds without overwriting existing data.
3. Revising an old question moves it above more recently created but untouched questions.
4. Opening a question without changing anything does not reorder it.
5. Editing notes and saving reorders the question; changing filters does not.
6. Automatic revision intervals advance correctly after late completion.
7. Double-clicking Complete doesn't create duplicate revision history or next schedules.
8. Manually rescheduling does not delete old completed revision records.
9. Today/Tomorrow/Overdue follow user's selected timezone across midnight and DST where relevant.
10. Changing a question from Done back to In Progress retains prior completion and revision events.
11. Date-filtered statistics are correct when multiple revisions occur on the same day.
12. A user with no questions sees useful empty states without broken charts.
13. Dark mode and mobile forms remain readable and usable.
14. Source URLs and embedded note content are validated and safely rendered.

---

## 13. Deferred to V2

- Automatic source URL metadata fetching/scraping or platform integration adapters.
- Excel/CSV bulk import and export (export may be added earlier if needed).
- Email/push revision reminders and scheduled jobs.
- Adaptive spaced-repetition intervals based on user-rated difficulty.
- Sharing/public profiles/team study groups and leaderboards.
- Offline PWA functionality.

---

## 14. Non-Negotiable Project Rules

1. Do not delete, rename, redesign or refactor existing features without explicit approval.
2. Reuse components and keep a single source of truth for status/revision calculations.
3. Never silently discard notes or revision history.
4. All database writes require authorization, validation and correct ownership checks.
5. Keep feature scope aligned with V1 manual entry before adding URL import automation.
6. Prioritize quick question entry, clear revision actions, accurate stats, and recently active ordering over extra visual effects.

---

## 15. Definition of V1 Complete

A newly registered user can onboard, manually create DSA/SQL/language questions with platform numbers, links and rich notes; update statuses; find their most recently worked/revised items at the top; complete/reschedule revisions with preserved history; see time-filtered stats and streaks; and use the responsive deployed app in light/dark mode without accessing any other user's records.
