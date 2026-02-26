-- ============================================
-- Investment Packages - Direct SQL Script
-- ============================================
-- Run this in Supabase SQL Editor if you don't have CLI
-- Dashboard > SQL Editor > New Query > Paste & Run

-- 1. Create the table
CREATE TABLE IF NOT EXISTS investment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  features TEXT[] NOT NULL,
  color TEXT NOT NULL DEFAULT 'default',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index
CREATE INDEX IF NOT EXISTS idx_investment_packages_active 
ON investment_packages(is_active, display_order);

-- 3. Insert seed data
INSERT INTO investment_packages (name, amount, features, color, is_popular, is_active, display_order) 
VALUES
  (
    'Bronze', 
    1000, 
    ARRAY['Basic Trading Access', 'Standard Support', '5% Mining Power'], 
    'default', 
    false, 
    true, 
    1
  ),
  (
    'Silver', 
    10000, 
    ARRAY['Advanced Trading Tools', 'Priority Support', '10% Mining Power', 'Low Fees'], 
    'warning', 
    false, 
    true, 
    2
  ),
  (
    'Gold', 
    50000, 
    ARRAY['Zero Trading Fees', '24/7 VIP Support', '25% Mining Power', 'Copy Trading Pro'], 
    'secondary', 
    true, 
    true, 
    3
  ),
  (
    'Premium', 
    500000, 
    ARRAY['Institutional Tools', 'Dedicated Account Manager', '50% Mining Power', 'Private Signals'], 
    'primary', 
    false, 
    true, 
    4
  );

-- 4. Enable RLS
ALTER TABLE investment_packages ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Anyone can view active packages" ON investment_packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON investment_packages;

-- 6. Create RLS policies
CREATE POLICY "Anyone can view active packages"
  ON investment_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON investment_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 7. Verify installation
SELECT 
  'Installation Complete!' as status,
  COUNT(*) as total_packages,
  COUNT(*) FILTER (WHERE is_active = true) as active_packages,
  COUNT(*) FILTER (WHERE is_popular = true) as popular_packages
FROM investment_packages;

-- Expected output:
-- status: "Installation Complete!"
-- total_packages: 4
-- active_packages: 4
-- popular_packages: 1
