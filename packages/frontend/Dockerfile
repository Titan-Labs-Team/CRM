# ---- build stage ----
# Context must be repo root (docker-compose.prod.yml sets context: .)
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}
COPY package*.json ./
COPY packages/frontend/package.json ./packages/frontend/
RUN npm ci --workspace=packages/frontend --ignore-scripts
COPY packages/frontend ./packages/frontend
RUN npm run build --workspace=packages/frontend

# ---- serve stage ----
FROM nginx:alpine AS runtime
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
