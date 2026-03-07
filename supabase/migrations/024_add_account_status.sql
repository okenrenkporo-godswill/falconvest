-- Add account_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active' 
CHECK (account_status IN ('active', 'suspended', 'deactivated'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- Add admin notes for suspension/deactivation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id);
