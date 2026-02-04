-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate admin policies using auth.jwt() to avoid recursion
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    auth.uid() = id
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    auth.uid() = id
  );
