# Quick Fix Guide - Admin & KYC Issues

## 🚀 Quick Start

### 1. Apply Database Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard SQL Editor:
# Run: 024_add_account_status.sql
# Run: 025_fix_kyc_submissions_schema.sql
```

### 2. Test Each Fix

---

## ✅ Fix #1: User Account Suspension

### What Changed
- Admins can now suspend/deactivate user accounts
- Suspended users are immediately logged out
- Cannot log back in until reactivated

### How to Use

**Suspend a User:**
1. Go to `/cpanel/users`
2. Find user in list
3. Click ⋮ (three dots) menu
4. Select "Suspend Account"
5. Enter reason (e.g., "Suspicious activity")
6. Confirm

**Reactivate a User:**
1. Go to `/cpanel/users`
2. Find suspended user (red "suspended" badge)
3. Click ⋮ menu
4. Select "Reactivate Account"
5. Confirm

### What Happens
```
Admin suspends user
    ↓
User tries to access any page
    ↓
Middleware detects suspension
    ↓
User auto-logged out
    ↓
Redirected to /login?error=account_suspended&reason=...
    ↓
Error message displayed
```

### Testing
```bash
# 1. Suspend a test user
# 2. Try logging in as that user → Should see error
# 3. If already logged in → Should be kicked out
# 4. Reactivate user
# 5. Try logging in again → Should work
```

---

## ✅ Fix #2: KYC Email Notifications

### What Changed
- Admin receives email when user submits KYC
- User receives confirmation email
- Email includes direct link to review page

### Email Flow
```
User uploads ID documents
    ↓
User gets: "Identity Verification Submitted"
    ↓
Admin gets: "[Admin Alert] New KYC Submission"
    ↓
Admin clicks link → Opens /cpanel/kyc-pending
```

### Email Content (Admin)
```
Subject: [Admin Alert] New KYC Submission

New KYC verification submitted:
Name: John Doe
Email: john@example.com
Time: 3/7/2026, 3:30 PM

[Review KYC Submissions] → Link to /cpanel/kyc-pending
```

### Testing
```bash
# 1. User submits KYC at /onboarding/kyc-advanced
# 2. Check user's email → Should receive confirmation
# 3. Check admin@FalconVest.live → Should receive alert
# 4. Click link in admin email → Opens KYC pending page
```

### Configuration
```env
# Required in .env.local
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Fix #3: KYC Pending Display

### What Changed
- Fixed query that was hiding some submissions
- Fixed schema mismatch
- All KYC submissions now visible

### The Problem
```typescript
// OLD (Broken) - Used inner join that filtered results
.select(`
  *,
  profiles!inner (email, first_name, last_name)
`)

// NEW (Fixed) - Fetch separately and combine
const submissions = await fetch kyc_submissions
const profiles = await fetch profiles
const combined = merge(submissions, profiles)
```

### Why It Failed Before
- `!inner` join required matching profile
- If profile data was missing/incomplete → submission hidden
- User "k_rangel77@yahoo.com" had profile issue → not shown

### Testing
```bash
# 1. Go to /cpanel/kyc-pending
# 2. Check if k_rangel77@yahoo.com is visible
# 3. Verify all submissions show up
# 4. Check stats match actual counts
# 5. Try approving/rejecting → Should work
```

---

## 📋 Complete Testing Checklist

### Account Suspension
- [ ] Admin can suspend user with reason
- [ ] Suspended user sees error on login
- [ ] Suspended user (logged in) gets kicked out
- [ ] Admin can reactivate user
- [ ] Reactivated user can log in
- [ ] Account status shows in users table
- [ ] Suspension reason is stored

### KYC Emails
- [ ] User submits KYC documents
- [ ] User receives confirmation email
- [ ] Admin receives notification email
- [ ] Email link works (opens KYC page)
- [ ] Email shows correct user info
- [ ] Works with RESEND_API_KEY configured

### KYC Display
- [ ] All submissions visible in pending page
- [ ] k_rangel77@yahoo.com appears
- [ ] Stats show correct counts
- [ ] Can approve submissions
- [ ] Can reject submissions
- [ ] Profile data displays correctly

---

## 🐛 Troubleshooting

### "User still can log in after suspension"
- Check if migrations applied: `SELECT account_status FROM profiles LIMIT 1;`
- Check middleware is running: Look for console logs
- Clear browser cookies and try again

### "Admin not receiving KYC emails"
- Check RESEND_API_KEY in .env.local
- Check admin email: `admin@FalconVest.live`
- Check Resend dashboard for delivery status
- Check server logs for email errors

### "KYC submissions still not showing"
- Check migration applied: `\d kyc_submissions` in psql
- Check for errors in browser console
- Check server action logs
- Verify admin role: `SELECT role FROM profiles WHERE id = 'your-id';`

---

## 🔧 Manual Database Checks

### Check Account Status Column
```sql
SELECT id, email, account_status, suspension_reason 
FROM profiles 
WHERE account_status != 'active';
```

### Check KYC Submissions Schema
```sql
\d kyc_submissions
-- Should show: full_name, id_number, document_front_url, document_back_url
```

### Check All KYC Submissions
```sql
SELECT 
  ks.id,
  ks.user_id,
  ks.status,
  p.email,
  ks.created_at
FROM kyc_submissions ks
LEFT JOIN profiles p ON p.id = ks.user_id
ORDER BY ks.created_at DESC;
```

### Find Specific User
```sql
SELECT * FROM profiles WHERE email = 'k_rangel77@yahoo.com';
SELECT * FROM kyc_submissions WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'k_rangel77@yahoo.com'
);
```

---

## 📁 Files Changed Summary

### New Files (2)
- `supabase/migrations/024_add_account_status.sql`
- `supabase/migrations/025_fix_kyc_submissions_schema.sql`

### Modified Files (5)
- `src/actions/admin.ts` - Added suspend/reactivate, fixed KYC query
- `src/actions/kyc.ts` - Added email notifications
- `src/lib/email.ts` - Added admin KYC notification
- `src/lib/supabase/middleware.ts` - Added suspension check
- `src/components/admin/users-table.tsx` - Added suspend UI
- `src/app/(auth)/login/page.tsx` - Added suspension error display

---

## 🎯 Success Criteria

All three issues are fixed when:

1. ✅ Admin can suspend user → User cannot log in
2. ✅ Admin receives email when KYC submitted
3. ✅ All KYC submissions visible (including k_rangel77@yahoo.com)

---

## 🆘 Need Help?

**Check logs:**
```bash
# Server logs
npm run dev

# Database logs
supabase logs

# Email logs (Resend dashboard)
https://resend.com/emails
```

**Common issues:**
- Migrations not applied → Run `supabase db push`
- Email not configured → Add RESEND_API_KEY
- Cache issues → Clear browser cache
- RLS blocking → Check admin role in database

---

**Status:** ✅ All fixes implemented and ready for testing
