"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitKycAction(formData: FormData) {
  
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("No user found");
    return { error: "Not authenticated" };
  }

  const fullName = formData.get("fullName") as string;
  const idNumber = formData.get("idNumber") as string;
  const frontId = formData.get("frontId") as File;
  const backId = formData.get("backId") as File;


  if (!fullName || !idNumber || !frontId || !backId) {
    console.error("Missing fields");
    return { error: "All fields are required" };
  }

  // Upload documents to Supabase Storage
  const timestamp = Date.now();
  
  const { data: frontData, error: frontError } = await supabase.storage
    .from("kyc-documents")
    .upload(`${user.id}/front-${timestamp}.${frontId.name.split('.').pop()}`, frontId);

  if (frontError) {
    console.error("Front ID upload error:", frontError);
    return { error: "Failed to upload front ID" };
  }

  const { data: backData, error: backError } = await supabase.storage
    .from("kyc-documents")
    .upload(`${user.id}/back-${timestamp}.${backId.name.split('.').pop()}`, backId);

  if (backError) {
    console.error("Back ID upload error:", backError);
    return { error: "Failed to upload back ID" };
  }

  // Get public URLs
  const { data: { publicUrl: frontUrl } } = supabase.storage
    .from("kyc-documents")
    .getPublicUrl(frontData.path);

  const { data: { publicUrl: backUrl } } = supabase.storage
    .from("kyc-documents")
    .getPublicUrl(backData.path);

  console.log("Public URLs:", { frontUrl, backUrl });

  // Insert KYC submission
  console.log("Inserting KYC submission...");
  const { error: insertError } = await supabase
    .from("kyc_submissions")
    .insert({
      user_id: user.id,
      full_name: fullName,
      id_number: idNumber,
      document_front_url: frontUrl,
      document_back_url: backUrl,
      status: "pending"
    });

  if (insertError) {
    console.error("Insert error:", insertError);
    return { error: "Failed to submit KYC" };
  }
  console.log("KYC submission inserted successfully");

  // Update profile KYC status
  console.log("Updating profile KYC status...");
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ kyc_status: "pending" })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account");
  return { success: true };
}

export async function getKycStatus() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("kyc_status")
    .eq("id", user.id)
    .single();

  return profile?.kyc_status || "pending";
}
