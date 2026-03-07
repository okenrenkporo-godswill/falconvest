# Debugging KYC Pending Page - Step by Step

## Issue
Seeing 12 total submissions, 2 rejected, 0 pending - but this doesn't match actual database.

## What I Changed

### 1. Server Action (`src/actions/admin.ts`)
- Added query to fetch ALL submissions for stats (not just current page)
- Added detailed console logging
- Returns stats object with accurate counts

### 2. Component (`src/components/admin/kyc-pending-content.tsx`)
- Now uses stats from server instead of calculating from current page
- Added console logging to trace data flow

## How to Debug

### Step 1: Check Browser Console
1. Open `/cpanel/kyc-pending`
2. Open browser DevTools (F12)
3. Look for these console logs:

```
ALL KYC Submissions query: { count: X, error: null, statuses: [...] }
Calculated stats: { total: X, pending: Y, approved: Z, rejected: W }
getPendingKycSubmissions result: { ... }
Loading KYC submissions for page: 1
Received result: { dataCount: X, totalPages: Y, stats: {...} }
```

**What to check:**
- Does `ALL KYC Submissions query` show the correct count?
- Does `statuses` array show all the actual statuses?
- Do the `Calculated stats` match what you expect?

### Step 2: Check Database Directly

**Option A: Using Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Run:
```sql
SELECT status, COUNT(*) as count 
FROM kyc_submissions 
GROUP BY status;
```

**Option B: Using psql**
```bash
export DATABASE_URL="your-connection-string"
./scripts/check-kyc-data.sh
```

**Option C: Manual query**
```bash
psql $DATABASE_URL -c "SELECT status, COUNT(*) FROM kyc_submissions GROUP BY status;"
```

### Step 3: Check What's Being Returned

Add this to your browser console while on the page:
```javascript
// Check what the component received
console.log("Current stats:", stats);
console.log("Current submissions:", submissions);
```

## Possible Issues

### Issue 1: RLS (Row Level Security) Blocking Query
**Symptom:** Query returns fewer rows than expected
**Check:** Are you logged in as admin?
```sql
SELECT role FROM profiles WHERE id = auth.uid();
```
**Should return:** `admin`

### Issue 2: Old Data in Browser Cache
**Solution:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 3: Server Action Not Updated
**Solution:** Restart dev server
```bash
# Stop server (Ctrl+C)
npm run dev
# or
pnpm dev
```

### Issue 4: Database Has Different Data Than Expected
**Check:** Run diagnostic script
```bash
psql $DATABASE_URL < scripts/diagnose-kyc-data.sql
```

## Expected Behavior

### What Should Happen:
1. Server fetches ALL kyc_submissions (no filters)
2. Counts statuses: pending, manually_verified, auto_verified, rejected
3. Returns accurate stats to component
4. Component displays stats in cards
5. Component displays paginated submissions in table

### Example Output:
```
ALL KYC Submissions query: {
  count: 25,
  error: null,
  statuses: ['pending', 'pending', 'manually_verified', 'rejected', ...]
}

Calculated stats: {
  total: 25,
  pending: 15,
  approved: 8,
  rejected: 2
}
```

## Quick Fixes

### Fix 1: Clear Everything and Restart
```bash
# Stop server
# Clear browser cache
# Restart server
pnpm dev
# Hard refresh page (Cmd+Shift+R)
```

### Fix 2: Check Admin Client
The query uses `createAdminClient()` which bypasses RLS. Make sure this is working:
```typescript
// In src/actions/admin.ts
const adminClient = createAdminClient();
const { data } = await adminClient.from("kyc_submissions").select("*");
console.log("Admin query returned:", data?.length, "rows");
```

### Fix 3: Verify Migration Applied
```sql
-- Check if new columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'kyc_submissions';
```

## What to Report Back

Please check and report:
1. **Browser console logs** - What do you see?
2. **Database query result** - Run the SQL query above
3. **Admin role** - Are you logged in as admin?
4. **Server logs** - Any errors in terminal?

This will help identify exactly where the issue is!
