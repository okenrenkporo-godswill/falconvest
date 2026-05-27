-- Deposits table with proof of payment
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.wallets(id),
  coin TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  usd_value DECIMAL(20, 2) NOT NULL,
  wallet_address TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('trading', 'holdings', 'staking')),
  proof_path TEXT NOT NULL,
  tx_hash TEXT,
  network TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create storage bucket for deposit proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-proofs', 'deposit-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for deposit proofs
CREATE POLICY "Users can upload own deposit proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deposit-proofs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own deposit proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deposit-proofs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all deposit proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deposit-proofs' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for deposits table
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposits"
  ON public.deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits"
  ON public.deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposits"
  ON public.deposits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all deposits"
  ON public.deposits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_deposits_created_at ON public.deposits(created_at DESC);

-- Function to credit user balance
CREATE OR REPLACE FUNCTION credit_balance(
  p_user_id UUID,
  p_asset TEXT,
  p_amount DECIMAL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.balances (user_id, asset, amount)
  VALUES (p_user_id, p_asset, p_amount)
  ON CONFLICT (user_id, asset)
  DO UPDATE SET
    amount = public.balances.amount + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
