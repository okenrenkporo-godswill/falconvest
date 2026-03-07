# Copy Trading - Quick Reference

## Error Messages & User Guidance

### ❌ Before (Confusing)
```
Error: Already copying this trader
```
User thinks: "What do I do now?"

### ✅ After (Helpful)
```
Cannot Start Copy Trading
You are already copying this trader. 
You can increase your copy amount from 'My Copy Trades'
```
User knows: "Go to My Copy Trades and click Increase"

---

## New UI Elements

### My Copy Trades Page - Active Copy Trade Card

```
┌─────────────────────────────────────────────────────────┐
│  👤 CryptoKing_99                    [Active]            │
│  👥 1,250 followers  •  88.5% Win Rate                   │
│                                                           │
│  Copy Amount    Total Profit    Trades                   │
│  $1,000         +$250           12                       │
│                                                           │
│  [View Results]  [Increase]  [Stop]                      │
│      (blue)       (green)     (red)                      │
└─────────────────────────────────────────────────────────┘
```

### Increase Copy Amount Modal

```
┌─────────────────────────────────────────┐
│  Increase Copy Amount              [×]  │
├─────────────────────────────────────────┤
│                                         │
│  Copying                                │
│  CryptoKing_99                          │
│                                         │
│  Current Amount        $1,000           │
│  USDT Balance          $5,000           │
│                                         │
│  Additional Amount (USDT)               │
│  $ [________] [Max]                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ New Total Amount                │   │
│  │ $2,500                          │   │
│  └─────────────────────────────────┘   │
│                                         │
│         [Cancel]  [Increase Amount]     │
└─────────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Increase Existing Copy
```
My Copy Trades
    ↓
Click "Increase" button
    ↓
Modal opens
    ↓
Enter additional amount
    ↓
Click "Increase Amount"
    ↓
✅ Success toast
    ↓
Page refreshes with new amount
```

### Flow 2: Try to Re-copy Active Trader
```
Browse Traders
    ↓
Click "Copy Trade" (already copying)
    ↓
Enter amount
    ↓
Click "Start Copying"
    ↓
❌ Error toast with guidance
    ↓
Navigate to "My Copy Trades"
    ↓
Click "Increase" button
    ↓
Add more funds
```

### Flow 3: Re-copy After Stopping
```
My Copy Trades
    ↓
Click "Stop" on active copy
    ↓
✅ Copy stopped
    ↓
Browse Traders
    ↓
Click "Copy Trade" (same trader)
    ↓
Enter amount
    ↓
Click "Start Copying"
    ↓
✅ New copy created!
```

---

## Button States

### Active Copy Trade
- ✅ View Results (always visible)
- ✅ Increase (only for active)
- ✅ Stop (only for active)

### Stopped Copy Trade
- ✅ View Results (always visible)
- ❌ Increase (hidden)
- ❌ Stop (hidden)

---

## Validation Rules

### Increase Copy Amount
1. ✅ User must be authenticated
2. ✅ Copy trade must exist
3. ✅ Copy trade must belong to user
4. ✅ Copy trade status must be 'active'
5. ✅ Additional amount must be > 0
6. ✅ User must have sufficient USDT balance
7. ✅ Balance must be in trading account

### Start Copy Trading
1. ✅ User must be authenticated
2. ✅ Amount must be ≥ trader's minimum
3. ✅ User must have sufficient USDT balance
4. ✅ Cannot have another active copy of same trader
5. ✅ Can have stopped copies of same trader (history)

---

## Database State Examples

### Before Fix (Problem)
```sql
-- User stops copying
copy_trades: user_id=123, trader_id=456, status='stopped'

-- User tries to copy again
INSERT INTO copy_trades (user_id=123, trader_id=456, status='active')
❌ ERROR: duplicate key violates unique constraint
```

### After Fix (Solution)
```sql
-- User stops copying
copy_trades: user_id=123, trader_id=456, status='stopped'

-- User tries to copy again
INSERT INTO copy_trades (user_id=123, trader_id=456, status='active')
✅ SUCCESS: Unique index only checks active copies

-- Result: Two rows exist
Row 1: user_id=123, trader_id=456, status='stopped'  (history)
Row 2: user_id=123, trader_id=456, status='active'   (current)
```

---

## API Response Examples

### startCopyTrading() - Already Copying
```typescript
{
  error: "You are already copying this trader",
  suggestion: "You can increase your copy amount from 'My Copy Trades'",
  existingAmount: 1000
}
```

### increaseCopyAmount() - Success
```typescript
{
  success: true,
  newAmount: 2500
}
```

### increaseCopyAmount() - Insufficient Balance
```typescript
{
  error: "Insufficient balance in trading account"
}
```

---

## Toast Messages

### Success Messages
- ✅ "Started copying {trader_name}"
- ✅ "Increased copy amount to ${newAmount}"
- ✅ "Stopped copying {trader_name}"

### Error Messages
- ❌ "Cannot Start Copy Trading - You are already copying this trader. You can increase your copy amount from 'My Copy Trades'"
- ❌ "Insufficient balance in trading account"
- ❌ "Minimum copy amount is ${min_amount}"
- ❌ "Copy trade not found or inactive"
- ❌ "Please enter a valid amount"

---

## Mobile vs Desktop

### Mobile (Compact)
```
[View Results]
[Add] [Stop]
```

### Desktop (Spacious)
```
[View Results]  [Increase]  [Stop]
```

Both layouts show same functionality, just different labels:
- Mobile: "Add" (shorter)
- Desktop: "Increase" (clearer)

---

**Quick Start:**
1. Apply migration: `supabase db push`
2. Test re-copying: Stop a copy, then copy again ✅
3. Test increasing: Click "Increase" on active copy ✅
4. Test error feedback: Try copying already-copied trader ✅
