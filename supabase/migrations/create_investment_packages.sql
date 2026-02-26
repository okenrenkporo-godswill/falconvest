-- Create investment_packages table
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

-- Create index for active packages
CREATE INDEX idx_investment_packages_active ON investment_packages(is_active, display_order);

-- Insert seed data (existing 4 packages)
INSERT INTO investment_packages (name, amount, features, color, is_popular, is_active, display_order) VALUES
  ('Bronze', 1000, ARRAY['Basic Trading Access', 'Standard Support', '5% Mining Power'], 'default', false, true, 1),
  ('Silver', 10000, ARRAY['Advanced Trading Tools', 'Priority Support', '10% Mining Power', 'Low Fees'], 'warning', false, true, 2),
  ('Gold', 50000, ARRAY['Zero Trading Fees', '24/7 VIP Support', '25% Mining Power', 'Copy Trading Pro'], 'secondary', true, true, 3),
  ('Premium', 500000, ARRAY['Institutional Tools', 'Dedicated Account Manager', '50% Mining Power', 'Private Signals'], 'primary', false, true, 4);

-- Enable RLS
ALTER TABLE investment_packages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active packages
CREATE POLICY "Anyone can view active packages"
  ON investment_packages FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can manage packages
CREATE POLICY "Admins can manage packages"
  ON investment_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
