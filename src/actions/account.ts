"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) return { error: "Current password is incorrect" };

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) return { error: updateError.message };

  return { success: true };
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const country = formData.get("country") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      country,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/account");
  return { success: true };
}

export async function uploadProfileAvatar(data: { base64: string; size: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("[uploadProfileAvatar] Not authenticated");
    return { error: "Not authenticated" };
  }

  console.log("[uploadProfileAvatar] Starting upload for user:", user.id);
  console.log("[uploadProfileAvatar] File size:", data.size);

  try {
    // Convert base64 to Buffer
    const buffer = Buffer.from(data.base64, "base64");
    const fileName = `users/${user.id}/${Date.now()}.jpg`;

    console.log("[uploadProfileAvatar] Uploading to:", fileName);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadProfileAvatar] Upload error:", uploadError);
      throw uploadError;
    }

    console.log("[uploadProfileAvatar] Upload successful, getting public URL");

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    console.log("[uploadProfileAvatar] Public URL:", publicUrl);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("[uploadProfileAvatar] Update error:", updateError);
      throw updateError;
    }

    console.log("[uploadProfileAvatar] Profile updated successfully");

    revalidatePath("/dashboard/account");
    return { success: true, avatar_url: publicUrl };
  } catch (error: any) {
    console.error("[uploadProfileAvatar] Caught error:", error);
    return { error: error.message || "Upload failed" };
  }
}
