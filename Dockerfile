FROM node:22-slim AS base
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy build-time values so `next build` can statically analyze routes;
# real secrets are provided at runtime via `docker run -e ...` / compose.
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Default to a local SQLite file; override with a Postgres/MySQL URL (and a
# matching `provider` in prisma/schema.prisma) for real production use.
ENV DATABASE_URL="file:./dev.db"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app ./
RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

# The SQLite file lives in /app/prisma — mount a volume there to persist
# data across container restarts/redeploys.
VOLUME ["/app/prisma"]

# `prisma db push` keeps the SQLite schema in sync on boot; harmless/fast
# once the schema already matches. Swap for `prisma migrate deploy` if you
# adopt versioned migrations.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run start"]
