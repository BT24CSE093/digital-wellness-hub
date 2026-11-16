# Phase 4 — Student Wellness Core

**Digital Wellness Hub** — *"Your Digital Life. Your Rules."*

Phase 4 implements the core personalized, authenticated wellness tools for college and university students. It transforms Digital Wellness Hub from a public directory into a daily student companion for attention management, device awareness, and digital boundary setting.

---

## 1. Architecture & Design Principles

All Phase 4 features adhere to the established modular monolithic architecture:
- **Modular Monolith**: Routes → Controllers → Services → Repositories → Validation (Zod) → Database (Prisma).
- **Strict Ownership & Isolation**: Every personal wellness record (`FocusSession`, `ScreenTimeLog`, `ScreenTimeGoal`, `WellnessAssessment`, `DailyPlanner`) is directly associated with the authenticated user ID extracted from a validated JWT access token (`req.user!.sub`). Frontend-provided user IDs are never trusted.
- **Privacy First**: No keyloggers, no browser history surveillance, no URL tracking, and no background device spyware. All screen-time entries are consciously and manually entered by the student.
- **Non-Diagnostic & Educational**: The self-assessment tool is strictly an educational self-reflection device, providing structured reflection and actionable habit recommendations without diagnostic medical claims.

---

## 2. Core Functional Modules

### 2.1 Focus Sprint Timer / Pomodoro Protocol
- **Accurate Timer Engine**: Implements an SVG circular countdown with `Date.now()` timestamp calculation (`targetEndTimeRef = Date.now() + remainingSeconds * 1000`). Even when browser tabs are throttled or backgrounded, returning to the tab preserves exact, drift-free remaining time.
- **Sprint Modes**:
  - `POMODORO`: 25 minutes deep focus sprint.
  - `SHORT_BREAK`: 5 minutes recovery interval.
  - `LONG_BREAK`: 15 minutes extended rest.
  - `CUSTOM`: Configurable study durations (up to 480 minutes).
- **Intention & Reflection**: Students set a single intention before starting. Upon sprint completion, a modal prompts for reflection, distraction count, and a 1–5 star focus rating.
- **Persistence**: Completed sprints are persisted to PostgreSQL via `POST /api/v1/wellness/focus-sessions`.

### 2.2 Manual Screen-Time Tracking & Goals
- **Self-Reported Logging**: Students log daily device usage extracted from iOS Screen Time or Android Digital Wellbeing settings:
  - Total screen time (hours and minutes).
  - Productive minutes vs. Distracting minutes.
  - Phone pickups count.
  - Category breakdown: Social Media, Entertainment, Education, Gaming, Productivity, Other.
  - Qualitative notes and reflections.
- **Screen-Time Goals**:
  - Configurable daily maximum screen-time limit (default: 360 min / 6 hours).
  - Max distracting apps budget (default: 120 min / 2 hours).
  - Target bedtime / digital sunset hour (default: 23:00 / 11 PM).
- **Progress & Budget Visualizer**: Displays a dynamic progress bar showing remaining minutes, percentage of daily budget utilized, and prominent visual alerts when the daily limit is exceeded.

### 2.3 Digital Wellness Self-Assessment
- **10-Question Structured Questionnaire**: Evaluates digital balance across five distinct dimensions (2 questions per dimension, rated 1–5):
  1. `screenTimeAwareness`: Conscious awareness and tracking of screen usage.
  2. `focusBehavior`: Capacity for sustained attention without tab-switching.
  3. `deviceHabits`: Proactive notification silencing and home-screen friction.
  4. `sleepAndRestoration`: Evening digital sunset and charging devices outside the bedroom.
  5. `socialDigitalBalance`: Offline hobbies and presence during face-to-face interactions.
- **Scoring & Tier Classification**:
  - Per-dimension percentages (0–100%).
  - Overall aggregate score (0–100).
  - Four wellness tiers:
    - `OPTIMAL` (80–100): Strong intentional boundaries.
    - `BALANCED` (60–79): Healthy baseline with minor friction areas.
    - `MODERATE` (40–59): Noticeable screen fatigue and fragmented attention.
    - `CRITICAL` (0–39): Severe attention overload risk.
- **Actionable Recommendations**: Dynamic tips addressing the student's lowest-scoring dimensions.
- **Educational Disclaimer**: Explicitly framed as non-diagnostic educational guidance.

### 2.4 Daily Wellness Planner
- **Digital Boundary Intention**: Daily statement of intention (e.g., *"No Instagram until after 12 PM lecture"*).
- **Priority Tasks Checklist**: Add high-priority study blocks with priority labels (`HIGH`, `MEDIUM`, `LOW`), estimated minutes, and completion toggles.
- **Evening Digital Shutdown Routine**: Daily toggle to mark the shutdown protocol complete, logging the shutdown timestamp and encouraging screen-free rest.

### 2.5 Student Wellness Dashboard & Analytics
- **Aggregated Real-Time DB Metrics**:
  - Today's focus minutes and sprint count.
  - Today's screen time, goal progress, and remaining time.
  - Active digital intention and planner task completion status.
  - Latest wellness assessment score and tier badge.
- **Recharts Data Visualizations**:
  - 7-day focus minutes trend bar chart.
  - Daily screen-time vs. productive time comparison.
- **Quick-Access Navigation**: One-click shortcuts to launch a sprint, log screen time, plan the day, or retake the assessment.

---

## 3. REST API Reference

All Phase 4 wellness endpoints require authentication via Bearer token: `Authorization: Bearer <accessToken>`.

### Focus Sessions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/wellness/focus-sessions` | Create completed focus session record |
| `GET` | `/api/v1/wellness/focus-sessions` | List authenticated student's sessions (paginated) |
| `GET` | `/api/v1/wellness/focus-sessions/:id` | Get single session details (ownership checked) |
| `DELETE` | `/api/v1/wellness/focus-sessions/:id` | Delete own focus session (ownership checked) |
| `GET` | `/api/v1/wellness/focus-summary` | Aggregated focus stats and 7-day trend |

### Screen Time Tracking & Goals
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/wellness/screen-time` | Create or upsert daily screen-time log |
| `GET` | `/api/v1/wellness/screen-time` | List screen-time logs (supports `startDate`, `endDate`) |
| `GET` | `/api/v1/wellness/screen-time/:id` | Get single log by ID (ownership checked) |
| `PUT` | `/api/v1/wellness/screen-time/:id` | Update screen-time log (ownership checked) |
| `DELETE` | `/api/v1/wellness/screen-time/:id` | Delete screen-time log (ownership checked) |
| `GET` | `/api/v1/wellness/screen-time-summary` | Today's log, goal comparison, and 7-day trend |
| `GET` | `/api/v1/wellness/screen-time-goals` | Get student's screen-time goal |
| `PUT` | `/api/v1/wellness/screen-time-goals` | Set or update student's screen-time goal |

### Digital Wellness Assessment
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/wellness/assessments` | Submit assessment questionnaire responses |
| `GET` | `/api/v1/wellness/assessments` | List assessment history |
| `GET` | `/api/v1/wellness/assessments/latest` | Retrieve latest assessment score and tier |
| `GET` | `/api/v1/wellness/assessments/:id` | Get specific assessment (ownership checked) |

### Daily Planner
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/wellness/planner` | Get plan for specified date (`?date=YYYY-MM-DD`) |
| `POST` | `/api/v1/wellness/planner` | Create or update daily intention and tasks |
| `PUT` | `/api/v1/wellness/planner/:date` | Update plan tasks or shutdown status |
| `GET` | `/api/v1/wellness/planner/recent` | Get 7 most recent daily plans |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/wellness/dashboard-summary` | Consolidated real-time dashboard snapshot |

---

## 4. Privacy & Authorization Enforcement

1. **Authentication Token Required**: All endpoints pass through `authenticateToken` middleware. Unauthenticated requests receive `401 UNAUTHORIZED`.
2. **Strict User Ownership**: `userId` is obtained exclusively from `req.user!.sub`.
3. **Cross-User Data Isolation**:
   - Queries query exclusively with `{ where: { userId } }` or `{ where: { id, userId } }`.
   - Access attempts by Student B on Student A's records return `404 NOT_FOUND` to prevent ID enumeration.
4. **Input Validation**: All request bodies and query parameters are strictly validated using Zod schemas (`.max(1440)` for minutes, ISO date regex, duration bounds).

---

## 5. Verification & Testing

### Running Tests
```bash
# Run backend integration tests (including 31 Phase 4 tests)
npm test --prefix backend

# Run frontend tests (including 10 Phase 4 calculations tests)
npm test --prefix frontend

# Verify builds
npm run build --prefix backend
npm run build --prefix frontend
```
