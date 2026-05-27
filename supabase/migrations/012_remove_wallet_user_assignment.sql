-- Remove user assignment columns from wallets table
DROP POLICY IF EXISTS "Users can view assigned wallets" ON public.wallets;
ALTER TABLE wallets DROP COLUMN IF EXISTS user_id;
ALTER TABLE wallets DROP COLUMN IF EXISTS assigned_at;

-- Remove wallet_id from deposits (users select wallet, not assigned)
-- Keep it for reference of which wallet they deposited to
-- No changes needed to deposits table
