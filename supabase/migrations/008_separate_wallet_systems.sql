-- ============================================
-- SEPARATE WALLET SYSTEMS MIGRATION
-- Platform Wallets (deposits) vs User Wallets (withdrawals)
-- ============================================

-- Step 1: Rename wallets to platform_wallets
ALTER TABLE IF EXISTS wallets RENAME TO platform_wallets;

-- Step 2: Drop existing RLS policies on platform_wallets that depend on user_id
DROP POLICY IF EXISTS "Users can view assigned wallets" ON platform_wallets;
DROP POLICY IF EXISTS "Users can view own wallets" ON platform_wallets;
DROP POLICY IF EXISTS "Users can update own wallets" ON platform_wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON platform_wallets;
DROP POLICY IF EXISTS "Admins can manage wallets" ON platform_wallets;

-- Step 3: Remove user assignment columns from platform_wallets
ALTER TABLE platform_wallets 
  DROP COLUMN IF EXISTS user_id CASCADE,
  DROP COLUMN IF EXISTS assigned_at CASCADE;

-- Step 4: Create user_wallets table for withdrawals
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  tag TEXT,
  label TEXT,
  is_default BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, wallet_address, symbol)
);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_symbol ON user_wallets(symbol);
CREATE INDEX IF NOT EXISTS idx_user_wallets_status ON user_wallets(status);

-- Step 6: Enable RLS on user_wallets
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS Policies for user_wallets
DROP POLICY IF EXISTS "Users can view own wallets" ON user_wallets;
CREATE POLICY "Users can view own wallets"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wallets" ON user_wallets;
CREATE POLICY "Users can insert own wallets"
  ON user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wallets" ON user_wallets;
CREATE POLICY "Users can update own wallets"
  ON user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wallets" ON user_wallets;
CREATE POLICY "Users can delete own wallets"
  ON user_wallets FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all user wallets" ON user_wallets;
CREATE POLICY "Admins can view all user wallets"
  ON user_wallets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 8: Update deposits foreign key
ALTER TABLE deposits 
  DROP CONSTRAINT IF EXISTS deposits_wallet_id_fkey;

ALTER TABLE deposits 
  ADD CONSTRAINT deposits_platform_wallet_id_fkey 
  FOREIGN KEY (wallet_id) REFERENCES platform_wallets(id);

-- Step 9: Add user_wallet_id to withdrawals
ALTER TABLE withdrawals 
  ADD COLUMN IF NOT EXISTS user_wallet_id UUID REFERENCES user_wallets(id);

-- Step 10: Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create trigger for user_wallets updated_at
DROP TRIGGER IF EXISTS update_user_wallets_updated_at ON user_wallets;
CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Add comments for clarity
COMMENT ON TABLE platform_wallets IS 'Company wallet addresses for receiving deposits from users';
COMMENT ON TABLE user_wallets IS 'User personal wallet addresses for sending withdrawals to users';
