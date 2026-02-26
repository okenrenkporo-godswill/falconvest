"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// Notify admin immediately when user clicks "Confirm Deposits"
export async function notifyDepositIntent(amount: number, accountType: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (profile?.email) {
    try {
      const { notifyAdminDeposit } = await import("@/lib/email");
      await notifyAdminDeposit(profile.email, amount, `USD (${accountType})`);
    } catch (error) {
      console.error("Failed to notify admin of deposit intent:", error);
    }
  }

  return { success: true };
}

export async function submitDepositProof(data: {
  coin: string;
  amount: number;
  usdAmount: number;
  walletAddress: string;
  walletId?: string;
  accountType: string;
  proofImage: string;
}) {
  console.log("=== DEPOSIT SUBMISSION START ===");
  console.log("Input data:", {
    coin: data.coin,
    amount: data.amount,
    usdAmount: data.usdAmount,
    walletAddress: data.walletAddress,
    walletId: data.walletId,
    accountType: data.accountType,
    hasProofImage: !!data.proofImage
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("ERROR: No user found");
    return { error: "Unauthorized" };
  }

  console.log("User ID:", user.id);

  try {
    let fileName = null;

    // Only process image if provided
    if (data.proofImage) {
      console.log("Processing proof image...");
      // Convert base64 to Uint8Array
      const base64Data = data.proofImage.split(",")[1];
      if (base64Data) {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Upload proof to storage
        fileName = `${user.id}/${Date.now()}-deposit-proof.jpg`;
        console.log("Uploading to:", fileName);
        const { error: uploadError } = await supabase.storage
          .from("deposit-proofs")
          .upload(fileName, bytes, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          return { error: uploadError.message };
        }
        console.log("Upload successful");
      }
    } else {
      console.log("No proof image provided");
    }

    // Get wallet_id - use provided walletId or lookup by coin
    let walletId = data.walletId;

    if (!walletId) {
      console.log("Looking up wallet for coin:", data.coin);
      const { data: wallet, error: walletError } = await supabase
        .from("platform_wallets")
        .select("id")
        .eq("symbol", data.coin)
        .eq("status", "active")
        .limit(1)
        .single();

      if (walletError) {
        console.log("Wallet lookup error:", walletError);
      }

      walletId = wallet?.id;
      console.log("Found wallet ID:", walletId);
    }

    // Create deposit record
    const depositData = {
      user_id: user.id,
      wallet_id: walletId || null,
      coin: data.coin,
      amount: data.amount,
      usd_value: data.usdAmount,
      wallet_address: data.walletAddress,
      account_type: data.accountType.toLowerCase(),
      proof_path: fileName,
      status: "pending",
    };

    console.log("Inserting deposit record:", depositData);

    const { data: insertedData, error: insertError } = await supabase
      .from("deposits")
      .insert(depositData)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return { error: insertError.message };
    }

    console.log("Deposit inserted successfully:", insertedData);

    // Get user email for notification
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    // Notify admin
    if (profile?.email) {
      try {
        console.log("Sending admin notification...");
        const { notifyAdminDeposit } = await import("@/lib/email");
        await notifyAdminDeposit(profile.email, data.amount, data.coin);
        console.log("Admin notification sent");
      } catch (error) {
        // Log but don't fail the deposit
        console.error("Failed to notify admin of deposit:", error);
      }
    } else {
      console.error("No profile email found for deposit notification");
    }

    revalidatePath("/dashboard/deposit");
    console.log("=== DEPOSIT SUBMISSION SUCCESS ===");
    return { success: true };
  } catch (error: any) {
    console.error("Deposit proof error:", error);
    return { error: error.message || "Failed to submit deposit" };
  }
}

//   if (insertError) {
//     return { error: insertError.message };
//   }

//   revalidatePath("/dashboard");
//   return { success: true };
// }

export async function getUserDeposits() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("No user found");
    return [];
  }

  // Fetch deposits
  const { data: deposits, error } = await supabase
    .from("deposits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching deposits:", error);
    return [];
  }

  // Fetch all platform wallets using admin client (no RLS)
  const adminClient = createAdminClient();
  const { data: wallets } = await adminClient
    .from("platform_wallets")
    .select("id, symbol, fullname, logo_url, network");

  // Map deposits with wallet info
  const depositsWithWallets = (deposits || []).map((deposit) => {
    // Try to find wallet by wallet_id first, then by coin symbol
    const wallet = wallets?.find((w) => w.id === deposit.wallet_id) ||
      wallets?.find((w) => w.symbol === deposit.coin);

    return {
      ...deposit,
      wallets: wallet ? {
        logo_url: wallet.logo_url,
        symbol: wallet.symbol,
        fullname: wallet.fullname,
        network: wallet.network
      } : null
    };
  });

  return depositsWithWallets;
}

export async function getDepositProofUrl(proofPath: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Check if user owns this deposit or is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // If not admin, verify user owns the deposit
  if (!isAdmin) {
    const userId = proofPath.split("/")[0];
    if (userId !== user.id) {
      return { error: "Unauthorized" };
    }
  }

  const client = isAdmin ? createAdminClient() : supabase;

  const { data } = await client.storage
    .from("deposit-proofs")
    .createSignedUrl(proofPath, 3600);

  return data;
}
