-- =========================================================
-- FalconVest USER CREATION FIX (V2)
-- Resolves: "Database error creating new user"
-- Ensures: Profiles trigger is robust and all required columns have defaults.
-- Run this in your Supabase SQL Editor
-- =========================================================

BEGIN;

-- 1. HARDEN PROFILES SCHEMA
-- Ensure all essential columns are NOT NULL but have a default value.
-- This prevent the INSERT trigger from failing if some fields are missing initially.

ALTER TABLE public.profiles 
  ALTER COLUMN first_name SET DEFAULT '',
  ALTER COLUMN last_name SET DEFAULT '',
  ALTER COLUMN country SET DEFAULT '',
  ALTER COLUMN phone SET DEFAULT '',
  ALTER COLUMN kyc_status SET DEFAULT 'pending',
  ALTER COLUMN account_status SET DEFAULT 'active',
  ALTER COLUMN role SET DEFAULT 'user';

-- 2. RESET TRIGGER AND FUNCTION
-- Re-create the handle_new_user function to be extremely robust.
-- This version handles ALL metadata and uses COALESCE to ensure no NULLs in NOT NULL columns.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
  f_name TEXT;
  l_name TEXT;
BEGIN
  -- 1. Extract values from metadata (fallbacks to defaults)
  f_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  l_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  
  -- 2. Generate Unique Username
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  -- 3. Perform Insert
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    first_name, 
    last_name, 
    full_name, 
    role, 
    kyc_status, 
    account_status,
    phone,
    country,
    state,
    city,
    address
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    final_username, 
    f_name, 
    l_name,
    CASE WHEN f_name != '' THEN f_name || ' ' || l_name ELSE split_part(NEW.email, '@', 1) END,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'pending',
    'active',
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- =========================================================
-- SCRIPT COMPLETE. Try creating a trader now.
-- =========================================================
