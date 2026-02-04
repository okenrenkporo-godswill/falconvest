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
    .select("email, full_name")
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
    const userName = userProfile.full_name || userProfile.email.split("@")[0];
    const { sendKycApprovedEmail, sendKycRejectedEmail } = await import("@/lib/email");
    
    if (data.status === "manually_verified") {
      await sendKycApprovedEmail(userProfile.email, userName);
    } else if (data.status === "rejected") {
      await sendKycRejectedEmail(userProfile.email, userName, data.rejectionReason);
    }
  }

  revalidatePath("/admin/kyc-pending");
  revalidatePath("/admin/users");

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

  // Use admin client to fetch all pending KYC submissions
  const adminClient = createAdminClient();

  const { data } = await adminClient
    .from("kyc_submissions")
    .select(
      `
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        username
      )
    `
    )
    .eq("status", "pending")
    .order("uploaded_at", { ascending: false });

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

  revalidatePath("/admin/users");
  return { success: true };
}
