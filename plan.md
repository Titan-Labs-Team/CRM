# Titan Labs CRM — Milestone Plan

> Track build progress. Each milestone is a deployable, independently testable increment.

---

## M1 — Scaffolding & Auth Foundation
**Goal**: Empty repo → working login/logout with JWT, protected routes, tenant + user creation.

### Backend
- [x] Monorepo setup (npm workspaces, docker-compose.yml, .gitignore)
- [x] Express + TypeScript + Knex configured
- [x] Zod env validation
- [x] Migrations: `tenants`, `users`, `refresh_tokens`
- [x] `POST /auth/register` — creates tenant + admin user
- [x] `POST /auth/login` — returns accessToken + refreshToken
- [x] `POST /auth/refresh` — rotates refresh token
- [x] `POST /auth/logout` — revokes refresh token
- [x] `GET /auth/me` — current user
- [x] `PATCH /auth/me` — update own profile
- [x] `requireAuth` + `tenantScope` middleware
- [x] `GET|PATCH /tenant` — workspace settings
- [x] `GET /users`, `POST /users/invite`, `PATCH /users/:id`

### Frontend
- [x] Vite + React + TypeScript + Tailwind with full brand tokens
- [x] Axios instance with JWT interceptor + silent refresh on 401
- [x] Zustand `authStore`
- [x] `LoginPage` and `RegisterPage` (React Hook Form + Zod)
- [x] `AppShell` with `Sidebar` and `Topbar`
- [x] Protected route guard (redirect to `/login`)
- [x] Placeholder `DashboardPage`

**Test**: Create workspace → login → see shell → logout. Silent refresh on 401. ✅

---

## M2 — Contacts Module
**Goal**: Full CRUD contacts/leads with filtering, search, and CSV export.

### Backend
- [x] Migration: `contacts`
- [x] REST CRUD for `/contacts`
- [x] Filtering by type, owner, full-text search
- [x] Pagination (offset-based)
- [x] `requireRole` on delete (manager+)
- [x] `GET /contacts/export` — CSV

### Frontend
- [x] `ContactsPage` — table + search + filters
- [x] `ContactForm` modal — create/edit
- [x] `ContactDetailPage` — profile + deal placeholder
- [x] `useContacts` hook (TanStack Query)
- [x] Export button + CSV download

**Test**: Create/edit/search/filter/delete. Export CSV. Role-based delete restriction.

---

## M3 — Pipeline & Kanban Board
**Goal**: Full Kanban with drag-and-drop deal cards and stage management.

### Backend
- [x] Migrations: `pipelines`, `pipeline_stages`, `deals`
- [x] Pipelines + stages CRUD + `POST /stages/reorder`
- [x] Deals CRUD + `GET /deals/kanban` (grouped by stage)
- [x] `PATCH /deals/:id/stage` (move)
- [x] `PATCH /deals/:id/won` and `/lost`
- [x] `POST /deals/reorder` (position batch update)
- [x] Audit log on stage change

### Frontend
- [x] `KanbanBoard` → `KanbanColumn` → `KanbanCard` hierarchy
- [x] @dnd-kit drag-and-drop (cross-column + within-column)
- [x] Optimistic cache updates on drag
- [x] `DealForm` modal
- [x] Won/Lost quick actions on card hover
- [ ] `DealQuickEditPanel` slide-over (M4)
- [ ] `PipelineSettings` page (M5)

**Test**: Create pipeline → add stages → add deals → drag cards. Won/Lost. Stage reorder persists.

---

## M4 — Dashboard, Activities, Calendar
**Goal**: KPI dashboard, activity tracking, calendar scheduling.

### Backend
- [x] Migrations: `activities`, `calendar_events`, `calendar_event_attendees`
- [x] `/activities` CRUD + `PATCH /activities/:id/done`
- [x] `/calendar/events` CRUD + attendee management
- [x] `GET /reports/kpis` — total open, won MTD, conversion rate, avg cycle
- [x] `GET /reports/funnel` — deals by stage
- [x] `GET /reports/revenue` — grouped by week/month

### Frontend
- [x] `DashboardPage` — 4×KpiCard, FunnelChart, RevenueChart, ActivityFeed
- [x] `ContactDetailPage` — activity timeline
- [x] `DealDetailPage` — activity list + add activity
- [x] `CalendarPage` with FullCalendar (month/week/day)
- [x] `EventModal` — create/edit with deal/contact link + attendees

**Test**: Dashboard shows real numbers. Log activities. Calendar shows events. ✅

---

## M5 — Reports, Export, Team Management
**Goal**: Full reporting, data export, team administration + invite flow.

### Backend
- [ ] `GET /reports/activities` — by type + by user
- [ ] `GET /reports/leaderboard` — deals won + value per user
- [ ] Streaming CSV export for deals + contacts
- [ ] `POST /users/invite` — sends invitation email
- [ ] `POST /contacts/import` — CSV bulk import

### Frontend
- [ ] `ReportsPage` — tabs: Overview / Activities / Leaderboard / Export
- [ ] `ReportFilters` — date range, user, pipeline selectors
- [ ] `ReportTable` — sortable columns
- [ ] `ExportButton` with streaming download
- [ ] `TeamSettings` — user list, role change, invite form, deactivate
- [ ] Invite → set password flow

**Test**: Leaderboard accurate. CSV exports open in Excel. Invite email → new user logs in.

---

## M6 — Integrations API & Webhooks
**Goal**: Developer-facing REST API and HMAC-signed webhook delivery.

### Backend
- [ ] Migrations: `integrations`, `api_keys`, `audit_logs`
- [ ] `/integrations` CRUD + HMAC-signed webhook delivery + retry
- [ ] `POST /integrations/:id/test`
- [ ] `/api-keys` CRUD (prefix+hash scheme)
- [ ] Public API routes (`/public/contacts`, `/public/deals`) authenticated via `X-API-Key`
- [ ] Scope enforcement (read/write)

### Frontend
- [ ] `IntegrationsSettings` — webhook form + test button + response preview
- [ ] API key generator (show-once modal with copy)
- [ ] Key list with prefix, dates, last used

**Test**: Webhook receives signed payload. API key reads contacts via curl. Revoked key → 401.

---

## M7 — Billing, Premium Tiers, Hardening
**Goal**: Stripe billing, feature gating by plan, production hardening.

### Backend
- [ ] Migration: `subscriptions`
- [ ] Stripe Checkout + Customer Portal + webhook handler
- [ ] `requireTier` middleware on gated routes
- [ ] Rate limiting by tier (free: 100/day, starter: 1000/day, pro: 10000/day)
- [ ] Audit logs fully populated

### Frontend
- [ ] `BillingSettings` — plan display, usage bars, upgrade CTA
- [ ] `UpgradeModal` — plan comparison, triggered by gated features
- [ ] Plan badge in Sidebar (`FREE`, `STARTER`, `PRO`)
- [ ] Lock icons + tooltips on gated items

**Test**: Free user blocked from CSV export with upgrade modal. Stripe Checkout upgrades plan. Webhook cancels subscription.

---

## M8 — Polish, Search, Notifications, Deployment
**Goal**: Production deployment, global search, notifications, final UX polish.

### Backend
- [ ] `GET /search?q=` — unified full-text search across contacts/deals/activities
- [ ] Notifications table + `GET /notifications` + `PATCH /notifications/:id/read`
- [ ] `GET /health` health check endpoint
- [ ] Docker multi-stage build
- [ ] Connection pool tuning + index review

### Frontend
- [ ] Cmd+K search modal with keyboard navigation + grouped results
- [ ] Notification bell — unread count badge + mark-all-read
- [ ] Error boundaries on all pages
- [ ] Loading skeletons (replace spinners)
- [ ] Empty states with context-aware CTAs on all list pages
- [ ] Sonner toasts on all mutations
- [ ] Mobile responsive layout (hamburger sidebar, horizontal Kanban scroll)

### Infra
- [ ] `docker-compose.yml` production config (Postgres + backend + nginx)
- [ ] GitHub Actions CI (lint + type-check + test on PR)
- [ ] GitHub Actions CD (Docker build + push on merge to main)

**Test**: Global search accurate. Notifications appear on stage change. CI passes. `docker compose up` starts full system. Mobile layout usable.
