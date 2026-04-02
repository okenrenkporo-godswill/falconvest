-- =========================================================
-- SYNCTRADE ATOMIC ASSET SWAP RPC
-- Resolves: Asset accumulation bug (swapping without deduction)
-- Ensures: Atomic transaction for both debit and credit.
-- =========================================================

CREATE OR REPLACE FUNCTION swap_assets(
  p_user_id UUID,
  p_from_asset TEXT,
  p_to_asset TEXT,
  p_amount DECIMAL,
  p_conversion_rate DECIMAL,
  p_account_type TEXT DEFAULT 'trading'
)
RETURNS JSONB AS $$
DECLARE
  current_balance DECIMAL;
  target_amount DECIMAL;
BEGIN
  -- 1. Check source balance
  SELECT amount INTO current_balance
  FROM public.balances
  WHERE user_id = p_user_id 
    AND asset = p_from_asset 
    AND account_type = p_account_type;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient ' || p_from_asset || ' balance in ' || p_account_type || ' account.');
  END IF;

  -- 2. Deduct from source
  UPDATE public.balances
  SET amount = amount - p_amount, 
      updated_at = NOW()
  WHERE user_id = p_user_id 
    AND asset = p_from_asset 
    AND account_type = p_account_type;

  -- 3. Calculate and Credit to target
  target_amount := p_amount * p_conversion_rate;
  
  INSERT INTO public.balances (user_id, asset, amount, account_type)
  VALUES (p_user_id, p_to_asset, target_amount, p_account_type)
  ON CONFLICT (user_id, asset, account_type)
  DO UPDATE SET
    amount = public.balances.amount + target_amount,
    updated_at = NOW();

  -- 4. Record as transaction (optional but recommended)
  -- If you have a transactions table, you can insert a swap record here.

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Successfully swapped ' || p_amount || ' ' || p_from_asset || ' to ' || target_amount || ' ' || p_to_asset,
    'from_asset', p_from_asset,
    'to_asset', p_to_asset,
    'deducted_amount', p_amount,
    'credited_amount', target_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure authenticated users can call it
GRANT EXECUTE ON FUNCTION swap_assets TO authenticated;
