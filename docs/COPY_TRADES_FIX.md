# Copy Trades Unique Constraint Fix

## Problem

Users were unable to re-copy a trader after stopping, receiving this error:
```
duplicate key value violates unique constraint "copy_trades_user_id_trader_id_key"
```

## Root Cause

The `copy_trades` table had a `UNIQUE(user_id, trader_id)` constraint that prevented any duplicate entries, regardless of status. This meant once a user stopped copying a trader, they could never copy them again.

## Solution

Replaced the table-level unique constraint with a **partial unique index** that only applies when `status = 'active'`.

This allows:
- ✅ Only one active copy per trader per user
- ✅ Multiple stopped/paused copies in history
- ✅ Users can re-copy traders after stopping

## Migration

**File:** `supabase/migrations/023_fix_copy_trades_unique_constraint.sql`

```sql
-- Drop the old unique constraint
ALTER TABLE public.copy_trades DROP CONSTRAINT IF EXISTS copy_trades_user_id_trader_id_key;

-- Create a partial unique index that only applies to active copies
CREATE UNIQUE INDEX copy_trades_user_trader_active_unique 
ON public.copy_trades (user_id, trader_id) 
WHERE status = 'active';
```

## How to Apply

### Option 1: Using Supabase CLI
```bash
supabase db push
```

### Option 2: Using the script
```bash
export SUPABASE_DB_URL="your-connection-string"
./scripts/fix-copy-trades-constraint.sh
```

### Option 3: Manual (Supabase Dashboard)
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the migration SQL
3. Run the query

## Verification

After applying, test:
1. Start copying a trader
2. Stop copying that trader
3. Try copying the same trader again → Should work! ✅

## Code Changes

No code changes needed! The `startCopyTrading` action already checks for active copies only:

```typescript
const { data: existing } = await supabase
  .from("copy_trades")
  .select("id")
  .eq("user_id", user.id)
  .eq("trader_id", data.traderId)
  .eq("status", "active")  // ✅ Already correct
  .single();
```

## Impact

- **Breaking:** None
- **Data Loss:** None
- **Backward Compatible:** Yes
- **Requires Restart:** No
