-- =========================================================
-- FalconVest: MASTER VERIFICATION & APPLY SCRIPT
-- Run this in Supabase SQL Editor to ensure all DB objects exist.
-- Safe to run multiple times (uses IF NOT EXISTS / CREATE OR REPLACE).
-- =========================================================

-- =========================================================
-- 1. TRANSACTION LEDGER TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.transaction_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    from_asset TEXT,
    to_asset TEXT,
    from_amount DECIMAL,
    to_amount DECIMAL,
    rate DECIMAL,
    before_balance_from DECIMAL,
    after_balance_from DECIMAL,
    before_balance_to DECIMAL,
    after_balance_to DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON public.transaction_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON public.transaction_ledger(created_at);

-- =========================================================
-- 2. SWAP ASSETS RPC
-- =========================================================
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
  SELECT amount INTO v_before_from FROM public.balances
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_from_asset) AND account_type = p_account_type;
  
  IF v_before_from IS NULL OR v_before_from < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient ' || p_from_asset || ' balance.');
  END IF;

  SELECT COALESCE(amount, 0) INTO v_before_to FROM public.balances
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_to_asset) AND account_type = p_account_type;

  UPDATE public.balances
  SET amount = amount - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_from_asset) AND account_type = p_account_type;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  IF v_row_count = 0 THEN
    RAISE EXCEPTION 'Critical Integrity Error: Could not verify % deduction. Swap aborted.', p_from_asset;
  END IF;

  SELECT amount INTO v_after_from FROM public.balances
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_from_asset) AND account_type = p_account_type;

  v_target_amount := p_amount * p_conversion_rate;
  
  INSERT INTO public.balances (user_id, asset, amount, account_type)
  VALUES (p_user_id, UPPER(p_to_asset), v_target_amount, p_account_type)
  ON CONFLICT (user_id, asset, account_type)
  DO UPDATE SET
    amount = public.balances.amount + v_target_amount,
    updated_at = NOW();

  SELECT amount INTO v_after_to FROM public.balances
  WHERE user_id = p_user_id AND UPPER(asset) = UPPER(p_to_asset) AND account_type = p_account_type;

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

-- =========================================================
-- 3. COPY TRADING ATOMIC OPS
-- =========================================================
CREATE OR REPLACE FUNCTION start_copy_trade_atomic(
  p_user_id UUID,
  p_trader_id UUID,
  p_copy_amount DECIMAL,
  p_copy_percentage DECIMAL DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  current_usdt_balance DECIMAL;
BEGIN
  IF EXISTS (SELECT 1 FROM public.copy_trades WHERE user_id = p_user_id AND trader_id = p_trader_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are already copying this trader.');
  END IF;

  SELECT amount INTO current_usdt_balance
  FROM public.balances
  WHERE user_id = p_user_id AND asset = 'USDT' AND account_type = 'trading';

  IF current_usdt_balance IS NULL OR current_usdt_balance < p_copy_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient USDT balance in trading account.');
  END IF;

  UPDATE public.balances
  SET amount = amount - p_copy_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND asset = 'USDT' AND account_type = 'trading';

  INSERT INTO public.copy_trades (user_id, trader_id, copy_amount, copy_percentage, status, started_at)
  VALUES (p_user_id, p_trader_id, p_copy_amount, p_copy_percentage, 'active', NOW());

  RETURN jsonb_build_object('success', true, 'message', 'Successfully started copy trading with ' || p_copy_amount || ' USDT');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION stop_copy_trade_atomic(
  p_user_id UUID,
  p_copy_trade_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_copy_amount DECIMAL;
  v_total_profit DECIMAL;
  v_return_amount DECIMAL;
BEGIN
  SELECT copy_amount, total_profit INTO v_copy_amount, v_total_profit
  FROM public.copy_trades
  WHERE id = p_copy_trade_id AND user_id = p_user_id AND status = 'active';

  IF v_copy_amount IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Active copy trade not found or already stopped.');
  END IF;

  v_return_amount := v_copy_amount + v_total_profit;

  UPDATE public.copy_trades
  SET status = 'stopped', stopped_at = NOW(), stopped_by = 'user'
  WHERE id = p_copy_trade_id;

  INSERT INTO public.balances (user_id, asset, amount, account_type)
  VALUES (p_user_id, 'USDT', v_return_amount, 'trading')
  ON CONFLICT (user_id, asset, account_type)
  DO UPDATE SET amount = public.balances.amount + v_return_amount, updated_at = NOW();

  RETURN jsonb_build_object('success', true, 'message', 'Successfully stopped copy trading. Returned ' || v_return_amount || ' USDT to trading balance.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increase_copy_amount_atomic(
  p_user_id UUID,
  p_copy_trade_id UUID,
  p_additional_amount DECIMAL
)
RETURNS JSONB AS $$
DECLARE
  v_current_usdt_balance DECIMAL;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.copy_trades WHERE id = p_copy_trade_id AND user_id = p_user_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Active copy trade not found.');
  END IF;

  SELECT amount INTO v_current_usdt_balance
  FROM public.balances
  WHERE user_id = p_user_id AND asset = 'USDT' AND account_type = 'trading';

  IF v_current_usdt_balance IS NULL OR v_current_usdt_balance < p_additional_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient USDT balance to increase copy amount.');
  END IF;

  UPDATE public.balances
  SET amount = amount - p_additional_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND asset = 'USDT' AND account_type = 'trading';

  UPDATE public.copy_trades
  SET copy_amount = copy_amount + p_additional_amount, updated_at = NOW()
  WHERE id = p_copy_trade_id;

  RETURN jsonb_build_object('success', true, 'message', 'Successfully increased copy amount by ' || p_additional_amount || ' USDT.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- 4. GRANT PERMISSIONS
-- =========================================================
GRANT EXECUTE ON FUNCTION public.swap_assets TO authenticated;
GRANT EXECUTE ON FUNCTION start_copy_trade_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION stop_copy_trade_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION increase_copy_amount_atomic TO authenticated;

-- =========================================================
-- 5. VERIFICATION QUERY - Check everything exists
-- =========================================================
SELECT 'VERIFICATION RESULTS' AS status;

SELECT routine_name AS function_name, 'EXISTS ✅' AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('swap_assets', 'start_copy_trade_atomic', 'stop_copy_trade_atomic', 'increase_copy_amount_atomic', 'handle_new_user', 'credit_balance', 'debit_balance')
ORDER BY routine_name;

SELECT table_name, 'EXISTS ✅' AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'balances', 'platform_wallets', 'user_wallets', 'deposits', 'withdrawals', 'copy_trades', 'copy_trade_positions', 'traders', 'transaction_ledger', 'otp_codes')
ORDER BY table_name;
