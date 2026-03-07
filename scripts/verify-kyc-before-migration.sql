-- Pre-Migration Verification Script
-- Run this BEFORE applying 025_fix_kyc_submissions_schema.sql

\echo '=== PRE-MIGRATION VERIFICATION ==='
\echo ''

\echo '1. Total KYC Submissions:'
SELECT COUNT(*) as total_submissions FROM kyc_submissions;

\echo ''
\echo '2. Approved KYC Submissions:'
SELECT COUNT(*) as approved_kycs 
FROM kyc_submissions 
WHERE status IN ('manually_verified', 'auto_verified');

\echo ''
\echo '3. Current Schema Columns:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'kyc_submissions'
ORDER BY ordinal_position;

\echo ''
\echo '4. Sample of Existing Data (first 3 rows):'
SELECT 
  id,
  user_id,
  document_type,
  file_path,
  status,
  uploaded_at
FROM kyc_submissions 
LIMIT 3;

\echo ''
\echo '5. Users with Approved KYC:'
SELECT 
  p.email,
  p.kyc_status,
  ks.status as submission_status,
  ks.uploaded_at
FROM profiles p
JOIN kyc_submissions ks ON ks.user_id = p.id
WHERE ks.status IN ('manually_verified', 'auto_verified')
ORDER BY ks.uploaded_at DESC;

\echo ''
\echo '=== SAVE THIS OUTPUT FOR COMPARISON ==='
