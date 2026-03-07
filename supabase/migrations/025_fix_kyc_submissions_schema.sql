-- Fix KYC submissions schema to match current usage
-- SAFE: Only adds missing columns, does NOT drop existing data

-- Add new columns if they don't exist (safe operation)
ALTER TABLE public.kyc_submissions 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS document_front_url TEXT,
ADD COLUMN IF NOT EXISTS document_back_url TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Make old columns nullable so new submissions don't need them
ALTER TABLE public.kyc_submissions 
ALTER COLUMN document_type DROP NOT NULL,
ALTER COLUMN file_path DROP NOT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_status ON public.kyc_submissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_created_at ON public.kyc_submissions(created_at DESC);

-- Note: We keep both old and new columns for backward compatibility
-- Old columns: document_type, file_path, uploaded_at (preserved for existing approved KYCs)
-- New columns: full_name, id_number, document_front_url, document_back_url (for new submissions)
