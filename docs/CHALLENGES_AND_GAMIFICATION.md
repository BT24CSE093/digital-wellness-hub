# Phase 5: Wellness Challenges & Gamification

## 1. Overview & Humane Philosophy

The Wellness Challenges & Gamification module of Digital Wellness Hub transforms habit building into an encouraging, student-centric experience. Rather than employing manipulative streak mechanisms, public leaderboards, or shame-based notifications, this module embraces **ethical, autonomy-supportive digital wellness principles**:

1. **Non-Shaming & Non-Punitive:** Missing a day does not reset your hard work to zero or lock you out. Progress is celebrated accumulatively.
2. **Private by Default:** All enrollment records, completed activities, daily reflections, and earned milestones are strictly scoped to the authenticated student. No public exposure of personal wellness metrics.
3. **Evidence-Based Habit Protocols:** Multi-day challenges are designed around deliberate focus, notification detachment, blue-light mitigation, and offline balance.
4. **Verified Core Integrations:** Achievements are computed directly from real student activity across the core wellness tools (Focus Sessions, Manual Screen-Time Logging, Self-Assessments, Daily Planner, and Challenge completions).

---

## 2. Architecture & Data Model

The module reuses the existing PostgreSQL Prisma schema without introducing unnecessary migrations:

### Database Models

- **`Challenge`**:
  - `id`: UUID (cuid)
  - `title`: String
  - `slug`: Unique slug string
  - `description`: Text (contains challenge protocol and serialized daily curriculum steps)
  - `durationDays`: Integer (e.g., 5, 7, 14)
  - `difficulty`: Enum (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`)
  - `badgeIcon`: String motif name
  - `isPublished`: Boolean
  - `createdAt`, `updatedAt`: Timestamps

- **`ChallengeEnrollment`**:
  - `id`: UUID (cuid)
  - `userId`: Foreign key -> `User(id)` (CASCADE on delete)
  - `challengeId`: Foreign key -> `Challenge(id)` (CASCADE on delete)
  - `status`: Enum (`ACTIVE`, `COMPLETED`, `ABANDONED`)
  - `startDate`: DateTime
  - `completedDate`: Nullable DateTime
  - `currentStreak`: Integer (computed consecutive active days)
  - `completedDays`: JSON array (`number[]` representing completed day indices `[1, 2, ...]`)
  - Unique constraint: `[userId, challengeId]` prevents duplicate simultaneous enrollments.

---

## 3. Challenge Lifecycle & Progress Tracking

1. **Browsing & Discovery (`GET /api/v1/challenges`):**
   - Publicly accessible without authentication.
   - Filters: search query, difficulty (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`), duration range (`minDuration`, `maxDuration`).
   - Paginated response including enrollment counts and per-user enrollment status when an auth token is provided.

2. **Enrollment (`POST /api/v1/challenges/:id/enroll`):**
   - Authenticated student starts a challenge.
   - Prevents duplicate active enrollments (returns `409 Conflict`).
   - Re-enrollment allowed if a previous attempt was marked `ABANDONED`.

3. **Daily Action Checklists (`PUT /api/v1/challenges/my/:enrollmentId/progress`):**
   - Students toggle individual days (`dayNumber: 1..durationDays`).
   - Automatically computes `progressPercentage`.
   - When all days `1..durationDays` are checked off, the enrollment status automatically transitions to `COMPLETED`, sets `completedDate`, and awards completion achievements.

4. **Withdrawal / Cancellation (`DELETE /api/v1/challenges/:id/enroll`):**
   - Students can drop out or restart at any time without punitive penalties.

---

## 4. Privacy-Conscious Achievement Engine

Students unlock milestones across 5 core categories derived purely from verified database records:

| Category | Achievement ID | Title | Criteria |
|---|---|---|---|
| **FOCUS** | `FIRST_FOCUS_SESSION` | First Step to Flow | Complete 1 verified focus timer session |
| **FOCUS** | `FOCUS_CENTURION` | Deep Work Dedication | Accumulate 100+ minutes of focused work |
| **FOCUS** | `FOCUS_MASTER` | Flow State Specialist | Complete 10+ focus sessions |
| **SCREEN_TIME** | `FIRST_SCREEN_LOG` | Digital Awareness | Manually log your daily screen-time for the first time |
| **SCREEN_TIME** | `MINDFUL_TRACKER` | Habitual Observer | Log screen-time across 5+ unique days |
| **SCREEN_TIME** | `INTENTIONAL_STUDENT` | Intentional Balance | Log screen-time with at least one category under daily limit |
| **ASSESSMENT** | `SELF_AWARE_CHECK` | Reflective Pause | Complete 1 digital wellness self-assessment |
| **ASSESSMENT** | `RECURRING_REFLECTOR` | Mindful Evolutionary | Complete 3+ digital wellness self-assessments over time |
| **PLANNER** | `FIRST_DAILY_PLAN` | Organized Mind | Create your first intentional daily planner |
| **PLANNER** | `WEEK_PLANNER` | Architect of Time | Create daily plans for 7+ days |
| **CHALLENGE** | `FIRST_CHALLENGE_JOINED` | Stepping Up | Enroll in your first wellness challenge |
| **CHALLENGE** | `CHALLENGE_CHAMPION` | Habit Finisher | Fully complete any multi-day challenge protocol |

---

## 5. API Endpoints

### Public & Student Endpoints
- `GET /api/v1/challenges` — Browse published challenges with filters and pagination
- `GET /api/v1/challenges/:idOrSlug` — View challenge overview and daily curriculum
- `POST /api/v1/challenges/:id/enroll` — Enroll in a challenge
- `DELETE /api/v1/challenges/:id/enroll` — Withdraw / cancel active enrollment
- `GET /api/v1/challenges/my` — List authenticated student's active and completed enrollments
- `GET /api/v1/challenges/my/:enrollmentId` — Get enrollment details with daily checklist
- `PUT /api/v1/challenges/my/:enrollmentId/progress` — Check/uncheck a day's action step
- `GET /api/v1/challenges/achievements` — Get all 12 achievement badges with live progress
- `GET /api/v1/challenges/dashboard` — Get student gamification summary & milestones

### Admin Endpoints (`requireRole(['ADMIN'])`)
- `POST /api/v1/challenges/admin` — Create a new challenge with daily curriculum
- `PUT /api/v1/challenges/admin/:id` — Update challenge details and activities
- `PATCH /api/v1/challenges/admin/:id/publish` — Toggle challenge published state
- `DELETE /api/v1/challenges/admin/:id` — Delete challenge
- `GET /api/v1/challenges/admin/stats` — Platform challenge stats (totals, published, enrollments)

---

## 6. Verification & Test Suite

- **Backend Integration Tests:** `backend/src/__tests__/challenges.test.ts` (25 tests covering public browsing, enrollment, duplicate handling, daily checklists, auto-completion, achievement calculation, and admin CRUD).
- **Frontend Unit Tests:** `frontend/src/__tests__/challenges.test.ts` (4 unit tests verifying completion calculations, boundary condition safety, and non-shaming streak counters).
- **Total Workspace Test Count:** **132 automated tests passing** across 9 test suites (101 backend, 31 frontend).
