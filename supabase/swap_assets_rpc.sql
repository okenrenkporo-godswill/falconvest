-- Upgrade swap_assets to a Strict Atomic Ledger version
CREATE OR REPLACE FUNCTION public.swap_assets(
  p_user_id UUID,
  p_from_asset TEXT,
  p_to_asset TEXT,
  p_amount DECIMAL,
  p_conversion_rate DECIMAL,
  p_account_type TEXT DEFAULT 'trading'
)
RETURNS JSONB AS $$
DECLARE
  v_before_from DECIMAL;
  v_after_from DECIMAL;
  v_before_to DECIMAL;
  v_after_to DECIMAL;
  v_target_amount DECIMAL;
  v_row_count INT;
BEGIN
  -- 1. Capture BEFORE balances for Ledger
  SELECT amount INTO v_before_from FROM public.balances
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_from_asset) AND account_type = p_account_type;
  
  IF v_before_from IS NULL OR v_before_from < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient ' || p_from_asset || ' balance.');
  END IF;

  SELECT COALESCE(amount, 0) INTO v_before_to FROM public.balances
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_to_asset) AND account_type = p_account_type;

  -- 2. Deduct from source (STRICT INTEGRITY)
  UPDATE public.balances
  SET amount = amount - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_from_asset) AND account_type = p_account_type;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  IF v_row_count = 0 THEN
    RAISE EXCEPTION 'Critical Integrity Error: Could not verify % deduction. Swap aborted.', p_from_asset;
  END IF;

  SELECT amount INTO v_after_from FROM public.balances
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_from_asset) AND account_type = p_account_type;

  -- 3. Calculate and Credit to target
  v_target_amount := p_amount * p_conversion_rate;
  
  INSERT INTO public.balances (user_id, asset, amount, account_type)
  VALUES (p_user_id, UPPER(p_to_asset), v_target_amount, p_account_type)
  ON CONFLICT (user_id, asset, account_type)
  DO UPDATE SET
    amount = public.balances.amount + v_target_amount,
    updated_at = NOW();

  SELECT amount INTO v_after_to FROM public.balances
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_to_asset) AND account_type = p_account_type;

  -- 4. RECORD TO LEDGER (Permanently log the transaction)
  INSERT INTO public.transaction_ledger (
    user_id, transaction_type, from_asset, to_asset, from_amount, to_amount, rate,
    before_balance_from, after_balance_from, before_balance_to, after_balance_to
  ) VALUES (
    p_user_id, 'swap', UPPER(p_from_asset), UPPER(p_to_asset), p_amount, v_target_amount, p_conversion_rate,
    v_before_from, v_after_from, v_before_to, v_after_to
  );

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Successfully swapped ' || p_amount || ' ' || p_from_asset || ' to ' || v_target_amount || ' ' || p_to_asset
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
