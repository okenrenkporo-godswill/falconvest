-- Add admin_notes column to kyc_verification_results
ALTER TABLE kyc_verification_results 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add admin update policy
CREATE POLICY "Admins can update verification results" ON kyc_verification_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
