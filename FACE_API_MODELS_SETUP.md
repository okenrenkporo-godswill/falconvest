# Face-API.js Models Setup

## Download Models

The face-api.js models need to be placed in the `public/models` directory.

### Option 1: Download from CDN (Recommended)

```bash
# Create models directory
mkdir -p public/models

# Download models
cd public/models

# Tiny Face Detector (lightweight, fast)
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

# Face Landmark 68 Net
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1

# Face Recognition Net
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
```

### Option 2: Use npm package

```bash
# Install models package
pnpm add face-api.js-models

# Copy models to public directory
cp -r node_modules/face-api.js-models/models public/
```

### Option 3: Manual Download

1. Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download these files to `public/models/`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`

## Verify Installation

After downloading, your directory structure should look like:

```
public/
└── models/
    ├── tiny_face_detector_model-weights_manifest.json
    ├── tiny_face_detector_model-shard1
    ├── face_landmark_68_model-weights_manifest.json
    ├── face_landmark_68_model-shard1
    ├── face_recognition_model-weights_manifest.json
    ├── face_recognition_model-shard1
    └── face_recognition_model-shard2
```

## Model Sizes

- Tiny Face Detector: ~400KB
- Face Landmark 68: ~350KB
- Face Recognition: ~6.2MB

**Total**: ~7MB (cached in browser after first load)

## Testing

Start your dev server and navigate to `/onboarding/kyc-advanced/selfie`

The models will load automatically. Check the browser console for:
```
✅ Face-api.js models loaded
```

If you see errors, verify the files are in the correct location.
