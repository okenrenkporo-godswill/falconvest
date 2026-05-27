-- ============================================
-- FINAL CONSOLIDATED DATABASE SETUP
-- Run this in your Supabase SQL Editor to fix missing tables (otp_codes, platform_wallets, etc.)
-- ============================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('pending', 'auto_verified', 'manually_verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. OTP CODES TABLE
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.otp_codes(expires_at);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  country TEXT NOT NULL,
  state TEXT,
  city TEXT,
  address TEXT,
  role user_role NOT NULL DEFAULT 'user',
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  kyc_rejection_reason TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PLATFORM WALLETS TABLE (For Deposits)
CREATE TABLE IF NOT EXISTS public.platform_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  fullname TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  logo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BALANCES TABLE
CREATE TABLE IF NOT EXISTS public.balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  locked_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  account_type TEXT NOT NULL DEFAULT 'trading' CHECK (account_type IN ('trading', 'holdings', 'staking')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, asset, account_type)
);

-- 6. TRADES TABLE
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  type TEXT NOT NULL CHECK (type IN ('market', 'limit')),
  amount DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INVESTMENT PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.investment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  min_amount DECIMAL NOT NULL,
  max_amount DECIMAL,
  roi_range TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. STORAGE BUCKETS (Metadata only - actual buckets must be created via Dashboard)
-- Supabase automatically sets up storage.buckets, but seeding entries helps UI logic.
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('kyc-documents', 'kyc-documents', false),
  ('deposit-proofs', 'deposit-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- 9. SEED DATA
-- Investment Packages
INSERT INTO public.investment_packages (name, description, min_amount, max_amount, roi_range, duration_days, features)
VALUES
  ('Bronze Plan', 'Entry level trading package', 500, 1999, '5% - 10%', 7, ARRAY['Daily Reports', 'Standard Support']),
  ('Silver Plan', 'Intermediate trading package', 2000, 4999, '12% - 18%', 14, ARRAY['Daily Reports', 'Priority Support', 'Trade Alerts']),
  ('Gold Plan', 'Professional trading package', 5000, 19999, '20% - 35%', 30, ARRAY['Personal Manager', 'Real-time Alerts', 'Custom Strategies']),
  ('Platinum Plan', 'Institutional grade trading', 20000, NULL, '40%+', 60, ARRAY['Direct Access', 'Tax Reporting', 'VIP Support'])
ON CONFLICT DO NOTHING;

-- 10. RLS POLICIES
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to OTP codes" ON public.otp_codes FOR ALL USING (false);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view platform wallets" ON public.platform_wallets FOR SELECT USING (true);

-- 11. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, first_name, last_name, phone, country, state, city, address)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
