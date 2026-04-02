-- =========================================================
-- SYNCTRADE MASTER SCHEMA (CLEAN REBUILD)
-- This script is idempotent: it will fix existing tables or create new ones.
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('pending', 'auto_verified', 'manually_verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLES

-- OTP CODES
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  full_name TEXT,
  phone TEXT,
  country TEXT NOT NULL DEFAULT '',
  state TEXT,
  city TEXT,
  address TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  kyc_status TEXT DEFAULT 'pending',
  kyc_rejection_reason TEXT,
  avatar_url TEXT,
  account_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure correct columns exist in profiles (if table already existed)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active';

-- PLATFORM WALLETS
CREATE TABLE IF NOT EXISTS public.platform_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  fullname TEXT NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  network TEXT NOT NULL,
  tag TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- BALANCES
CREATE TABLE IF NOT EXISTS public.balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  locked_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  account_type TEXT NOT NULL DEFAULT 'trading' CHECK (account_type IN ('trading', 'holdings', 'staking')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, asset, account_type)
);

-- TRADES
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  type TEXT NOT NULL CHECK (type IN ('market', 'limit')),
  amount DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8),
  total DECIMAL(20, 8),
  fee DECIMAL(20, 8) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INVESTMENT PACKAGES
CREATE TABLE IF NOT EXISTS public.investment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  min_amount DECIMAL,
  max_amount DECIMAL,
  roi_range TEXT,
  duration_days INTEGER,
  features TEXT[] DEFAULT '{}',
  color TEXT DEFAULT 'default',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure expected columns in investment_packages
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS min_amount DECIMAL;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS max_amount DECIMAL;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS roi_range TEXT;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'default';
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 4. SEED DATA
-- Clear existing packages to avoid duplicates and ensure new schema
TRUNCATE public.investment_packages CASCADE;

INSERT INTO public.investment_packages 
  (name, amount, min_amount, max_amount, roi_range, duration_days, features, color, is_popular, is_active, display_order, description) 
VALUES
  ('Bronze', 1000, 500, 1999, '5% - 10%', 7, ARRAY['Basic Trading Access', 'Standard Support', '5% Mining Power'], 'default', false, true, 1, 'Entry level trading package'),
  ('Silver', 10000, 2000, 4999, '12% - 18%', 14, ARRAY['Advanced Trading Tools', 'Priority Support', '10% Mining Power', 'Low Fees'], 'warning', false, true, 2, 'Intermediate trading package'),
  ('Gold', 50000, 5000, 19999, '20% - 35%', 30, ARRAY['Zero Trading Fees', '24/7 VIP Support', '25% Mining Power', 'Copy Trading Pro'], 'secondary', true, true, 3, 'Professional trading package'),
  ('Premium', 500000, 20000, NULL, '40%+', 60, ARRAY['Institutional Tools', 'Dedicated Account Manager', '50% Mining Power', 'Private Signals'], 'primary', false, true, 4, 'Institutional grade trading');

-- 5. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('kyc-documents', 'kyc-documents', false),
  ('deposit-proofs', 'deposit-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- 6. TRIGGER FUNCTIONS (AUTOMATION)
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
  INSERT INTO public.profiles (id, email, username, first_name, last_name, full_name, role)
  VALUES (
    NEW.id, NEW.email, final_username, f_name, l_name,
    CASE WHEN f_name != '' THEN f_name || ' ' || l_name ELSE split_part(NEW.email, '@', 1) END,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. SECURITY (RLS POLICIES)
-- Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Clear old policies (Tables)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own balance" ON public.balances;
DROP POLICY IF EXISTS "Public can view platform wallets" ON public.platform_wallets;
DROP POLICY IF EXISTS "No direct access to OTP codes" ON public.otp_codes;

-- Apply new policies (Tables)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own balance" ON public.balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view platform wallets" ON public.platform_wallets FOR SELECT USING (true);
CREATE POLICY "No direct access to OTP codes" ON public.otp_codes FOR ALL USING (false);

-- 7.1 STORAGE POLICIES (storage.objects)
-- Clear old policies (Storage)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own deposit proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own deposit proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own KYC documents" ON storage.objects;

-- AVATARS
CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- DEPOSIT PROOFS
CREATE POLICY "Users can upload own deposit proofs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'deposit-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own deposit proofs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'deposit-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- KYC DOCUMENTS
CREATE POLICY "Users can upload own KYC documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own KYC documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ADMIN OVERRIDE (Optional but helpful)
CREATE POLICY "Admins can view all storage" ON storage.objects FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION credit_balance(p_user_id UUID, p_asset TEXT, p_amount DECIMAL, p_account_type TEXT DEFAULT 'trading')
RETURNS void AS $$
BEGIN
  INSERT INTO public.balances (user_id, asset, amount, account_type)
  VALUES (p_user_id, p_asset, p_amount, p_account_type)
  ON CONFLICT (user_id, asset, account_type)
  DO UPDATE SET amount = public.balances.amount + p_amount, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
