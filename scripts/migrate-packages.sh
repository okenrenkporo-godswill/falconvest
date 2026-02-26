#!/bin/bash

# Investment Packages Migration Script
# This script creates the investment_packages table and seeds it with the existing 4 packages

echo "🚀 Running Investment Packages Migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Run the migration
echo "📦 Creating investment_packages table..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "   - Created 'investment_packages' table"
    echo "   - Seeded with 4 packages (Bronze, Silver, Gold, Premium)"
    echo "   - Enabled Row Level Security (RLS)"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Visit /cpanel/packages to manage packages"
    echo "   2. The deposit page now uses dynamic packages"
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi
