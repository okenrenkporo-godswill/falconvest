-- Staking System Tables

-- Staking pools
CREATE TABLE public.staking_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset TEXT NOT NULL,
  name TEXT NOT NULL,
  apy DECIMAL(5, 2) NOT NULL,
  lock_period_days INT NOT NULL,
  min_stake_amount DECIMAL(20, 8) NOT NULL,
  max_stake_amount DECIMAL(20, 8),
  total_staked DECIMAL(20, 8) NOT NULL DEFAULT 0,
  total_stakers INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(asset, lock_period_days)
);

-- User stakes
CREATE TABLE public.user_stakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  pool_id UUID NOT NULL REFERENCES public.staking_pools(id) ON DELETE CASCADE,
  amount DECIMAL(20, 8) NOT NULL,
  apy DECIMAL(5, 2) NOT NULL,
  rewards_earned DECIMAL(20, 8) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unstaked')),
  staked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlock_at TIMESTAMPTZ NOT NULL,
  unstaked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staking rewards history
CREATE TABLE public.staking_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stake_id UUID NOT NULL REFERENCES public.user_stakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_staking_pools_status ON public.staking_pools(status);
CREATE INDEX idx_staking_pools_asset ON public.staking_pools(asset);
CREATE INDEX idx_user_stakes_user_id ON public.user_stakes(user_id);
CREATE INDEX idx_user_stakes_pool_id ON public.user_stakes(pool_id);
CREATE INDEX idx_user_stakes_status ON public.user_stakes(status);
CREATE INDEX idx_staking_rewards_user_id ON public.staking_rewards(user_id);

-- RLS
ALTER TABLE public.staking_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_rewards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active pools" ON public.staking_pools
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own stakes" ON public.user_stakes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stakes" ON public.user_stakes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stakes" ON public.user_stakes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own rewards" ON public.staking_rewards
  FOR SELECT USING (user_id = auth.uid());
