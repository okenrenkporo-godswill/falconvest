-- =========================================================
-- FalconVest ULTIMATE SCHEMA SYNC & FIX SCRIPT
-- Resolves: Missing tables (copy_trades, traders), kyc_status constraints, and relational issues.
-- This script is idempotent: it will create missing tables or fix existing ones.
-- =========================================================

BEGIN;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Ensure they exist)
DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'auto_verified', 'manually_verified', 'rejected', 'failed', 'unverified');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLES - CORE & MISSING SYSTEMS

-- Profiles (Standardization)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  kyc_status TEXT DEFAULT 'pending',
  account_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure profiles has all columns and fix constraints
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_kyc_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_kyc_status_check 
  CHECK (kyc_status IN ('pending', 'verified', 'auto_verified', 'manually_verified', 'rejected', 'failed', 'unverified'));

-- Traders System
CREATE TABLE IF NOT EXISTS public.traders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive', 'rejected')),
  total_followers INT NOT NULL DEFAULT 0,
  total_profit DECIMAL(20, 2) NOT NULL DEFAULT 0,
  win_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  risk_score INT CHECK (risk_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copy Trading System
CREATE TABLE IF NOT EXISTS public.copy_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trader_id UUID NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  copy_amount DECIMAL(20, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  total_profit DECIMAL(20, 2) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, trader_id)
);

CREATE TABLE IF NOT EXISTS public.copy_trade_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_trade_id UUID NOT NULL REFERENCES public.copy_trades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trader_id UUID NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  amount DECIMAL(20, 8) NOT NULL,
  profit_loss DECIMAL(20, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KYC System
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  id_number TEXT,
  document_type TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'auto_verified', 'manually_verified')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staking System
CREATE TABLE IF NOT EXISTS public.staking_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset TEXT NOT NULL,
  name TEXT NOT NULL,
  apy DECIMAL(5, 2) NOT NULL,
  lock_period_days INT NOT NULL,
  min_stake_amount DECIMAL(20, 8) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(asset, lock_period_days)
);

CREATE TABLE IF NOT EXISTS public.user_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES public.staking_pools(id) ON DELETE CASCADE,
  amount DECIMAL(20, 8) NOT NULL,
  apy DECIMAL(5, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unstaked')),
  staked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlock_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RELATIONAL FIXES (Foreign Keys for existing tables)

-- Balances
ALTER TABLE public.balances DROP CONSTRAINT IF EXISTS balances_user_id_fkey;
ALTER TABLE public.balances ADD CONSTRAINT balances_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Trades
ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_user_id_fkey;
ALTER TABLE public.trades ADD CONSTRAINT trades_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. TRIGGER REFRESH (Standardize automation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
  f_name TEXT;
  l_name TEXT;
BEGIN
  f_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  l_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (
    id, email, username, first_name, last_name, full_name, role, kyc_status, account_status
  )
  VALUES (
    NEW.id, NEW.email, final_username, f_name, l_name,
    CASE WHEN f_name != '' THEN f_name || ' ' || l_name ELSE split_part(NEW.email, '@', 1) END,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'pending', 'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
