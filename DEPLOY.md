# RiseRank Backend — Deployment Guide

Complete step-by-step guide to deploy the backend on AWS EC2 with Nginx + SSL.

---

## Prerequisites checklist

Before starting, have these ready:

- [ ] EC2 instance created (Ubuntu 22.04, t3.small, port 22/80/443 open)
- [ ] `.pem` key file downloaded from AWS
- [ ] MongoDB Atlas cluster created, connection string copied
- [ ] Gmail app password generated
- [ ] AWS IAM user created with S3 access, access keys copied
- [ ] Firebase service account JSON downloaded
- [ ] Google OAuth Web Client ID copied
- [ ] Domain A record pointing to EC2 public IP (allow 5–15 min to propagate)

---

## Step 1 — SSH into your EC2 instance

```bash
# Replace with your actual .pem path and EC2 IP
chmod 400 ~/riserank.pem
ssh -i ~/riserank.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Step 2 — Run the bootstrap script (one-time only)

On the server:

```bash
# Download and run the bootstrap script
curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/riserank-backend/main/scripts/bootstrap-ec2.sh | bash
```

Or copy it manually:
```bash
bash /var/www/riserank-backend/scripts/bootstrap-ec2.sh
```

This installs: Node.js 18, PM2, Nginx, Certbot, UFW firewall, clones the repo.

---

## Step 3 — Create the .env file on the server

```bash
nano /var/www/riserank-backend/.env
```

Paste and fill in all values:

```env
NODE_ENV=production
PORT=5000

MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/riserank?retryWrites=true&w=majority

JWT_SECRET=generate_32_random_chars_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=different_32_random_chars_here
JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUNDS=12

ALLOWED_ORIGINS=https://riserank.in,https://www.riserank.in

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_16_char_app_password

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=riserank-assets
AWS_S3_BASE_URL=https://riserank-assets.s3.ap-south-1.amazonaws.com

# Firebase: paste the entire service account JSON as a single line
FIREBASE_SERVER_KEY={"type":"service_account","project_id":"..."}

GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com

SUPER_ADMIN_EMAIL=superadmin@riserank.in
SUPER_ADMIN_PASSWORD=StrongPassword@2024

LOG_LEVEL=info
LOG_DIR=logs

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

Secure the file:
```bash
chmod 600 /var/www/riserank-backend/.env
```

> **Generate random JWT secrets:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
> Run twice — use one for JWT_SECRET, one for JWT_REFRESH_SECRET.

---

## Step 4 — Get SSL certificate

Make sure your domain's A record already points to this server's IP:

```bash
sudo certbot --nginx -d api.riserank.in
```

Follow the prompts. Certbot will auto-renew every 90 days.

Test renewal works:
```bash
sudo certbot renew --dry-run
```

---

## Step 5 — Start the app

```bash
cd /var/www/riserank-backend

# Install production dependencies
npm ci --only=production

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save so it restarts on server reboot
pm2 save

# Check it's running
pm2 status
```

Test the API:
```bash
curl https://api.riserank.in/api/v1/health
# Should return: {"success":true,"message":"OK"}
```

---

## Step 6 — Seed the Super Admin

Run once only — creates your first admin account:

```bash
cd /var/www/riserank-backend
node scripts/seedSuperAdmin.js
```

Then log into the admin panel at `https://YOUR_ADMIN_PANEL_URL` with the email/password from `.env`.

---

## Step 7 — Add GitHub Secrets for auto-deploy

In your GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret name | Value |
|---|---|
| `EC2_HOST` | Your EC2 public IP (e.g. `13.xx.xx.xx`) |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Full contents of your `.pem` file |
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | Same as in `.env` |
| `JWT_REFRESH_SECRET` | Same as in `.env` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Your Gmail app password |
| `AWS_ACCESS_KEY_ID` | From IAM |
| `AWS_SECRET_ACCESS_KEY` | From IAM |
| `FIREBASE_SERVER_KEY` | Firebase service account JSON (one line) |
| `GOOGLE_CLIENT_ID` | Web Client ID from Google Cloud |
| `SUPER_ADMIN_EMAIL` | Your admin email |
| `SUPER_ADMIN_PASSWORD` | Your admin password |

After adding secrets, every push to `main` will automatically:
1. Run tests
2. SSH into EC2, write `.env`, pull code, reload PM2

---

## Useful commands on the server

```bash
# View live logs
pm2 logs riserank-backend

# Restart the app manually
pm2 restart riserank-backend

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Test Nginx config after editing
sudo nginx -t && sudo systemctl reload nginx

# Check SSL certificate expiry
sudo certbot certificates

# Monitor server resources
htop
```

---

## Architecture overview

```
Internet
   │
   ▼
Nginx (port 443 HTTPS / 80 → redirect)
   │  rate limiting, SSL termination, security headers
   ▼
Node.js / Express (port 5000, localhost only)
   │  managed by PM2 (auto-restart, log rotation)
   ▼
MongoDB Atlas (cloud, Mumbai region)
   │
   ├── AWS S3 (avatar uploads)
   ├── Firebase FCM (push notifications)
   └── Gmail SMTP (email OTPs)
```

---

## Estimated monthly cost at launch

| Service | Tier | Cost |
|---|---|---|
| EC2 t3.small | On-demand | ~$17/mo |
| MongoDB Atlas M0 | Free | $0 |
| AWS S3 | ~1 GB | ~$0.02 |
| Domain (riserank.in) | Annual | ~₹800/yr |
| SSL (Let's Encrypt) | Free | $0 |
| **Total** | | **~$17/mo** |

Upgrade MongoDB to M10 ($57/mo) when you hit ~5,000 users.
