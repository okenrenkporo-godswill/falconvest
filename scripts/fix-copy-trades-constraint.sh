#!/bin/bash

# Apply the fix for copy_trades unique constraint
# This allows users to re-copy traders after stopping

echo "Applying migration: 023_fix_copy_trades_unique_constraint.sql"

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: SUPABASE_DB_URL environment variable is not set"
  echo "Please set it to your Supabase database connection string"
  exit 1
fi

# Apply migration
psql "$SUPABASE_DB_URL" -f supabase/migrations/023_fix_copy_trades_unique_constraint.sql

if [ $? -eq 0 ]; then
  echo "✅ Migration applied successfully!"
  echo "Users can now re-copy traders after stopping."
else
  echo "❌ Migration failed. Check the error above."
  exit 1
fi
