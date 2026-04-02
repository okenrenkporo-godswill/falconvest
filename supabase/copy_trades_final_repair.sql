-- =========================================================
-- SYNCTRADE STOP TRADE & SCHEMA CACHE REPAIR (RESTORED)
-- Resolves: "Could not find 'stopped_by' column"
-- Ensures: All system columns for copy-trading are present.
-- =========================================================

BEGIN;

-- 1. HARDEN COPY TRADES TABLE
-- Ensure all columns used for tracking durations and stopping trades exist.
ALTER TABLE public.copy_trades 
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS stopped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stopped_by TEXT; -- Tracks if 'user' or 'admin' stopped it

-- 2. RESET TRADERS (REDUNDANCY CHECK)
-- Just in case some columns were missed in previous steps.
ALTER TABLE public.traders 
  ADD COLUMN IF NOT EXISTS total_trades INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_followers INT NOT NULL DEFAULT 0;

-- 3. FORCE REFRESH SCHEMA CACHE
-- PostgREST (Supabase) notification of schema changes via table comments.
COMMENT ON TABLE public.copy_trades IS 'User copy-trading subscriptions v3 (final columns)';
COMMENT ON TABLE public.traders IS 'Platform trading profiles for copy-trading (final schema)';

COMMIT;

-- =========================================================
-- SCRIPT COMPLETE. Try stopping a trade now.
-- =========================================================
