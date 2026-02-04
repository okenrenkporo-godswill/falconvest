# Identity Verification System - Implementation Plan

## Overview
Build an advanced identity verification system similar to Innovatrics that includes:
1. Document scanning/capture
2. OCR data extraction and review
3. Liveness detection (selfie capture)
4. Face matching between document and selfie
5. Automated verification results

## Analysis of Screenshots

### Step 1: Capture ID (Screenshot 1)
- **Live camera feed** with document frame overlay
- "Scan document" button in center
- "Front side" label at top
- "Verify on mobile" option at bottom
- Clean, minimal UI with camera access

### Step 2: Review Details (Screenshots 2-4)
- **Left Panel**: Document preview with "Front" label
- **Right Panel**: Extracted data in organized sections:
  - **Personal Detail**: Given Names, Surname, DOB, Sex, NIN, Nationality
  - **Document Detail**: Passport No., Expiry Date, Issue Date, Place of Birth
  - **Machine Readable Zone**: Full MRZ text
  - **Photos Section**: Portrait, Ghost Portrait, Signature extracted from document
- **Actions**: "Retake", "Contact us", "Continue" buttons
- Data validation indicators (red warning for missing surname)

### Step 3: Take a Selfie (Screenshot 5)
- **Live camera feed** with circular face overlay
- "Stay still..." instruction
- Face detection with oval guide
- Real-time liveness detection

### Step 4: Results
- Verification complete
- Match score display
- Success/failure status

## Technical Architecture

### Frontend Components

#### 1. Document Capture Component
```
/onboarding/kyc/capture
- Camera access via getUserMedia API
- Document frame overlay with guides
- Real-time document detection
- Auto-capture when document detected
- Manual capture button
- Support for both front and back
```

#### 2. Data Review Component
```
/onboarding/kyc/review
- Display captured document image
- Show extracted OCR data in structured format
- Allow user to verify/edit data
- Validation indicators
- Retake option
- Continue to next step
```

#### 3. Selfie Capture Component
```
/onboarding/kyc/selfie
- Live camera feed
- Face detection overlay (circular guide)
- Liveness detection instructions
- Auto-capture when face properly positioned
- Multiple frame capture for liveness
```

#### 4. Results Component
```
/onboarding/kyc/results
- Display verification status
- Show match score
- Success/failure message
- Next steps
```

### Backend Services

#### 1. OCR Service (Document Data Extraction)
**Options:**
- **AWS Textract** - Best for ID documents, supports MRZ
- **Google Cloud Vision API** - Good OCR accuracy
- **Azure Computer Vision** - Document intelligence
- **Tesseract.js** - Open source, client-side option

**Recommended: AWS Textract**
- Specialized in identity documents
- Extracts structured data
- Reads MRZ (Machine Readable Zone)
- High accuracy for passports, IDs, driver's licenses

#### 2. Face Detection & Liveness
**Options:**
- **AWS Rekognition** - Face detection, liveness, comparison
- **Azure Face API** - Face verification and liveness
- **FaceIO** - Specialized facial authentication
- **iProov** - Advanced liveness detection

**Recommended: AWS Rekognition**
- Face detection in documents
- Face comparison (document vs selfie)
- Liveness detection
- Match confidence scores

#### 3. Document Verification
**Options:**
- **Onfido** - Complete identity verification platform
- **Jumio** - ID verification and authentication
- **Veriff** - Identity verification service
- **Innovatrics** - The system in screenshots (enterprise)

**Recommended for MVP: AWS Services (Textract + Rekognition)**
- Cost-effective
- Easy integration
- Scalable
- No third-party dependencies

## Implementation Plan

### Phase 1: Document Capture (Week 1)
**Tasks:**
1. Create camera capture component
   - Request camera permissions
   - Display live video feed
   - Add document frame overlay
   - Implement auto-detection (optional)
   - Manual capture button
   - Support front/back capture

2. Upload to Supabase Storage
   - Save captured images
   - Generate unique file names
   - Store metadata

**Tech Stack:**
- React Webcam library or native getUserMedia
- Canvas API for image processing
- Supabase Storage for uploads

### Phase 2: OCR & Data Extraction (Week 2)
**Tasks:**
1. Integrate AWS Textract
   - Set up AWS credentials
   - Create Lambda function for Textract
   - Parse document data
   - Extract MRZ if present

2. Create review interface
   - Display document image
   - Show extracted data in structured format
   - Add validation rules
   - Allow manual corrections
   - Highlight missing/invalid fields

3. Store extracted data
   - Save to Supabase database
   - Link to user profile
   - Update KYC submission record

**Database Schema:**
```sql
CREATE TABLE kyc_document_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  submission_id UUID REFERENCES kyc_submissions(id),
  document_type TEXT, -- passport, drivers_license, national_id
  given_names TEXT,
  surname TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  document_number TEXT,
  expiry_date DATE,
  issue_date DATE,
  place_of_birth TEXT,
  mrz_line1 TEXT,
  mrz_line2 TEXT,
  portrait_extracted BOOLEAN,
  signature_extracted BOOLEAN,
  confidence_score DECIMAL,
  raw_ocr_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 3: Selfie Capture & Liveness (Week 3)
**Tasks:**
1. Create selfie capture component
   - Camera access
   - Face detection overlay
   - Real-time face positioning guide
   - Liveness instructions ("Stay still", "Turn left", etc.)
   - Capture multiple frames

2. Implement liveness detection
   - Use AWS Rekognition DetectFaces
   - Check for real person (not photo/video)
   - Validate face quality
   - Ensure proper lighting

3. Upload selfie
   - Save to Supabase Storage
   - Link to KYC submission

**Tech Stack:**
- face-api.js for client-side face detection
- AWS Rekognition for liveness verification

### Phase 4: Face Matching & Verification (Week 4)
**Tasks:**
1. Extract face from document
   - Use AWS Rekognition to detect face in ID
   - Crop and save portrait

2. Compare faces
   - Use AWS Rekognition CompareFaces
   - Get similarity score
   - Set threshold (e.g., 90% match)

3. Generate verification result
   - Calculate overall confidence score
   - Check all validation criteria:
     - Document authenticity
     - Data completeness
     - Face match score
     - Liveness passed
   - Update KYC status

4. Create results page
   - Display verification status
   - Show match percentage
   - Provide next steps
   - Handle failures gracefully

**Database Schema:**
```sql
CREATE TABLE kyc_verification_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  submission_id UUID REFERENCES kyc_submissions(id),
  face_match_score DECIMAL,
  liveness_passed BOOLEAN,
  document_authentic BOOLEAN,
  data_complete BOOLEAN,
  overall_confidence DECIMAL,
  status TEXT, -- passed, failed, manual_review
  failure_reasons TEXT[],
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## AWS Services Setup

### 1. AWS Textract
```typescript
// Server action
import { TextractClient, AnalyzeIDCommand } from "@aws-sdk/client-textract";

export async function extractDocumentData(imageBytes: Buffer) {
  const client = new TextractClient({ region: "us-east-1" });
  
  const command = new AnalyzeIDCommand({
    DocumentPages: [{
      Bytes: imageBytes
    }]
  });
  
  const response = await client.send(command);
  return parseTextractResponse(response);
}
```

### 2. AWS Rekognition
```typescript
// Face comparison
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";

export async function compareFaces(
  documentImageBytes: Buffer,
  selfieImageBytes: Buffer
) {
  const client = new RekognitionClient({ region: "us-east-1" });
  
  const command = new CompareFacesCommand({
    SourceImage: { Bytes: documentImageBytes },
    TargetImage: { Bytes: selfieImageBytes },
    SimilarityThreshold: 90
  });
  
  const response = await client.send(command);
  return response.FaceMatches?.[0]?.Similarity || 0;
}
```

### 3. Liveness Detection
```typescript
// Liveness check
import { RekognitionClient, DetectFacesCommand } from "@aws-sdk/client-rekognition";

export async function checkLiveness(imageBytes: Buffer) {
  const client = new RekognitionClient({ region: "us-east-1" });
  
  const command = new DetectFacesCommand({
    Image: { Bytes: imageBytes },
    Attributes: ["ALL"]
  });
  
  const response = await client.send(command);
  const face = response.FaceDetails?.[0];
  
  return {
    isReal: face?.Confidence > 95,
    eyesOpen: face?.EyesOpen?.Value,
    mouthOpen: face?.MouthOpen?.Value,
    quality: face?.Quality
  };
}
```

## Environment Variables
```env
# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Verification Thresholds
FACE_MATCH_THRESHOLD=90
LIVENESS_CONFIDENCE_THRESHOLD=95
DOCUMENT_CONFIDENCE_THRESHOLD=85
```

## User Flow

### Complete Journey
1. **Start KYC** → User clicks "Complete KYC"
2. **Capture Document** → Camera opens, user scans ID front
3. **Capture Back** (optional) → Scan ID back if applicable
4. **Processing** → Show loading while OCR extracts data
5. **Review Data** → User verifies extracted information
6. **Edit if needed** → User can correct any errors
7. **Confirm** → User confirms data is correct
8. **Selfie Instructions** → Show what to expect
9. **Capture Selfie** → Live camera with face guide
10. **Liveness Check** → Follow instructions (turn head, blink, etc.)
11. **Processing** → Face matching and verification
12. **Results** → Show success/failure with score
13. **Dashboard** → Redirect to dashboard if approved

## Cost Estimation (AWS)

### Per Verification
- **Textract AnalyzeID**: $0.04 per document
- **Rekognition DetectFaces**: $0.001 per image
- **Rekognition CompareFaces**: $0.001 per comparison
- **Total per user**: ~$0.05

### Monthly (1000 verifications)
- **Total**: ~$50/month
- Very cost-effective compared to third-party services ($1-5 per verification)

## Alternative: Third-Party Services

### If AWS is too complex:

#### Option 1: Onfido
- Complete solution
- $2-5 per verification
- Easy integration
- Handles everything

#### Option 2: Veriff
- Similar to Onfido
- Good for crypto/fintech
- Compliance built-in

#### Option 3: Jumio
- Enterprise-grade
- High accuracy
- More expensive

## Recommended Approach

### MVP (Minimum Viable Product)
1. **Week 1-2**: Basic document upload + manual review (current system)
2. **Week 3-4**: Add OCR with AWS Textract
3. **Week 5-6**: Add selfie capture + face matching
4. **Week 7-8**: Add liveness detection + automated verification

### Production-Ready
- Use AWS services for cost-effectiveness
- Implement all 4 steps
- Add fraud detection
- Compliance reporting
- Audit logs

## Next Steps

1. **Decide on approach**:
   - Build with AWS (more control, cheaper)
   - Use third-party service (faster, easier)

2. **Set up AWS account** (if building):
   - Enable Textract
   - Enable Rekognition
   - Create IAM user with permissions

3. **Create database schema**:
   - Add kyc_document_data table
   - Add kyc_verification_results table

4. **Build components**:
   - Start with document capture
   - Then OCR review
   - Then selfie capture
   - Finally face matching

5. **Test thoroughly**:
   - Different document types
   - Various lighting conditions
   - Edge cases (glasses, beard, etc.)

## Security Considerations

1. **Data Privacy**:
   - Encrypt biometric data
   - Store face embeddings, not raw images
   - GDPR compliance
   - Right to deletion

2. **Fraud Prevention**:
   - Check for photo of photo
   - Detect screen replay attacks
   - Validate document authenticity
   - Check for tampering

3. **Compliance**:
   - Store audit logs
   - Track verification attempts
   - Document rejection reasons
   - Maintain compliance reports

---

**Recommendation**: Start with AWS Textract for OCR (Phase 2) as it provides immediate value by automating data extraction. Then add face matching (Phase 4) for security. Liveness detection (Phase 3) can be added later for enhanced security.

**Timeline**: 4-8 weeks for full implementation
**Cost**: ~$50-100/month for 1000 verifications
**Complexity**: Medium (requires AWS knowledge)
