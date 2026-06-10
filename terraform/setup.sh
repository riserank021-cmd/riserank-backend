#!/bin/bash
# RiseRank — Terraform Setup Script
# Run this once from inside the terraform/ directory:
#   cd ~/Desktop/RiseRank/riserank-backend/terraform
#   bash setup.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "══════════════════════════════════════════════"
echo "   RiseRank — AWS Infrastructure Setup"
echo "══════════════════════════════════════════════"
echo ""

# ── 1. Check prerequisites ─────────────────────────────────────────────────────
echo "▶ Checking prerequisites..."

if ! command -v terraform &>/dev/null; then
  echo -e "${RED}✗ Terraform not found.${NC}"
  echo "  Install it with: brew tap hashicorp/tap && brew install hashicorp/tap/terraform"
  exit 1
fi
echo -e "${GREEN}✓ Terraform $(terraform version -json | python3 -c 'import sys,json; print(json.load(sys.stdin)["terraform_version"])')${NC}"

if ! command -v aws &>/dev/null; then
  echo -e "${RED}✗ AWS CLI not found.${NC}"
  echo "  Install it with: brew install awscli"
  exit 1
fi
echo -e "${GREEN}✓ AWS CLI $(aws --version 2>&1 | awk '{print $1}')${NC}"

# Check AWS credentials are configured
if ! aws sts get-caller-identity &>/dev/null; then
  echo -e "${RED}✗ AWS credentials not configured.${NC}"
  echo "  Run: aws configure"
  echo "  You'll need your AWS Access Key ID and Secret Access Key."
  exit 1
fi
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS credentials valid (account: $AWS_ACCOUNT)${NC}"

echo ""

# ── 2. Generate SSH key pair ───────────────────────────────────────────────────
echo "▶ Setting up SSH key pair..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f "riserank" ] && [ -f "riserank.pub" ]; then
  echo -e "${GREEN}✓ SSH key pair already exists (riserank / riserank.pub)${NC}"
else
  ssh-keygen -t rsa -b 4096 -f riserank -N "" -C "riserank-ec2"
  echo -e "${GREEN}✓ SSH key pair generated${NC}"
fi

# Keep the private key safe
chmod 400 riserank
echo -e "${YELLOW}  ⚠ Keep 'riserank' (private key) safe — you need it to SSH into your server${NC}"
echo ""

# ── 3. Detect your current IP ─────────────────────────────────────────────────
echo "▶ Detecting your public IP for SSH access..."
MY_IP=$(curl -s --max-time 5 https://ifconfig.me || curl -s --max-time 5 https://api.ipify.org)
if [ -z "$MY_IP" ]; then
  echo -e "${RED}✗ Could not detect your IP. Check your internet connection.${NC}"
  exit 1
fi
SSH_CIDR="${MY_IP}/32"
echo -e "${GREEN}✓ Your IP: $MY_IP → SSH will be restricted to $SSH_CIDR${NC}"
echo ""

# ── 4. Terraform init ──────────────────────────────────────────────────────────
echo "▶ Running terraform init..."
terraform init
echo ""

# ── 5. Terraform plan ─────────────────────────────────────────────────────────
echo "▶ Running terraform plan..."
terraform plan -var="ssh_allowed_ip=${SSH_CIDR}"
echo ""

# ── 6. Confirm before applying ────────────────────────────────────────────────
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Review the plan above before continuing.${NC}"
echo -e "${YELLOW}  This will CREATE real AWS resources (~\$17/mo).${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"
echo ""
read -p "Apply and create the infrastructure? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted. Run this script again when ready."
  exit 0
fi

echo ""
echo "▶ Running terraform apply..."
terraform apply -var="ssh_allowed_ip=${SSH_CIDR}" -auto-approve

# ── 7. Print summary ──────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Infrastructure created successfully!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo ""
echo "Your outputs:"
terraform output
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Point your DNS:  api.riserank.in  →  $(terraform output -raw instance_public_ip)"
echo "  2. SSH into server: $(terraform output -raw ssh_command)"
echo "  3. Run the backend bootstrap script on the server"
echo ""
echo -e "${YELLOW}Save your private key somewhere safe:${NC}"
echo "  cp terraform/riserank ~/.ssh/riserank.pem"
echo "  chmod 400 ~/.ssh/riserank.pem"
