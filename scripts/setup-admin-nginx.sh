#!/bin/bash
# Run ONCE on EC2 to deploy the admin panel at riserank.in/admin
# Usage:
#   cd /var/www/riserank-backend && bash scripts/setup-admin-nginx.sh
#
# The script will clone riserank-admin. Make sure git credentials are configured
# on EC2 before running (they usually are via the existing riserank-backend clone).

set -e

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
  echo "   (enter credentials if prompted)"
  cd /var/www
  git clone https://github.com/riserank021-cmd/riserank-admin.git
fi

echo "✓ Admin repo ready at $ADMIN_DIR"

# 2. Add /admin location to nginx config if not already present
if grep -q "location /admin" "$NGINX_CONF" 2>/dev/null; then
  echo "✓ Nginx /admin block already exists — skipping"
else
  echo "→ Adding /admin location to nginx..."
  # Insert admin block before the last closing brace of the server block
  sudo sed -i '/^}$/i\
\
    # Admin Panel\
    location \/admin {\
        alias \/var\/www\/riserank-admin\/dist;\
        index index.html;\
        try_files $uri $uri\/ \/admin\/index.html;\
    }' "$NGINX_CONF"
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
