-- Quick diagnostic to check actual KYC data

\echo '=== KYC SUBMISSIONS DIAGNOSTIC ==='
\echo ''

\echo '1. Total rows in kyc_submissions:'
SELECT COUNT(*) as total FROM kyc_submissions;

\echo ''
\echo '2. Status breakdown:'
SELECT 
  status,
  COUNT(*) as count
FROM kyc_submissions
GROUP BY status
ORDER BY count DESC;

\echo ''
\echo '3. All submissions with user emails:'
SELECT 
  ks.id,
  ks.user_id,
  p.email,
  ks.status,
  ks.created_at,
  ks.full_name,
  ks.document_type
FROM kyc_submissions ks
LEFT JOIN profiles p ON p.id = ks.user_id
ORDER BY ks.created_at DESC;

\echo ''
\echo '4. Check for NULL statuses:'
SELECT COUNT(*) as null_status_count
FROM kyc_submissions
WHERE status IS NULL;

\echo ''
\echo '5. Check profiles table:'
SELECT 
  email,
  kyc_status,
  account_status
FROM profiles
WHERE kyc_status != 'pending'
ORDER BY email;
