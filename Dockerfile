# ─────────────────────────────────────────────────────────────
# Dockerfile
# Multi-stage build for lean production image.
# Used in CI/CD and local Docker development.
# NOT used directly on EC2 (PM2 runs Node directly there).
# ─────────────────────────────────────────────────────────────

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp

# Copy deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodeapp:nodejs . .

# Create logs dir with correct permissions
RUN mkdir -p logs && chown -R nodeapp:nodejs logs

USER nodeapp

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
