# Identity Verification System - Free & Open Source Implementation Plan

## Overview
Build an advanced identity verification system using **100% free and open-source** solutions.

## Free & Open Source Tech Stack

### 1. OCR (Document Data Extraction)
**Tesseract.js** - Free, open-source OCR engine
- **Cost**: FREE
- **Runs**: Client-side or server-side
- **Accuracy**: Good for printed text
- **MRZ Support**: Yes (with proper training)
- **Languages**: 100+ languages supported

**Alternative**: PaddleOCR (Python-based, very accurate)

### 2. Face Detection & Recognition
**face-api.js** - JavaScript face recognition library
- **Cost**: FREE
- **Runs**: Client-side (browser)
- **Features**:
  - Face detection
  - Face landmarks (68 points)
  - Face recognition
  - Face comparison
  - Age/gender/emotion detection
- **Models**: Pre-trained TensorFlow.js models

**Alternative**: OpenCV.js (more powerful but larger)

### 3. Liveness Detection
**Custom Implementation** using face-api.js
- **Cost**: FREE
- **Methods**:
  - Blink detection
  - Head movement (turn left/right)
  - Smile detection
  - Random challenges
  - Multiple frame analysis

### 4. Document Detection
**OpenCV.js** - Computer vision library
- **Cost**: FREE
- **Features**:
  - Edge detection
  - Document boundary detection
  - Perspective correction
  - Image enhancement

## Complete Implementation Architecture

### Frontend Libraries (All Free)

```json
{
  "dependencies": {
    "tesseract.js": "^5.0.0",           // OCR
    "face-api.js": "^0.22.2",           // Face detection/recognition
    "opencv.js": "^4.9.0",              // Document detection
    "@tensorflow/tfjs": "^4.17.0",      // ML models
    "react-webcam": "^7.2.0",           // Camera access
    "mrz": "^3.5.0"                     // MRZ parsing
  }
}
```

### Step-by-Step Implementation

## Phase 1: Document Capture with Auto-Detection

### Install Dependencies
```bash
pnpm add tesseract.js face-api.js opencv.js @tensorflow/tfjs react-webcam mrz
```

### Document Capture Component
```typescript
// Uses OpenCV.js for document detection
// Automatically detects document edges
// Applies perspective correction
// Enhances image quality
```

**Features**:
- Real-time document detection
- Auto-capture when document detected
- Edge detection and cropping
- Perspective correction
- Image enhancement (brightness, contrast)

## Phase 2: OCR with Tesseract.js

### OCR Processing
```typescript
import Tesseract from 'tesseract.js';
import { parse as parseMRZ } from 'mrz';

// Extract text from document
const { data: { text } } = await Tesseract.recognize(
  imageFile,
  'eng',
  {
    logger: m => console.log(m)
  }
);

// Parse MRZ if present
const mrzLines = extractMRZLines(text);
const mrzData = parseMRZ(mrzLines);
```

**Extracted Data**:
- Full name
- Date of birth
- Document number
- Expiry date
- Nationality
- Gender
- MRZ data (if passport)

### MRZ Parsing (Free Library)
```typescript
// mrz library parses Machine Readable Zone
// Validates checksums
// Extracts structured data
```

## Phase 3: Face Detection & Extraction

### Extract Face from Document
```typescript
import * as faceapi from 'face-api.js';

// Load models (one-time, cached)
await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

// Detect face in document
const detection = await faceapi
  .detectSingleFace(documentImage)
  .withFaceLandmarks()
  .withFaceDescriptor();

// Extract face region
const faceImage = extractFaceRegion(documentImage, detection.box);
```

## Phase 4: Selfie Capture with Liveness

### Liveness Detection Implementation
```typescript
// Multi-challenge liveness detection
const challenges = [
  { type: 'blink', instruction: 'Blink your eyes' },
  { type: 'smile', instruction: 'Smile' },
  { type: 'turn_left', instruction: 'Turn your head left' },
  { type: 'turn_right', instruction: 'Turn your head right' }
];

// Detect blinks
function detectBlink(landmarks) {
  const leftEye = calculateEyeAspectRatio(landmarks.getLeftEye());
  const rightEye = calculateEyeAspectRatio(landmarks.getRightEye());
  return (leftEye + rightEye) / 2 < 0.2; // Threshold for closed eyes
}

// Detect head rotation
function detectHeadRotation(landmarks) {
  const nose = landmarks.getNose();
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  
  // Calculate angle
  const angle = calculateAngle(nose, leftEye, rightEye);
  return {
    left: angle < -15,
    right: angle > 15,
    center: Math.abs(angle) < 10
  };
}

// Detect smile
function detectSmile(landmarks) {
  const mouth = landmarks.getMouth();
  const mouthWidth = calculateDistance(mouth[0], mouth[6]);
  const mouthHeight = calculateDistance(mouth[3], mouth[9]);
  return mouthWidth / mouthHeight > 2.5; // Smile ratio
}
```

### Liveness Flow
1. **Random challenge** - Select 2-3 random actions
2. **User performs** - Follow on-screen instructions
3. **Validate** - Check if action performed correctly
4. **Capture** - Take photo when all challenges passed
5. **Multiple frames** - Capture 3-5 frames for comparison

## Phase 5: Face Matching

### Compare Faces
```typescript
import * as faceapi from 'face-api.js';

// Get face descriptors (128-dimensional vectors)
const documentDescriptor = await faceapi
  .detectSingleFace(documentFaceImage)
  .withFaceLandmarks()
  .withFaceDescriptor();

const selfieDescriptor = await faceapi
  .detectSingleFace(selfieImage)
  .withFaceLandmarks()
  .withFaceDescriptor();

// Calculate Euclidean distance
const distance = faceapi.euclideanDistance(
  documentDescriptor.descriptor,
  selfieDescriptor.descriptor
);

// Convert to similarity score (0-100%)
const similarity = Math.max(0, (1 - distance / 0.6) * 100);

// Match if similarity > 70%
const isMatch = similarity > 70;
```

**Accuracy**: 95%+ for good quality images

## Complete Database Schema

```sql
-- Document data table
CREATE TABLE kyc_document_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  submission_id UUID REFERENCES kyc_submissions(id),
  
  -- Document info
  document_type TEXT, -- passport, drivers_license, national_id
  document_number TEXT,
  
  -- Personal info
  given_names TEXT,
  surname TEXT,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  
  -- Document dates
  issue_date DATE,
  expiry_date DATE,
  
  -- Additional info
  place_of_birth TEXT,
  address TEXT,
  
  -- MRZ data
  mrz_line1 TEXT,
  mrz_line2 TEXT,
  mrz_line3 TEXT,
  mrz_valid BOOLEAN,
  
  -- Extracted images
  portrait_path TEXT, -- Face extracted from document
  signature_path TEXT,
  
  -- OCR metadata
  ocr_confidence DECIMAL,
  raw_ocr_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liveness check results
CREATE TABLE kyc_liveness_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  submission_id UUID REFERENCES kyc_submissions(id),
  
  -- Challenges
  challenges_given TEXT[], -- ['blink', 'turn_left', 'smile']
  challenges_passed TEXT[],
  
  -- Detection results
  blink_detected BOOLEAN,
  smile_detected BOOLEAN,
  head_movement_detected BOOLEAN,
  
  -- Quality checks
  face_detected BOOLEAN,
  face_quality_score DECIMAL,
  lighting_adequate BOOLEAN,
  
  -- Anti-spoofing
  multiple_faces_detected BOOLEAN,
  screen_detected BOOLEAN,
  
  passed BOOLEAN,
  confidence_score DECIMAL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Face matching results
CREATE TABLE kyc_face_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  submission_id UUID REFERENCES kyc_submissions(id),
  
  -- Images compared
  document_face_path TEXT,
  selfie_path TEXT,
  
  -- Match results
  similarity_score DECIMAL, -- 0-100
  euclidean_distance DECIMAL,
  is_match BOOLEAN,
  
  -- Face quality
  document_face_quality DECIMAL,
  selfie_face_quality DECIMAL,
  
  -- Landmarks detected
  document_landmarks_count INTEGER,
  selfie_landmarks_count INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overall verification results
CREATE TABLE kyc_verification_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  submission_id UUID REFERENCES kyc_submissions(id),
  
  -- Component scores
  document_quality_score DECIMAL,
  ocr_confidence_score DECIMAL,
  liveness_score DECIMAL,
  face_match_score DECIMAL,
  
  -- Overall result
  overall_confidence DECIMAL,
  status TEXT, -- passed, failed, manual_review
  
  -- Checks
  document_valid BOOLEAN,
  data_extracted BOOLEAN,
  liveness_passed BOOLEAN,
  face_matched BOOLEAN,
  
  -- Failure reasons
  failure_reasons TEXT[],
  
  -- Timestamps
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## File Structure

```
src/
├── lib/
│   ├── ocr/
│   │   ├── tesseract.ts          # OCR processing
│   │   ├── mrz-parser.ts         # MRZ parsing
│   │   └── text-extractor.ts     # Extract structured data
│   ├── face/
│   │   ├── face-api-setup.ts     # Load models
│   │   ├── face-detector.ts      # Detect faces
│   │   ├── face-matcher.ts       # Compare faces
│   │   └── face-extractor.ts     # Extract face from document
│   ├── liveness/
│   │   ├── blink-detector.ts     # Detect blinks
│   │   ├── smile-detector.ts     # Detect smiles
│   │   ├── head-movement.ts      # Detect head rotation
│   │   └── liveness-checker.ts   # Main liveness logic
│   └── document/
│       ├── document-detector.ts  # OpenCV document detection
│       ├── edge-detector.ts      # Find document edges
│       └── image-enhancer.ts     # Enhance image quality
├── app/
│   └── onboarding/
│       └── kyc-advanced/
│           ├── page.tsx           # Main KYC flow
│           ├── capture/
│           │   └── page.tsx       # Document capture
│           ├── review/
│           │   └── page.tsx       # Review extracted data
│           ├── selfie/
│           │   └── page.tsx       # Selfie + liveness
│           └── results/
│               └── page.tsx       # Verification results
└── actions/
    └── kyc-advanced.ts            # Server actions
```

## Model Files (Free, Pre-trained)

Download face-api.js models (one-time):
```bash
# Create public/models directory
mkdir -p public/models

# Download models (free from face-api.js repo)
# - ssd_mobilenetv1 (face detection)
# - face_landmark_68 (facial landmarks)
# - face_recognition (face descriptors)
# - tiny_face_detector (lightweight alternative)
```

**Total size**: ~10MB (cached in browser)

## Performance Optimization

### 1. Client-Side Processing
- All processing in browser
- No server costs
- Privacy-friendly (data doesn't leave device)
- Fast processing

### 2. Web Workers
```typescript
// Run OCR in background thread
const worker = await Tesseract.createWorker();
await worker.loadLanguage('eng');
await worker.initialize('eng');
const { data } = await worker.recognize(image);
```

### 3. Model Caching
```typescript
// Cache models in browser
const MODEL_URL = '/models';
await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
// Models cached, subsequent loads are instant
```

## Cost Comparison

### Open Source Solution
- **Setup**: FREE
- **Per verification**: $0.00
- **Monthly (1000 users)**: $0.00
- **Hosting**: Standard Next.js hosting
- **Storage**: Supabase free tier (1GB)

### AWS Solution
- **Per verification**: ~$0.05
- **Monthly (1000 users)**: ~$50

### Third-Party (Onfido/Veriff)
- **Per verification**: $2-5
- **Monthly (1000 users)**: $2,000-5,000

**Savings**: $2,000-5,000/month! 💰

## Accuracy Expectations

### Tesseract.js OCR
- **Printed text**: 95%+ accuracy
- **MRZ**: 98%+ accuracy (structured format)
- **Handwriting**: 60-70% (not recommended)

### face-api.js Face Matching
- **Good lighting**: 95%+ accuracy
- **Poor lighting**: 85%+ accuracy
- **False positive rate**: <1%

### Liveness Detection
- **Multi-challenge**: 90%+ accuracy
- **Prevents**: Photo attacks, video replay
- **May miss**: Sophisticated 3D masks (rare)

## Implementation Timeline

### Week 1: Document Capture
- Camera component
- OpenCV.js integration
- Document detection
- Auto-capture

### Week 2: OCR & Data Extraction
- Tesseract.js integration
- MRZ parsing
- Data extraction
- Review interface

### Week 3: Face Detection
- face-api.js setup
- Face extraction from document
- Face quality checks

### Week 4: Selfie & Liveness
- Selfie capture
- Liveness challenges
- Multi-frame capture

### Week 5: Face Matching
- Face comparison
- Similarity scoring
- Results page

### Week 6: Testing & Refinement
- Test with various documents
- Improve accuracy
- Handle edge cases

## Advantages of Open Source Approach

✅ **Zero cost** - No per-verification fees
✅ **Privacy** - Processing in browser
✅ **No vendor lock-in** - Own the code
✅ **Customizable** - Modify as needed
✅ **Offline capable** - Works without internet
✅ **Fast** - No API latency
✅ **Scalable** - No usage limits

## Limitations

⚠️ **Lower accuracy** than enterprise solutions (95% vs 99%)
⚠️ **Client-side processing** - Requires good device
⚠️ **Model size** - ~10MB initial download
⚠️ **Browser compatibility** - Needs modern browser
⚠️ **Manual review** - May need human verification for edge cases

## Recommended Hybrid Approach

### Tier 1: Automated (90% of users)
- Use open-source solution
- Auto-approve if confidence > 90%
- Fast, free, automated

### Tier 2: Manual Review (10% of users)
- Low confidence scores
- Admin reviews manually
- Use existing admin panel

### Tier 3: Enhanced (Optional)
- For high-risk users
- Use AWS Rekognition for second opinion
- Only when needed (~1% of users)

**Result**: 99% free, 1% paid = ~$0.50/month for 1000 users

## Next Steps

1. **Install dependencies**
2. **Download face-api.js models**
3. **Create document capture component**
4. **Integrate Tesseract.js for OCR**
5. **Add face detection and matching**
6. **Implement liveness detection**
7. **Build results page**

**Ready to start implementation?** 🚀
