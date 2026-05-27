-- Complete Trading Platform Schema

-- 1. Wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  fullname TEXT NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  network TEXT NOT NULL,
  tag TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMPTZ
);

-- 2. Traders table
CREATE TABLE IF NOT EXISTS public.traders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT,
  roi DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pnl DECIMAL(20, 2) NOT NULL DEFAULT 0,
  win_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  aum DECIMAL(20, 2) NOT NULL DEFAULT 0,
  copiers INTEGER NOT NULL DEFAULT 0,
  max_drawdown DECIMAL(5, 2) NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 5 CHECK (risk_score BETWEEN 1 AND 10),
  description TEXT,
  tags TEXT[],
  chart_data DECIMAL[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Copy trades table
CREATE TABLE IF NOT EXISTS public.copy_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trader_id UUID NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  amount_per_trade DECIMAL(20, 2) NOT NULL,
  stop_loss_percentage DECIMAL(5, 2),
  take_profit_percentage DECIMAL(5, 2),
  max_open_trades INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  total_pnl DECIMAL(20, 2) DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stopped_at TIMESTAMPTZ
);

-- 4. Withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  usd_value DECIMAL(20, 2) NOT NULL,
  destination_address TEXT NOT NULL,
  network TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('trading', 'holdings', 'staking')),
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')),
  rejection_reason TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- 5. Enhance trades table
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS entry_price DECIMAL(20, 8);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS exit_price DECIMAL(20, 8);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(20, 8);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS take_profit DECIMAL(20, 8);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS pnl DECIMAL(20, 2);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS is_copy_trade BOOLEAN DEFAULT FALSE;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS copied_from_trader_id UUID REFERENCES public.traders(id);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'trading' CHECK (account_type IN ('trading', 'holdings', 'staking'));

-- 6. Staking positions table
CREATE TABLE IF NOT EXISTS public.staking_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  apy DECIMAL(5, 2) NOT NULL,
  rewards_earned DECIMAL(20, 8) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unstaking', 'completed')),
  staked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unstaked_at TIMESTAMPTZ
);

-- 7. Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  commission_earned DECIMAL(20, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- 8. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade', 'kyc', 'system')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets
CREATE POLICY "Users can view assigned wallets"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
  ON public.wallets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for traders
CREATE POLICY "Anyone can view active traders"
  ON public.traders FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage traders"
  ON public.traders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for copy_trades
CREATE POLICY "Users can view own copy trades"
  ON public.copy_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own copy trades"
  ON public.copy_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own copy trades"
  ON public.copy_trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all copy trades"
  ON public.copy_trades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for withdrawals
CREATE POLICY "Users can view own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
  ON public.withdrawals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for staking_positions
CREATE POLICY "Users can view own staking positions"
  ON public.staking_positions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own staking positions"
  ON public.staking_positions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all staking positions"
  ON public.staking_positions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallets_symbol ON public.wallets(symbol);
CREATE INDEX idx_wallets_status ON public.wallets(status);

CREATE INDEX idx_traders_status ON public.traders(status);
CREATE INDEX idx_traders_roi ON public.traders(roi DESC);

CREATE INDEX idx_copy_trades_user_id ON public.copy_trades(user_id);
CREATE INDEX idx_copy_trades_trader_id ON public.copy_trades(trader_id);
CREATE INDEX idx_copy_trades_status ON public.copy_trades(status);

CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_withdrawals_requested_at ON public.withdrawals(requested_at DESC);

CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_is_copy_trade ON public.trades(is_copy_trade);
CREATE INDEX idx_trades_trader_id ON public.trades(copied_from_trader_id);

CREATE INDEX idx_staking_user_id ON public.staking_positions(user_id);
CREATE INDEX idx_staking_status ON public.staking_positions(status);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Function to debit balance (for withdrawals)
CREATE OR REPLACE FUNCTION debit_balance(
  p_user_id UUID,
  p_asset TEXT,
  p_amount DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  SELECT amount INTO current_balance
  FROM public.balances
  WHERE user_id = p_user_id AND asset = p_asset;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.balances
  SET amount = amount - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND asset = p_asset;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update trader stats
CREATE OR REPLACE FUNCTION update_trader_stats(
  p_trader_id UUID,
  p_roi DECIMAL DEFAULT NULL,
  p_pnl DECIMAL DEFAULT NULL,
  p_win_rate DECIMAL DEFAULT NULL,
  p_copiers INTEGER DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.traders
  SET
    roi = COALESCE(p_roi, roi),
    pnl = COALESCE(p_pnl, pnl),
    win_rate = COALESCE(p_win_rate, win_rate),
    copiers = COALESCE(p_copiers, copiers)
  WHERE id = p_trader_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
