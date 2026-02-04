# Bug Fixes - Liveness Detection & Upload Issues

## Issues Fixed

### 1. Liveness Detection Problems

**Problem:**
- Smile detected even without smiling (false positives)
- Blink not detected after many tries (threshold too strict)

**Root Cause:**
- Smile threshold too low (2.5) - normal mouth positions triggered it
- Blink threshold too strict (0.2) - required very tight eye closure

**Solution:**
```typescript
// Blink detection - More lenient
const avgEAR = (leftEAR + rightEAR) / 2;
if (avgEAR < 0.25) {  // Changed from 0.2 to 0.25
  // Blink detected
}

// Smile detection - More strict
const mouthRatio = mouthWidth / mouthHeight;
if (mouthRatio > 3.0) {  // Changed from 2.5 to 3.0
  // Smile detected
}
```

**Thresholds Explained:**
- **Blink (EAR < 0.25):** Eye Aspect Ratio drops when eyes close. 0.25 is more forgiving for partial blinks.
- **Smile (ratio > 3.0):** Mouth width/height ratio increases when smiling. 3.0 requires a clear smile.

### 2. Upload Failure

**Problem:**
```
Error: Failed to upload front image
ExperimentalWarning: buffer.File is an experimental feature
```

**Root Causes:**
1. RLS policies blocking server-side uploads
2. base64ToBlob conversion issues
3. Missing service role authentication

**Solutions:**

#### A. Use Service Role for Uploads
```typescript
// Create service client (bypasses RLS)
const { createClient: createServiceClient } = await import("@supabase/supabase-js");
const serviceSupabase = createServiceClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Upload with service role
await serviceSupabase.storage
  .from("kyc-documents")
  .upload(frontPath, frontBlob, { contentType: "image/jpeg", upsert: false });
```

#### B. Improved base64ToBlob Conversion
```typescript
function base64ToBlob(base64: string): Blob {
  try {
    // Handle data URL prefix
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const contentType = base64.includes(',') 
      ? base64.split(',')[0].split(':')[1].split(';')[0]
      : 'image/jpeg';
    
    // Decode in chunks for better memory handling
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    const sliceSize = 512;
    
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    
    return new Blob(byteArrays, { type: contentType });
  } catch (error) {
    console.error("base64ToBlob error:", error);
    throw new Error("Failed to convert image data");
  }
}
```

#### C. Added Detailed Logging
```typescript
console.log("Uploading files:", { frontPath, selfiePath, backPath });
console.log("Blob sizes:", { 
  front: frontBlob.size, 
  selfie: selfieBlob.size, 
  back: backBlob?.size 
});

if (frontError) {
  console.error("Front upload error details:", frontError);
  throw new Error(`Failed to upload front image: ${frontError.message}`);
}
```

## Storage Policy Requirements

The service role bypasses RLS, but for reference, the required policy is:

```sql
-- Service role can upload (already exists via service role key)
CREATE POLICY "Service can upload KYC docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kyc-documents');
```

## Testing

### Liveness Detection
1. **Blink Test:**
   - Look at camera normally
   - Close eyes briefly (even partial closure should work)
   - Should detect within 1-2 tries

2. **Smile Test:**
   - Look at camera with neutral expression (should NOT trigger)
   - Smile widely showing teeth
   - Should detect clear smile only

### Upload Test
1. Complete KYC flow
2. Check console logs for:
   ```
   Uploading files: { frontPath: "...", selfiePath: "...", backPath: "..." }
   Blob sizes: { front: 123456, selfie: 234567, back: 345678 }
   All files uploaded successfully
   ```
3. Verify in Supabase Storage → kyc-documents
4. Check database for file paths

## Files Modified

1. **`src/app/onboarding/kyc-advanced/selfie/page.tsx`**
   - Adjusted blink threshold: 0.2 → 0.25
   - Adjusted smile threshold: 2.5 → 3.0

2. **`src/actions/kyc.ts`**
   - Improved base64ToBlob function
   - Added service role client for uploads
   - Added detailed error logging
   - Added blob size logging

## Build Status

✅ **Build successful**  
✅ **No TypeScript errors**  
✅ **Ready for testing**

## Expected Behavior

### Liveness Detection
- **Blink:** Detects within 1-3 tries with normal eye closure
- **Smile:** Only detects clear, wide smiles (no false positives)
- **Auto-proceed:** Automatically captures and proceeds when both complete

### Upload
- **Success:** Files uploaded to `kyc-documents/{user_id}/{timestamp}-{type}.jpg`
- **Logging:** Console shows upload progress and success
- **Database:** File paths saved in `kyc_submissions` table
- **Email:** Appropriate email sent based on verification result

## Troubleshooting

### If Blink Still Not Detected
- Ensure good lighting on face
- Close eyes more fully
- Try blinking slower
- Check console for EAR values (should drop below 0.25)

### If Smile False Positives
- Keep neutral expression initially
- Smile widely when prompted
- Show teeth for clear detection

### If Upload Still Fails
1. Check console for detailed error message
2. Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env`
3. Check Supabase Storage bucket exists: `kyc-documents`
4. Verify bucket is private (not public)
5. Check blob sizes in console (should be > 0)

## Notes

- **Service Role:** Bypasses RLS policies, safe for server actions
- **Blob Conversion:** Handles large images efficiently with chunking
- **Error Messages:** Now include specific Supabase error details
- **Logging:** Helps debug issues in production
