-- Create transaction_ledger table to track all balance changes for financial integrity
CREATE TABLE IF NOT EXISTS public.transaction_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- 'swap', 'deposit', 'withdrawal', 'copy_trade'
    from_asset TEXT,
    to_asset TEXT,
    from_amount DECIMAL,
    to_amount DECIMAL,
    rate DECIMAL,
    before_balance_from DECIMAL,
    after_balance_from DECIMAL,
    before_balance_to DECIMAL,
    after_balance_to DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON public.transaction_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON public.transaction_ledger(created_at);

-- Add helper to record in ledger
-- This can be used internally by other RPCs
COMMENT ON TABLE public.transaction_ledger IS 'Permanent audit trail for all user balance movements.';
