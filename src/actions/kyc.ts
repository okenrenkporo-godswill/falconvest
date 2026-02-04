"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const uploadKycSchema = z.object({
  documentType: z.string(),
  filePath: z.string(),
});

export async function uploadKycAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const frontFile = formData.get("frontFile") as File;
  const backFile = formData.get("backFile") as File | null;

  if (!frontFile) {
    return { error: "Front of ID is required" };
  }

  // Validate file size (5MB max)
  if (frontFile.size > 5 * 1024 * 1024) {
    return { error: "Front file is too large (max 5MB)" };
  }

  if (backFile && backFile.size > 5 * 1024 * 1024) {
    return { error: "Back file is too large (max 5MB)" };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(frontFile.type)) {
    return { error: "Invalid file type. Please upload JPG, PNG, or PDF" };
  }

  if (backFile && !allowedTypes.includes(backFile.type)) {
    return { error: "Invalid file type for back. Please upload JPG, PNG, or PDF" };
  }

  try {
    // Upload front file
    const frontFileName = `${user.id}/${Date.now()}-front-${frontFile.name}`;
    const { error: frontUploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(frontFileName, frontFile);

    if (frontUploadError) {
      console.error("Front upload error:", frontUploadError);
      return { error: "Failed to upload front of ID" };
    }

    // Insert front submission
    const { error: frontInsertError } = await supabase.from("kyc_submissions").insert({
      user_id: user.id,
      document_type: "id_front",
      file_path: frontFileName,
      status: "pending",
    });

    if (frontInsertError) {
      console.error("Front insert error:", frontInsertError);
      return { error: "Failed to save front document" };
    }

    // Upload back file if provided
    if (backFile) {
      const backFileName = `${user.id}/${Date.now()}-back-${backFile.name}`;
      const { error: backUploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(backFileName, backFile);

      if (backUploadError) {
        console.error("Back upload error:", backUploadError);
        // Don't fail if back upload fails
      } else {
        await supabase.from("kyc_submissions").insert({
          user_id: user.id,
          document_type: "id_back",
          file_path: backFileName,
          status: "pending",
        });
      }
    }

    // Update profile KYC status
    await supabase
      .from("profiles")
      .update({ kyc_status: "pending" })
      .eq("id", user.id);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("KYC upload error:", error);
    return { error: "An error occurred during upload" };
  }
}

export async function uploadKycDocumentAction(data: z.infer<typeof uploadKycSchema>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("kyc_submissions").insert({
    user_id: user.id,
    document_type: data.documentType,
    file_path: data.filePath,
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  // Update profile KYC status
  await supabase
    .from("profiles")
    .update({ kyc_status: "pending" })
    .eq("id", user.id);

  revalidatePath("/dashboard/account");
  return { success: true };
}

export async function getKycStatus() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("kyc_status, kyc_rejection_reason")
    .eq("id", user.id)
    .single();

  return data;
}

// Advanced KYC submission
export async function submitAdvancedKycAction(data: {
  frontImage: string;
  backImage?: string;
  selfieImage: string;
  extractedData: any;
  verificationResult: any;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || profile?.email?.split("@")[0] || "User";

    // Convert base64 to blob and upload
    const frontBlob = base64ToBlob(data.frontImage);
    const selfieBlob = base64ToBlob(data.selfieImage);
    const backBlob = data.backImage ? base64ToBlob(data.backImage) : null;

    const timestamp = Date.now();
    const frontPath = `${user.id}/${timestamp}-front.jpg`;
    const selfiePath = `${user.id}/${timestamp}-selfie.jpg`;
    const backPath = data.backImage ? `${user.id}/${timestamp}-back.jpg` : null;

    console.log("Uploading files:", { frontPath, selfiePath, backPath });
    console.log("Blob sizes:", { 
      front: frontBlob.size, 
      selfie: selfieBlob.size, 
      back: backBlob?.size 
    });

    // Use service role for uploads (bypasses RLS)
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const { env } = await import("@/env");
    const serviceSupabase = createServiceClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Upload front
    const { error: frontError } = await serviceSupabase.storage
      .from("kyc-documents")
      .upload(frontPath, frontBlob, { contentType: "image/jpeg", upsert: false });

    if (frontError) {
      console.error("Front upload error details:", frontError);
      throw new Error(`Failed to upload front image: ${frontError.message}`);
    }

    // Upload selfie
    const { error: selfieError } = await serviceSupabase.storage
      .from("kyc-documents")
      .upload(selfiePath, selfieBlob, { contentType: "image/jpeg", upsert: false });

    if (selfieError) {
      console.error("Selfie upload error details:", selfieError);
      throw new Error(`Failed to upload selfie: ${selfieError.message}`);
    }

    // Upload back if exists
    if (backBlob && backPath) {
      await serviceSupabase.storage
        .from("kyc-documents")
        .upload(backPath, backBlob, { contentType: "image/jpeg", upsert: false });
    }

    console.log("All files uploaded successfully");

    // Create submission records
    const { data: frontSubmission, error: frontSubError } = await supabase
      .from("kyc_submissions")
      .insert({
        user_id: user.id,
        document_type: "id_front",
        file_path: frontPath,
        status: "pending",
      })
      .select()
      .single();

    if (frontSubError) throw new Error("Failed to create front submission");

    if (backPath) {
      await supabase.from("kyc_submissions").insert({
        user_id: user.id,
        document_type: "id_back",
        file_path: backPath,
        status: "pending",
      });
    }

    const { data: selfieSubmission } = await supabase
      .from("kyc_submissions")
      .insert({
        user_id: user.id,
        document_type: "selfie",
        file_path: selfiePath,
        status: "pending",
      })
      .select()
      .single();

    // Save extracted document data
    await supabase.from("kyc_document_data").insert({
      user_id: user.id,
      submission_id: frontSubmission.id,
      given_names: data.extractedData.givenNames,
      surname: data.extractedData.surname,
      date_of_birth: data.extractedData.dateOfBirth,
      gender: data.extractedData.gender,
      nationality: data.extractedData.nationality,
      document_number: data.extractedData.documentNumber,
      expiry_date: data.extractedData.expiryDate,
      mrz_line1: data.extractedData.mrzLine1,
      mrz_line2: data.extractedData.mrzLine2,
      mrz_valid: data.extractedData.mrzValid,
      ocr_confidence: data.extractedData.confidence,
      raw_ocr_text: data.extractedData.rawText,
    });

    // Save liveness check
    await supabase.from("kyc_liveness_checks").insert({
      user_id: user.id,
      challenges_given: ["blink", "smile"],
      challenges_passed: data.verificationResult.liveness.passed ? ["blink", "smile"] : [],
      blink_detected: data.verificationResult.liveness.passed,
      smile_detected: data.verificationResult.liveness.passed,
      passed: data.verificationResult.liveness.passed,
      confidence_score: 100,
    });

    // Save face match
    await supabase.from("kyc_face_matches").insert({
      user_id: user.id,
      similarity_score: data.verificationResult.faceMatch.score,
      euclidean_distance: (1 - data.verificationResult.faceMatch.score / 100) * 0.6,
      is_match: data.verificationResult.faceMatch.passed,
    });

    // Save overall verification result
    await supabase.from("kyc_verification_results").insert({
      user_id: user.id,
      face_match_score: data.verificationResult.faceMatch.score,
      liveness_score: data.verificationResult.liveness.passed ? 100 : 0,
      ocr_confidence_score: data.extractedData.confidence || 0,
      overall_confidence: data.verificationResult.overall.confidence,
      status: data.verificationResult.overall.status,
      failure_reasons: data.verificationResult.overall.status === "failed" ? ["Low confidence"] : [],
      verified_at: data.verificationResult.overall.status === "passed" ? new Date().toISOString() : null,
    });

    // Update profile KYC status
    const newStatus = data.verificationResult.overall.status === "passed" ? "approved" : "pending";
    await supabase
      .from("profiles")
      .update({ kyc_status: newStatus })
      .eq("id", user.id);

    // Send appropriate email
    const { sendKycSubmittedEmail, sendKycApprovedEmail } = await import("@/lib/email");
    
    if (newStatus === "approved") {
      await sendKycApprovedEmail(user.email!, userName);
    } else {
      await sendKycSubmittedEmail(user.email!, userName);
    }

    revalidatePath("/dashboard");
    return { success: true, status: newStatus };
  } catch (error: any) {
    console.error("Advanced KYC submission error:", error);
    return { error: error.message || "Failed to submit KYC" };
  }
}

function base64ToBlob(base64: string): Blob {
  try {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const contentType = base64.includes(',') 
      ? base64.split(',')[0].split(':')[1].split(';')[0]
      : 'image/jpeg';
    
    // Decode base64
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    // Convert to byte array in chunks
    const sliceSize = 512;
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: contentType });
  } catch (error) {
    console.error("base64ToBlob error:", error);
    throw new Error("Failed to convert image data");
  }
}
