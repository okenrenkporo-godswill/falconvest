-- Post-Migration Verification Script
-- Run this AFTER applying 025_fix_kyc_submissions_schema.sql

\echo '=== POST-MIGRATION VERIFICATION ==='
\echo ''

\echo '1. Total KYC Submissions (should be SAME as before):'
SELECT COUNT(*) as total_submissions FROM kyc_submissions;

\echo ''
\echo '2. Approved KYC Submissions (should be SAME as before):'
SELECT COUNT(*) as approved_kycs 
FROM kyc_submissions 
WHERE status IN ('manually_verified', 'auto_verified');

\echo ''
\echo '3. New Schema Columns (should include new columns):'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'kyc_submissions'
ORDER BY ordinal_position;

\echo ''
\echo '4. Old Data Still Exists (should show same data as before):'
SELECT 
  id,
  user_id,
  document_type,
  file_path,
  status,
  uploaded_at,
  full_name,
  document_front_url
FROM kyc_submissions 
WHERE document_type IS NOT NULL
LIMIT 3;

\echo ''
\echo '5. Users with Approved KYC (should be SAME as before):'
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
\echo '6. Check New Columns Exist:'
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_submissions' 
    AND column_name = 'full_name'
  ) THEN '✓ full_name exists' ELSE '✗ full_name missing' END as check_1,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_submissions' 
    AND column_name = 'id_number'
  ) THEN '✓ id_number exists' ELSE '✗ id_number missing' END as check_2,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_submissions' 
    AND column_name = 'document_front_url'
  ) THEN '✓ document_front_url exists' ELSE '✗ document_front_url missing' END as check_3,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_submissions' 
    AND column_name = 'document_back_url'
  ) THEN '✓ document_back_url exists' ELSE '✗ document_back_url missing' END as check_4;

\echo ''
\echo '=== COMPARE WITH PRE-MIGRATION OUTPUT ==='
\echo 'Total submissions should be SAME'
\echo 'Approved KYCs should be SAME'
\echo 'Old data should still be visible'
\echo 'New columns should exist'
