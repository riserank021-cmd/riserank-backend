#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# bootstrap-ec2.sh
#
# One-time setup script for a fresh Ubuntu 22.04 EC2 instance.
# Run as: bash bootstrap-ec2.sh
#
# What it does:
#   1. Updates OS packages
#   2. Installs Node.js 18 LTS
#   3. Installs PM2, git
#   4. Installs Nginx + Certbot
#   5. Creates app directory + clones repo
#   6. Copies Nginx config + enables it
#   7. Sets up PM2 startup on reboot
# ─────────────────────────────────────────────────────────────

set -e  # exit on any error

echo ""
echo "======================================================"
echo "  RiseRank EC2 Bootstrap — Ubuntu 22.04"
echo "======================================================"
echo ""

# ── 1. Update OS ─────────────────────────────────────────────
echo ">>> [1/7] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw

# ── 2. Install Node.js 18 LTS ────────────────────────────────
echo ">>> [2/7] Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Node: $(node --version)  NPM: $(npm --version)"

# ── 3. Install PM2 globally ───────────────────────────────────
echo ">>> [3/7] Installing PM2..."
sudo npm install -g pm2
pm2 --version

# ── 4. Install Nginx + Certbot ────────────────────────────────
echo ">>> [4/7] Installing Nginx and Certbot..."
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# ── 5. Create app directory + clone repo ──────────────────────
echo ">>> [5/7] Setting up app directory..."
sudo mkdir -p /var/www/riserank-backend
sudo chown -R ubuntu:ubuntu /var/www/riserank-backend

# Replace with your actual GitHub repo URL
REPO_URL="https://github.com/YOUR_GITHUB_USERNAME/riserank-backend.git"

if [ -d "/var/www/riserank-backend/.git" ]; then
  echo "Repo already cloned, pulling latest..."
  cd /var/www/riserank-backend
  git fetch origin main
  git reset --hard origin/main
else
  echo "Cloning repo..."
  git clone "$REPO_URL" /var/www/riserank-backend
fi

cd /var/www/riserank-backend
npm ci --only=production
mkdir -p logs

# ── 6. Configure Nginx ────────────────────────────────────────
echo ">>> [6/7] Configuring Nginx..."
sudo cp /var/www/riserank-backend/nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t  # test config before applying
sudo systemctl reload nginx

echo ""
echo "  ┌──────────────────────────────────────────────────┐"
echo "  │  MANUAL STEP REQUIRED: SSL Certificate           │"
echo "  │                                                  │"
echo "  │  Make sure your domain's A record points to      │"
echo "  │  this server's public IP, then run:              │"
echo "  │                                                  │"
echo "  │  sudo certbot --nginx -d api.riserank.in         │"
echo "  │                                                  │"
echo "  │  Certbot will auto-renew every 90 days.          │"
echo "  └──────────────────────────────────────────────────┘"
echo ""

# ── 7. Set up PM2 startup on reboot ──────────────────────────
echo ">>> [7/7] Configuring PM2 startup..."
pm2 startup | tail -1 | bash 2>/dev/null || true
# PM2 will be saved after first deployment

# ── Firewall ─────────────────────────────────────────────────
echo ">>> Configuring UFW firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
sudo ufw status

echo ""
echo "======================================================"
echo "  Bootstrap complete!"
echo ""
echo "  Next steps:"
echo "  1. Create .env file:  nano /var/www/riserank-backend/.env"
echo "  2. Get SSL cert:      sudo certbot --nginx -d api.riserank.in"
echo "  3. Start app:         cd /var/www/riserank-backend"
echo "                        pm2 start ecosystem.config.js --env production"
echo "                        pm2 save"
echo "  4. Add GitHub secrets (see DEPLOY.md)"
echo "  5. Push to main → auto-deploys via GitHub Actions"
echo "======================================================"
