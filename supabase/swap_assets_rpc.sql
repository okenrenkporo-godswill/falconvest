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
  v_row_count INT;
BEGIN
  -- 1. Check source balance
  SELECT amount INTO current_balance
  FROM public.balances
  WHERE user_id = p_user_id 
    AND UPPER(asset) = UPPER(p_from_asset) 
    AND account_type = p_account_type;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient ' || p_from_asset || ' balance in ' || p_account_type || ' account.');
  END IF;

  -- 2. Deduct from source (Strict Integrity Check)
  UPDATE public.balances
  SET amount = amount - p_amount, 
      updated_at = NOW()
  WHERE user_id = p_user_id 
    AND UPPER(asset) = UPPER(p_from_asset) 
    AND account_type = p_account_type;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  IF v_row_count = 0 THEN
    -- If no row was updated, it means our search criteria failed. ROLLBACK.
    RAISE EXCEPTION 'Internal Error: Could not find % balance record to debit. Swap cancelled.', p_from_asset;
  END IF;

  -- 3. Calculate and Credit to target
  target_amount := p_amount * p_conversion_rate;
  
  INSERT INTO public.balances (user_id, asset, amount, account_type)
  VALUES (p_user_id, UPPER(p_to_asset), target_amount, p_account_type)
  ON CONFLICT (user_id, asset, account_type)
  DO UPDATE SET
    amount = public.balances.amount + target_amount,
    updated_at = NOW();

  -- 4. Return success
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Successfully swapped ' || p_amount || ' ' || p_from_asset || ' to ' || target_amount || ' ' || p_to_asset
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure authenticated users can call it
GRANT EXECUTE ON FUNCTION swap_assets TO authenticated;
