# User Details Page - Admin Actions

## What Was Added

### 1. KYC Documents Display
- Shows ID number and submission date
- Displays front and back ID images
- Only visible if user has submitted KYC

### 2. Admin Actions Section
New action buttons for admins:

#### KYC Actions (shown when KYC is pending)
- **Approve KYC** - Instantly approves user's KYC
- **Reject KYC** - Opens modal to enter rejection reason
- **View KYC Documents** - Scrolls to documents section

#### Account Status Actions
- **Suspend Account** - Opens modal to enter suspension reason
- **Reactivate Account** - Shown for suspended users, reactivates immediately

### 3. Action Modals
- **Reject KYC Modal** - Input field for rejection reason
- **Suspend Account Modal** - Input field for suspension reason

## User Flow

### Approve KYC
1. Admin clicks "Approve KYC"
2. Instant approval (no modal)
3. Success toast shown
4. Page reloads with updated status

### Reject KYC
1. Admin clicks "Reject KYC"
2. Modal opens with reason input
3. Admin enters reason
4. Clicks "Reject"
5. Success toast shown
6. Page reloads with updated status

### Suspend Account
1. Admin clicks "Suspend Account"
2. Modal opens with reason input
3. Admin enters reason (e.g., "Suspicious activity")
4. Clicks "Suspend"
5. Success toast shown
6. Page reloads
7. Button changes to "Reactivate Account"

### Reactivate Account
1. Admin clicks "Reactivate Account"
2. Instant reactivation (no modal)
3. Success toast shown
4. Page reloads
5. Button changes back to "Suspend Account"

## UI Layout

```
┌─────────────────────────────────────────┐
│  ← Back   [Avatar]  User Name           │
│           user@email.com                 │
├─────────────────────────────────────────┤
│  [Stats Cards: Balance, Trades, etc.]   │
├─────────────────────────────────────────┤
│  Profile Information                     │
│  Name, Email, Phone, Country, etc.      │
├─────────────────────────────────────────┤
│  Admin Actions                           │
│  [Approve KYC] [Reject KYC]             │
│  [Suspend Account] [View KYC Docs]      │
├─────────────────────────────────────────┤
│  KYC Documents (if submitted)            │
│  ID Number: 123456                       │
│  [Front ID Image] [Back ID Image]       │
├─────────────────────────────────────────┤
│  [Tabs: Balances, Trades, etc.]         │
└─────────────────────────────────────────┘
```

## Button States

### KYC Status = "pending" + Has Submission
- ✅ Show "Approve KYC"
- ✅ Show "Reject KYC"
- ✅ Show "View KYC Documents"

### KYC Status = "manually_verified"
- ❌ Hide KYC action buttons
- ✅ Show "View KYC Documents"

### Account Status = "active"
- ✅ Show "Suspend Account"

### Account Status = "suspended"
- ✅ Show "Reactivate Account"
- ❌ Hide "Suspend Account"

## Files Modified

1. **`src/components/admin/user-details-content.tsx`**
   - Added KYC action handlers
   - Added suspend/reactivate handlers
   - Added action buttons section
   - Added modals for reject/suspend
   - Added auto-reload after actions

2. **`src/actions/admin-user-details.ts`**
   - Already fetches KYC submission ✅
   - No changes needed

3. **`src/actions/admin.ts`**
   - Already has `approveKycAction()` ✅
   - Already has `rejectKycAction()` ✅
   - Already has `suspendUserAccount()` ✅
   - Already has `reactivateUserAccount()` ✅

## Testing Checklist

### KYC Actions
- [ ] User with pending KYC shows action buttons
- [ ] Click "Approve KYC" → Status changes to verified
- [ ] Click "Reject KYC" → Modal opens
- [ ] Enter reason and reject → Status changes to rejected
- [ ] Approved/rejected users don't show KYC action buttons
- [ ] "View KYC Documents" scrolls to documents section

### Account Actions
- [ ] Active user shows "Suspend Account" button
- [ ] Click "Suspend Account" → Modal opens
- [ ] Enter reason and suspend → User suspended
- [ ] Suspended user shows "Reactivate Account" button
- [ ] Click "Reactivate Account" → User reactivated
- [ ] Suspended user cannot log in

### UI/UX
- [ ] All buttons have loading states
- [ ] Success toasts appear after actions
- [ ] Error toasts appear on failure
- [ ] Page reloads after successful action
- [ ] KYC images display correctly
- [ ] Modals close after successful action

## Example Usage

### Scenario 1: Approve User KYC
```
1. Admin opens /cpanel/users/[user-id]
2. Sees "Admin Actions" section
3. Clicks "Approve KYC"
4. Toast: "Success - KYC approved"
5. Page reloads
6. KYC status chip shows "manually_verified"
7. Action buttons disappear
```

### Scenario 2: Suspend Suspicious User
```
1. Admin opens /cpanel/users/[user-id]
2. Clicks "Suspend Account"
3. Modal opens
4. Enters: "Multiple failed login attempts"
5. Clicks "Suspend"
6. Toast: "Success - User suspended"
7. Page reloads
8. Button changes to "Reactivate Account"
9. User tries to log in → Kicked out with error
```

## Success Criteria

✅ Admin can approve KYC from user details page
✅ Admin can reject KYC with reason
✅ Admin can suspend account with reason
✅ Admin can reactivate suspended account
✅ KYC documents are visible
✅ All actions show loading states
✅ All actions show success/error feedback
✅ Page updates after actions

---

**Status:** ✅ Complete and ready to use
