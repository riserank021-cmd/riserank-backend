#!/bin/bash
# Run ONCE on EC2 to deploy the admin panel at riserank.in/admin
# Usage: bash /var/www/riserank-backend/scripts/setup-admin-nginx.sh

set -e

# Provide token via: export GH_TOKEN=ghp_... before running, or set it below once
GH_TOKEN="${GH_TOKEN:-}"
ADMIN_REPO="https://riserank021-cmd:${GH_TOKEN}@github.com/riserank021-cmd/riserank-admin.git"
ADMIN_DIR="/var/www/riserank-admin"
NGINX_CONF="/etc/nginx/sites-available/riserank"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RiseRank Admin Panel — EC2 Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Clone or pull admin repo
if [ -d "$ADMIN_DIR/.git" ]; then
  echo "→ Pulling latest admin panel..."
  cd "$ADMIN_DIR" && git pull
else
  echo "→ Cloning admin panel repo..."
  cd /var/www && git clone "$ADMIN_REPO" riserank-admin
fi

echo "✓ Admin repo ready at $ADMIN_DIR"

# 2. Add /admin location to nginx config if not already present
if grep -q "location /admin" "$NGINX_CONF" 2>/dev/null; then
  echo "✓ Nginx /admin block already exists — skipping"
else
  echo "→ Adding /admin location to nginx..."
  # Find the closing brace of the server block and insert before it
  # We'll add it before the last closing brace in the config
  sudo bash -c "cat >> $NGINX_CONF" << 'NGINX_BLOCK'

    # Admin Panel
    location /admin {
        alias /var/www/riserank-admin/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }
NGINX_BLOCK
  echo "✓ Nginx block added"
fi

# 3. Test and reload nginx
echo "→ Testing nginx config..."
sudo nginx -t

echo "→ Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  Admin panel deployed!"
echo "  URL: https://riserank.in/admin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
