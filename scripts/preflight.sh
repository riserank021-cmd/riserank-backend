#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# RiseRank — Pre-flight checklist
# Run this before first deploy to validate your .env is complete
# Usage: bash scripts/preflight.sh
# ─────────────────────────────────────────────────────────────────────────────

PASS=0
FAIL=0

check() {
  local KEY=$1
  local VAL
  VAL=$(grep -E "^${KEY}=" .env 2>/dev/null | cut -d= -f2-)
  if [ -z "$VAL" ] || [ "$VAL" = "your_value_here" ] || [[ "$VAL" == *"CHANGE_ME"* ]]; then
    echo "  ❌  $KEY — NOT SET"
    FAIL=$((FAIL+1))
  else
    echo "  ✅  $KEY"
    PASS=$((PASS+1))
  fi
}

echo ""
echo "🔍  RiseRank Pre-flight Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f ".env" ]; then
  echo "  ❌  .env file not found! Copy .env.example to .env first."
  exit 1
fi

echo ""
echo "── Core (required) ──────────────────"
check MONGO_URI
check JWT_SECRET
check JWT_REFRESH_SECRET
check NODE_ENV

echo ""
echo "── Email (required for OTP & welcome) ──"
check SMTP_HOST
check SMTP_USER
check SMTP_PASS

echo ""
echo "── AWS S3 (required for avatars & images) ──"
check AWS_ACCESS_KEY_ID
check AWS_SECRET_ACCESS_KEY
check AWS_S3_BUCKET
check AWS_REGION
check AWS_S3_BASE_URL

echo ""
echo "── Firebase FCM (required for push notifications) ──"
check FIREBASE_SERVER_KEY

echo ""
echo "── App version gate ──────────────────"
check MINIMUM_APP_VERSION
check LATEST_APP_VERSION

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  $PASS checks passed"
if [ $FAIL -gt 0 ]; then
  echo "  ❌  $FAIL checks FAILED — fill these in .env before deploying"
  echo ""
  exit 1
else
  echo ""
  echo "🎉  All checks passed! Ready to deploy."
  echo ""
fi
