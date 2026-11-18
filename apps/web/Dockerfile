# syntax=docker/dockerfile:1

# ============================================================
# Nara Charm 后端 API — Next.js standalone 多阶段构建
# 监听 37001 (Caddy 反代)
#
# 构建:  BUILD_TARGET=backend (或不设) → output: 'standalone'
# 注意:  `output: export` (静态前端) 不要在这里构建
# ============================================================

# ─── Stage 1: 依赖安装 ─────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# pnpm
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json

RUN pnpm install --frozen-lockfile --filter web...

FROM deps AS migrator
COPY apps/web/drizzle ./apps/web/drizzle
COPY apps/web/scripts/migrate-release.mjs ./apps/web/scripts/migrate-release.mjs
WORKDIR /app/apps/web
CMD ["node", "scripts/migrate-release.mjs"]

# ─── Stage 2: 构建 ──────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# pnpm
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web ./apps/web
COPY packages/db ./packages/db

# 构建 standalone (BUILD_TARGET 不设为 static)
ENV BUILD_TARGET=backend
RUN pnpm --filter web exec next build --webpack

# ─── Stage 3: 运行 ──────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=37001
ENV HOSTNAME=0.0.0.0

# 拷贝 standalone 产物 (含 server.js + 静态资源 + 最小 node_modules)
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# standalone 结构: server.js 在 standalone 根, 需在 apps/web 下找 static
# 所以运行目录调整:
WORKDIR /app/apps/web

EXPOSE 37001

CMD ["node", "server.js"]
