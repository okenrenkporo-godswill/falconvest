-- =========================================================
-- FalconVest TRADERS & COPY SYSTEM REPAIR
-- Resolves: Missing columns "max_followers", "min_copy_amount", etc.
-- Ensures: All system columns match the application's required schema.
-- Run this in your Supabase SQL Editor
-- =========================================================

BEGIN;

-- 1. HARDEN TRADERS TABLE
-- Add missing system columns for the trader dashboard
ALTER TABLE public.traders 
  ADD COLUMN IF NOT EXISTS min_copy_amount DECIMAL(20, 2) NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS max_followers INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS total_trades INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_followers INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_profit DECIMAL(20, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5, 2) NOT NULL DEFAULT 0;

-- Ensure constraints (like win_rate percentage or risk_score range)
ALTER TABLE public.traders DROP CONSTRAINT IF EXISTS traders_risk_score_check;
ALTER TABLE public.traders ADD CONSTRAINT traders_risk_score_check 
  CHECK (risk_score IS NULL OR (risk_score BETWEEN 1 AND 10));

-- 2. HARDEN COPY TRADES TABLE
-- Add missing columns for tracking performance and limits
ALTER TABLE public.copy_trades 
  ADD COLUMN IF NOT EXISTS copy_percentage DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS total_trades INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_profit DECIMAL(20, 2) NOT NULL DEFAULT 0;

-- 3. HARDEN COPY TRADE POSITIONS
-- Add tracking for who closed the position (user, trader, admin, or system)
ALTER TABLE public.copy_trade_positions 
  ADD COLUMN IF NOT EXISTS closed_by TEXT CHECK (closed_by IS NULL OR (closed_by IN ('user', 'trader', 'admin', 'system'))),
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exit_price DECIMAL(20, 8),
  ADD COLUMN IF NOT EXISTS profit_loss DECIMAL(20, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trader_position_id UUID;

-- 4. FORCE REFRESH SCHEMA CACHE
-- PostgREST (Supabase) sometimes needs a DDL change to refresh its cache.
-- By updating a comment, we notify the system there was a schema change.
COMMENT ON TABLE public.traders IS 'Platform trading profiles for copy-trading system (updated schema)';
COMMENT ON TABLE public.copy_trades IS 'User copy-trading subscriptions and performance metrics';

COMMIT;

-- =========================================================
-- SCRIPT COMPLETE. Try updating or creating a trader now.
-- =========================================================
