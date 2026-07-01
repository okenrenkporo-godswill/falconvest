-- Alter profiles table to add bot, profit, and vps fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profit_amount DECIMAL(20, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bot_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bot_restriction_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vps_status TEXT NOT NULL DEFAULT 'none' CHECK (vps_status IN ('none', 'active', 'expired'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vps_renewal_price DECIMAL(20, 2) NOT NULL DEFAULT 0.00;

-- Create user_bot_plans table
CREATE TABLE IF NOT EXISTS public.user_bot_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('silver', 'gold', 'diamond')),
  price DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plan_type)
);

-- Enable RLS for user_bot_plans
ALTER TABLE public.user_bot_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bot plans" ON public.user_bot_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bot plans" ON public.user_bot_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to initialize user bot plans
CREATE OR REPLACE FUNCTION public.initialize_user_bot_plans()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_bot_plans (user_id, plan_type, price, is_active, status)
  VALUES 
    (NEW.id, 'silver', 1000.00, false, 'inactive'),
    (NEW.id, 'gold', 5000.00, false, 'inactive'),
    (NEW.id, 'diamond', 10000.00, false, 'inactive')
  ON CONFLICT (user_id, plan_type) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize bot plans on new profile creation
DROP TRIGGER IF EXISTS on_profile_created_initialize_bot_plans ON public.profiles;
CREATE TRIGGER on_profile_created_initialize_bot_plans
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_bot_plans();

-- Initialize plans for all existing profiles
INSERT INTO public.user_bot_plans (user_id, plan_type, price, is_active, status)
SELECT id, 'silver', 1000.00, false, 'inactive' FROM public.profiles
ON CONFLICT (user_id, plan_type) DO NOTHING;

INSERT INTO public.user_bot_plans (user_id, plan_type, price, is_active, status)
SELECT id, 'gold', 5000.00, false, 'inactive' FROM public.profiles
ON CONFLICT (user_id, plan_type) DO NOTHING;

INSERT INTO public.user_bot_plans (user_id, plan_type, price, is_active, status)
SELECT id, 'diamond', 10000.00, false, 'inactive' FROM public.profiles
ON CONFLICT (user_id, plan_type) DO NOTHING;
