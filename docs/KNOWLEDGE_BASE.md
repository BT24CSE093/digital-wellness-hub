# Phase 3: Public Knowledge Base & Resource Discovery

## Overview

Phase 3 adds the complete **Public Knowledge Base** to Digital Wellness Hub — a curated, searchable directory of digital wellness tools, a device configuration guide library, a side-by-side resource comparison engine, and full admin content management.

This document covers the backend API, frontend pages, data model, seeded content, and testing strategy for Phase 3.

---

## Architecture Summary

```
Phase 3 Modules
├── Backend
│   ├── /api/v1/resources           → Public resource listing + filtering + pagination
│   ├── /api/v1/resources/:id       → Resource detail by ID or slug
│   ├── /api/v1/categories          → Category listing + detail
│   ├── /api/v1/guides              → Published guide listing + platform/difficulty filters
│   ├── /api/v1/guides/:slug        → Guide detail + related guides
│   └── /api/v1/admin/*             → ADMIN-only CRUD for resources, categories, guides
├── Frontend Pages
│   ├── /resources                  → ResourceListPage (public)
│   ├── /resources/:id              → ResourceDetailPage (public)
│   ├── /compare                    → ResourceComparePage (public, localStorage)
│   ├── /guides                     → GuideListPage (public, platform tabs)
│   ├── /guides/:slug               → GuideDetailPage (interactive, progress tracking)
│   ├── /admin/resources            → AdminResourcesPage (ADMIN only)
│   └── /admin/guides               → AdminGuidesPage (ADMIN only)
└── Database
    ├── Category (5 seeded)
    ├── Resource (8 seeded: verified + unverified)
    └── DeviceGuide (6 seeded: 5 published, 1 draft)
```

---

## Backend API Reference

### Public Endpoints (No authentication required)

#### `GET /api/v1/resources`

List and filter resources with pagination.

| Query Param    | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| `page`         | integer | Page number (default: 1)                         |
| `limit`        | integer | Items per page (default: 12, max: 50)            |
| `search`       | string  | Full-text search against title/tagline/description|
| `category`     | string  | Filter by category ID or slug                    |
| `platform`     | string  | Filter by platform (WINDOWS, IOS, etc.)          |
| `pricingModel` | string  | FREE, FREEMIUM, PAID, OPEN_SOURCE                |
| `isVerified`   | boolean | `true` or `false` — verified staff filter        |
| `sortBy`       | string  | `ratingAvg`, `createdAt`, `title`                |
| `sortOrder`    | string  | `asc` or `desc` (default: `desc`)                |

**Response Envelope:**
```json
{
  "success": true,
  "data": [ /* Resource[] */ ],
  "meta": { "total": 8, "page": 1, "limit": 12, "totalPages": 1 }
}
```

---

#### `GET /api/v1/resources/:id`

Fetch a single resource by database ID or slug. Returns full detail including category, reviews, and submitter/verifier info.

---

#### `GET /api/v1/categories`

Return all categories with `_count.resources` (total resources in each category).

---

#### `GET /api/v1/guides`

List **published** guides only (never returns drafts to public clients).

| Query Param  | Type   | Description                               |
|--------------|--------|-------------------------------------------|
| `platform`   | enum   | IOS, ANDROID, MACOS, WINDOWS, LINUX, BROWSER |
| `difficulty` | enum   | BEGINNER, INTERMEDIATE, ADVANCED          |
| `search`     | string | Partial title search (case-insensitive)   |
| `page`       | int    | Page number                               |
| `limit`      | int    | Items per page                            |

---

#### `GET /api/v1/guides/:slug`

Fetch full guide detail (all steps as structured JSON array) plus up to 3 `relatedGuides` from the same platform.

**Response:**
```json
{
  "success": true,
  "data": {
    "guide": { /* DeviceGuide with steps[] */ },
    "relatedGuides": [ /* Partial DeviceGuide[] */ ]
  }
}
```

---

### Admin Endpoints (Requires JWT + ADMIN role)

All admin routes sit behind `authenticateToken` and `requireRole([UserRole.ADMIN])`.

| Method   | Endpoint                                  | Action                               |
|----------|-------------------------------------------|--------------------------------------|
| `POST`   | `/api/v1/admin/resources`                 | Create a new resource                |
| `PUT`    | `/api/v1/admin/resources/:id`             | Update resource fields               |
| `PATCH`  | `/api/v1/admin/resources/:id/verify`      | Toggle `isVerified` status           |
| `DELETE` | `/api/v1/admin/resources/:id`             | Permanently delete resource          |
| `POST`   | `/api/v1/admin/categories`                | Create a new category                |
| `PUT`    | `/api/v1/admin/categories/:id`            | Update category name/slug/icon       |
| `DELETE` | `/api/v1/admin/categories/:id`            | Delete category (fails if resources exist) |
| `GET`    | `/api/v1/admin/guides`                    | List ALL guides (incl. unpublished drafts) |
| `POST`   | `/api/v1/admin/guides`                    | Create a new guide with steps        |
| `PUT`    | `/api/v1/admin/guides/:id`                | Update guide content                 |
| `PATCH`  | `/api/v1/admin/guides/:id/publish`        | Toggle `isPublished` status          |
| `DELETE` | `/api/v1/admin/guides/:id`                | Permanently delete guide             |

---

## Comparison Engine

Comparison state is stored **client-side only** in `localStorage` under the key `dwh_comparison_ids`.

- **Maximum items:** 3 (enforced by `comparisonStorage.ts`)
- **No server state:** works for both authenticated and guest users
- **Sync:** `dwh_comparison_updated` custom DOM event is dispatched on every mutation so Navbar badge and floating bar stay in sync with the comparison page
- **API calls:** On `/compare`, the frontend fetches each stored ID from `GET /api/v1/resources/:id` to build the comparison matrix

---

## Seeded Content

### Categories (5)

| Name                             | Slug                    |
|----------------------------------|-------------------------|
| Website & App Blockers           | `blockers`              |
| Mindful Note-Taking & Writing    | `note-taking`           |
| Sleep & Blue Light Filters       | `blue-light-sleep`      |
| Focus Timers & Deep Work         | `focus-timers`          |
| Digital Minimalism Launchers     | `minimalist-launchers`  |

### Resources (8)

| Title                       | Pricing     | Verified |
|-----------------------------|-------------|----------|
| Cold Turkey Blocker         | FREEMIUM    | ✅        |
| Freedom                     | PAID        | ✅        |
| f.lux                       | FREE        | ✅        |
| ActivityWatch               | OPEN_SOURCE | ✅        |
| Forest: Stay Focused        | FREEMIUM    | ✅        |
| Obsidian                    | FREEMIUM    | ✅        |
| Olauncher Minimal AF        | OPEN_SOURCE | ✅        |
| Focus Keeper Community Ed.  | FREE        | ❌ (draft)|

### Device Guides (6)

| Title                                              | Platform | Difficulty   | Published |
|----------------------------------------------------|----------|--------------|-----------|
| Enable Scheduled Grayscale on iOS                  | IOS      | BEGINNER     | ✅         |
| Android Digital Wellbeing Focus Mode               | ANDROID  | BEGINNER     | ✅         |
| Windows 11 Focus Sessions                          | WINDOWS  | BEGINNER     | ✅         |
| macOS Work Focus Filter & Screen Time Downtime     | MACOS    | INTERMEDIATE | ✅         |
| Distraction-Free Web Browsing via Content Blockers | BROWSER  | BEGINNER     | ✅         |
| Advanced Hostfile & DNS Blocking for Linux         | LINUX    | ADVANCED     | ❌ (draft) |

---

## Frontend Pages

### `/resources` — ResourceListPage

- Search bar with debounced input
- Category dropdown (from `GET /api/v1/categories`)
- Platform selector (6 values)
- Pricing model filter (4 values)
- Verified-only checkbox
- Sort (Recently Added, Highest Rated, Alphabetical)
- `ResourceCard` grid (responsive 1/2/3 columns)
- Pagination (page range, prev/next buttons)
- Floating comparison action bar when items selected
- Compare count badge in Navbar

### `/resources/:id` — ResourceDetailPage

- Breadcrumb navigation
- Full category/pricing/platform metadata panel
- Staff verification indicator
- Community reviews section (approved reviews only)
- "Add to Compare" toggle button with link to `/compare`
- Official site external link

### `/compare` — ResourceComparePage

- Side-by-side matrix table: Pricing, Platforms, Verification, Rating, Tagline, Description, Actions
- Per-column remove button
- Clear All comparison button
- "Add more tool" prompt when fewer than 3 items selected

### `/guides` — GuideListPage

- Platform tab filters (All, iOS, Android, Windows, macOS, Browser, Linux)
- Keyword search
- Difficulty dropdown
- `GuideCard` grid

### `/guides/:slug` — GuideDetailPage

- Breadcrumb, platform/difficulty/time badges
- Interactive progress bar
- Step-by-step checklist (click steps to mark complete)
- Pro tip callouts (emerald) and warning callouts (amber)
- 100% completion celebration banner
- Related guides from same platform

### `/admin/resources` — AdminResourcesPage *(ADMIN only)*

- Full resource table with inline verify toggle
- Create/Edit modal with multi-select platforms and pricing toggles
- Delete with confirmation dialog

### `/admin/guides` — AdminGuidesPage *(ADMIN only)*

- Full guide table with publish/draft toggle
- Multi-step guide creation modal with dynamic step builder
- Delete with confirmation

---

## Testing

### Backend Tests (`backend/src/__tests__/knowledgeBase.test.ts`)

**22 tests** covering:
- Resource listing, pagination, search, filtering by pricing/platform/isVerified
- Resource detail by slug and 404 handling
- Guide listing (public only published), platform filtering
- Guide detail response structure and related guides
- Draft guide inaccessible via public route
- Admin creates, updates, verifies, deletes a resource
- Admin lists all guides including drafts
- Admin creates, publishes, deletes a guide
- Student blocked from admin endpoints (403)
- Unauthenticated request blocked from admin endpoints (401)
- Input validation rejection (422)

### Frontend Tests (`frontend/src/__tests__/knowledgeBase.test.ts`)

**12 tests** covering:
- localStorage round-trip add/retrieve
- Duplicate ID prevention
- MAX_COMPARE_ITEMS enforcement (3)
- Single item removal while preserving others
- `isResourceInComparison()` boolean utility
- `clearComparison()` wipes all state
- SessionStorage privacy boundary (never written to)
- Graceful handling of corrupted JSON in localStorage
- `dwh_comparison_updated` event dispatched on add
- `dwh_comparison_updated` event dispatched on remove
- `dwh_comparison_updated` event dispatched on clear

### Full Test Suite

| Suite                            | Tests | Status  |
|----------------------------------|-------|---------|
| healthAndReady.test.ts           | 2     | ✅ Pass  |
| knowledgeBase.test.ts (backend)  | 22    | ✅ Pass  |
| auth.test.ts (backend)           | 21    | ✅ Pass  |
| auth.test.tsx (frontend)         | 5     | ✅ Pass  |
| knowledgeBase.test.ts (frontend) | 12    | ✅ Pass  |
| **TOTAL**                        | **62**| **✅ All Pass** |

---

## Security Controls

| Control                              | Details                                              |
|--------------------------------------|------------------------------------------------------|
| RBAC on admin routes                 | `authenticateToken` + `requireRole([ADMIN])`         |
| Zod validation on all inputs         | `validateRequest()` middleware, 422 on failure       |
| Public routes have no auth required  | Resources and guides endpoints are fully public      |
| Comparison stored client-side only   | No user identity leakage; works for anonymous guests |
| No hardcoded security claims         | Tool descriptions are factual only; no invented claims |

---

> **Phase 3 is complete.** Phase 4 (Focus Timer, Screen-Time Logging, Wellness Assessments) is the next planned milestone.
