"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const updateKycSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["manually_verified", "rejected"]),
  rejectionReason: z.string().optional(),
});

export async function updateKycStatusAction(data: z.infer<typeof updateKycSchema>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  // Use admin client to update any user's KYC status
  const adminClient = createAdminClient();

  // Get user details for email
  const { data: userProfile } = await adminClient
    .from("profiles")
    .select("email, first_name, last_name")
    .eq("id", data.userId)
    .single();

  const { error } = await adminClient
    .from("profiles")
    .update({
      kyc_status: data.status,
      kyc_rejection_reason: data.rejectionReason || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.userId);

  if (error) {
    return { error: error.message };
  }

  // Update KYC submission status
  await adminClient
    .from("kyc_submissions")
    .update({
      status: data.status,
      rejection_reason: data.rejectionReason || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("user_id", data.userId)
    .eq("status", "pending");

  // Send email notification
  if (userProfile?.email) {
    const userName = userProfile.first_name && userProfile.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
      : userProfile.email.split("@")[0];
    const { sendKycApprovedEmail, sendKycRejectedEmail } = await import("@/lib/email");
    
    if (data.status === "manually_verified") {
      await sendKycApprovedEmail(userProfile.email, userName);
    } else if (data.status === "rejected") {
      await sendKycRejectedEmail(userProfile.email, userName, data.rejectionReason);
    }
  }

  revalidatePath("/cpanel/kyc-pending");
  revalidatePath("/cpanel/users");

  return { success: true };
}

export async function getPendingKycSubmissions() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return [];

  // Use admin client to fetch all KYC submissions with verification results
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("profiles")
    .select(`
      id,
      email,
      first_name,
      last_name,
      username,
      kyc_status,
      created_at,
      kyc_verification_results (
        status,
        face_match_score,
        liveness_score,
        ocr_confidence_score,
        overall_confidence,
        created_at
      )
    `)
    .not("kyc_status", "is", null)
    .order("created_at", { ascending: false });

  console.log("getPendingKycSubmissions query result:", { data, error, count: data?.length });

  return data || [];
}

export async function getAllUsers() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return [];

  // Use admin client to fetch all users
  const adminClient = createAdminClient();

  const { data } = await adminClient
    .from("profiles")
    .select("*")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  return data || [];
}

export async function deleteUserAction(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  // Use admin client to delete user (bypasses RLS)
  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/cpanel/users");
  return { success: true };
}

export async function getKycVerificationDetails(userId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Unauthorized" };

  const adminClient = createAdminClient();

  // Get verification results
  const { data: verification, error: verificationError } = await adminClient
    .from("kyc_verification_results")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  console.log("getKycVerificationDetails - userId:", userId);
  console.log("Verification query result:", { verification, verificationError });

  // Get related data separately
  const { data: documentData } = await adminClient
    .from("kyc_document_data")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: livenessChecks } = await adminClient
    .from("kyc_liveness_checks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: faceMatches } = await adminClient
    .from("kyc_face_matches")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Combine the data
  const combinedVerification = verification ? {
    ...verification,
    kyc_document_data: documentData ? [documentData] : [],
    kyc_liveness_checks: livenessChecks ? [livenessChecks] : [],
    kyc_face_matches: faceMatches ? [faceMatches] : []
  } : null;

  // Get document submissions
  const { data: submissions } = await adminClient
    .from("kyc_submissions")
    .select("document_type, file_path")
    .eq("user_id", userId);

  // Generate signed URLs
  const documentUrls: any = {};
  if (submissions) {
    for (const sub of submissions) {
      const { data } = await adminClient.storage
        .from("kyc-documents")
        .createSignedUrl(sub.file_path, 3600);
      if (data) documentUrls[sub.document_type] = data.signedUrl;
    }
  }

  // Get user profile
  const { data: userProfile } = await adminClient
    .from("profiles")
    .select("email, first_name, last_name, kyc_status")
    .eq("id", userId)
    .single();

  return { verification: combinedVerification, documentUrls, userProfile };
}

export async function approveKycWithOverride(userId: string, notes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Unauthorized" };

  const adminClient = createAdminClient();

  // Update verification result
  await adminClient
    .from("kyc_verification_results")
    .update({ status: "passed", admin_notes: notes })
    .eq("user_id", userId);

  // Update profile
  const { data: userProfile } = await adminClient
    .from("profiles")
    .update({ kyc_status: "manually_verified" })
    .eq("id", userId)
    .select("email, first_name, last_name")
    .single();

  // Send email
  if (userProfile?.email) {
    const userName = userProfile.first_name && userProfile.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
      : userProfile.email.split("@")[0];
    const { sendKycApprovedEmail } = await import("@/lib/email");
    await sendKycApprovedEmail(userProfile.email, userName);
  }

  revalidatePath("/cpanel/kyc-pending");
  return { success: true };
}

export async function rejectKycWithReason(userId: string, reason: string, notes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Unauthorized" };

  const adminClient = createAdminClient();

  // Update verification result
  await adminClient
    .from("kyc_verification_results")
    .update({ status: "failed", admin_notes: notes })
    .eq("user_id", userId);

  // Update profile
  const { data: userProfile } = await adminClient
    .from("profiles")
    .update({ kyc_status: "rejected", kyc_rejection_reason: reason })
    .eq("id", userId)
    .select("email, first_name, last_name")
    .single();

  // Send email
  if (userProfile?.email) {
    const userName = userProfile.first_name && userProfile.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
      : userProfile.email.split("@")[0];
    const { sendKycRejectedEmail } = await import("@/lib/email");
    await sendKycRejectedEmail(userProfile.email, userName, reason);
  }

  revalidatePath("/cpanel/kyc-pending");
  return { success: true };
}
