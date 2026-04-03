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

export async function updateKycStatusAction(
  data: z.infer<typeof updateKycSchema>,
) {
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
    const userName =
      userProfile.first_name && userProfile.last_name
        ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
        : userProfile.email.split("@")[0];
    const { sendKycApprovedEmail, sendKycRejectedEmail } =
      await import("@/lib/email");

    if (data.status === "manually_verified") {
      await sendKycApprovedEmail(userProfile.email, userName);
    } else if (data.status === "rejected") {
      await sendKycRejectedEmail(
        userProfile.email,
        userName,
        data.rejectionReason,
      );
    }
  }

  revalidatePath("/cpanel/kyc-pending");
  revalidatePath("/cpanel/users");

  return { success: true };
}

export async function getPendingKycSubmissions(page: number = 1, limit: number = 15) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], totalPages: 0, stats: { total: 0, pending: 0, approved: 0, rejected: 0 } };

  // Check admin role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { data: [], totalPages: 0, stats: { total: 0, pending: 0, approved: 0, rejected: 0 } };

  const adminClient = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1. Get all profiles that have 'pending' status
  // We've removed the trader filter to ensure all normal signups show up
  const { data: pendingProfiles, error: profileError } = await adminClient
    .from("profiles")
    .select("*")
    .eq("kyc_status", "pending")
    .order("created_at", { ascending: false });

  if (profileError) {
    console.error("Error fetching pending profiles:", profileError);
    return { data: [], totalPages: 0, stats: { total: 0, pending: 0, approved: 0, rejected: 0 } };
  }

  const count = pendingProfiles?.length || 0;
  
  // Paginate the local list
  const paginatedProfiles = (pendingProfiles || []).slice(from, to + 1);

  // 2. Fetch submissions for these profiles
  const profileIds = paginatedProfiles.map(p => p.id);
  const { data: submissions } = await adminClient
    .from("kyc_submissions")
    .select("*")
    .in("user_id", profileIds);

  // 3. Map to unified structure and generate signed URLs for documents
  const unifiedData = await Promise.all((paginatedProfiles || []).map(async p => {
    const sub = submissions?.find(s => s.user_id === p.id);
    
    let frontUrl = sub?.document_front_url || "";
    let backUrl = sub?.document_back_url || "";

    // Generate signed URLs if it's a Supabase storage URL
    if (frontUrl && frontUrl.includes("supabase.co/storage/v1/object/public/kyc-documents/")) {
      const path = frontUrl.split("kyc-documents/")[1];
      const { data } = await adminClient.storage
        .from("kyc-documents")
        .createSignedUrl(path, 3600); // 1 hour expiry
      if (data) frontUrl = data.signedUrl;
    }

    if (backUrl && backUrl.includes("supabase.co/storage/v1/object/public/kyc-documents/")) {
      const path = backUrl.split("kyc-documents/")[1];
      const { data } = await adminClient.storage
        .from("kyc-documents")
        .createSignedUrl(path, 3600);
      if (data) backUrl = data.signedUrl;
    }

    return {
      id: sub ? sub.id : `PROFILE:${p.id}`,
      user_id: p.id,
      full_name: p.full_name || p.email.split('@')[0],
      id_number: sub ? sub.id_number : "Not provided",
      document_front_url: frontUrl,
      document_back_url: backUrl,
      status: p.kyc_status,
      created_at: sub ? sub.created_at : p.created_at,
      profiles: {
        email: p.email,
        full_name: p.full_name
      }
    };
  }));

  const stats = {
    total: pendingProfiles.length,
    pending: pendingProfiles.length,
    approved: 0, 
    rejected: 0,
  };

  return {
    data: unifiedData,
    totalPages: Math.ceil((count || 0) / limit),
    stats,
  };
}

export async function approveKycAction(submissionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const adminClient = createAdminClient();
  let userId = "";

  if (submissionId.startsWith("PROFILE:")) {
    userId = submissionId.replace("PROFILE:", "");
  } else {
    const { data: submission } = await adminClient
      .from("kyc_submissions")
      .select("user_id")
      .eq("id", submissionId)
      .single();
    if (!submission) return { error: "Submission not found" };
    userId = submission.user_id;

    // Update submission record if it exists
    await adminClient
      .from("kyc_submissions")
      .update({ status: "manually_verified" })
      .eq("id", submissionId);
  }

  // Update profile KYC status
  await adminClient
    .from("profiles")
    .update({ kyc_status: "manually_verified" })
    .eq("id", userId);

  revalidatePath("/cpanel/kyc-pending");
  return { success: true };
}

export async function rejectKycAction(submissionId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const adminClient = createAdminClient();
  let userId = "";

  if (submissionId.startsWith("PROFILE:")) {
    userId = submissionId.replace("PROFILE:", "");
  } else {
    const { data: submission } = await adminClient
      .from("kyc_submissions")
      .select("user_id")
      .eq("id", submissionId)
      .single();
    if (!submission) return { error: "Submission not found" };
    userId = submission.user_id;

    await adminClient
      .from("kyc_submissions")
      .update({ 
        status: "rejected",
        admin_notes: reason 
      })
      .eq("id", submissionId);
  }

  // Update profile KYC status
  await adminClient
    .from("profiles")
    .update({ kyc_status: "rejected" })
    .eq("id", userId);

  revalidatePath("/cpanel/kyc-pending");
  return { success: true };
}

export async function getAllUsers(page: number = 1, limit: number = 20) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], totalPages: 0, totalCount: 0, stats: { verified: 0, pending: 0, unverified: 0 } };

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { data: [], totalPages: 0, totalCount: 0, stats: { verified: 0, pending: 0, unverified: 0 } };

  // Use admin client to fetch all users (including admins)
  const adminClient = createAdminClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count } = await adminClient
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  // Get stats from all users
  const { data: allUsers } = await adminClient
    .from("profiles")
    .select("kyc_status");

  const stats = {
    verified: allUsers?.filter((u) => u.kyc_status === "manually_verified" || u.kyc_status === "auto_verified").length || 0,
    pending: allUsers?.filter((u) => u.kyc_status === "pending").length || 0,
    unverified: allUsers?.filter((u) => !u.kyc_status || u.kyc_status === "unverified" || u.kyc_status === "rejected").length || 0,
  };

  return {
    data: data || [],
    totalPages: Math.ceil((count || 0) / limit),
    totalCount: count || 0,
    stats,
  };
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

// Suspend user account
export async function suspendUserAccount(userId: string, reason: string) {
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

  const { error } = await adminClient
    .from("profiles")
    .update({
      account_status: "suspended",
      suspension_reason: reason,
      suspended_at: new Date().toISOString(),
      suspended_by: user.id,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/users");
  return { success: true };
}

// Reactivate user account
export async function reactivateUserAccount(userId: string) {
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

  const { error } = await adminClient
    .from("profiles")
    .update({
      account_status: "active",
      suspension_reason: null,
      suspended_at: null,
      suspended_by: null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/users");
  return { success: true };
}

export async function getKycVerificationDetails(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  console.log("Verification query result:", {
    verification,
    verificationError,
  });

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
  const combinedVerification = verification
    ? {
        ...verification,
        kyc_document_data: documentData ? [documentData] : [],
        kyc_liveness_checks: livenessChecks ? [livenessChecks] : [],
        kyc_face_matches: faceMatches ? [faceMatches] : [],
      }
    : null;

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
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
    const userName =
      userProfile.first_name && userProfile.last_name
        ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
        : userProfile.email.split("@")[0];
    const { sendKycApprovedEmail } = await import("@/lib/email");
    await sendKycApprovedEmail(userProfile.email, userName);
  }

  revalidatePath("/cpanel/kyc-pending");
  return { success: true };
}

export async function rejectKycWithReason(
  userId: string,
  reason: string,
  notes: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
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
    const userName =
      userProfile.first_name && userProfile.last_name
        ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
        : userProfile.email.split("@")[0];
    const { sendKycRejectedEmail } = await import("@/lib/email");
    await sendKycRejectedEmail(userProfile.email, userName, reason);
  }

  revalidatePath("/cpanel/kyc-pending");
  return { success: true };
}
