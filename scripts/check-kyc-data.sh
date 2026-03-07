#!/bin/bash

# Quick check of KYC data in database
# Run this to see what's actually in your database

echo "=== Checking KYC Submissions ==="
echo ""

# You need to set your database URL
# export DATABASE_URL="your-supabase-connection-string"

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  echo "Please run: export DATABASE_URL='your-connection-string'"
  exit 1
fi

echo "1. Total KYC submissions:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as total FROM kyc_submissions;"

echo ""
echo "2. Status breakdown:"
psql "$DATABASE_URL" -c "SELECT status, COUNT(*) as count FROM kyc_submissions GROUP BY status ORDER BY count DESC;"

echo ""
echo "3. Recent submissions with emails:"
psql "$DATABASE_URL" -c "SELECT ks.id, p.email, ks.status, ks.created_at FROM kyc_submissions ks LEFT JOIN profiles p ON p.id = ks.user_id ORDER BY ks.created_at DESC LIMIT 10;"

echo ""
echo "=== Check complete ==="
