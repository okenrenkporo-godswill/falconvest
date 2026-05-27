-- Add account_type to balances table
ALTER TABLE public.balances 
ADD COLUMN account_type TEXT NOT NULL DEFAULT 'trading' 
CHECK (account_type IN ('trading', 'holdings', 'staking'));

-- Drop old unique constraint
ALTER TABLE public.balances 
DROP CONSTRAINT IF EXISTS balances_user_id_asset_key;

-- Add new unique constraint with account_type
ALTER TABLE public.balances 
ADD CONSTRAINT balances_user_id_asset_account_type_key 
UNIQUE (user_id, asset, account_type);

-- Update credit_balance function to support account_type
CREATE OR REPLACE FUNCTION credit_balance(
  p_user_id UUID,
  p_asset TEXT,
  p_amount DECIMAL,
  p_account_type TEXT DEFAULT 'trading'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.balances (user_id, asset, amount, account_type)
  VALUES (p_user_id, p_asset, p_amount, p_account_type)
  ON CONFLICT (user_id, asset, account_type)
  DO UPDATE SET
    amount = public.balances.amount + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update debit_balance function to support account_type
CREATE OR REPLACE FUNCTION debit_balance(
  p_user_id UUID,
  p_asset TEXT,
  p_amount DECIMAL,
  p_account_type TEXT DEFAULT 'trading'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  SELECT amount INTO current_balance
  FROM public.balances
  WHERE user_id = p_user_id 
    AND asset = p_asset 
    AND account_type = p_account_type;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.balances
  SET amount = amount - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id 
    AND asset = p_asset 
    AND account_type = p_account_type;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
