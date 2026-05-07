# Titan Labs CRM — CLAUDE.md

This file documents everything an AI assistant needs to know to contribute effectively to this project.

---

## Project Overview

**Titan Labs CRM** is a multi-tenant SaaS CRM for managing leads, contacts, deals, and sales pipelines. Companies sign up and get an isolated workspace. The product replaces scattered tools (WhatsApp, spreadsheets) with a centralized Kanban-first platform.

**Key personas**: Seller (manages leads/deals), Manager (analytics + team config), Admin (billing + workspace ownership).

---

## Monorepo Structure

```
CRMTitanLabs/
├── packages/
│   ├── backend/        # Express + TypeScript + Knex + PostgreSQL
│   └── frontend/       # React + Vite + TypeScript + Tailwind CSS
├── CLAUDE.md
├── plan.md
├── package.json        # npm workspaces root
└── docker-compose.yml  # Postgres 16 + pgAdmin
```

Run commands from the **repo root** unless noted otherwise.

---

## Commands

```bash
# Start local DB
docker compose up -d

# Install all deps (run from root)
npm install

# Backend
npm run dev --workspace=packages/backend        # dev server on :3001
npm run build --workspace=packages/backend      # tsc compile
npm run migrate:latest --workspace=packages/backend   # run pending migrations
npm run migrate:rollback --workspace=packages/backend # rollback last batch
npm run seed --workspace=packages/backend       # run dev seeds

# Frontend
npm run dev --workspace=packages/frontend       # Vite dev server on :5173
npm run build --workspace=packages/frontend     # production build
npm run preview --workspace=packages/frontend   # preview production build

# From inside a package directory
cd packages/backend && npm run dev
cd packages/frontend && npm run dev
```

---

## Tech Stack

| Layer | Library |
|---|---|
| Backend runtime | Node.js 20+ |
| Backend framework | Express 4 + TypeScript |
| Database | PostgreSQL 16 |
| Query builder / migrations | Knex.js |
| Auth | jose (JWT) + bcryptjs |
| Validation | Zod |
| Payments | Stripe Node SDK |
| Frontend build | Vite |
| Frontend framework | React 18 + TypeScript |
| Server state | TanStack Query v5 |
| Global client state | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v3 + CVA (class-variance-authority) |
| UI primitives | Radix UI |
| Charts | Recharts |
| Drag and drop | @dnd-kit/core + @dnd-kit/sortable |
| Calendar | FullCalendar (React adapter) |
| Icons | Lucide React |
| HTTP client | Axios (with interceptors) |
| Toasts | Sonner |
| Date handling | date-fns |

---

## Design System

Brand palette — applied via Tailwind config:

| Token | Hex | Usage |
|---|---|---|
| `bg-primary` | `#0c0f15` | Main background |
| `bg-darker` | `#04080f` | Deeper bg (sidebar) |
| `bg-surface` | `#111827` | Cards, modals, inputs |
| `bg-border` | `#1f2937` | Borders, dividers |
| `accent-green` | `#72d296` | Primary CTA, active states, accent |
| `accent-green-dim` | `#4a9b6f` | Hover states on green |
| `text-primary` | `#ffffff` | Main text |
| `text-secondary` | `#9ca3af` | Muted labels |
| `text-muted` | `#4b5563` | Placeholder, disabled |
| `status-won` | `#72d296` | Won deal state |
| `status-lost` | `#ef4444` | Lost deal state |
| `status-open` | `#3b82f6` | Open deal state |

Design language reference: **Linear** (clean, productivity-focused) + **Pipedrive** (pipeline UX).

---

## Multi-Tenancy Rules (CRITICAL)

Every user belongs to exactly one tenant (workspace). Tenant isolation is enforced at the **service layer**:

1. `tenantScope` middleware extracts `tenant_id` from the decoded JWT and sets `req.tenantId`.
2. Every service function receives `tenantId` as its **first argument**.
3. Every Knex query on a tenant-scoped table **must** include `.where({ tenant_id: tenantId })`.
4. Never query a tenant-scoped table without scoping — this is a data leak.

Tables NOT scoped by tenant: `tenants`, `refresh_tokens`, `api_keys` (keyed by hash directly).

```typescript
// CORRECT
async function getDeals(tenantId: string, filters: DealFilters) {
  return db('deals').where({ tenant_id: tenantId, ...filters });
}

// WRONG — never do this
async function getDeals(filters: DealFilters) {
  return db('deals').where(filters); // missing tenant_id scope!
}
```

---

## Auth Architecture

- **Access token**: JWT, 15-minute TTL, signed with `JWT_SECRET`, contains `{ sub: userId, tenantId, role }`
- **Refresh token**: 7-day TTL, stored **hashed** (SHA-256) in `refresh_tokens` table, enables server-side revocation
- Token rotation: every refresh call issues a new refresh token and revokes the old one
- Frontend: Axios interceptor catches 401 → silently calls `/auth/refresh` → retries original request
- `requireAuth` middleware: verifies JWT, attaches `req.user = { id, tenantId, role }`

---

## Role System

| Role | Permissions |
|---|---|
| `admin` | Full access — billing, user management, workspace config |
| `manager` | All seller permissions + team management + reports |
| `seller` | CRUD own contacts/deals, view pipeline, log activities |

Use `requireRole('admin')` or `requireRole('manager', 'admin')` middleware on routes.

---

## Feature Gating / Plan Tiers

Tier hierarchy: `free < starter < pro < enterprise`

```typescript
// Usage on routes
router.get('/contacts/export', requireAuth, requireTier('pro'), handler);
```

`requireTier` reads `tenant.plan` from the **database** (not JWT) to avoid stale plan data.
Gated routes return HTTP **402** with body `{ error: 'upgrade_required', requiredPlan: 'pro' }`.
Frontend reads this response and triggers the `UpgradeModal` component.

| Feature | Min tier |
|---|---|
| CSV import | pro |
| CSV export (contacts) | pro |
| Integrations / Webhooks | starter |
| API keys | starter |
| Extra users (>3) | starter |
| Custom fields | pro |

---

## API Conventions

- All routes prefixed: `/api/v1/`
- Auth: `Authorization: Bearer <accessToken>` header
- Public API: `X-API-Key: tlk_...` header
- Success: `{ data: ... }` or `{ data: [...], meta: { total, page, limit } }`
- Error: `{ error: 'message', code?: 'ERROR_CODE', details?: [...] }`
- Pagination: query params `?page=1&limit=20` (offset-based)
- HTTP 422 for validation errors (Zod), 401 for auth, 403 for role, 402 for tier, 404 for not found

---

## Database Conventions

- All primary keys: `uuid` using `gen_random_uuid()` (Postgres)
- All timestamps: `timestamptz` (timezone-aware)
- Soft delete: not used — use `is_active` for users, hard delete elsewhere
- Migrations: Knex timestamped migrations in `packages/backend/src/db/migrations/`
- Never modify existing migrations — always create a new one
- Every migration has both `up` and `down` functions

---

## Frontend Conventions

- All API calls go through `src/services/api.ts` (Axios instance)
- All server state via TanStack Query hooks in `src/hooks/`
- All client-only global state via Zustand stores in `src/store/`
- All forms use React Hook Form with Zod resolver
- Components in `src/components/ui/` are pure, reusable, no business logic
- Page components in `src/pages/` may use hooks and business logic
- Use `cn()` (clsx + tailwind-merge) for conditional class merging

---

## Environment Variables

### Backend (`packages/backend/.env`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/titancrm
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
PORT=3001
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

### Frontend (`packages/frontend/.env`)
```
VITE_API_URL=http://localhost:3001/api/v1
```

---

## Milestone Status

See [plan.md](./plan.md) for current progress.

| Milestone | Status |
|---|---|
| M1 — Scaffolding & Auth | ✅ Done |
| M2 — Contacts Module | ✅ Done |
| M3 — Pipeline & Kanban | ✅ Done |
| M4 — Dashboard, Activities, Calendar | ⏳ Pending |
| M5 — Reports, Export, Team | ⏳ Pending |
| M6 — Integrations API & Webhooks | ⏳ Pending |
| M7 — Billing & Premium Tiers | ⏳ Pending |
| M8 — Polish, Search, Deployment | ⏳ Pending |
