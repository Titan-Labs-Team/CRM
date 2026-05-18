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
- [x] `GET /reports/activities` — by type + by user
- [x] `GET /reports/leaderboard` — deals won + value per user
- [x] CSV export for deals (`GET /deals/export`, requires pro)
- [x] `POST /users/invite` — sends invitation email (Resend, fallback temp password)
- [x] `POST /contacts/import` — CSV bulk import (multer + csv-parse, requires pro)
- [x] `must_change_password` migration + auth flow (forced password change on first login)

### Frontend
- [x] `ReportsPage` — tabs: Overview / Activities / Leaderboard / Export
- [x] Export buttons (contacts + deals CSV download)
- [x] CSV import for contacts (file picker + progress feedback)
- [x] `SettingsPage` — user list, role change, invite form, deactivate
- [x] `ChangePasswordModal` — force password change on first login after invite

**Test**: Leaderboard accurate. CSV exports open in Excel. Invite email → new user logs in → forced password change modal.

---

## M6 — Integrations API & Webhooks
**Goal**: Developer-facing REST API and HMAC-signed webhook delivery.

### Backend
- [x] Migrations: `api_keys`, `integrations` (audit_logs already existed)
- [x] `/integrations` CRUD + HMAC-signed webhook delivery (`X-Titan-Signature`) + fire-and-forget
- [x] `POST /integrations/:id/test`
- [x] `/api-keys` CRUD (prefix+hash scheme, SHA-256)
- [x] Public API routes (`/public/contacts`, `/public/deals`) authenticated via `X-API-Key`
- [x] Scope enforcement (read/write)
- [x] Webhook auto-fire on contact.created/updated/deleted and deal.created/stage_changed/won/lost

### Frontend
- [x] `WebhooksSection` in SettingsPage — webhook form, event picker, test button, response status
- [x] `ApiKeysSection` in SettingsPage — key list with prefix, dates, last used
- [x] API key generator with show-once modal + copy button

**Test**: Webhook receives signed payload. API key reads contacts via curl. Revoked key → 401.

---

## M7 — Billing, Premium Tiers, Hardening
**Goal**: Stripe billing, feature gating by plan, production hardening.

### Backend
- [x] Migration: `subscriptions`
- [x] Stripe Checkout + Customer Portal + webhook handler
- [x] `requireTier` middleware on gated routes
- [x] Rate limiting by tier (free: 100/day, starter: 1000/day, pro: 10000/day)
- [ ] Audit logs fully populated

### Frontend
- [x] `BillingSection` in SettingsPage — plan display, upgrade CTA, portal link
- [x] `UpgradeModal` — plan comparison, triggered automatically on HTTP 402
- [x] Plan badge in Sidebar (`FREE`, `STARTER`, `PRO`)
- [ ] Lock icons + tooltips on gated items

**Test**: Free user blocked from CSV export with upgrade modal. Stripe Checkout upgrades plan. Webhook cancels subscription.

---

## M8 — Polish, Search, Notifications, Deployment
**Goal**: Production deployment, global search, notifications, final UX polish.

### Backend
- [x] `GET /search?q=` — unified full-text search across contacts/deals/activities
- [x] Notifications table + `GET /notifications` + `PATCH /notifications/:id/read` + `POST /notifications/read-all`
- [x] `GET /health` health check endpoint
- [x] Docker multi-stage build (`packages/backend/Dockerfile`, `packages/frontend/Dockerfile`)

### Frontend
- [x] Cmd+K search modal with keyboard navigation + grouped results
- [x] Notification bell — unread count badge + mark-all-read
- [x] Error boundaries on all pages (AppShell wraps Outlet)
- [x] Loading skeletons (TableSkeleton, KanbanSkeleton, CardSkeleton, Skeleton)
- [x] Empty states with context-aware CTAs on all list pages (EmptyState component)
- [x] Sonner toasts on all mutations
- [x] Mobile responsive layout (hamburger sidebar via AppShell, horizontal Kanban scroll)

### Infra
- [x] `docker-compose.prod.yml` production config (Postgres + backend + nginx)
- [x] GitHub Actions CI (lint + type-check on PR — `.github/workflows/ci.yml`)
- [x] GitHub Actions CD (Docker build + push on merge to main — `.github/workflows/cd.yml`)

**Test**: Global search accurate. Notifications appear on stage change. CI passes. `docker compose -f docker-compose.prod.yml up` starts full system. Mobile layout usable. ✅

---

## M9 — Stripe Live, Admin DB Access, Landing Page, UX Fixes

> Itens pós-lançamento: configuração de produção Stripe, acesso ao banco em produção, landing page de vendas e correções de UX identificadas no uso real.

---

### T1 — Stripe: variáveis de ambiente e fluxo de pagamento em produção

**Problema**: Os Price IDs do Stripe (`STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`) não estão configurados, portanto o botão de upgrade leva a erro. Além disso, falta clareza sobre como o webhook confirma o upgrade de plano.

**O que fazer**:

- [x] No dashboard Stripe (modo live), criar os produtos **Starter** e **Pro** com seus respectivos preços recorrentes e copiar os Price IDs
- [x] Adicionar ao `packages/backend/.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`
- [ ] No dashboard Stripe → Webhooks, apontar para `https://<seu-dominio>/api/v1/billing/webhook` e habilitar os eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` — **pendente: aguardando domínio de produção**
- [ ] Corrigir erro `StripeInvalidRequestError: No valid payment method types` ao criar Checkout Session — **ver bloco de erro abaixo**
- [ ] Testar webhook ponta a ponta: `stripe listen --forward-to localhost:3001/api/v1/billing/webhook` + `stripe trigger checkout.session.completed` retornando 200

**Arquivo-chave**: `packages/backend/src/modules/billing/billing.service.ts`

#### ⚠️ Erro pendente — Checkout Session falha ao criar

**Erro**: `StripeInvalidRequestError: No valid payment method types for this Checkout Session`

**Causa**: A conta Stripe não tem métodos de pagamento compatíveis com a moeda configurada (provavelmente BRL) habilitados no dashboard.

**Como corrigir (duas opções)**:

**Opção A — Habilitar métodos no dashboard Stripe (recomendado para produção)**:
1. Acesse [dashboard.stripe.com/settings/payment_methods](https://dashboard.stripe.com/settings/payment_methods)
2. Habilite **Cartão de crédito/débito** para BRL
3. Se usar modo live, pode precisar ativar também **Boleto** ou **Pix**

**Opção B — Especificar `payment_method_types` explicitamente no código**:
Em `packages/backend/src/modules/billing/billing.service.ts`, na criação da sessão, adicionar:
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],  // adicionar esta linha
  customer: customerId,
  mode: 'subscription',
  ...
});
```
Esta opção resolve independente das configurações do dashboard.

---

### T2 — Acesso ao banco de dados PostgreSQL em produção (Docker)

**Problema**: Em produção com Docker, o banco roda em container isolado. É necessário saber como conectar para operações manuais (conceder plano manualmente, debugar dados, etc.).

**Como acessar o banco em produção**:

#### Opção A — `docker exec` direto (sem expor porta)
```bash
# Listar containers rodando
docker compose -f docker-compose.prod.yml ps

# Abrir psql dentro do container do banco
docker compose -f docker-compose.prod.yml exec db psql -U postgres -d titancrm
```

#### Opção B — Expor porta temporariamente (só quando necessário)
Adicionar ao serviço `db` no `docker-compose.prod.yml`:
```yaml
ports:
  - "5432:5432"   # remover após uso — nunca deixar exposto em produção
```
Depois conectar com qualquer client (DBeaver, TablePlus, psql local).

#### Conceder plano manualmente a um tenant
```sql
-- Ver tenants cadastrados
SELECT id, name, plan FROM tenants;

-- Promover tenant para 'pro' ou 'starter'
UPDATE tenants SET plan = 'pro' WHERE id = '<tenant-uuid>';

-- Ver subscriptions
SELECT * FROM subscriptions WHERE tenant_id = '<tenant-uuid>';

-- Inserir/atualizar subscription manualmente (se necessário)
INSERT INTO subscriptions (tenant_id, plan, status, current_period_end)
VALUES ('<tenant-uuid>', 'pro', 'active', NOW() + INTERVAL '1 year')
ON CONFLICT (tenant_id) DO UPDATE
  SET plan = 'pro', status = 'active', current_period_end = NOW() + INTERVAL '1 year';
```

**Rodar migrations em produção**:
```bash
docker compose -f docker-compose.prod.yml exec backend \
  npx knex --knexfile knexfile.ts migrate:latest
```

- [ ] Documentar esse fluxo no README do projeto
- [ ] Avaliar adicionar rota `POST /admin/grant-plan` protegida por segredo de admin para operações self-service sem psql

---

### T3 — Landing Page de apresentação e venda ✅

**Objetivo**: Página pública em `/` (ou domínio separado) que convença visitantes a criar conta. Deve comunicar o produto, mostrar os planos e ter CTAs claros para cadastro.

**Seções obrigatórias**:

- [x] **Hero** — headline forte + subheadline + CTA primário ("Começar grátis") + screenshot/mockup do produto
- [x] **Dor / Solução** — 3 bullets curtos: problema atual (WhatsApp, planilhas) → como o Titan Labs resolve
- [x] **Features** — 4–6 cards com ícone: Pipeline Kanban, Contatos, Relatórios, Automações/Webhooks, API, Multi-usuário
- [x] **Social proof** — depoimentos placeholder ou logos de clientes (pode ser fictício no MVP)
- [x] **Pricing** — tabela de planos FREE / STARTER / PRO com features por tier e botões de CTA
- [x] **FAQ** — 4–6 perguntas frequentes sobre planos, cancelamento, dados
- [x] **Footer** — links: Termos, Privacidade, Contato, redes sociais

**Decisões técnicas**:
- Criar como página React em `packages/frontend/src/pages/landing/LandingPage.tsx`
- Rota pública `/` no router (sem `ProtectedRoute`)
- Redirecionar `/` para `/dashboard` quando o usuário já estiver autenticado
- Usar o design system existente (tokens de cor, fontes) mas com layout de marketing (full-width, seções alternadas)
- O botão de plano pago na seção Pricing deve chamar `POST /billing/checkout` passando o plano selecionado — se não autenticado, redireciona para `/register?plan=pro`

**Arquivo-chave**: `packages/frontend/src/app/router.tsx` (adicionar rota `/`), `packages/frontend/src/pages/landing/LandingPage.tsx` (criar)

---

### T4 — Navbar: nome do workspace no lugar de "Titan Labs" ✅

**Problema**: O nome fixo "Titan Labs" aparece na sidebar. Deve ser substituído pelo nome da empresa que o admin cadastrou no momento do registro (campo `tenants.name`).

**O que fazer**:

- [x] No `Sidebar.tsx`, buscar o nome do tenant via `GET /api/v1/tenant` (já existe endpoint + hook `useBilling` retorna subscription, mas o tenant name vem de `PATCH /tenant`)
- [x] Criar (ou reutilizar) hook `useTenant()` que chama `GET /api/v1/tenant` e retorna `{ name, plan, ... }`
- [x] Substituir o texto `"Titan Labs"` no `Sidebar.tsx` pelo `tenant.name` (com fallback `"Titan Labs"` enquanto carrega)
- [x] Garantir que `RegisterPage` já salva o `companyName` como `tenants.name` — verificar `POST /auth/register`

**Arquivo-chave**: `packages/frontend/src/components/layout/Sidebar.tsx`

---

### T5 — Pipeline: editar nome das etapas (stages) ✅

**Problema**: Na modal de configurações do pipeline (`PipelineSettingsModal`), é possível excluir etapas mas não renomeá-las. O endpoint `PATCH /pipelines/:pipelineId/stages/:stageId` já existe no backend.

**O que fazer**:

- [x] Em `PipelineSettingsModal.tsx`, adicionar modo de edição inline nas etapas: clicar no nome da etapa transforma em `<input>`, confirmar com Enter ou botão ✓, cancelar com Escape
- [x] Chamar `PATCH /pipelines/:pipelineId/stages/:stageId` com `{ name }` ao confirmar
- [x] Usar `useUpdateStage` (hook já existe em `usePipeline.ts`) para a mutation
- [x] Adicionar toast de sucesso/erro (já no hook)

**Arquivo-chave**: `packages/frontend/src/components/pipeline/PipelineSettingsModal.tsx`

---

### T6 — Contatos: campo "Responsável" funcional com select de membros ✅

**Problema**: A tabela de contatos exibe a coluna "Responsável" e o filtro por owner existe no backend, mas o formulário de criação/edição de contato (`ContactForm.tsx`) não tem campo para selecionar o responsável — o `owner_id` nunca é preenchido.

**O que fazer**:

- [x] Em `ContactForm.tsx`, adicionar campo `<select>` (ou combobox) "Responsável" que lista os usuários ativos do tenant
- [x] Buscar usuários via `useUsers()` (hook já existe) e popular as opções com `{ value: user.id, label: user.full_name }`
- [x] Incluir `ownerId` no schema Zod do formulário e no `CreateContactInput`
- [x] Verificar que o backend já aceita `owner_id` no `POST /contacts` e `PATCH /contacts/:id` — se não, adicionar ao service/controller
- [x] Exibir avatar + nome do responsável na `ContactDetailPage` (já consome `owner_name` do backend)

**Arquivo-chave**: `packages/frontend/src/components/contacts/ContactForm.tsx`

---

## M10 — Conversão e Crescimento

> Melhorias identificadas após análise de pricing e produto. Foco em aumentar conversão Free → Pago.

---

### T1 — Limitar plano Free para forçar conversão

**Problema**: O Free entrega quase tudo (pipeline, relatórios, leaderboard, calendário, contatos ilimitados). O usuário não sente falta de nada — não tem motivo para pagar.

**O que fazer**:

- [ ] Limitar contatos no Free a **300** — ao atingir o limite, exibir banner "Você atingiu o limite do plano Free. Faça upgrade para adicionar mais contatos." com CTA para Starter/Pro
- [ ] Mover **Relatórios** (ReportsPage — abas Activities, Leaderboard) para **Starter+** — no Free exibir as abas bloqueadas com `UpgradeModal` ao clicar
- [ ] Implementar contagem de contatos no backend: antes de inserir novo contato, verificar `COUNT` e retornar 402 se Free e >= 300
- [ ] Exibir no Dashboard um indicador de uso: "247 / 300 contatos usados" no plano Free

**Arquivos-chave**:
- `packages/backend/src/modules/contacts/contacts.service.ts` (adicionar check de limite)
- `packages/frontend/src/pages/reports/ReportsPage.tsx` (gate nas abas)
- `packages/frontend/src/pages/dashboard/DashboardPage.tsx` (indicador de uso)

---

### T2 — Landing page: reduzir atrito no CTA principal

**Problema**: O fluxo atual é landing → `/register` com 5 campos (workspace, slug, nome, e-mail, senha). Qualquer campo a mais reduz conversão.

**O que fazer**:

- [ ] Simplificar `RegisterPage` para **3 campos apenas**: e-mail, senha, nome da empresa — gerar o slug automaticamente a partir do nome da empresa (sem expor o campo slug ao usuário)
- [ ] Adicionar opção de **continuar com Google** (OAuth) — reduz atrito para zero no cadastro (requer `passport-google-oauth20` no backend ou Supabase Auth)
- [ ] Após cadastro, redirecionar para um **onboarding de 2 passos** em vez de jogar direto no dashboard vazio: (1) "Como se chama seu primeiro pipeline?" (2) "Convide alguém do time (opcional)" — aumenta ativação

**Arquivos-chave**:
- `packages/frontend/src/pages/auth/RegisterPage.tsx`
- `packages/backend/src/modules/auth/auth.service.ts`

---

### T3 — Suporte via WhatsApp

**Problema**: Para SaaS B2B pequeno no Brasil, suporte por WhatsApp aumenta conversão e reduz churn — o cliente sente que tem alguém por trás do produto.

**O que fazer**:

- [ ] Adicionar botão flutuante de WhatsApp na `LandingPage` e dentro do app (canto inferior direito) apontando para o número de suporte
- [ ] Criar template de mensagem automática: "Olá! Sou da [empresa], tenho dúvida sobre o Titan Labs CRM."
- [ ] Avaliar integração com **Z-API ou Evolution API** para automação de respostas comuns (boas-vindas, link de docs, status de pagamento)

**Arquivo-chave**: `packages/frontend/src/pages/landing/LandingPage.tsx`, `packages/frontend/src/components/layout/AppShell.tsx`
