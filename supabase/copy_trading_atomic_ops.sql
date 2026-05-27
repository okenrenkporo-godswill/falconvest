-- =========================================================
-- FalconVest ATOMIC COPY-TRADE START RPC
-- Resolves: "Double-spending" of copy trading funds.
-- Ensures: Funds are debited from the USDT balance before the trade starts.
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
  -- 1. Check if already copying (to be safe)
  IF EXISTS (SELECT 1 FROM public.copy_trades WHERE user_id = p_user_id AND trader_id = p_trader_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are already copying this trader.');
  END IF;

  -- 2. Check and Debit USDT Balance (Trading Account)
  SELECT amount INTO current_usdt_balance
  FROM public.balances
  WHERE user_id = p_user_id AND asset = 'USDT' AND account_type = 'trading';

  IF current_usdt_balance IS NULL OR current_usdt_balance < p_copy_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient USDT balance in trading account.');
  END IF;

  -- 3. Perform the Debit
  UPDATE public.balances
  SET amount = amount - p_copy_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id AND asset = 'USDT' AND account_type = 'trading';

  -- 4. Create the Copy Trade Record
  INSERT INTO public.copy_trades (
    user_id,
    trader_id,
    copy_amount,
    copy_percentage,
    status,
    started_at
  ) VALUES (
    p_user_id,
    p_trader_id,
    p_copy_amount,
    p_copy_percentage,
    'active',
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully started copy trading with ' || p_copy_amount || ' USDT'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================
-- FalconVest ATOMIC COPY-TRADE STOP RPC
-- Resolves: Refund of funds after trade stop.
-- Ensures: Atomic credit of (amount + profit) back to USDT balance.
-- =========================================================

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
  -- 1. Get trade details (ensure it is active)
  SELECT copy_amount, total_profit INTO v_copy_amount, v_total_profit
  FROM public.copy_trades
  WHERE id = p_copy_trade_id AND user_id = p_user_id AND status = 'active';

  IF v_copy_amount IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Active copy trade not found or already stopped.');
  END IF;

  -- 2. Calculate return amount (Initial + Profit)
  v_return_amount := v_copy_amount + v_total_profit;

  -- 3. Mark as stopped
  UPDATE public.copy_trades
  SET status = 'stopped',
      stopped_at = NOW(),
      stopped_by = 'user'
  WHERE id = p_copy_trade_id;

  -- 4. Credit the USDT trading balance
  INSERT INTO public.balances (user_id, asset, amount, account_type)
  VALUES (p_user_id, 'USDT', v_return_amount, 'trading')
  ON CONFLICT (user_id, asset, account_type)
  DO UPDATE SET
    amount = public.balances.amount + v_return_amount,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully stopped copy trading. Returned ' || v_return_amount || ' USDT to trading balance.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- FalconVest ATOMIC INCREASE COPY AMOUNT RPC
-- Ensures: Additional funds are debited from the USDT balance.
-- =========================================================

CREATE OR REPLACE FUNCTION increase_copy_amount_atomic(
  p_user_id UUID,
  p_copy_trade_id UUID,
  p_additional_amount DECIMAL
)
RETURNS JSONB AS $$
DECLARE
  v_current_usdt_balance DECIMAL;
BEGIN
  -- 1. Check if copy trade is active
  IF NOT EXISTS (SELECT 1 FROM public.copy_trades WHERE id = p_copy_trade_id AND user_id = p_user_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Active copy trade not found.');
  END IF;

  -- 2. Check and Debit USDT Balance
  SELECT amount INTO v_current_usdt_balance
  FROM public.balances
  WHERE user_id = p_user_id AND asset = 'USDT' AND account_type = 'trading';

  IF v_current_usdt_balance IS NULL OR v_current_usdt_balance < p_additional_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient USDT balance to increase copy amount.');
  END IF;

  -- 3. Perform the Debit
  UPDATE public.balances
  SET amount = amount - p_additional_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id AND asset = 'USDT' AND account_type = 'trading';

  -- 4. Update the Copy Trade Record
  UPDATE public.copy_trades
  SET copy_amount = copy_amount + p_additional_amount,
      updated_at = NOW()
  WHERE id = p_copy_trade_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully increased copy amount by ' || p_additional_amount || ' USDT.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION stop_copy_trade_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION increase_copy_amount_atomic TO authenticated;
