# Digital Wellness Hub

> **"Your Digital Life. Your Rules."**  
> A full-stack digital wellness platform engineered for college and university students.

---

## 1. Project Overview

Digital Wellness Hub empowers higher education students to reclaim agency over their digital habits through:
- **Curated Resource Directory & Objective Comparisons** (Free, Paid, Freemium, Open-Source)
- **Step-by-Step Device Configuration Guides** (iOS/Android Focus Modes, Scheduled Grayscale, Notification Triage)
- **Mindful Focus Sessions & Deep Work Timers** (Pomodoro with pre-session intentions and post-session reflection)
- **Reflective Screen-Time Logging & Visual Analytics**
- **Structured Digital Wellness Self-Assessments**
- **Gamified Habit Challenges & Digital Sunset Routines**

---

## 2. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, Recharts
- **Backend:** Node.js, Express.js, TypeScript, Zod, REST API
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Testing:** Vitest, Supertest, Playwright
- **Deployment Targets:** Vercel (Frontend SPA), Render (Backend API + Managed PostgreSQL)

---

## 3. Directory Structure

```text
digital-wellness-hub/
├── frontend/                     # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/           # Common, layout (Navbar, Footer), and UI primitives
│   │   ├── features/             # Feature modules (auth, dashboard, resources, etc.)
│   │   ├── hooks/                # Custom React hooks (useHealthCheck, etc.)
│   │   ├── routes/               # Declarative client-side route configuration
│   │   ├── services/             # API client and networking abstractions
│   │   ├── types/                # Global TypeScript definitions
│   │   ├── utils/                # Utility functions (cn class-merger)
│   │   ├── App.tsx               # Root view and temporary Phase 1 homepage
│   │   └── main.tsx              # DOM mount point
│   ├── .env.example              # Frontend environment template
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                      # Node.js + Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma         # Definitive PostgreSQL relational schema
│   │   ├── seed.ts               # Database seeder (categories, admin, verified resources)
│   │   └── migrations/           # Prisma migration history
│   ├── src/
│   │   ├── config/               # Environment parser (Zod) and Prisma singleton
│   │   ├── middleware/           # Centralized error handler, 404 handler
│   │   ├── modules/              # Domain modules (auth, users, resources, etc.)
│   │   ├── utils/                # Standardized JSON response helpers
│   │   ├── app.ts                # Express app setup and /api/v1/health endpoint
│   │   └── server.ts             # Server entrypoint and graceful shutdown
│   ├── .env.example              # Backend environment template
│   ├── package.json
│   └── tsconfig.json
├── docs/                         # Architectural & engineering specifications
│   ├── PROJECT_OVERVIEW.md
│   ├── SRS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── DEVELOPMENT_ROADMAP.md
│   └── SECURITY_REQUIREMENTS.md
├── docker-compose.yml            # Local PostgreSQL container service
├── .gitignore
├── package.json                  # Root convenience scripts
└── README.md
```

---

## 4. Getting Started & Development Workflow

### Prerequisites
- **Node.js:** v18.0.0 or higher (v22 LTS recommended)
- **npm:** v9.0.0 or higher
- **PostgreSQL:** Local PostgreSQL instance or Docker Desktop

### 4.1 Environment Configuration

1. Copy the frontend environment template:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
2. Copy the backend environment template:
   ```bash
   cp backend/.env.example backend/.env
   ```

### 4.2 Starting Local PostgreSQL (Docker)

If Docker is installed and running on your system:
```bash
# Start PostgreSQL service in background
docker compose up -d

# Verify container health
docker compose ps
```

### 4.3 Backend Development

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Apply migrations (when PostgreSQL is running)
npm run prisma:migrate

# Seed initial categories and resources
npm run prisma:seed

# Start backend development server (with hot reload)
npm run dev

# Compile TypeScript production build
npm run build
```
Backend API will be accessible at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/v1/health`

### 4.4 Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Compile production build
npm run build
```
Frontend application will be accessible at: `http://localhost:5173`

---

## 5. Development Command Reference

| Action | Location | Command |
| :--- | :--- | :--- |
| Start Frontend Dev Server | `frontend/` | `npm run dev` |
| Build Frontend SPA | `frontend/` | `npm run build` |
| Start Backend Dev Server | `backend/` | `npm run dev` |
| Build Backend TypeScript | `backend/` | `npm run build` |
| Run Backend in Production | `backend/` | `npm run start` |
| Generate Prisma Client | `backend/` | `npm run prisma:generate` |
| Apply Prisma Migrations | `backend/` | `npm run prisma:migrate` |
| Seed Database | `backend/` | `npm run prisma:seed` |
| Start Docker PostgreSQL | Root | `npm run docker:db:up` |
| Stop Docker PostgreSQL | Root | `npm run docker:db:down` |

---

## 6. Architecture Status & Implementation Phasing

- [x] **Phase 0:** Requirements, Architecture, Database Design & Security Specifications
- [x] **Phase 1:** Project Scaffolding, Environment Setup & Health Verification
- [x] **Phase 2:** Authentication Engine (Argon2id, JWT HttpOnly Cookies, Token Rotation & RBAC)
- [x] **Phase 3:** Public Knowledge Base (Resources, Comparisons, Device Guides)
- [x] **Phase 4:** Student Wellness Core (Focus Timer, Screen-Time Logging, Daily Planner, Self-Assessment)
- [x] **Phase 5:** Wellness Challenges & Privacy-Conscious Gamification
- [x] **Phase 6:** Community Submissions, Feedback Reports & Admin Moderation
- [x] **Phase 7:** Production Hardening, Security Audits & Deployment Readiness

---

## 7. Production Deployment Guide

### A. Database (PostgreSQL)
1. Provision a PostgreSQL instance (e.g. Render Managed PostgreSQL, Supabase, Neon).
2. Note the connection URL with SSL enabled: `postgresql://user:password@host:5432/dbname?sslmode=require`.
3. Apply schema migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   # Seed default catalog (categories, initial challenges, sample guides)
   npm run prisma:seed
   ```

### B. Backend Deployment (Render)
1. Create a **Web Service** pointing to the `backend/` directory (or use `render.yaml` Blueprint).
2. Configure environment variables using `backend/.env.production.example`:
   - `NODE_ENV=production`
   - `DATABASE_URL=<your-production-db-url>`
   - `FRONTEND_URL=https://<your-frontend-domain>.vercel.app`
   - `JWT_ACCESS_SECRET=<generate 32+ character random secret>`
   - `JWT_REFRESH_SECRET=<generate 32+ character random secret>`
3. Build Command: `npm install && npm run prisma:generate && npm run build`
4. Start Command: `npm run start`
5. Health Check Path: `/api/v1/health`

### C. Frontend Deployment (Vercel)
1. Import the repository into Vercel, setting root directory to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build` (outputs to `dist`).
4. Set Environment Variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>.onrender.com/api/v1`
5. Deploy. `vercel.json` automatically handles client-side routing rewrites to `/index.html`.
