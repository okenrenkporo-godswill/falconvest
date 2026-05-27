-- Fix RLS policies for trades table

-- Add missing INSERT policy for trades
CREATE POLICY "Users can insert own trades" ON public.trades
  FOR INSERT WITH CHECK (user_id = auth.uid());
