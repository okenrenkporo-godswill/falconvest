"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  sendWithdrawalConfirmedEmail,
  sendWithdrawalRejectedEmail,
} from "@/lib/email";

export async function submitWithdrawal(data: {
  coin: string;
  amount: number;
  destinationAddress: string;
  network: string;
  accountType: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check balance for specific account type
  const { data: balance } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("asset", data.coin)
    .eq("account_type", data.accountType)
    .single();

  if (!balance || balance.amount < data.amount) {
    return { error: "Insufficient balance" };
  }

  // Create withdrawal request
  const { error } = await supabase.from("withdrawals").insert({
    user_id: user.id,
    coin: data.coin,
    amount: data.amount,
    usd_value: data.amount,
    destination_address: data.destinationAddress,
    network: data.network,
    account_type: data.accountType,
    status: "pending",
  });

  if (error) return { error: error.message };

  // Get user email for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  // Notify admin
  if (profile?.email) {
    try {
      const { notifyAdminWithdrawal } = await import("@/lib/email");
      await notifyAdminWithdrawal(profile.email, data.amount, data.coin);
    } catch (error) {
      console.error("Failed to notify admin:", error);
    }
  }

  revalidatePath("/dashboard/withdrawal");
  return { success: true };
}

export async function getUserWithdrawals() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", user.id)
    .order("requested_at", { ascending: false });

  return data || [];
}

export async function getUserBalances() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id);

  return data || [];
}

export async function getAllWithdrawals(page: number = 1, limit: number = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], totalPages: 0 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { data: [], totalPages: 0 };

  const adminClient = createAdminClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Fetch withdrawals without joins
  const { data: withdrawals, count } = await adminClient
    .from("withdrawals")
    .select("*", { count: "exact" })
    .order("requested_at", { ascending: false })
    .range(from, to);

  if (!withdrawals || withdrawals.length === 0)
    return { data: [], totalPages: 0 };

  // Get unique user IDs
  const userIds = [...new Set(withdrawals.map((w) => w.user_id))];

  // Fetch profiles separately
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, email, first_name, last_name, username")
    .in("id", userIds);

  // Map profiles to withdrawals
  const withdrawalsWithProfiles = withdrawals.map((withdrawal) => ({
    ...withdrawal,
    profiles: profiles?.find((p) => p.id === withdrawal.user_id) || {
      email: "Unknown",
      first_name: "Unknown",
      last_name: "User",
      username: "unknown",
    },
  }));

  return {
    data: withdrawalsWithProfiles,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function processWithdrawal(
  withdrawalId: string,
  action: "approve" | "reject",
  notes?: string,
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

  const { data: withdrawal } = await adminClient
    .from("withdrawals")
    .select("*")
    .eq("id", withdrawalId)
    .single();

  if (!withdrawal) return { error: "Withdrawal not found" };

  // Get user profile for email
  const { data: userProfile } = await adminClient
    .from("profiles")
    .select("email, first_name, last_name")
    .eq("id", withdrawal.user_id)
    .single();

  if (action === "approve") {
    // Debit balance with account_type
    const { data: debitResult } = await adminClient.rpc("debit_balance", {
      p_user_id: withdrawal.user_id,
      p_asset: withdrawal.coin,
      p_amount: withdrawal.amount,
      p_account_type: withdrawal.account_type,
    });

    if (!debitResult) {
      return { error: "Insufficient balance" };
    }

    const { error } = await adminClient
      .from("withdrawals")
      .update({
        status: "approved",
        processed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: notes,
      })
      .eq("id", withdrawalId);

    if (error) return { error: error.message };

    // Send confirmation email
    if (userProfile) {
      try {
        await sendWithdrawalConfirmedEmail(
          userProfile.email,
          userProfile.first_name,
          withdrawal.amount,
          withdrawal.coin,
          withdrawal.destination_address,
        );
      } catch (error) {
        console.error("Failed to send confirmation email:", error);
      }
    }
  } else {
    const { error } = await adminClient
      .from("withdrawals")
      .update({
        status: "rejected",
        rejection_reason: notes || "Rejected by admin",
        processed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: notes,
      })
      .eq("id", withdrawalId);

    if (error) return { error: error.message };

    // Send rejection email
    if (userProfile) {
      try {
        await sendWithdrawalRejectedEmail(
          userProfile.email,
          userProfile.first_name,
          withdrawal.amount,
          withdrawal.coin,
          notes,
        );
      } catch (error) {
        console.error("Failed to send rejection email:", error);
      }
    }
  }

  revalidatePath("/cpanel/withdrawals");
  revalidatePath("/dashboard/withdraw");
  return { success: true };
}
