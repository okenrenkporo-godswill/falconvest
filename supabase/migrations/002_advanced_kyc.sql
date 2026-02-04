-- Advanced KYC Tables

-- Document data extracted from OCR
CREATE TABLE IF NOT EXISTS kyc_document_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES kyc_submissions(id) ON DELETE CASCADE,
  given_names TEXT,
  surname TEXT,
  date_of_birth TEXT,
  gender TEXT,
  nationality TEXT,
  document_number TEXT,
  expiry_date TEXT,
  mrz_line1 TEXT,
  mrz_line2 TEXT,
  mrz_line3 TEXT,
  mrz_valid BOOLEAN,
  ocr_confidence DECIMAL,
  raw_ocr_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liveness detection results
CREATE TABLE IF NOT EXISTS kyc_liveness_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenges_given TEXT[],
  challenges_passed TEXT[],
  blink_detected BOOLEAN,
  smile_detected BOOLEAN,
  passed BOOLEAN,
  confidence_score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Face matching results
CREATE TABLE IF NOT EXISTS kyc_face_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  similarity_score DECIMAL,
  euclidean_distance DECIMAL,
  is_match BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overall verification results
CREATE TABLE IF NOT EXISTS kyc_verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  face_match_score DECIMAL,
  liveness_score DECIMAL,
  ocr_confidence_score DECIMAL,
  overall_confidence DECIMAL,
  status TEXT CHECK (status IN ('passed', 'failed', 'manual_review')),
  failure_reasons TEXT[],
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kyc_document_data_user_id ON kyc_document_data(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_liveness_checks_user_id ON kyc_liveness_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_face_matches_user_id ON kyc_face_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verification_results_user_id ON kyc_verification_results(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verification_results_status ON kyc_verification_results(status);

-- RLS Policies
ALTER TABLE kyc_document_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_liveness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_face_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verification_results ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own document data" ON kyc_document_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own liveness checks" ON kyc_liveness_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own face matches" ON kyc_face_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own verification results" ON kyc_verification_results
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert (via server actions)
CREATE POLICY "Service can insert document data" ON kyc_document_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can insert liveness checks" ON kyc_liveness_checks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can insert face matches" ON kyc_face_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can insert verification results" ON kyc_verification_results
  FOR INSERT WITH CHECK (true);

-- Admins can read all
CREATE POLICY "Admins can read all document data" ON kyc_document_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can read all liveness checks" ON kyc_liveness_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can read all face matches" ON kyc_face_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can read all verification results" ON kyc_verification_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
