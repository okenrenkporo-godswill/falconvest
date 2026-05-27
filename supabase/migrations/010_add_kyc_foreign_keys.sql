-- Add foreign key constraint from kyc_verification_results to profiles
-- This allows Supabase to understand the relationship for joins

ALTER TABLE kyc_verification_results
DROP CONSTRAINT IF EXISTS kyc_verification_results_user_id_fkey;

ALTER TABLE kyc_verification_results
ADD CONSTRAINT kyc_verification_results_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add verification_id column to related tables if not exists
ALTER TABLE kyc_document_data
ADD COLUMN IF NOT EXISTS verification_id UUID REFERENCES kyc_verification_results(id) ON DELETE CASCADE;

ALTER TABLE kyc_liveness_checks
ADD COLUMN IF NOT EXISTS verification_id UUID REFERENCES kyc_verification_results(id) ON DELETE CASCADE;

ALTER TABLE kyc_face_matches
ADD COLUMN IF NOT EXISTS verification_id UUID REFERENCES kyc_verification_results(id) ON DELETE CASCADE;

-- Keep user_id foreign keys
ALTER TABLE kyc_document_data
DROP CONSTRAINT IF EXISTS kyc_document_data_user_id_fkey;

ALTER TABLE kyc_document_data
ADD CONSTRAINT kyc_document_data_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE kyc_liveness_checks
DROP CONSTRAINT IF EXISTS kyc_liveness_checks_user_id_fkey;

ALTER TABLE kyc_liveness_checks
ADD CONSTRAINT kyc_liveness_checks_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE kyc_face_matches
DROP CONSTRAINT IF EXISTS kyc_face_matches_user_id_fkey;

ALTER TABLE kyc_face_matches
ADD CONSTRAINT kyc_face_matches_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE kyc_submissions
DROP CONSTRAINT IF EXISTS kyc_submissions_user_id_fkey;

ALTER TABLE kyc_submissions
ADD CONSTRAINT kyc_submissions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
