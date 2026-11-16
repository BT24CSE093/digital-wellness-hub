# Phase 6: Community, Feedback & Resource Contributions

## 1. Features
- **Resource Suggestions (`/community`):** Students suggest new digital wellness tools (title, description, URL, pricing model, platforms, category).
- **Feedback & Bug Reports (`/community/feedback`):** Students submit bug reports, UI/UX suggestions, content corrections, accessibility concerns, and general feedback.
- **Outdated Content Reporting (`/community/feedback` - Tab 2):** Students flag broken links, obsolete pricing, or outdated steps for resources or guides.
- **Private Submissions Dashboard (`/community/my-submissions`):** Students privately view the status and administrative notes on their contributions.
- **Admin Moderation & Conversion (`/admin/community`):** Administrators review submissions, approve/reject suggestions, resolve issues, and automatically convert approved suggestions into official verified catalog resources.

---

## 2. API Endpoints

### Student Endpoints (Authenticated)
- `POST /api/v1/community/suggestions` — Suggest a new digital wellness resource
- `POST /api/v1/community/feedback` — Submit feedback or bug report
- `POST /api/v1/community/reports` — Report outdated/incorrect content
- `GET /api/v1/community/my-submissions` — List user's private submissions

### Admin Moderation Endpoints (`requireRole(['ADMIN'])`)
- `GET /api/v1/community/admin/suggestions` — List pending/all suggestions
- `PATCH /api/v1/community/admin/suggestions/:id` — Approve (auto-converts to Resource) or reject
- `GET /api/v1/community/admin/feedback` — List feedback submissions
- `PATCH /api/v1/community/admin/feedback/:id` — Resolve or update feedback
- `GET /api/v1/community/admin/reports` — List content reports
- `PATCH /api/v1/community/admin/reports/:id` — Resolve or update reports

---

## 3. Moderation Workflow
1. **Submission:** Student submits a resource, feedback, or report with input/URL validation.
2. **Review:** Administrator inspects submission in `/admin/community`.
3. **Action:**
   - **Approved Resource Suggestion:** Automatically generates an official verified `Resource` with a unique slug and links it back to the suggestion record (`convertedResourceId`).
   - **Resolved Feedback / Report:** Administrator provides an optional note and marks the entry `RESOLVED`.
   - **Declined Suggestion:** Marked `REJECTED` with an optional explanation visible only to the author.
