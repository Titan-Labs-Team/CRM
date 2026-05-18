# ---- deps stage ----
# Context must be repo root (docker-compose.prod.yml sets context: .)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package.json ./packages/backend/
RUN npm ci --workspace=packages/backend --ignore-scripts

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY packages/backend ./packages/backend

WORKDIR /app/packages/backend

EXPOSE 3001
CMD ["node", "--import", "tsx/esm", "src/server.ts"]
