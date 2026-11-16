# Digital Wellness Hub — Project Overview

> **Tagline:** "Your Digital Life. Your Rules."  
> **Target Audience:** College and University Students  
> **Status:** Architecture & Initialization Phase  
> **System Architecture:** Modular Monolithic (Decoupled Client & Server)

---

## 1. Executive Summary

Modern higher education requires students to navigate constant digital engagement across learning management systems, research databases, communication platforms, and social media. However, hyperconnectivity frequently manifests as:
- **Notification fatigue & continuous partial attention**, impairing deep analytical thinking.
- **Sleep disruption** caused by late-night screen exposure and blue light.
- **Compulsive doomscrolling and digital procrastination**, leading to academic stress and burnout.
- **Opaque privacy tradeoffs**, where students unknowingly sacrifice personal data to proprietary platforms.

**Digital Wellness Hub** is a centralized, production-grade web platform engineered specifically for university students. It empowers students to reclaim agency over their digital environments through evidence-based self-regulation, structured device configurations, curated open and privacy-respecting tools, reflective focus sessions, self-assessments, and incremental habit challenges.

The platform serves a dual purpose:
1. **Academic Rigor:** Designed with modular monolithic architecture, clean code patterns, domain-driven boundaries, and secure credential handling.
2. **Product Viability:** A high-utility, responsive web application deployable to modern cloud infrastructure (Vercel + Render + PostgreSQL) with production performance and privacy standards.

---

## 2. Core Value Proposition & Platform Pillars

Digital Wellness Hub is structured around nine core operational pillars:

```
+-----------------------------------------------------------------------------------+
|                            DIGITAL WELLNESS HUB                                    |
|                     "Your Digital Life. Your Rules."                              |
+-----------------------------------------------------------------------------------+
|  1. Wellness Education         2. Resource Directory        3. Device Guides       |
|  - Digital minimalism          - Free/Paid/Freemium/OSS     - iOS/Android Focus    |
|  - Attention economics         - Objective comparisons      - Grayscale tutorials  |
|  - Sleep & ergonomics          - Verified student tags      - Notification triage  |
+-----------------------------------------------------------------------------------+
|  4. Focus Tools                5. Screen-Time Awareness     6. Wellness Assessment |
|  - Deep-work Pomodoro          - Manual/import logs         - Multi-tier scoring   |
|  - Distraction logging         - Category breakdowns        - Habit gap analysis   |
|  - Post-session reflection     - Goal vs. actual delta      - Tailored action plan |
+-----------------------------------------------------------------------------------+
|  7. Wellness Challenges        8. Personal Dashboard        9. Privacy Education   |
|  - 7/14/30-day detox streaks   - Visual analytics (Recharts)- Tracking awareness  |
|  - Social accountability       - Daily intention planner    - Permission hygiene   |
|  - Milestones & badges         - Weekly progress trends     - Digital footprint    |
+-----------------------------------------------------------------------------------+
```

### Pillar Breakdown

1. **Digital Wellness Education:** Pragmatic, non-judgmental educational guides synthesizing cognitive science concepts (e.g., attention restoration theory, dopamine regulation, context-switching penalties) into bite-sized actionable lessons.
2. **Resource Discovery & Comparisons:** An index of productivity, website blockers, mind-mapping, and wellness tools with transparent filtering across pricing tiers: **Free**, **Freemium**, **Paid**, and **Open-Source (OSS)**.
3. **Practical Device Configuration Tutorials:** Step-by-step interactive walkthroughs teaching students how to configure iOS/Android/macOS/Windows devices (e.g., scheduled grayscale mode, VIP notification channels, App Limits, DNS-level ad/tracker blocking).
4. **Focus & Productivity Tools:** A customizable web-based focus environment combining Pomodoro/52-17 intervals with pre-session intention setting and post-session cognitive reflection.
5. **Screen-Time Awareness & Tracking:** A reflective screen-time logging engine enabling students to record usage hours across categories (Study, Entertainment, Social, Administrative), compare against personal targets, and visualize trends over time.
6. **Self-Assessment Engine:** A standardized digital habit assessment evaluating 4 core dimensions: Attention Management, Boundary Setting, Emotional Relationship with Tech, and Sleep Hygiene, producing an aggregate Wellness Index score and customized recommendations.
7. **Digital Wellness Challenges:** Gamified, streak-based micro-challenges (e.g., "7-Day Phone-Free Morning", "Notification Zero Challenge", "Weekend Digital Sunset") with daily check-ins.
8. **Personal Dashboard & Analytics:** A personalized command center delivering holistic health metrics, streak counters, active goals, and trend charts rendered via Recharts.
9. **Privacy & Digital Safety Education:** Educational content and audit checklists covering cookie management, ad-broker opt-outs, secure password managers, 2FA hygiene, and university VPN best practices.

---

## 3. Target Audience & Student Persona Analysis

### Primary Audience
Undergraduate and graduate university students (ages 18–26) experiencing high academic cognitive loads alongside high digital device dependence.

### Key Pain Points Addressed
- **The "Tab Overload" Dilemma:** Difficulty maintaining focus when academic reading occurs in the same browser where entertainment is one click away.
- **Asymmetric Knowledge:** Commercial apps utilize persuasive design (variable rewards, infinite scroll) while students lack formal training on counter-configuring their hardware and operating systems.
- **Budget Sensitivity:** Students cannot afford expensive subscription-based focus apps and need vetted free or open-source alternatives.
- **Guilt-Driven Cycles:** Punitive wellness apps trigger anxiety. Digital Wellness Hub focuses on intentionality, agency, and harm reduction rather than ascetic abstinence.

---

## 4. Architectural Philosophy & Scope Boundaries

### Architectural Principles
- **Separation of Concerns:** Strict isolation between client presentation, API routing, business domain logic, and persistent storage.
- **Modular Monolith:** A single backend repository and deployment unit with domain-driven modular boundaries (Auth, Resources, Focus, ScreenTime, Assessments, Challenges, Admin), ensuring simplicity without microservices overhead.
- **Stateless Application Layer:** Backend instances maintain zero in-memory session state; all state is backed by PostgreSQL, enabling seamless horizontal restarts or scaling.
- **Privacy by Design:** Zero automated client spyware. The platform does not install invasive background daemons or harvest browser history; it is a user-directed self-improvement tool.

### Scope Boundaries

| In-Scope | Out-of-Scope (Deliberately Excluded) |
| :--- | :--- |
| Responsive web application (Desktop & Mobile viewports) | Native OS kernel extensions / root-level device lockdowns |
| Manual & CSV/JSON screen-time metric input | Invasive automated background keystroke or URL sniffing |
| Focus timer with local and cloud-synced sessions | Complex AI/LLM generative chatbots (unnecessary token costs) |
| Structured multi-choice assessments & recommendation mapping | Real-time WebRTC peer video streaming |
| Role-based access control (Student, Admin, Guest) | Microservices, message queues, and Kubernetes orchestration |
| Cookie-based secure dual-token authentication | Third-party payment gateways (commercial monetization) |

---

## 5. Technology Stack Rationale

| Layer | Selected Technology | Technical Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18+ / TypeScript / Vite | High developer velocity, rapid HMR, strict type safety, rich ecosystem for component design. |
| **Styling** | Tailwind CSS | Utility-first CSS ensuring lightweight production bundles, unified design tokens, and rapid UI development. |
| **Routing** | React Router (v6/v7) | Declarative client-side routing with nested layouts and battle-tested route guards for role authorization. |
| **Icons & Charts** | Lucide React + Recharts | Minimal bundle footprint, accessible SVG icons, and composable declarative charting built on SVG primitives. |
| **Backend Runtime** | Node.js + Express.js + TypeScript | High I/O performance for concurrent API requests, unified TypeScript types across stack, standard enterprise tooling. |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational integrity, ACID compliance, type-safe query generation, deterministic schema migrations. |
| **Security & Auth** | Argon2id + JWT + HttpOnly Cookies | Password hashing resistant to GPU/ASIC attacks, dual-token access/refresh strategy preventing token theft in localStorage. |
| **Validation** | Zod | Runtime schema validation with automatic TypeScript inference at controller boundaries. |
| **Deployment** | Vercel (Client) + Render (API & DB) | Frictionless CI/CD, automatic preview branches, managed PostgreSQL instance, and zero DevOps maintenance burden. |

---

## 6. Success Metrics & Academic Evaluation

For academic and capstone evaluation, the project's success is governed by:
1. **Architectural Purity:** Clean layered separation (Routes -> Controllers -> Services -> Repositories -> Database).
2. **Security Posture:** 100% adherence to OWASP Top 10 recommendations (A-grade security headers, secure cookie flags, input validation, rate limiting).
3. **Usability & Performance:** Sub-200ms p95 API response times, Lighthouse accessibility score > 90.
4. **Functional Completeness:** Seamless end-to-end user journeys for Guests, Students, and Administrators.
