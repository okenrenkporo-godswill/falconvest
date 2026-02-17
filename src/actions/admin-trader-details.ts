"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getTraderDetails(traderId: string) {
  const adminClient = createAdminClient();
  
  const { data: trader, error } = await adminClient
    .from("traders")
    .select("*")
    .eq("id", traderId)
    .single();

  if (error) return { error: error.message };
  
  return { trader };
}

export async function updateTraderInfo(traderId: string, data: {
  display_name: string;
  bio?: string;
  avatar_url?: string;
  risk_score?: number;
  min_copy_amount?: number;
  max_followers?: number;
  commission_rate?: number;
  total_followers?: number;
  total_profit?: number;
  win_rate?: number;
  total_trades?: number;
}) {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from("traders")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", traderId);

  if (error) return { error: error.message };

  revalidatePath(`/cpanel/traders/${traderId}`);
  revalidatePath("/cpanel/traders");
  return { success: true };
}

export async function uploadTraderAvatar(traderId: string, fileData: { base64: string; size: number }) {
  const adminClient = createAdminClient();
  
  try {
    console.log("Starting avatar upload for trader:", traderId, "Size:", fileData.size);
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(fileData.base64, "base64");
    console.log("Buffer created, size:", buffer.length);

    // Upload to storage
    const fileName = `traders/${traderId}/${Date.now()}.jpg`;
    console.log("Uploading to:", fileName);
    
    const { error: uploadError } = await adminClient.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: uploadError.message };
    }

    console.log("Upload successful");

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from("avatars")
      .getPublicUrl(fileName);

    console.log("Public URL:", publicUrl);

    // Update trader with new avatar URL
    const { error: updateError } = await adminClient
      .from("traders")
      .update({ avatar_url: publicUrl })
      .eq("id", traderId);

    if (updateError) {
      console.error("Update error:", updateError);
      return { error: updateError.message };
    }

    console.log("Trader updated successfully");
    revalidatePath(`/cpanel/traders/${traderId}`);
    return { success: true, avatar_url: publicUrl };
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return { error: error.message };
  }
}

export async function createTrader(data: {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country: string;
  display_name: string;
  bio?: string;
  risk_score?: number;
  min_copy_amount?: number;
  max_followers?: number;
  commission_rate?: number;
  total_followers?: number;
  total_profit?: number;
  win_rate?: number;
  total_trades?: number;
  avatar?: { base64: string; size: number } | null;
}) {
  const adminClient = createAdminClient();
  
  try {
    console.log("[CREATE TRADER] Starting trader creation for:", data.email);
    
    // Create auth user
    console.log("[CREATE TRADER] Creating auth user...");
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error("[CREATE TRADER] Auth creation failed:", authError);
      return { error: authError?.message || "Failed to create user" };
    }

    const userId = authData.user.id;
    console.log("[CREATE TRADER] Auth user created:", userId);

    // Update profile (trigger auto-creates it)
    console.log("[CREATE TRADER] Updating profile...");
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: `${data.first_name} ${data.last_name}`,
        phone: data.phone || "",
        country: data.country,
        kyc_status: "auto_verified",
      })
      .eq("id", userId);

    if (profileError) {
      console.error("[CREATE TRADER] Profile update failed:", profileError);
      await adminClient.auth.admin.deleteUser(userId);
      return { error: profileError.message };
    }
    console.log("[CREATE TRADER] Profile updated");

    // Create trader profile
    console.log("[CREATE TRADER] Creating trader profile...");
    const { data: traderData, error: traderError } = await adminClient
      .from("traders")
      .insert({
        user_id: userId,
        display_name: data.display_name,
        bio: data.bio || "",
        risk_score: data.risk_score || 5,
        min_copy_amount: data.min_copy_amount || 100,
        max_followers: data.max_followers || 0,
        commission_rate: data.commission_rate || 10,
        total_followers: data.total_followers || 0,
        total_profit: data.total_profit || 0,
        win_rate: data.win_rate || 0,
        total_trades: data.total_trades || 0,
        status: "active",
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (traderError || !traderData) {
      console.error("[CREATE TRADER] Trader creation failed:", traderError);
      await adminClient.auth.admin.deleteUser(userId);
      return { error: traderError?.message || "Failed to create trader" };
    }
    console.log("[CREATE TRADER] Trader created:", traderData.id);

    // Upload avatar if provided
    if (data.avatar) {
      console.log("[CREATE TRADER] Uploading avatar...");
      const buffer = Buffer.from(data.avatar.base64, "base64");
      const fileName = `traders/${traderData.id}/${Date.now()}.jpg`;
      
      const { error: uploadError } = await adminClient.storage
        .from("avatars")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        const { data: { publicUrl } } = adminClient.storage
          .from("avatars")
          .getPublicUrl(fileName);

        await adminClient
          .from("traders")
          .update({ avatar_url: publicUrl })
          .eq("id", traderData.id);
        console.log("[CREATE TRADER] Avatar uploaded:", publicUrl);
      } else {
        console.error("[CREATE TRADER] Avatar upload failed:", uploadError);
      }
    }

    // Create initial USDT balance
    console.log("[CREATE TRADER] Creating initial balance...");
    const { error: balanceError } = await adminClient
      .from("balances")
      .insert({
        user_id: userId,
        asset: "USDT",
        amount: 10000,
        account_type: "trading",
      });

    if (balanceError) {
      console.error("[CREATE TRADER] Balance creation failed:", balanceError);
    } else {
      console.log("[CREATE TRADER] Initial balance created");
    }

    console.log("[CREATE TRADER] Trader creation completed successfully");
    revalidatePath("/cpanel/traders");
    return { success: true, trader_id: traderData.id };
  } catch (error: any) {
    console.error("[CREATE TRADER] Unexpected error:", error);
    return { error: error.message };
  }
}
