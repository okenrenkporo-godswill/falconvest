# KYC Schema Migration - Data Safety Verification

## ✅ SAFE MIGRATION - No Data Loss

### What Changed in 025_fix_kyc_submissions_schema.sql

**BEFORE (Dangerous - REMOVED):**
```sql
-- ❌ This would DELETE existing data
DROP COLUMN IF EXISTS document_type,
DROP COLUMN IF EXISTS file_path,
DROP COLUMN IF EXISTS uploaded_at;
```

**AFTER (Safe - KEEPS existing data):**
```sql
-- ✅ Only ADDS new columns, preserves old ones
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS document_front_url TEXT,
ADD COLUMN IF NOT EXISTS document_back_url TEXT;

-- ✅ Makes old columns nullable (doesn't delete them)
ALTER COLUMN document_type DROP NOT NULL,
ALTER COLUMN file_path DROP NOT NULL;
```

---

## Current KYC Implementation

### User Flow (Dashboard → Account → KYC Modal)

**File:** `src/components/account/kyc-modal.tsx`

**User submits:**
- Full Name
- ID Number
- Front ID image
- Back ID image

**Action:** `submitKycAction()` in `src/actions/kyc.ts`

**Inserts into database:**
```typescript
{
  user_id: user.id,
  full_name: fullName,        // ← NEW column
  id_number: idNumber,        // ← NEW column
  document_front_url: frontUrl, // ← NEW column
  document_back_url: backUrl,   // ← NEW column
  status: "pending"
}
```

---

## Database Schema Compatibility

### Original Schema (001_initial_schema.sql)
```sql
CREATE TABLE public.kyc_submissions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,    -- OLD column
  file_path TEXT NOT NULL,        -- OLD column
  status kyc_status NOT NULL,
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL, -- OLD column
  reviewed_at TIMESTAMPTZ
);
```

### After Migration (BOTH old and new columns exist)
```sql
CREATE TABLE public.kyc_submissions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- OLD columns (preserved for existing approved KYCs)
  document_type TEXT,             -- Now nullable
  file_path TEXT,                 -- Now nullable
  uploaded_at TIMESTAMPTZ,
  
  -- NEW columns (used by current implementation)
  full_name TEXT,
  id_number TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ,
  
  -- Common columns
  status kyc_status NOT NULL,
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ
);
```

---

## Data Preservation

### Existing Approved KYCs
```sql
-- Example of existing data (PRESERVED)
{
  id: "abc-123",
  user_id: "user-456",
  document_type: "passport",      -- ✅ Still exists
  file_path: "user-456/doc.jpg",  -- ✅ Still exists
  uploaded_at: "2026-01-15",      -- ✅ Still exists
  status: "manually_verified",
  full_name: NULL,                -- New column, NULL for old data
  id_number: NULL,                -- New column, NULL for old data
  document_front_url: NULL,       -- New column, NULL for old data
  document_back_url: NULL         -- New column, NULL for old data
}
```

### New KYC Submissions
```sql
-- Example of new submission
{
  id: "xyz-789",
  user_id: "user-999",
  document_type: NULL,            -- Old column, NULL for new data
  file_path: NULL,                -- Old column, NULL for new data
  uploaded_at: NULL,              -- Old column, NULL for new data
  status: "pending",
  full_name: "John Doe",          -- ✅ New data
  id_number: "AB123456",          -- ✅ New data
  document_front_url: "https://...", -- ✅ New data
  document_back_url: "https://...",  -- ✅ New data
  created_at: "2026-03-07"
}
```

---

## Admin Query Compatibility

### getPendingKycSubmissions()

**Query:** Fetches ALL columns
```typescript
const { data: submissions } = await adminClient
  .from("kyc_submissions")
  .select("*")  // ← Gets both old and new columns
```

**Result:** Works for both old and new data
- Old KYC: Shows `document_type`, `file_path`
- New KYC: Shows `full_name`, `id_number`, `document_front_url`, `document_back_url`

**Admin UI:** Should check which columns have data
```typescript
// Display logic
const displayName = submission.full_name || "Legacy submission";
const frontDoc = submission.document_front_url || submission.file_path;
```

---

## Verification Steps

### 1. Check Existing Data (Before Migration)
```sql
-- Count existing KYC submissions
SELECT COUNT(*) FROM kyc_submissions;

-- Check what columns have data
SELECT 
  COUNT(*) as total,
  COUNT(document_type) as has_document_type,
  COUNT(file_path) as has_file_path,
  COUNT(full_name) as has_full_name,
  COUNT(document_front_url) as has_document_front_url
FROM kyc_submissions;
```

### 2. Apply Migration
```bash
supabase db push
```

### 3. Verify Data Preserved (After Migration)
```sql
-- Check all data still exists
SELECT COUNT(*) FROM kyc_submissions;
-- Should be SAME as before

-- Check old columns still have data
SELECT id, user_id, document_type, file_path, status
FROM kyc_submissions
WHERE document_type IS NOT NULL;
-- Should show existing approved KYCs

-- Check new columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'kyc_submissions'
AND column_name IN ('full_name', 'id_number', 'document_front_url', 'document_back_url');
-- Should show 4 rows
```

### 4. Test New Submission
```bash
# 1. User submits KYC via dashboard/account
# 2. Check database:
SELECT * FROM kyc_submissions ORDER BY created_at DESC LIMIT 1;
# Should show new columns populated
```

### 5. Test Admin View
```bash
# 1. Admin opens /cpanel/kyc-pending
# 2. Should see ALL submissions (old and new)
# 3. Can approve/reject both types
```

---

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

```sql
-- Remove new columns (keeps old data intact)
ALTER TABLE public.kyc_submissions 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS id_number,
DROP COLUMN IF EXISTS document_front_url,
DROP COLUMN IF EXISTS document_back_url,
DROP COLUMN IF EXISTS admin_notes;

-- Restore NOT NULL constraints
ALTER TABLE public.kyc_submissions 
ALTER COLUMN document_type SET NOT NULL,
ALTER COLUMN file_path SET NOT NULL;
```

**Note:** This only works if no new KYC submissions were made after migration.

---

## Summary

✅ **Safe:** No data deletion
✅ **Backward Compatible:** Old approved KYCs preserved
✅ **Forward Compatible:** New submissions use new columns
✅ **Admin Compatible:** Query works for both old and new data
✅ **Rollback Available:** Can revert if needed

**Recommendation:** Apply migration with confidence. All existing approved KYCs will remain intact.

---

## Final Checklist

Before applying migration:
- [ ] Backup database (optional but recommended)
- [ ] Count existing KYC submissions
- [ ] Note which users have approved KYCs

After applying migration:
- [ ] Verify same count of submissions
- [ ] Check old data still visible
- [ ] Test new KYC submission
- [ ] Test admin approval flow
- [ ] Verify approved users still show as verified

---

**Status:** ✅ Migration is SAFE to apply
