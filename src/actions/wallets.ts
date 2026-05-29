"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ============================================
// PLATFORM WALLETS (for deposits - company addresses)
// ============================================

export async function getAllPlatformWallets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return [];

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("platform_wallets")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

export async function createPlatformWallet(data: {
  symbol: string;
  fullname: string;
  walletAddress: string;
  network: string;
  tag?: string;
  logoFile?: string;
}) {
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

  let logoUrl = null;

  if (data.logoFile) {
    try {
      const base64Data = data.logoFile.split(",")[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const fileName = `${data.symbol.toLowerCase()}-${Date.now()}.png`;
      const { error: uploadError } = await adminClient.storage
        .from("wallet-logos")
        .upload(fileName, bytes, {
          contentType: "image/png",
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = adminClient.storage
          .from("wallet-logos")
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }
    } catch (error) {
      console.error("Logo upload error:", error);
    }
  }

  const { error } = await adminClient.from("platform_wallets").insert({
    symbol: data.symbol,
    fullname: data.fullname,
    wallet_address: data.walletAddress,
    network: data.network,
    tag: data.tag,
    logo_url: logoUrl,
    status: "active",
  });

  if (error) return { error: error.message };

  revalidatePath("/cpanel/wallets");
  return { success: true };
}

export async function updatePlatformWallet(
  walletId: string,
  data: {
    symbol?: string;
    fullname?: string;
    walletAddress?: string;
    network?: string;
    tag?: string;
    status?: string;
    logoFile?: string;
  }
) {
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

  let logoUrl = undefined;

  // Upload new logo if provided
  if (data.logoFile) {
    try {
      const base64Data = data.logoFile.split(",")[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const fileName = `${(data.symbol || 'wallet').toLowerCase()}-${Date.now()}.png`;
      const { error: uploadError } = await adminClient.storage
        .from("wallet-logos")
        .upload(fileName, bytes, {
          contentType: "image/png",
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = adminClient.storage
          .from("wallet-logos")
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }
    } catch (error) {
      console.error("Logo upload error:", error);
    }
  }

  const updateData: any = {
    wallet_address: data.walletAddress,
    network: data.network,
    tag: data.tag,
    status: data.status,
  };

  if (data.symbol) updateData.symbol = data.symbol;
  if (data.fullname) updateData.fullname = data.fullname;
  if (logoUrl) updateData.logo_url = logoUrl;

  const { error } = await adminClient
    .from("platform_wallets")
    .update(updateData)
    .eq("id", walletId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/wallets");
  return { success: true };
}

export async function deletePlatformWallet(walletId: string) {
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

  // Get wallet to check for logo to clean up
  const { data: wallet } = await adminClient
    .from("platform_wallets")
    .select("logo_url, symbol")
    .eq("id", walletId)
    .single();

  // Delete the wallet
  const { error } = await adminClient
    .from("platform_wallets")
    .delete()
    .eq("id", walletId);

  if (error) return { error: error.message };

  // Clean up logo from storage if it exists
  if (wallet?.logo_url) {
    try {
      const fileName = wallet.logo_url.split("/").pop();
      if (fileName) {
        await adminClient.storage.from("wallet-logos").remove([fileName]);
      }
    } catch (e) {
      console.error("Logo cleanup error:", e);
    }
  }

  revalidatePath("/cpanel/wallets");
  return { success: true };
}

export async function getActivePlatformWallets() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("platform_wallets")
    .select("*")
    .eq("status", "active")
    .order("symbol");

  return data || [];
}

// ============================================
// USER WALLETS (for withdrawals - user addresses)
// ============================================

export async function getUserWallets(userId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const targetUserId = userId || user.id;

  const { data } = await supabase
    .from("user_wallets")
    .select("*")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function addUserWallet(data: {
  symbol: string;
  wallet_address: string;
  network: string;
  tag?: string | null;
  label?: string | null;
  is_default?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  console.log("addUserWallet - Input data:", data);
  console.log("addUserWallet - User ID:", user.id);

  // If setting as default, unset other defaults for this coin
  if (data.is_default) {
    console.log("Unsetting other defaults for coin:", data.symbol);
    await supabase
      .from("user_wallets")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("symbol", data.symbol);
  }

  const insertData = {
    user_id: user.id,
    symbol: data.symbol,
    wallet_address: data.wallet_address,
    network: data.network,
    tag: data.tag,
    label: data.label,
    is_default: data.is_default || false,
  };

  console.log("addUserWallet - Inserting:", insertData);

  const { error } = await supabase.from("user_wallets").insert(insertData);

  if (error) {
    console.error("addUserWallet - Error:", error);
    return { error: error.message };
  }

  console.log("addUserWallet - Success!");
  revalidatePath("/dashboard/account");
  return { success: true };
}

export async function updateUserWallet(
  walletId: string,
  data: {
    label?: string;
    isDefault?: boolean;
    status?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // If setting as default, unset other defaults
  if (data.isDefault) {
    const { data: wallet } = await supabase
      .from("user_wallets")
      .select("symbol")
      .eq("id", walletId)
      .single();

    if (wallet) {
      await supabase
        .from("user_wallets")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("symbol", wallet.symbol);
    }
  }

  const { error } = await supabase
    .from("user_wallets")
    .update({
      label: data.label,
      is_default: data.isDefault,
      status: data.status,
    })
    .eq("id", walletId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/account");
  return { success: true };
}

export async function deleteUserWallet(walletId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_wallets")
    .delete()
    .eq("id", walletId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/account");
  return { success: true };
}
