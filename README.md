# Titan Labs CRM

> CRM SaaS multi-tenant para gestão de leads, contatos, negócios e pipelines de vendas.

Titan Labs CRM substitui ferramentas dispersas (WhatsApp, planilhas) por uma plataforma centralizada com foco em Kanban. Cada empresa que se cadastra recebe um workspace isolado com controle total de equipe, pipeline, relatórios e billing.

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Desenvolvimento Local](#instalação-e-desenvolvimento-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [API Reference](#api-reference)
- [Sistema de Planos e Permissões](#sistema-de-planos-e-permissões)
- [Deploy com Docker](#deploy-com-docker)
- [CI/CD](#cicd)
- [Design System](#design-system)
- [Arquitetura Multi-tenant](#arquitetura-multi-tenant)
- [Autenticação](#autenticação)

---

## Visão Geral

**Personas principais:**
- **Seller** — gerencia leads e negócios
- **Manager** — analytics + configuração da equipe
- **Admin** — billing + ownership do workspace

**Planos disponíveis:** `free → starter → pro → enterprise`

---

## Stack Tecnológico

### Backend

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express 4 + TypeScript |
| Banco de dados | PostgreSQL 16 |
| Query builder / Migrations | Knex.js |
| Autenticação | jose (JWT) + bcryptjs |
| Validação | Zod |
| Pagamentos | Stripe Node SDK |
| Email | Resend API |
| OAuth | passport-google-oauth20 |
| Upload de arquivos | Multer |
| CSV | csv-parse + csv-stringify |
| Rate limiting | express-rate-limit |

### Frontend

| Camada | Tecnologia |
|--------|-----------|
| Build | Vite |
| Framework | React 18 + TypeScript |
| Estado servidor | TanStack Query v5 |
| Estado global | Zustand |
| Formulários | React Hook Form + Zod |
| Estilização | Tailwind CSS v3 + CVA |
| UI primitivos | Radix UI |
| Gráficos | Recharts |
| Drag and Drop | @dnd-kit/core + @dnd-kit/sortable |
| Calendário | FullCalendar (React adapter) |
| Ícones | Lucide React |
| HTTP client | Axios (com interceptors) |
| Toasts | Sonner |
| Datas | date-fns |
| Roteamento | react-router-dom v6 |

---

## Estrutura do Projeto

```
CRMTitanLabs/
├── packages/
│   ├── backend/                        # Express + TypeScript + Knex + PostgreSQL
│   │   ├── src/
│   │   │   ├── server.ts               # Entry point, middleware, rotas
│   │   │   ├── config/
│   │   │   │   └── env.ts              # Validação de variáveis de ambiente (Zod)
│   │   │   ├── db/
│   │   │   │   ├── migrations/         # 15 migrations Knex
│   │   │   │   └── seeds/              # Seeds de desenvolvimento
│   │   │   ├── modules/                # 16 módulos de feature
│   │   │   │   ├── auth/
│   │   │   │   ├── billing/
│   │   │   │   ├── contacts/
│   │   │   │   ├── deals/
│   │   │   │   ├── pipelines/
│   │   │   │   ├── activities/
│   │   │   │   ├── calendar/
│   │   │   │   ├── reports/
│   │   │   │   ├── users/
│   │   │   │   ├── tenants/
│   │   │   │   ├── api-keys/
│   │   │   │   ├── integrations/
│   │   │   │   ├── notifications/
│   │   │   │   ├── search/
│   │   │   │   └── public/
│   │   │   └── shared/                 # Middleware, tipos, utilitários
│   │   ├── knexfile.ts
│   │   ├── Dockerfile
│   │   └── .env
│   └── frontend/                       # React + Vite + TypeScript + Tailwind CSS
│       ├── src/
│       │   ├── main.tsx                # Entry point React
│       │   ├── app/
│       │   │   ├── App.tsx             # Root component + providers
│       │   │   └── router.tsx          # Configuração de rotas
│       │   ├── components/             # Componentes organizados por feature
│       │   │   ├── ui/                 # Componentes puros (Button, Input, Dialog...)
│       │   │   ├── layout/             # AppShell, Sidebar, Topbar
│       │   │   ├── kanban/             # KanbanBoard, KanbanColumn, KanbanCard
│       │   │   ├── contacts/
│       │   │   ├── dashboard/
│       │   │   ├── auth/
│       │   │   └── ...
│       │   ├── pages/                  # Páginas com lógica de negócio
│       │   │   ├── auth/               # LoginPage, RegisterPage, AuthCallbackPage
│       │   │   ├── dashboard/
│       │   │   ├── contacts/
│       │   │   ├── deals/
│       │   │   ├── calendar/
│       │   │   ├── reports/
│       │   │   ├── settings/
│       │   │   └── landing/            # LandingPage pública
│       │   ├── hooks/                  # TanStack Query hooks
│       │   ├── store/                  # Zustand stores
│       │   └── services/
│       │       └── api.ts              # Instância Axios centralizada
│       ├── nginx.conf                  # Config Nginx para produção
│       ├── Dockerfile
│       └── .env
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Type-check em PRs
│       └── cd.yml                      # Build e push Docker em merge para main
├── docker-compose.yml                  # Postgres 16 + pgAdmin (desenvolvimento)
├── docker-compose.prod.yml             # Stack completa de produção
├── CLAUDE.md                           # Instruções para o assistente de IA
├── plan.md                             # Roadmap de milestones
└── package.json                        # npm workspaces root
```

---

## Funcionalidades

### Core CRM
- **Contatos** — CRUD completo com campos customizados, campo "Responsável" (assign a membro da equipe), importação/exportação CSV (plano pro)
- **Pipeline Kanban** — arrastar e soltar negócios entre etapas, renomear etapas inline, múltiplos pipelines
- **Negócios** — gestão completa com histórico de mudanças, marcar como ganho/perdido, exportação CSV
- **Atividades** — notas, chamadas, emails, reuniões, tarefas com timeline
- **Calendário** — agendamento com suporte a attendees

### Analytics e Relatórios
- **Dashboard** — KPIs, gráfico de receita, funil de conversão, feed de atividades
- **Relatórios** — KPIs, funil, receita por período, atividades por tipo, leaderboard de vendedores (starter+)
- **Indicador de uso** — barra de progresso de contatos no dashboard (plano free)

### Colaboração
- **Notificações** — disparo automático em deal.won, deal.lost, deal.stage_changed (exceto o ator)
- **Gestão de equipe** — convite por email, controle de roles, campo de responsável em contatos

### Plataforma e Integrações
- **Webhooks** — assinados com HMAC (X-Titan-Signature), disparo em eventos de contato e negócio
- **API pública** — autenticação por API key (X-API-Key: tlk_...), endpoints de leitura e criação
- **API keys** — prefix `tlk_`, hash SHA-256, controle de escopo (read/write), admin only
- **OAuth Google** — login e cadastro via Google, criação automática de tenant para novos usuários
- **Onboarding** — 2 passos: criar pipeline padrão + convidar equipe

### Billing
- **Stripe** — checkout session, portal de billing, webhook para sincronização de plano
- **Feature gating** — middleware `requireTier()` retorna 402 com prompt de upgrade
- **Rate limiting** — 100/1.000/10.000 req/dia por plano (free/starter/pro)

### UX
- **Busca global** — Cmd+K abre SearchModal, ILIKE em contatos, negócios e atividades
- **Mobile** — hamburger menu, sidebar overlay em telas `< md`
- **Skeletons** — TableSkeleton, KanbanSkeleton, CardSkeleton durante carregamento
- **Empty states** — EmptyState component em listagens
- **Error boundary** — captura crashes em páginas, exibe fallback
- **WhatsApp** — botão flutuante na LandingPage e no AppShell

---

## Pré-requisitos

- **Node.js** 20+
- **npm** 9+ (workspaces)
- **Docker** e **Docker Compose**
- **PostgreSQL 16** (via Docker ou instalação local)

---

## Instalação e Desenvolvimento Local

### 1. Clonar o repositório

```bash
git clone <url-do-repositório>
cd CRMTitanLabs
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Subir o banco de dados

```bash
docker compose up -d
```

Isso inicia:
- **PostgreSQL 16** em `localhost:5432` (usuário: `postgres`, senha: `postgres`, banco: `titancrm`)
- **pgAdmin 4** em `http://localhost:5050` (usuário: `admin@titancrm.com`, senha: `admin`)

### 4. Configurar variáveis de ambiente

Crie o arquivo `packages/backend/.env`:


```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/titancrm
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
[guid]::NewGuid().ToString() #para gerar secret key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Crie o arquivo `packages/frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api/v1
```

### 5. Executar migrations

```bash
npm run migrate:latest --workspace=packages/backend
```

### 6. Executar seeds (opcional)

```bash
npm run seed --workspace=packages/backend
```

### 7. Iniciar os servidores de desenvolvimento

Em terminais separados:

```bash
# Backend — porta 3001
npm run dev:backend

# Frontend — porta 5173
npm run dev:frontend
```

Ou diretamente dentro de cada pacote:

```bash
cd packages/backend && npm run dev
cd packages/frontend && npm run dev
```

---

## Variáveis de Ambiente

### Backend (`packages/backend/.env`)

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `DATABASE_URL` | Sim | — | String de conexão PostgreSQL |
| `JWT_SECRET` | Sim | — | Segredo para assinar access tokens (mín. 32 chars) |
| `JWT_REFRESH_SECRET` | Sim | — | Segredo para assinar refresh tokens (mín. 32 chars) |
| `PORT` | Não | `3001` | Porta do servidor backend |
| `NODE_ENV` | Não | `development` | `development` \| `production` \| `test` |
| `FRONTEND_URL` | Não | `http://localhost:5173` | Origem CORS do frontend |
| `STRIPE_SECRET_KEY` | Não | — | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Não | — | Segredo para validar webhooks do Stripe |
| `STRIPE_PRICE_STARTER` | Não | — | Price ID do plano Starter no Stripe |
| `STRIPE_PRICE_PRO` | Não | — | Price ID do plano Pro no Stripe |
| `RESEND_API_KEY` | Não | — | Chave de API do Resend (email) |
| `GOOGLE_CLIENT_ID` | Não | — | Client ID do Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Não | — | Client Secret do Google OAuth |

> **Nota:** As rotas de OAuth Google (`/auth/google`, `/auth/google/callback`) só são montadas se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estiverem definidos.

### Frontend (`packages/frontend/.env`)

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `VITE_API_URL` | Não | `http://localhost:3001/api/v1` | URL base da API backend |

---

## Banco de Dados

### Migrations

Todas as migrations ficam em `packages/backend/src/db/migrations/`. Toda migration tem funções `up` e `down`.

**Nunca modifique migrations existentes — crie sempre uma nova.**

| Migration | Tabela(s) | Descrição |
|-----------|-----------|-----------|
| 20240001 | `tenants` | Workspaces com plano (free/starter/pro/enterprise) |
| 20240002 | `users` | Membros com roles (admin/manager/seller) |
| 20240003 | `refresh_tokens` | Rotação de tokens (TTL 7 dias, hash SHA-256) |
| 20240004 | `contacts` | Leads/contatos com campos customizados |
| 20240005 | `pipelines`, `pipeline_stages` | Pipelines de venda + etapas com posição |
| 20240006 | `deals`, `audit_logs` | Negócios (won/lost/open) + trilha de auditoria |
| 20240007 | `activities` | Notas, chamadas, emails, reuniões, tarefas |
| 20240008 | `calendar_events`, `calendar_event_attendees` | Agendamentos com participantes |
| 20240009 | `audit_logs` | Recriação idempotente dos audit logs |
| 20240011 | `subscriptions` | Tracking de assinaturas Stripe |
| 20240012 | `api_keys` | API keys de desenvolvedor (prefix + hash) |
| 20240013 | `integrations` | Webhooks com assinatura HMAC |
| 20240014 | `notifications` | Notificações em tempo real (lida/não lida) |
| 20240015 | `users` | `password_hash` nullable (suporte a OAuth) |

### Comandos de migrations

```bash
# Rodar migrations pendentes
npm run migrate:latest --workspace=packages/backend

# Reverter último batch
npm run migrate:rollback --workspace=packages/backend

# Criar nova migration
npm run migrate:make --workspace=packages/backend -- nome_da_migration

# Seeds de desenvolvimento
npm run seed --workspace=packages/backend
```

### Convenções do banco

- **Primary keys:** UUID usando `gen_random_uuid()` (PostgreSQL)
- **Timestamps:** `timestamptz` (timezone-aware)
- **Soft delete:** apenas `is_active` em users; hard delete no restante
- **Multi-tenancy:** toda tabela com escopo de tenant tem coluna `tenant_id`

---

## API Reference

Todas as rotas são prefixadas com `/api/v1/`.

**Autenticação:** `Authorization: Bearer <accessToken>`
**API pública:** `X-API-Key: tlk_...`

### Convenções de resposta

```json
// Sucesso
{ "data": { ... } }
{ "data": [...], "meta": { "total": 100, "page": 1, "limit": 20 } }

// Erro
{ "error": "mensagem", "code": "ERROR_CODE", "details": [...] }
```

**Códigos HTTP:**
- `422` — erros de validação Zod
- `401` — não autenticado
- `403` — sem permissão (role)
- `402` — plano insuficiente (upgrade required)
- `404` — recurso não encontrado

### Endpoints

#### Autenticação (`/auth`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro de novo workspace |
| POST | `/auth/login` | Login com email/senha |
| POST | `/auth/refresh` | Renovar access token |
| POST | `/auth/logout` | Revogar refresh token |
| GET | `/auth/me` | Dados do usuário logado |
| PATCH | `/auth/me` | Atualizar perfil / trocar senha |
| GET | `/auth/google` | Redirecionar para Google OAuth |
| GET | `/auth/google/callback` | Callback do Google OAuth |

#### Workspace (`/tenant`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/tenant` | Dados do workspace atual |
| PATCH | `/tenant` | Atualizar configurações do workspace |

#### Equipe (`/users`)

| Método | Rota | Permissão |
|--------|------|-----------|
| GET | `/users` | Listar membros da equipe |
| POST | `/users/invite` | Convidar membro (manager/admin) |
| PATCH | `/users/:id` | Editar membro (admin) |

#### Contatos (`/contacts`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/contacts` | Listar com filtros e paginação |
| POST | `/contacts` | Criar contato |
| GET | `/contacts/:id` | Detalhe do contato |
| PATCH | `/contacts/:id` | Editar contato |
| DELETE | `/contacts/:id` | Excluir contato |
| POST | `/contacts/import` | Importar CSV (plano pro) |
| GET | `/contacts/export` | Exportar CSV (plano pro) |

#### Pipeline (`/pipelines`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/pipelines` | Listar pipelines |
| POST | `/pipelines` | Criar pipeline |
| PATCH | `/pipelines/:id` | Editar pipeline / renomear etapas |
| POST | `/pipelines/stages/reorder` | Reordenar etapas |

#### Negócios (`/deals`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/deals` | Listar negócios |
| GET | `/deals/kanban` | Dados agrupados por etapa para Kanban |
| POST | `/deals` | Criar negócio |
| GET | `/deals/:id` | Detalhe do negócio |
| PATCH | `/deals/:id` | Editar negócio |
| DELETE | `/deals/:id` | Excluir negócio |
| POST | `/deals/reorder` | Reordenar dentro da mesma etapa |
| PATCH | `/deals/:id/stage` | Mover para outra etapa |
| PATCH | `/deals/:id/won` | Marcar como ganho |
| PATCH | `/deals/:id/lost` | Marcar como perdido |
| GET | `/deals/export` | Exportar CSV (plano pro) |

#### Atividades (`/activities`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/activities` | Listar atividades |
| POST | `/activities` | Criar atividade |
| GET | `/activities/:id` | Detalhe |
| PATCH | `/activities/:id` | Editar |
| PATCH | `/activities/:id/done` | Marcar como concluída |

#### Calendário (`/calendar/events`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/calendar/events` | Listar eventos |
| POST | `/calendar/events` | Criar evento |
| PATCH | `/calendar/events/:id` | Editar evento |
| DELETE | `/calendar/events/:id` | Excluir evento |

#### Relatórios (`/reports`) — starter+

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/reports/kpis` | KPIs gerais |
| GET | `/reports/funnel` | Funil de conversão |
| GET | `/reports/revenue` | Receita por período |
| GET | `/reports/activities` | Atividades por tipo (starter+) |
| GET | `/reports/leaderboard` | Ranking de vendedores (starter+) |

#### Billing (`/billing`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/billing/webhook` | Webhook Stripe (raw body) |
| GET | `/billing/subscription` | Status da assinatura atual |
| POST | `/billing/checkout` | Criar sessão de checkout |
| POST | `/billing/portal` | Abrir portal de billing Stripe |

#### API Keys (`/api-keys`) — starter+, admin only

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api-keys` | Listar API keys |
| POST | `/api-keys` | Criar nova API key |
| DELETE | `/api-keys/:id` | Revogar API key |

#### Integrações/Webhooks (`/integrations`) — starter+

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/integrations` | Listar webhooks |
| POST | `/integrations` | Criar webhook |
| PATCH | `/integrations/:id` | Editar webhook |
| DELETE | `/integrations/:id` | Excluir webhook |
| POST | `/integrations/:id/test` | Disparar evento de teste |

#### Busca (`/search`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/search?q=<query>` | Busca ILIKE em contatos, negócios e atividades (mín. 2 chars) |

#### Notificações (`/notifications`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/notifications` | Listar notificações |
| GET | `/notifications/unread-count` | Contagem de não lidas |
| PATCH | `/notifications/:id/read` | Marcar como lida |
| POST | `/notifications/read-all` | Marcar todas como lidas |

#### API Pública (`/public`) — autenticação por API key

| Método | Rota | Escopo |
|--------|------|--------|
| GET | `/public/contacts` | read |
| POST | `/public/contacts` | write |
| GET | `/public/deals` | read |

#### Health check

| Método | Rota | Resposta |
|--------|------|----------|
| GET | `/health` | `{ "status": "ok", "timestamp": "..." }` |

---

## Sistema de Planos e Permissões

### Planos

Hierarquia: `free < starter < pro < enterprise`

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Contatos | Até 300 | Ilimitado | Ilimitado | Ilimitado |
| Usuários | Até 3 | Ilimitado | Ilimitado | Ilimitado |
| Pipelines/Kanban | Sim | Sim | Sim | Sim |
| Relatórios básicos | Sim | Sim | Sim | Sim |
| Relatórios avançados | Não | Sim | Sim | Sim |
| Importação CSV | Não | Não | Sim | Sim |
| Exportação CSV | Não | Não | Sim | Sim |
| Campos customizados | Não | Não | Sim | Sim |
| API keys | Não | Sim | Sim | Sim |
| Webhooks | Não | Sim | Sim | Sim |
| Rate limit | 100/dia | 1.000/dia | 10.000/dia | 10.000/dia |

Rotas gated retornam HTTP **402** com:

```json
{ "error": "upgrade_required", "code": "upgrade_required", "requiredPlan": "pro" }
```

### Roles

| Role | Permissões |
|------|-----------|
| `admin` | Acesso total — billing, gestão de usuários, config do workspace |
| `manager` | Todas as permissões do seller + gestão de equipe + relatórios |
| `seller` | CRUD de contatos/negócios próprios, pipeline, atividades |

---

## Deploy com Docker

Esta seção cobre todos os arquivos e comandos necessários para construir e subir o projeto em produção com Docker.

### Arquivos Docker necessários

```
CRMTitanLabs/
├── docker-compose.yml              # Desenvolvimento local (Postgres + pgAdmin)
├── docker-compose.prod.yml         # Produção (Postgres + Backend + Frontend/Nginx)
├── packages/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       ├── Dockerfile
│       └── nginx.conf
```

---

### `docker-compose.yml` — Desenvolvimento local

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: titancrm_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: titancrm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: titancrm_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@titancrm.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

```bash
# Subir em background
docker compose up -d

# Ver logs
docker compose logs -f

# Parar
docker compose down
```

---

### `docker-compose.prod.yml` — Produção

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
    restart: unless-stopped
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      NODE_ENV: production
      PORT: 3001
      FRONTEND_URL: ${FRONTEND_URL}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      STRIPE_PRICE_STARTER: ${STRIPE_PRICE_STARTER}
      STRIPE_PRICE_PRO: ${STRIPE_PRICE_PRO}
      RESEND_API_KEY: ${RESEND_API_KEY}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: .
      dockerfile: packages/frontend/Dockerfile
      args:
        VITE_API_URL: /api/v1
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_prod_data:
```

> **Importante:** O `context: .` (raiz do repositório) é obrigatório nos dois serviços de build para que o `package-lock.json` do npm workspaces esteja disponível durante a construção das imagens.

---

### `packages/backend/Dockerfile`

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar manifests do workspace inteiro
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/

# Instalar dependências de produção
RUN npm ci --workspace=packages/backend --omit=dev

# ─────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

# Copiar dependências instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules 2>/dev/null || true

# Copiar código-fonte do backend
COPY packages/backend ./packages/backend
COPY package.json ./

EXPOSE 3001

# Executar a partir da raiz do workspace
CMD ["node_modules/.bin/tsx", "packages/backend/src/server.ts"]
```

---

### `packages/frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

# Copiar manifests do workspace
COPY package.json package-lock.json ./
COPY packages/frontend/package.json ./packages/frontend/

# Instalar dependências
RUN npm ci --workspace=packages/frontend

# Copiar código-fonte e construir
COPY packages/frontend ./packages/frontend

ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build --workspace=packages/frontend

# ─────────────────────────────────────────
FROM nginx:alpine AS serve
WORKDIR /usr/share/nginx/html

# Copiar arquivos estáticos buildados
COPY --from=build /app/packages/frontend/dist .

# Copiar config do Nginx
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

### `packages/frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1024;

    # Proxy para o backend
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA fallback — necessário para React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

### `.env` de produção

Crie um arquivo `.env` na **raiz do repositório** para uso pelo `docker-compose.prod.yml`:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=troque_por_senha_segura
POSTGRES_DB=titancrm

# Backend
DATABASE_URL=postgresql://postgres:troque_por_senha_segura@db:5432/titancrm?sslmode=disable
JWT_SECRET=gere_uma_string_aleatoria_minimo_32_caracteres
JWT_REFRESH_SECRET=gere_outra_string_aleatoria_minimo_32_caracteres
FRONTEND_URL=https://seudominio.com.br

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...

# Email (opcional)
RESEND_API_KEY=re_...

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

> **Segurança:** Nunca commite o `.env` de produção. Adicione-o ao `.gitignore`.

---

### Comandos de produção

#### Subir a stack completa

```bash
# Build e subir todos os serviços
docker compose -f docker-compose.prod.yml up -d --build

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f db
```

#### Migrations em produção

As migrations rodam automaticamente na inicialização do backend. Para rodar manualmente:

```bash
# Rodar migrations pendentes
docker compose -f docker-compose.prod.yml exec backend \
  node_modules/.bin/tsx node_modules/.bin/knex \
  --knexfile packages/backend/knexfile.ts \
  migrate:latest

# Rollback
docker compose -f docker-compose.prod.yml exec backend \
  node_modules/.bin/tsx node_modules/.bin/knex \
  --knexfile packages/backend/knexfile.ts \
  migrate:rollback
```

#### Gerenciar imagens e containers

```bash
# Rebuild de um serviço específico
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml build frontend

# Rebuild do frontend com URL de API customizada
docker compose -f docker-compose.prod.yml build \
  --build-arg VITE_API_URL=https://seudominio.com.br/api/v1 frontend

# Restart sem rebuild
docker compose -f docker-compose.prod.yml restart backend

# Parar e remover containers (preserva volumes/dados)
docker compose -f docker-compose.prod.yml down

# Parar e remover tudo incluindo volumes — APAGA O BANCO
docker compose -f docker-compose.prod.yml down -v
```

#### Acesso ao banco em produção

```bash
# Abrir psql dentro do container
docker compose -f docker-compose.prod.yml exec db \
  psql -U postgres -d titancrm

# Dump do banco de dados
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U postgres titancrm > backup_$(date +%Y%m%d).sql

# Restaurar dump
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U postgres titancrm < backup_20240101.sql
```

#### Verificar saúde dos serviços

```bash
# Status dos containers
docker compose -f docker-compose.prod.yml ps

# Health check direto no backend
curl http://localhost:3001/health

# Health check via Nginx (frontend)
curl http://localhost/api/v1/health
```

---

### Build manual das imagens (sem Docker Compose)

```bash
# Backend — o contexto DEVE ser a raiz do repositório
docker build \
  -t titancrm-backend:latest \
  -f packages/backend/Dockerfile \
  .

docker run -d \
  --name titancrm-backend \
  -p 3001:3001 \
  --env-file .env \
  titancrm-backend:latest

# Frontend — o contexto DEVE ser a raiz do repositório
docker build \
  -t titancrm-frontend:latest \
  -f packages/frontend/Dockerfile \
  --build-arg VITE_API_URL=https://seudominio.com.br/api/v1 \
  .

docker run -d \
  --name titancrm-frontend \
  -p 80:80 \
  titancrm-frontend:latest
```

---

### Publicar imagens no GitHub Container Registry (GHCR)

```bash
# Autenticar
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Backend
docker build -t ghcr.io/<owner>/titancrm-backend:latest -f packages/backend/Dockerfile .
docker push ghcr.io/<owner>/titancrm-backend:latest

# Frontend
docker build \
  -t ghcr.io/<owner>/titancrm-frontend:latest \
  -f packages/frontend/Dockerfile \
  --build-arg VITE_API_URL=/api/v1 \
  .
docker push ghcr.io/<owner>/titancrm-frontend:latest
```

### Atualizar produção com nova imagem

```bash
# Baixar novas imagens publicadas
docker compose -f docker-compose.prod.yml pull

# Recriar containers com as novas imagens
docker compose -f docker-compose.prod.yml up -d
```

---

## CI/CD

### CI — `.github/workflows/ci.yml`

Dispara em: push para `main`, pull requests para `main`

- **Backend:** `npx tsc --noEmit` (type-check TypeScript)
- **Frontend:** `npm run lint` (tsc --noEmit)
- Node 20 com cache de npm

### CD — `.github/workflows/cd.yml`

Dispara em: merge para `main`

- Build das imagens Docker do backend e frontend
- Push para GitHub Container Registry (GHCR)
- Tags: `latest` + SHA do commit (`ghcr.io/<owner>/titancrm-backend:latest`)

> **Atenção:** O build context no CD deve ser `.` (raiz do repo) e não `./packages/*`, caso contrário o npm workspaces não encontrará o `package-lock.json` raiz e falhará.

---

## Design System

### Paleta de cores (Tailwind)

| Token | Hex | Uso |
|-------|-----|-----|
| `bg-primary` | `#0c0f15` | Background principal |
| `bg-darker` | `#04080f` | Background profundo (sidebar) |
| `bg-surface` | `#111827` | Cards, modais, inputs |
| `bg-border` | `#1f2937` | Bordas, divisores |
| `accent-green` | `#72d296` | CTA principal, estados ativos |
| `accent-green-dim` | `#4a9b6f` | Hover em elementos verdes |
| `text-primary` | `#ffffff` | Texto principal |
| `text-secondary` | `#9ca3af` | Labels secundários |
| `text-muted` | `#4b5563` | Placeholder, desabilitado |
| `status-won` | `#72d296` | Negócio ganho |
| `status-lost` | `#ef4444` | Negócio perdido |
| `status-open` | `#3b82f6` | Negócio em aberto |

Referência de design: **Linear** (clean, foco em produtividade) + **Pipedrive** (UX de pipeline).

### Convenções de componentes

- `cn()` (clsx + tailwind-merge) para merging condicional de classes
- `CVA` (class-variance-authority) para variantes de componentes
- Componentes `ui/` são puros (sem lógica de negócio)
- Páginas em `pages/` podem usar hooks e lógica de negócio

---

## Arquitetura Multi-tenant

Cada usuário pertence a exatamente um tenant (workspace). O isolamento é aplicado na **camada de serviço**:

1. Middleware `tenantScope` extrai `tenant_id` do JWT e define `req.tenantId`
2. Toda função de serviço recebe `tenantId` como **primeiro argumento**
3. Toda query Knex em tabela com escopo de tenant **deve** incluir `.where({ tenant_id: tenantId })`

```typescript
// CORRETO
async function getDeals(tenantId: string, filters: DealFilters) {
  return db('deals').where({ tenant_id: tenantId, ...filters });
}

// ERRADO — nunca faça isso (vazamento de dados entre tenants)
async function getDeals(filters: DealFilters) {
  return db('deals').where(filters);
}
```

**Tabelas sem escopo de tenant:** `tenants`, `refresh_tokens`, `api_keys`

---

## Autenticação

### Fluxo JWT

- **Access token:** JWT, TTL 15 minutos, assinado com `JWT_SECRET`, payload `{ sub: userId, tenantId, role }`
- **Refresh token:** TTL 7 dias, armazenado **com hash SHA-256** em `refresh_tokens` (revogável no servidor)
- **Rotação:** cada chamada a `/auth/refresh` emite novo refresh token e revoga o anterior

### Silent refresh (frontend)

O interceptor em `src/services/api.ts` captura respostas `401` → chama `/auth/refresh` silenciosamente → reprocessa a requisição original automaticamente.

### OAuth Google

- Rotas: `GET /auth/google` (redirect) → `/auth/google/callback` (token)
- Novos usuários têm tenant criado automaticamente
- `password_hash` é nullable — usuários OAuth não têm senha local
- Frontend: `AuthCallbackPage` em `/auth/callback` lê `accessToken`, `refreshToken` e `isNew` da query string; redireciona para `/onboarding` se novo usuário

### Middleware de proteção

```typescript
requireAuth               // Verifica JWT, define req.user = { id, tenantId, role }
requireRole('admin')      // Verifica role mínima
requireTier('pro')        // Verifica plano do tenant (lê do DB, não do JWT)
```

---

## Tarefas Pendentes de Infraestrutura

| Tarefa | Descrição |
|--------|-----------|
| Google OAuth em produção | Configurar `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` com o domínio real nas credenciais do Google Cloud Console |
| Stripe webhook em produção | Registrar `https://seudominio.com.br/api/v1/billing/webhook` no painel Stripe após configurar o domínio |
| Número WhatsApp | Substituir `5511999999999` pelo número real em `LandingPage.tsx` e `AppShell.tsx` |
| CD workflow | Corrigir build context de `./packages/*` para `.` nas GitHub Actions |
