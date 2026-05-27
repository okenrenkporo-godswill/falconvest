-- Add metadata column to otp_codes table for storing temporary password
ALTER TABLE public.otp_codes 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_otp_metadata ON public.otp_codes USING GIN (metadata);
