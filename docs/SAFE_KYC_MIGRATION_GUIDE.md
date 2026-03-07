# Safe KYC Migration - Step by Step

## ⚠️ IMPORTANT: This migration is SAFE and will NOT delete any data

### What This Migration Does

✅ **ADDS** new columns: `full_name`, `id_number`, `document_front_url`, `document_back_url`
✅ **KEEPS** old columns: `document_type`, `file_path`, `uploaded_at`
✅ **PRESERVES** all existing approved KYCs
✅ **ALLOWS** new KYC submissions to use new format

---

## Step-by-Step Migration

### Step 1: Verify Current Data (Optional but Recommended)

```bash
# Connect to your database
psql $DATABASE_URL

# Run pre-migration check
\i scripts/verify-kyc-before-migration.sql

# Save the output!
```

**What to note:**
- Total number of KYC submissions
- Number of approved KYCs
- List of users with approved KYC

---

### Step 2: Apply Migration

**Option A: Using Supabase CLI (Recommended)**
```bash
supabase db push
```

**Option B: Manual (Supabase Dashboard)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/025_fix_kyc_submissions_schema.sql`
3. Paste and run

**The migration will:**
```sql
-- Add new columns (safe)
ADD COLUMN IF NOT EXISTS full_name TEXT
ADD COLUMN IF NOT EXISTS id_number TEXT
ADD COLUMN IF NOT EXISTS document_front_url TEXT
ADD COLUMN IF NOT EXISTS document_back_url TEXT

-- Make old columns nullable (safe - keeps data)
ALTER COLUMN document_type DROP NOT NULL
ALTER COLUMN file_path DROP NOT NULL
```

---

### Step 3: Verify Migration Success

```bash
# Run post-migration check
psql $DATABASE_URL
\i scripts/verify-kyc-after-migration.sql
```

**Compare with Step 1 output:**
- ✅ Total submissions should be SAME
- ✅ Approved KYCs should be SAME
- ✅ Old data should still be visible
- ✅ New columns should exist

---

### Step 4: Test New KYC Submission

1. Log in as a regular user
2. Go to Dashboard → Account
3. Click "Verify Identity"
4. Submit KYC with:
   - Full Name
   - ID Number
   - Front ID image
   - Back ID image
5. Check database:
```sql
SELECT * FROM kyc_submissions ORDER BY created_at DESC LIMIT 1;
```
6. Should see new columns populated

---

### Step 5: Test Admin View

1. Log in as admin
2. Go to `/cpanel/kyc-pending`
3. Should see ALL submissions (old and new)
4. Try approving a new submission
5. Verify it works

---

## Quick Verification Commands

### Check if migration applied
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'kyc_submissions'
AND column_name IN ('full_name', 'id_number', 'document_front_url', 'document_back_url');
```
**Expected:** 4 rows

### Check old data preserved
```sql
SELECT COUNT(*) 
FROM kyc_submissions 
WHERE document_type IS NOT NULL;
```
**Expected:** Same count as before migration

### Check new submissions work
```sql
SELECT COUNT(*) 
FROM kyc_submissions 
WHERE full_name IS NOT NULL;
```
**Expected:** Count of new submissions after migration

---

## Rollback (If Needed)

**Only if something goes wrong:**

```sql
-- Remove new columns
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

**⚠️ Warning:** Only rollback if NO new KYC submissions were made after migration.

---

## FAQ

**Q: Will this delete my approved KYCs?**
A: No! Old data is preserved. We only ADD new columns.

**Q: What happens to existing approved users?**
A: Nothing changes. Their KYC status remains "manually_verified" or "auto_verified".

**Q: Can I still see old KYC submissions in admin panel?**
A: Yes! The query fetches ALL submissions regardless of which columns have data.

**Q: What if a user already has approved KYC and submits again?**
A: The system will create a new submission with new columns. Old submission remains in database.

**Q: Do I need to update any code?**
A: No! The code already uses the new column names. This migration just adds them to the database.

---

## Success Criteria

Migration is successful when:
- ✅ All existing KYC submissions still exist
- ✅ All approved users still show as verified
- ✅ New KYC submissions work
- ✅ Admin can see all submissions
- ✅ Admin can approve/reject submissions
- ✅ No errors in console

---

## Timeline

- **Step 1 (Verify):** 2 minutes
- **Step 2 (Migrate):** 10 seconds
- **Step 3 (Verify):** 2 minutes
- **Step 4 (Test):** 5 minutes
- **Step 5 (Test):** 2 minutes

**Total:** ~12 minutes

---

**Ready to proceed?** Start with Step 1! 🚀
