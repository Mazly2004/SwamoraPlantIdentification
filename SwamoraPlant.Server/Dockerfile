FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json drizzle.config.ts ./
COPY src/ ./src/

RUN npx tsc

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
# Install all deps (including drizzle-kit) so the entrypoint can run db:push
RUN npm ci

COPY --from=builder /app/dist ./dist

# drizzle-kit needs the config and the raw schema file to introspect and push
COPY drizzle.config.ts ./
COPY src/db/schema.ts ./src/db/schema.ts

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production

# Entrypoint: push schema → seed default account → start server
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
