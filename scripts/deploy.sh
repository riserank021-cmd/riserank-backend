#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# RiseRank Backend — One-command deploy script
# Usage: bash scripts/deploy.sh
# Run this on the EC2 server AFTER the first-time manual setup (see DEPLOY.md)
# ─────────────────────────────────────────────────────────────────────────────
set -e

APP_DIR="/var/www/riserank-backend"
BRANCH="main"

echo ""
echo "🚀  RiseRank Deploy — $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$APP_DIR"

echo "📥  Pulling latest from $BRANCH..."
git pull origin "$BRANCH"

echo "📦  Installing production dependencies..."
npm ci --only=production

echo "🔄  Reloading with PM2..."
pm2 reload ecosystem.config.js --env production

echo "🧪  Health check..."
sleep 2
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/v1/health || echo "000")
if [ "$STATUS" = "200" ]; then
  echo "✅  Health check passed (HTTP $STATUS)"
else
  echo "⚠️   Health check returned HTTP $STATUS — check logs with: pm2 logs riserank"
fi

echo ""
echo "✅  Deploy complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status
