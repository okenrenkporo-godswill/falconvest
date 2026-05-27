-- Copy Trading System - Update existing tables

-- Drop existing tables to recreate with proper schema
DROP TABLE IF EXISTS public.copy_trade_positions CASCADE;
DROP TABLE IF EXISTS public.copy_trades CASCADE;
DROP TABLE IF EXISTS public.traders CASCADE;

-- Traders table
CREATE TABLE public.traders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  total_followers INT NOT NULL DEFAULT 0,
  total_profit DECIMAL(20, 2) NOT NULL DEFAULT 0,
  win_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  total_trades INT NOT NULL DEFAULT 0,
  risk_score INT CHECK (risk_score BETWEEN 1 AND 10),
  min_copy_amount DECIMAL(20, 2) NOT NULL DEFAULT 100,
  max_followers INT,
  commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  UNIQUE(user_id)
);

-- Copy trades table
CREATE TABLE public.copy_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trader_id UUID NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  copy_amount DECIMAL(20, 2) NOT NULL,
  copy_percentage DECIMAL(5, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  total_profit DECIMAL(20, 2) NOT NULL DEFAULT 0,
  total_trades INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stopped_at TIMESTAMPTZ,
  stopped_by TEXT CHECK (stopped_by IN ('user', 'admin', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, trader_id)
);

-- Copy trade positions table
CREATE TABLE public.copy_trade_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_trade_id UUID NOT NULL REFERENCES public.copy_trades(id) ON DELETE CASCADE,
  trader_position_id UUID,
  user_id UUID NOT NULL,
  trader_id UUID NOT NULL REFERENCES public.traders(id),
  pair TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  amount DECIMAL(20, 8) NOT NULL,
  profit_loss DECIMAL(20, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  closed_by TEXT CHECK (closed_by IN ('user', 'trader', 'admin', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_traders_status ON public.traders(status);
CREATE INDEX idx_traders_user_id ON public.traders(user_id);
CREATE INDEX idx_copy_trades_user_id ON public.copy_trades(user_id);
CREATE INDEX idx_copy_trades_trader_id ON public.copy_trades(trader_id);
CREATE INDEX idx_copy_trades_status ON public.copy_trades(status);
CREATE INDEX idx_copy_trade_positions_copy_trade_id ON public.copy_trade_positions(copy_trade_id);
CREATE INDEX idx_copy_trade_positions_user_id ON public.copy_trade_positions(user_id);
CREATE INDEX idx_copy_trade_positions_status ON public.copy_trade_positions(status);

-- Helper functions
CREATE OR REPLACE FUNCTION increment_trader_followers(trader_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.traders
  SET total_followers = total_followers + 1,
      updated_at = NOW()
  WHERE id = trader_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_trader_followers(trader_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.traders
  SET total_followers = GREATEST(0, total_followers - 1),
      updated_at = NOW()
  WHERE id = trader_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_trade_positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for traders
CREATE POLICY "Users can view active traders" ON public.traders
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own trader profile" ON public.traders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own trader profile" ON public.traders
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for copy_trades
CREATE POLICY "Users can view their own copy trades" ON public.copy_trades
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own copy trades" ON public.copy_trades
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own copy trades" ON public.copy_trades
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for copy_trade_positions
CREATE POLICY "Users can view their own copy positions" ON public.copy_trade_positions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own copy positions" ON public.copy_trade_positions
  FOR UPDATE USING (user_id = auth.uid());
