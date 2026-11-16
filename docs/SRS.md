# Software Requirements Specification (SRS)

## Digital Wellness Hub — System Specification
**Document Version:** 1.0.0  
**Target Audience:** Engineering Team, Academic Evaluators, Stakeholders  
**Standard Compliance:** Tailored ISO/IEC/IEEE 29148 Standard

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) details the complete functional and non-functional requirements for the **Digital Wellness Hub** web platform. It serves as the definitive reference for development, testing, architectural review, and academic evaluation.

### 1.2 Scope
Digital Wellness Hub is a decoupled web application designed to help university students diagnose, manage, and optimize their digital habits. It comprises a client-side Single Page Application (SPA), a RESTful backend API, and a relational PostgreSQL database.

### 1.3 Definitions, Acronyms, and Abbreviations
- **Argon2id:** State-of-the-art password-hashing algorithm providing memory-hard and time-hard cryptographic protection.
- **JWT (JSON Web Token):** A cryptographically signed compact format used for stateless authentication.
- **HttpOnly Cookie:** A browser-managed cookie inaccessible via client-side JavaScript, mitigating Cross-Site Scripting (XSS) credential theft.
- **RBAC:** Role-Based Access Control.
- **OSS:** Open Source Software.
- **pLDDT / DWH-Index:** Digital Wellness Hub Composite Index measuring digital health score (0–100 scale).
- **SPA:** Single Page Application.
- **REST:** Representational State Transfer.

---

## 2. Overall Description

### 2.1 Product Perspective
Digital Wellness Hub is an independent, modular web application operating within standard modern web browsers (desktop and mobile). It does not require native operating system permissions or invasive kernel access, prioritizing user-directed habit transformation and verified educational content.

```
+-------------------------------------------------------------------------+
|                              USER AGENT                                  |
|         Desktop Browser / Mobile Browser (Chrome, Safari, Firefox)       |
+-------------------------------------------------------------------------+
                                    |
                           HTTPS / WSS / REST
                                    |
+-------------------------------------------------------------------------+
|                               VERCEL CDN                                 |
|         React + TypeScript + Vite Single Page Application (SPA)          |
+-------------------------------------------------------------------------+
                                    |
                        RESTful JSON API over HTTPS
                        (Secure HttpOnly Cookies)
                                    |
+-------------------------------------------------------------------------+
|                               RENDER API                                 |
|         Node.js + Express.js + TypeScript Modular Monolith API           |
+-------------------------------------------------------------------------+
                                    |
                             Prisma ORM (TCP)
                                    |
+-------------------------------------------------------------------------+
|                               DATABASE                                   |
|                     PostgreSQL Relational Storage                       |
+-------------------------------------------------------------------------+
```

### 2.2 User Roles & Persona Matrix

| Role | Description | Authentication Required | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **GUEST** | Unregistered or unauthenticated visitor | No | Browse public educational materials, search verified resources, view device guides, run trial wellness quiz. |
| **STUDENT** | Verified university student account | Yes (Role = `STUDENT`) | Access personal dashboard, log focus sessions, record screen-time, participate in challenges, save planner intentions, track analytics. |
| **ADMIN** | System administrator / platform curator | Yes (Role = `ADMIN`) | Moderate resources, verify user submissions, publish device guides, manage challenges, monitor system-wide engagement metrics. |

### 2.3 User Personas

#### Persona 1: Alex — The Overwhelmed Junior (Student)
- **Profile:** 20-year-old Computer Science undergraduate.
- **Problem:** Spends 9+ hours daily on screens. Experiences severe context switching between VS Code, Discord, YouTube, and Canvas. Feels perpetually exhausted and struggles to get restful sleep.
- **Needs:** Clear tutorials on setting up phone focus modes, finding distraction-free open-source note-taking tools, and logging study vs. distraction time.

#### Persona 2: Maya — The Health-Conscious Senior (Student)
- **Profile:** 22-year-old Psychology student preparing for honors thesis.
- **Problem:** Conscious of tech addiction, has attempted digital detoxes before but abandoned them due to lack of incremental tracking.
- **Needs:** Structured 7-day detox challenges, deep-work Pomodoro timer with mindful reflection prompts, and visual progress charts.

#### Persona 3: Prof. Jordan — Academic Lead / System Admin (Admin)
- **Profile:** Faculty advisor & digital ethics instructor.
- **Problem:** Students frequently request reliable, non-commercial digital hygiene tools and tutorials.
- **Needs:** Back-office dashboard to curate and verify privacy-respecting software, publish structured device guides, and ensure community submissions are vetted.

---

## 3. Role-Based Permissions Matrix

| Feature / Resource | Guest | Student | Admin |
| :--- | :---: | :---: | :---: |
| View Public Landing & Educational Articles | Read | Read | Read / Write |
| Search & Filter Resource Directory | Read | Read | Read / Write |
| Filter by Pricing (Free, Freemium, Paid, OSS) | Read | Read | Read / Write |
| View Device Configuration Tutorials | Read | Read | Read / Write |
| Submit New Resource for Verification | None | Write (Pending) | Write (Direct Approval) |
| Review / Rate Resources | None | Read / Write | Read / Write / Moderate |
| Run Digital Wellness Assessment | Trial (Ephemeral) | Full History | Full History |
| Run Focus Sessions & Log Reflections | None | Read / Write / Delete | Read (Own) |
| Record & Edit Screen-Time Logs | None | Read / Write / Delete | Read (Own) |
| Enroll in Challenges & Track Streaks | None | Read / Write | Read (Own) |
| Daily Digital Intention Planner | None | Read / Write | Read (Own) |
| Personal Analytics & Recharts Trends | None | Read (Own) | Read (Own) |
| Content Management (Guides, Categories) | None | None | Read / Write / Delete |
| User & Verification Administration | None | None | Read / Write / Delete |

---

## 4. Functional Requirements

### 4.1 Module 1: Authentication & Identity Management

- **FR-AUTH-01 (Registration):**
  - **Inputs:** `email` (valid format, university email encouraged), `password` (min 8 chars, 1 uppercase, 1 digit, 1 special symbol), `firstName`, `lastName`.
  - **Processing:** Verify email uniqueness in PostgreSQL; hash password using Argon2id with cryptographically random salt; create user record with default role `STUDENT`.
  - **Outputs:** HTTP 201 Created; set secure HttpOnly refresh token cookie; return access token and user profile in JSON body.
  - **Errors:** 409 Conflict if email exists; 422 Unprocessable Entity if validation fails.

- **FR-AUTH-02 (Login):**
  - **Inputs:** `email`, `password`.
  - **Processing:** Query user by email; verify password hash via Argon2id; generate 15-minute access token and 7-day refresh token; record refresh token hash in `refresh_tokens` table.
  - **Outputs:** HTTP 200 OK; access token in JSON body; refresh token in `Set-Cookie` (HttpOnly, Secure, SameSite).
  - **Errors:** 401 Unauthorized for invalid credentials; 429 Too Many Requests if rate limit exceeded.

- **FR-AUTH-03 (Token Refreshing):**
  - **Inputs:** Incoming HttpOnly cookie containing `refreshToken`.
  - **Processing:** Validate token signature; match against database record; if valid and non-revoked, issue new access token and rotate refresh token (single-use token rotation).
  - **Outputs:** HTTP 200 OK with fresh access token; updated `Set-Cookie` header.
  - **Errors:** 401 Unauthorized if token invalid, expired, or previously reused.

- **FR-AUTH-04 (Logout):**
  - **Processing:** Invalidate current refresh token in database; clear cookie via `Set-Cookie: maxAge=0`.
  - **Outputs:** HTTP 200 OK.

- **FR-AUTH-05 (Profile Management):**
  - **Processing:** Authenticated students can view and update their name, bio, and digital wellness preferences.

---

### 4.2 Module 2: Digital Wellness Education & Knowledge Base

- **FR-EDU-01 (Article Catalog):** The system shall serve curated educational articles covering digital minimalism, attention economy, sleep architecture, and privacy basics.
- **FR-EDU-02 (Categorization & Tags):** Educational articles must be organized by category (`ATTENTION`, `SLEEP`, `PRIVACY`, `HABITS`) and reading time estimates.
- **FR-EDU-03 (Public Accessibility):** All educational articles shall be publicly accessible to Guests without requiring authentication.

---

### 4.3 Module 3: Resource Directory & Comparison Engine

- **FR-RES-01 (Resource Discovery):** The system shall list verified digital wellness tools with search, category filtering, and platform filters (`iOS`, `Android`, `macOS`, `Windows`, `Linux`, `Web`).
- **FR-RES-02 (Pricing Model Filtering):** Users must be able to filter by explicit pricing tiers: `FREE`, `FREEMIUM`, `PAID`, and `OPEN_SOURCE`.
- **FR-RES-03 (Side-by-Side Comparison):** The frontend shall allow comparing up to 3 selected resources side-by-side across pricing, supported platforms, privacy policy rating, and open-source status.
- **FR-RES-04 (Student Community Submission):** Authenticated students may submit a resource suggestion with name, URL, pricing, and description. Submissions remain in `PENDING` state until Admin verification.
- **FR-RES-05 (Resource Ratings & Reviews):** Students can submit 1–5 star ratings and reviews for verified resources.

---

### 4.4 Module 4: Device Configuration Guides

- **FR-GUIDE-01 (Step-by-Step Guides):** The system shall provide structured walkthroughs for device hygiene (e.g., "Configuring iOS Focus Filters for Study", "Setting Android Grayscale Mode", "Disabling Windows Telemetry").
- **FR-GUIDE-02 (Step Progression):** Guides must support rich steps containing instruction text, platform screenshots/diagrams, and completion checkboxes.
- **FR-GUIDE-03 (Difficulty & Time Estimates):** Each guide shall state estimated completion time (e.g., 5 mins) and difficulty (`Beginner`, `Intermediate`, `Advanced`).

---

### 4.5 Module 5: Focus Sessions & Productivity Tools

- **FR-FOC-01 (Focus Timer Engine):** The frontend shall provide a Pomodoro and customizable deep-work interval timer (standard 25/5 min or custom 50/10 min).
- **FR-FOC-02 (Intention Setting):** Prior to initiating a focus session, the student must specify a concrete session intention (e.g., "Complete Chemistry Chapter 4 review").
- **FR-FOC-03 (Session Completion & Reflection):** Upon timer completion, the system prompts the student to log:
  - Completion status (`COMPLETED`, `INTERRUPTED`).
  - Distraction count (integer).
  - Mindful reflection note.
  - Perceived focus score (1–5).
- **FR-FOC-04 (Cloud Synchronization):** Completed sessions are persisted to the backend for analytics calculation.

---

### 4.6 Module 6: Screen-Time Awareness & Logging

- **FR-SCR-01 (Daily Screen-Time Log):** Students can record daily screen hours across four distinct buckets:
  1. Academic / Productive Screen-Time.
  2. Leisure / Entertainment Screen-Time.
  3. Social Media Screen-Time.
  4. Device Pickups Count.
- **FR-SCR-02 (Target Goal Setting):** Students can establish daily caps (e.g., max 2 hours social media, max 7 hours total screen time).
- **FR-SCR-03 (Goal Variance Reporting):** The system calculates delta between goal vs. actual log, highlighting negative and positive deviations.

---

### 4.7 Module 7: Digital Wellness Self-Assessment

- **FR-ASM-01 (Standardized Questionnaire):** The system provides an 16-question evidence-informed diagnostic covering 4 dimensions:
  1. Attention & Focus Retention.
  2. Sleep & Nighttime Device Habits.
  3. Boundary Enforcement (Notifications/Urgency).
  4. Emotional Wellbeing & Compulsive Checking.
- **FR-ASM-02 (DWH Wellness Score Calculation):** Answers (Likert scale 1–5) are weighted into an aggregate score of 0–100 and classified into four tiers:
  - `0 - 40`: Critical Digital Fatigue.
  - `41 - 65`: Moderate Tech Overload.
  - `66 - 85`: Balanced Digital Lifestyle.
  - `86 - 100`: Optimal Digital Mastery.
- **FR-ASM-03 (Personalized Prescription):** The system generates targeted resource and guide recommendations mapped to the student's lowest-scoring dimension.
- **FR-ASM-04 (Historical Trend Tracking):** Authenticated students can track their wellness score progression across multiple assessment dates.

---

### 4.8 Module 8: Digital Wellness Challenges

- **FR-CHL-01 (Challenge Catalog):** The system provides pre-configured challenges (e.g., "7-Day No Screens Before Breakfast", "14-Day Social Media App Limit", "30-Day Grayscale Challenge").
- **FR-CHL-02 (Enrollment & Daily Check-in):** Students enroll in a challenge and record daily completion status.
- **FR-CHL-03 (Streak Engine):** The system dynamically tracks continuous streaks and awards milestone badges upon completion.

---

### 4.9 Module 9: Daily Digital Planner & Shutdown Routine

- **FR-PLN-01 (Daily Digital Intention):** Morning check-in where students set their primary digital boundaries for the day (e.g., "No Instagram until 6:00 PM").
- **FR-PLN-02 (Digital Sunset Checklist):** Evening shutdown routine prompting the student to close study tabs, set do-not-disturb, and plug phone away from bed.

---

### 4.10 Module 10: Personal Analytics Dashboard

- **FR-DSH-01 (Summary KPIs):** Display overall Wellness Index, weekly focus hours, current challenge streak, and daily screen-time delta.
- **FR-DSH-02 (Data Visualization):** Render interactive Recharts:
  - Line Chart: 14-day Screen-Time vs. Goal trend.
  - Bar Chart: Daily Focus Minutes breakdown by category.
  - Radar Chart: Wellness Assessment 4-dimension profile.
- **FR-DSH-03 (Export Data):** Students can export their full activity history in JSON format.

---

### 4.11 Module 11: Admin Management & Verification

- **FR-ADM-01 (Resource Verification):** Administrators can view pending resource submissions, inspect metadata, edit details, approve, or reject.
- **FR-ADM-02 (Content Publishing):** Administrators can create, edit, unpublish, and delete educational guides, categories, and challenges.
- **FR-ADM-03 (System Health & Engagement Metrics):** Overview of active user counts, total focus hours logged, and top utilized resources.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **NFR-PERF-01:** Client initial page load (FCP) must complete within < 1.5 seconds on 4G connections.
- **NFR-PERF-02:** Backend REST API p95 response time must remain < 200ms for read endpoints and < 350ms for write endpoints under standard load.
- **NFR-PERF-03:** Client bundle size should not exceed 300kB gzipped for initial critical chunks via code splitting.

### 5.2 Security & Compliance
- **NFR-SEC-01:** Passwords must be hashed with Argon2id using parameters: minimum memory cost 65536 KiB (64 MiB), time cost 3 iterations, parallelism 4 lanes.
- **NFR-SEC-02:** Authentication tokens must be split into:
  - Access Token: Short-lived (15 minutes), payload restricted to `userId`, `email`, `role`.
  - Refresh Token: Long-lived (7 days), stored exclusively in `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax` depending on origin setup) cookies.
- **NFR-SEC-03:** All incoming API payloads must pass Zod schema validation; unrecognized fields must be stripped.
- **NFR-SEC-04:** Rate limiting must enforce 5 attempts per 15 minutes on `/auth/login` and `/auth/register` to prevent credential stuffing.

### 5.3 Usability & Accessibility
- **NFR-ACC-01:** UI components must satisfy WCAG 2.1 Level AA contrast ratios (minimum 4.5:1 for body text).
- **NFR-ACC-02:** All interactive controls (buttons, modals, forms) must be fully keyboard accessible with visible focus rings.
- **NFR-ACC-03:** Responsive layouts must function smoothly from 360px mobile viewports to 4K desktop screens.

### 5.4 Reliability & Maintainability
- **NFR-REL-01:** Zero single points of failure in business logic; all runtime errors must be caught by global error handlers and returned as standardized JSON envelopes without exposing internal stack traces.
- **NFR-REL-02:** Database migrations must be managed deterministically via Prisma Migrate.
- **NFR-REL-03:** Strict TypeScript compiler configuration (`strict: true`, `noImplicitAny: true`).
