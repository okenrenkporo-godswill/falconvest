-- Fix copy_trades unique constraint to allow re-copying after stopping

-- Drop the old unique constraint
ALTER TABLE public.copy_trades DROP CONSTRAINT IF EXISTS copy_trades_user_id_trader_id_key;

-- Create a partial unique index that only applies to active copies
CREATE UNIQUE INDEX copy_trades_user_trader_active_unique 
ON public.copy_trades (user_id, trader_id) 
WHERE status = 'active';
