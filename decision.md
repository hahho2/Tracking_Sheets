# CodeTrack — Architecture & Product Decision Records (ADRs)

> **Document Purpose:** This file records all foundational architectural, technical, product, and data-modeling decisions for **CodeTrack V1**, explaining **what** was decided, **why** each decision was taken, what alternatives were considered, and how they map to files and implementations.  
> **Companion Documents:** [Plan.md](./Plan.md) | [Techstack.md](./.agents/Techstack.md)

---

## Decision Index

| ADR ID | Decision Title | Status | Category |
| :--- | :--- | :--- | :--- |
| **ADR-001** | [Next.js App Router as Unified Full-Stack Architecture](#adr-001-nextjs-app-router-as-unified-full-stack-architecture) | Accepted | Architecture |
| **ADR-002** | [PostgreSQL with Prisma ORM](#adr-002-postgresql-with-prisma-orm) | Accepted | Database |
| **ADR-003** | [Strict Multi-User Isolation via Scoped Repositories](#adr-003-strict-multi-user-isolation-via-scoped-repositories) | Accepted | Security / Data |
| **ADR-004** | [Manual Question Entry for V1 (Excluding URL Scraping)](#adr-004-manual-question-entry-for-v1-excluding-url-scraping) | Accepted | Product Scope |
| **ADR-005** | [Recently Active Ordering Anchored on `lastActivityAt`](#adr-005-recently-active-ordering-anchored-on-lastactivityat) | Accepted | Core UX / Performance |
| **ADR-006** | [Dynamic Timezone-Aware Revision States & Non-Static DB Persistence](#adr-006-dynamic-timezone-aware-revision-states--non-static-db-persistence) | Accepted | Business Engine |
| **ADR-007** | [Append-Only Immutable Revision History & Idempotent Completion](#adr-007-append-only-immutable-revision-history--idempotent-completion) | Accepted | Data Integrity |
| **ADR-008** | [Calendar Day Streak Based on Qualifying Active Recall Events](#adr-008-calendar-day-streak-based-on-qualifying-active-recall-events) | Accepted | Gamification / Metrics |
| **ADR-009** | [Tiptap JSON Notes + Private Object Storage with Signed URLs](#adr-009-tiptap-json-notes--private-object-storage-with-signed-urls) | Accepted | Rich Content / Storage |
| **ADR-010** | [Tailwind CSS + shadcn/ui + CSS Variables Theming](#adr-010-tailwind-css--shadcnui--css-variables-theming) | Accepted | Frontend / Styling |
| **ADR-011** | [Auth.js (NextAuth) with Prisma Adapter & Server-Side Guards](#adr-011-authjs-nextauth-with-prisma-adapter--server-side-guards) | Accepted | Authentication |
| **ADR-012** | [Google Stitch MCP Integration via `mcp-remote` Proxy Bridge](#adr-012-google-stitch-mcp-integration-via-mcp-remote-proxy-bridge) | Accepted | Tooling & AI Pair-Programming |
| **ADR-013** | [Neo-Morphic Visual Design & Theme System Matching Stitch Design Screens](#adr-013-neo-morphic-visual-design--theme-system-matching-stitch-design-screens) | Accepted | Frontend Design / Aesthetics |
| **ADR-014** | [Client Reactive Store Architecture & PostCSS Tailwind v4 Engine](#adr-014-client-reactive-store-architecture--postcss-tailwind-v4-engine) | Accepted | State Management & Interactivity |

---

### ADR-001: Next.js App Router as Unified Full-Stack Architecture

- **Status:** Accepted (V1)
- **Category:** System Architecture
- **Context:** We needed to choose the web framework and runtime structure for CodeTrack. The options were: (1) Next.js App Router with Server Actions and Route Handlers, or (2) React SPA (Vite) + separate Node.js / Express backend server.
- **Decision:** Use **Next.js App Router** with React, TypeScript, Server Actions for mutations, and Route Handlers for standard HTTP/upload endpoints running on the Node.js runtime. No separate Express server in V1.
- **Why We Took It:**
  1. **Zero-API-boilerplate type safety:** Server Actions allow direct calling of server logic with end-to-end TypeScript types and Zod validation, eliminating redundant REST boilerplate for internal forms.
  2. **Single deployment artifact:** Deploying both frontend and backend together to Vercel drastically simplifies CI/CD, environment variable management, and local development.
  3. **No CORS overhead:** Client-to-server communication is same-origin, avoiding cross-origin credential issues.
  4. **Fast initial server render:** Dashboard, detail views, and listings can server-render initial data without client-side loading flashes.
- **Alternatives Considered:**
  - *Separate Express/Fastify API:* Adds infrastructure complexity (2 servers to deploy, monitor, and configure CORS), doubles deployment cost, and complicates local developer setup.
- **Trade-offs & Mitigations:**
  - *Serverless connection limits with PostgreSQL:* Handled by using connection pooling (Prisma Accelerate or PgBouncer) in production.
- **Affected Files:**
  - `src/app/`
  - `src/server/actions/`
  - `src/server/services/`

---

### ADR-002: PostgreSQL with Prisma ORM

- **Status:** Accepted (V1)
- **Category:** Database & Persistence
- **Context:** CodeTrack requires complex relational data modeling: Users, Questions, Topics, Categories, Sources, Notes, Revision Schedules, Revision Occurrences, Audit Trails, and Activity Events.
- **Decision:** Use **PostgreSQL** as the primary relational database with **Prisma ORM** for schema definition, migrations, and typed queries.
- **Why We Took It:**
  1. **Relational guarantees:** Strict foreign keys, cascade deletes where appropriate, unique composite constraints (e.g. `(userId, questionId)`, `(platform, externalQuestionId)`), and ACID transactions.
  2. **Atomic multi-table transactions:** Marking a revision complete requires: recording revision history + updating next revision schedule + writing an activity event + bumping `lastActivityAt`. Prisma’s interactive transactions (`prisma.$transaction`) make this bulletproof.
  3. **Predictable schema migrations:** Versioned migrations committed in Git ensure all environments are strictly synchronized.
- **Alternatives Considered:**
  - *MongoDB / Document Store:* Relational joins and consistency across revisions, notes, and activity histories would require manual application-level integrity logic that is prone to orphan records.
  - *Drizzle ORM:* Excellent, but Prisma’s mature schema declaration and migration tooling provide faster and safer setup for this multi-entity schema.
- **Trade-offs & Mitigations:**
  - *Prisma engine cold-start overhead in serverless:* Use singleton Prisma client (`src/lib/db.ts`) with pooled connection strings.
- **Affected Files:**
  - `prisma/schema.prisma`
  - `prisma/migrations/`
  - `prisma/seed.ts`
  - `src/lib/db.ts`

---

### ADR-003: Strict Multi-User Isolation via Scoped Repositories

- **Status:** Accepted (V1)
- **Category:** Security & Multi-Tenancy
- **Context:** Multiple users will use CodeTrack simultaneously. One user must never be able to read, edit, or delete another user's questions, notes, revision history, or attachments by guessing IDs (IDOR).
- **Decision:** Enforce user ownership in all repository and service methods. Separate the conceptual catalog entity (`Question`) from the user tracking entity (`UserQuestion`). Every query starts with `WHERE userId = :currentUserId`.
- **Why We Took It:**
  1. **Defense in depth:** Hiding UI buttons or relying on client routing is never enough. Every Server Action and Route Handler extracts `userId` from the verified session and passes it down.
  2. **Ownership checks in repositories:** Queries like `findFirst({ where: { id, userId } })` naturally return 404/null if an ID belongs to someone else.
  3. **Future catalog sharing:** Separating `Question` from `UserQuestion` allows V2 to introduce global curated question lists (e.g. "Striver SDE Sheet") without rewriting the user-tracking schema.
- **Alternatives Considered:**
  - *Single combined Question table with `userId`:* Simpler, but prevents sharing questions or templates across users in the future.
- **Affected Files:**
  - `src/lib/auth-guard.ts`
  - `src/server/repositories/question.repository.ts`
  - `src/server/repositories/revision.repository.ts`

---

### ADR-004: Manual Question Entry for V1 (Excluding URL Scraping)

- **Status:** Accepted (V1)
- **Category:** Product Scope & Reliability
- **Context:** Should V1 automatically scrape metadata (problem title, tags, description) from LeetCode, GFG, HackerRank URLs?
- **Decision:** **Strictly manual entry in V1.** Support manual entry of external URLs, platform IDs, tags, difficulty, and rich notes. Automated scraping/parsing is deferred to V2.
- **Why We Took It:**
  1. **Anti-bot measures:** Platforms like LeetCode and GFG use Cloudflare bot protection, dynamic client-side hydration (Next.js/React), and IP rate-limiting that break server-side scraping without heavy browser orchestration (Puppeteer/Playwright).
  2. **Fragility and maintenance cost:** Third-party DOM changes cause silent failures, leading to frustrating user experiences.
  3. **Speed of entry:** With the "Save & Add Another" feature (which retains category, topic, and platform), manual entry takes under 15 seconds per question.
- **Alternatives Considered:**
  - *Scraping microservice / Puppeteer:* High maintenance, heavy hosting footprint, and prone to breaking.
- **Affected Files:**
  - `src/components/questions/question-form.tsx`
  - `src/lib/validations/question.schema.ts`

---

### ADR-005: Recently Active Ordering Anchored on `lastActivityAt`

- **Status:** Accepted (V1)
- **Category:** Core UX & Database Querying
- **Context:** Users work on questions across multiple days. Default alphabetical or creation-date ordering buries recently revised or edited questions.
- **Decision:** Store an explicit `lastActivityAt` (UTC timestamp) on `UserQuestion`. Order all default list views by `lastActivityAt DESC, id DESC`. Update this field **only on meaningful actions**:
  1. Question creation
  2. Status change (e.g., `In Progress` → `Done`)
  3. Saved note edits
  4. Completed revision
- **Why We Took It:**
  1. **Immediate context recall:** When a user opens CodeTrack, the problem they were just studying or revised earlier that morning is immediately at the top.
  2. **No phantom updates:** Passive actions (opening the page, viewing notes, filtering, search) do NOT touch `lastActivityAt`.
  3. **Fast indexable queries:** A composite B-tree index on `(userId, archivedAt, lastActivityAt DESC, id DESC)` ensures queries run in sub-millisecond time.
- **Alternatives Considered:**
  - *Using `updatedAt`:* Too broad. Any background script, cache touch, or accidental save would falsely move a question to the top.
- **Affected Files:**
  - `src/lib/activity.ts`
  - `src/server/services/question.service.ts`
  - `src/server/repositories/question.repository.ts`

---

### ADR-006: Dynamic Timezone-Aware Revision States & Non-Static DB Persistence

- **Status:** Accepted (V1)
- **Category:** Business Engine
- **Context:** Should states like `Today`, `Overdue`, `Tomorrow`, `Upcoming` be persisted as static columns in the database?
- **Decision:** **Never persist dynamic temporal labels as static database enum columns.** Store `nextDueDate` (as a UTC timestamp or calendar date) and compute `Today`, `Overdue`, `Tomorrow`, and `Upcoming` dynamically on query time using the user's configured timezone (`UserSettings.timezone`).
- **Why We Took It:**
  1. **No midnight desynchronization:** A question due "Tomorrow" becomes "Today" when the clock strikes midnight in the user's timezone. Static database values would require cron jobs across thousands of timezones to constantly update rows.
  2. **No overdue cascading:** If a revision was scheduled for October 10th and the user completes it on October 20th, the next interval (e.g. +7 days) is calculated from **October 20th** (actual completion date), NOT October 10th. This prevents a completed revision from immediately creating another overdue item.
- **Alternatives Considered:**
  - *Daily cron job updating static status columns:* High complexity, fails when users change timezones, and leaves data in inconsistent states if cron fails.
- **Affected Files:**
  - `src/lib/dates.ts`
  - `src/server/services/revision.service.ts`
  - `src/components/revisions/revision-card.tsx`

---

### ADR-007: Append-Only Immutable Revision History & Idempotent Completion

- **Status:** Accepted (V1)
- **Category:** Data Integrity & Auditing
- **Context:** How to record completed revisions and prevent duplicate submissions from rapid double-clicks or unstable connections.
- **Decision:**
  - Keep a dedicated append-only `RevisionOccurrence` / `RevisionHistory` table.
  - Completed records are immutable.
  - Rescheduling a future date updates `RevisionSchedule.nextDueDate` and logs a `RevisionAudit` event, but never alters completed history.
  - Guard completions with unique idempotency keys or database transactions to prevent duplicate history records.
- **Why We Took It:**
  1. **Historical accuracy:** Historical statistics (e.g., "revisions completed last month") must remain accurate forever, even if the question is reopened or deleted later.
  2. **Safe concurrency:** Double-clicking "Mark Revised" on a slow connection won't advance intervals twice or create duplicate entries.
- **Alternatives Considered:**
  - *Only storing `lastRevisionDate` on the question:* Loses all historical context and makes trend charts impossible to generate.
- **Affected Files:**
  - `src/server/services/revision.service.ts`
  - `src/server/repositories/revision.repository.ts`

---

### ADR-008: Calendar Day Streak Based on Qualifying Active Recall Events

- **Status:** Accepted (V1)
- **Category:** Metrics & Gamification
- **Context:** How to calculate daily study streaks fairly and reliably across different timezones.
- **Decision:** A calendar day counts as "active" if and only if **at least 1 question is completed (`Done`) OR at least 1 revision is completed** between 00:00:00 and 23:59:59 in the user's local timezone. Viewing questions, opening the app, or editing notes does NOT extend streaks.
- **Why We Took It:**
  1. **Incentivizes real learning:** Passive clicks or opening a tab do not constitute active recall or problem solving.
  2. **Timezone fairness:** A user solving a problem at 11:30 PM in Tokyo must have that day credited to Tokyo's calendar date, not UTC.
- **Alternatives Considered:**
  - *Rolling 24-hour window:* Confusing to users because morning vs evening study sessions could break a streak unexpectedly.
- **Affected Files:**
  - `src/lib/dates.ts`
  - `src/server/services/streak.service.ts`
  - `src/components/charts/activity-heatmap.tsx`

---

### ADR-009: Tiptap JSON Notes + Private Object Storage with Signed URLs

- **Status:** Accepted (V1)
- **Category:** Rich Content & Media Storage
- **Context:** How to store rich notes (code blocks, headings, lists, formatted text) and embedded images securely.
- **Decision:**
  - Use **Tiptap** headless editor with lowlight syntax highlighting.
  - Store notes as **structured JSON** (`QuestionNote.contentJson`) in PostgreSQL.
  - Store images in **private S3-compatible object storage** (e.g. AWS S3, Cloudflare R2, or Supabase Storage).
  - Images are uploaded via server-generated signed URLs and accessed only via authenticated signed read URLs.
- **Why We Took It:**
  1. **XSS protection:** Storing structured JSON rather than raw HTML strings eliminates stored cross-site scripting vulnerabilities.
  2. **Database hygiene:** Uploaded images can be megabytes in size; storing them directly as Base64 in PostgreSQL causes database bloat and slow backups.
  3. **Privacy:** User study notes containing proprietary code or private solutions must not have publicly accessible image URLs.
- **Alternatives Considered:**
  - *Raw Markdown textarea:* Poor user experience for inline images, code formatting, and non-technical note taking.
  - *Public image uploads:* Violates multi-user privacy requirements.
- **Affected Files:**
  - `src/components/editor/rich-notes-editor.tsx`
  - `src/components/editor/read-only-notes.tsx`
  - `src/server/services/upload.service.ts`
  - `src/app/api/uploads/sign/route.ts`

---

### ADR-010: Tailwind CSS + shadcn/ui + CSS Variables Theming

- **Status:** Accepted (V1)
- **Category:** Frontend Styling & UI
- **Context:** Choosing the UI design system, styling framework, and theme architecture.
- **Decision:** Use **Tailwind CSS** with **shadcn/ui** accessible components (built on Radix UI primitives) and **next-themes** with CSS variables for Light / Dark / System modes.
- **Why We Took It:**
  1. **No runtime CSS-in-JS overhead:** Tailwind compiles to minimal static CSS, ensuring fast page load times and zero hydration mismatches.
  2. **Total code ownership:** shadcn/ui copies accessible, customizable primitives directly into `src/components/ui`, avoiding locked third-party component dependencies.
  3. **Keyboard accessibility:** Radix primitives provide ARIA attributes, keyboard navigation, and focus management out of the box.
  4. **Instant dark mode:** Using semantic CSS variables (e.g., `hsl(var(--background))`) enables flicker-free theme switching.
- **Alternatives Considered:**
  - *Material UI / Ant Design:* Heavy bundle size, difficult to customize, and poor fit for modern Next.js server components.
- **Affected Files:**
  - `src/app/globals.css`
  - `src/components/ui/`
  - `src/components/providers/theme-provider.tsx`
  - `components.json`

---

### ADR-011: Auth.js (NextAuth) with Prisma Adapter & Server-Side Guards

- **Status:** Accepted (V1)
- **Category:** Authentication & Authorization
- **Context:** Selecting the authentication system for multi-user sign-up, credential login, password reset, and session management.
- **Decision:** Use **Auth.js (v5)** with the **Prisma adapter**, secure cookie sessions, and bcrypt password hashing. Create centralized server-side guards (`requireUser()`).
- **Why We Took It:**
  1. **Native Next.js App Router integration:** Seamless session checking inside Server Components, Server Actions, and Route Handlers.
  2. **Extensible:** Supports Email/Password credentials in V1 and allows adding GitHub/Google OAuth in the future by adding simple provider keys.
  3. **Centralized guard:** `requireUser()` guarantees that unauthenticated calls fail immediately at the top of any Server Action.
- **Alternatives Considered:**
  - *Custom JWT roll-your-own auth:* High security risk regarding cookie flags, refresh tokens, and CSRF protection.
  - *Clerk / Supabase Auth:* External dependency that can be harder to run fully offline or unit test in CI without cloud credentials.
- **Affected Files:**
  - `src/auth.ts`
  - `src/lib/auth-guard.ts`
  - `src/app/(auth)/`

---

### ADR-012: Google Stitch MCP Integration via `mcp-remote` Proxy Bridge

- **Status:** Accepted (V1)
- **Category:** Development Tooling & MCP Integration
- **Context:** The development environment uses Google Stitch MCP for UI design system inspection, screen generation, and variant workflows. Stitch operates over remote HTTP Streamable transport and requires an API key header (`X-Goog-Api-Key`), whereas Antigravity IDE natively spawns local stdio processes for MCP.
- **Decision:** Configure Stitch MCP globally (`~/.gemini/config/mcp_config.json` and `~/.gemini/antigravity-ide/mcp_config.json`) and locally (`.agents/mcp_config.json`) using `npx -y mcp-remote` to bridge remote HTTP Streamable transport into local stdio.
- **Why We Took It:**
  1. **Protocol compatibility:** `mcp-remote` proxies between local STDIO and remote StreamableHTTPClientTransport, passing custom headers cleanly.
  2. **Centralized tool discovery:** Exposes all 16 Stitch design system tools (`list_screens`, `apply_design_system`, `generate_screen_from_text`, etc.) directly into the agent workflow.
- **Affected Files:**
  - `c:\Study Tracker\.agents\mcp_config.json`
  - `c:\Study Tracker\mcp_config.json`
  - `~/.gemini/config/mcp_config.json`
  - `~/.gemini/antigravity-ide/mcp_config.json`

### ADR-013: Neo-Morphic Visual Design & Theme System Matching Stitch Design Screens

- **Status:** Accepted (V1)
- **Category:** Frontend Design / Aesthetics & Design System
- **Context:** The product requires a visually stunning, polished developer experience matching the 11 exported Stitch design screens (Project ID: `1652372752977837060`), including soft neo-morphic depth (`.neo-raised`, `.neo-inset`, `.neo-fab`), vibrant semantic accents, and flawless dark/light mode switching.
- **Decision:**
  - Implement a customized Tailwind theme using HSL CSS variables for `--background`, `--card`, `--primary`, `--border`, etc.
  - Define custom utility classes in `src/app/globals.css`:
    - `.neo-raised`: Dual-shadow raised elevation for cards, pills, and buttons with subtle border highlights.
    - `.neo-inset`: Inset recessed shadow for search inputs, code blocks, and active states.
    - `.neo-fab`: Vibrant indigo-to-purple gradient floating action button with ambient glow for mobile/quick-add actions.
  - Implement dynamic interactive dialogs matching Stitch Screen 11:
    - Reschedule Revision modal supporting quick intervals (`+1 Day`, `+3 Days`, `+7 Days`) and custom calendar date picker.
    - Mark Revised modal with difficulty rating (`Easy`, `Medium`, `Hard`) and optional recall notes.
  - Maintain desktop side navigation (~240px) with persistent badges and mobile bottom tab bar navigation for complete responsive parity.
- **Why We Took It:**
  1. **Visual WOW Factor:** Distinctive neo-morphic shadows combined with modern Inter typography elevate CodeTrack beyond generic cookie-cutter dashboards.
  2. **Zero Hydration Mismatch:** Next-themes with `suppressHydrationWarning` and `class` strategy ensures instantaneous, flicker-free dark mode transitions.
  3. **Direct Fidelity to Stitch Specs:** Faithfully adheres to all 11 exported screens from the Google Stitch platform.
- **Affected Files:**
  - `src/app/globals.css`
  - `src/components/layout/app-header.tsx`
  - `src/components/layout/app-sidebar.tsx`
  - `src/components/layout/mobile-nav.tsx`
  - `src/components/providers/theme-provider.tsx`
  - `src/app/(app)/dashboard/page.tsx`
  - `src/app/(app)/questions/page.tsx`
  - `src/app/(app)/questions/[id]/page.tsx`
  - `src/app/(app)/questions/new/page.tsx`
  - `src/app/(app)/revisions/page.tsx`
  - `src/app/(app)/stats/page.tsx`
  - `src/app/(app)/activity/page.tsx`
  - `src/app/(app)/settings/page.tsx`

### ADR-014: Client Reactive Store Architecture & PostCSS Tailwind v4 Engine

- **Status:** Accepted (V1)
- **Category:** State Management, UI Interactivity & CSS Compilation
- **Context:** The application required immediate UI reactivity and tactile user feedback without full round-trip page reloads. In addition, Tailwind CSS v4 required an explicit PostCSS compilation configuration (`@tailwindcss/postcss`) to transform `@import "tailwindcss";` and compile theme tokens into real CSS styles.
- **Decision:**
  - Configure `@tailwindcss/postcss` and `postcss.config.mjs` alongside `@theme` variables in `src/app/globals.css`.
  - Implement a client-side reactive store (`src/lib/store.tsx`) with localStorage persistence, managing question catalogs, active revision queues, streak counts, daily problem targets, and toast notifications.
  - Mount a global floating `ToastContainer` (`src/components/ui/toast.tsx`) to surface instantaneous micro-feedback on problem additions, revision completions, rescheduling, and preferences.
  - Implement reusable modal dialogs:
    - `RescheduleModal` (`src/components/revisions/reschedule-modal.tsx`) with presets (`+1d`, `+3d`, `+7d`) and manual calendar picker.
    - `MarkRevisedModal` (`src/components/revisions/mark-revised-modal.tsx`) with confidence ratings (`Easy`, `Medium`, `Hard`) and reflections.
  - Suppress relative date hydration mismatch warnings via `suppressHydrationWarning`.
- **Why We Took It:**
  1. **Instantaneous User Gratification:** When marking a revision or logging a problem, the revision queue, daily progress bar, and metrics react immediately.
  2. **Zero Hydration Mismatch:** Clean SSR/client separation and suppressed relative timestamps prevent console errors.
  3. **High Fidelity with Stitch Design:** Delivers the exact tactile feeling and color palettes shown in the Google Stitch design system.
- **Affected Files:**
  - `postcss.config.mjs`
  - `src/app/globals.css`
  - `src/lib/store.tsx`
  - `src/components/ui/toast.tsx`
  - `src/components/revisions/reschedule-modal.tsx`
  - `src/components/revisions/mark-revised-modal.tsx`
  - `src/app/(app)/dashboard/page.tsx`
  - `src/app/(app)/questions/page.tsx`
  - `src/app/(app)/questions/new/page.tsx`
  - `src/app/(app)/questions/[id]/page.tsx`
  - `src/app/(app)/revisions/page.tsx`
  - `src/app/(app)/settings/page.tsx`
  - `src/app/(app)/stats/page.tsx`
  - `src/app/(app)/activity/page.tsx`

---

## Decision Maintenance Rules

1. **Immutable Historical Records:** Once an ADR is marked `Accepted` and code is implemented, do not silently alter past decisions. If requirements change, author a new ADR (e.g. `ADR-013: V2 Automated LeetCode Scraping via Webhook`) superseding the older one.
2. **Mandatory Review Before Refactoring:** Any PR or feature change that contradicts an accepted decision must reference and update this document.
3. **Traceability:** Every major service or repository file must clearly reflect the corresponding ADR listed here.
