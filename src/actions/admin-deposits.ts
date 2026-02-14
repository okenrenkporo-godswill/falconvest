"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendDepositConfirmedEmail, sendDepositRejectedEmail } from "@/lib/email";

export async function getAllDeposits(page: number = 1, limit: number = 20) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("Admin deposits: No user found");
    return { data: [], totalPages: 0 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("Admin deposits: User profile", { userId: user.id, role: profile?.role });

  if (profile?.role !== "admin") {
    console.log("Admin deposits: User is not admin");
    return { data: [], totalPages: 0 };
  }

  const adminClient = createAdminClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // First, fetch deposits without joins
  const { data, count, error } = await adminClient
    .from("deposits")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  console.log("Admin deposits: Query result", { 
    count: data?.length, 
    error,
    hasData: !!data,
    firstDeposit: data?.[0]
  });

  if (error || !data) return { data: [], totalPages: 0 };

  // Fetch profiles separately
  const userIds = [...new Set(data.map(d => d.user_id))];
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, email, first_name, last_name, username")
    .in("id", userIds);

  // Fetch platform wallets separately
  const walletIds = [...new Set(data.map(d => d.wallet_id).filter(Boolean))];
  const { data: wallets } = await adminClient
    .from("platform_wallets")
    .select("id, symbol, fullname, logo_url, network")
    .in("id", walletIds);

  // Map data together
  const depositsWithRelations = data.map(deposit => ({
    ...deposit,
    profiles: profiles?.find(p => p.id === deposit.user_id),
    platform_wallets: wallets?.find(w => w.id === deposit.wallet_id)
  }));

  return {
    data: depositsWithRelations,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function verifyDeposit(depositId: string, action: "confirm" | "reject", notes?: string) {
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

  // Get deposit details with user info
  const { data: deposit } = await adminClient
    .from("deposits")
    .select("*")
    .eq("id", depositId)
    .single();

  if (!deposit) return { error: "Deposit not found" };

  // Get user profile for email
  const { data: userProfile } = await adminClient
    .from("profiles")
    .select("email, first_name, last_name")
    .eq("id", deposit.user_id)
    .single();

  if (action === "confirm") {
    // Update deposit status
    const { error: updateError } = await adminClient
      .from("deposits")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: notes,
      })
      .eq("id", depositId);

    if (updateError) return { error: updateError.message };

    // Credit user balance with account_type
    const { error: balanceError } = await adminClient.rpc("credit_balance", {
      p_user_id: deposit.user_id,
      p_asset: deposit.coin,
      p_amount: deposit.amount,
      p_account_type: deposit.account_type,
    });

    if (balanceError) {
      // Rollback deposit status if balance update fails
      await adminClient
        .from("deposits")
        .update({ status: "pending" })
        .eq("id", depositId);
      return { error: "Failed to credit balance" };
    }

    // Send confirmation email
    if (userProfile) {
      try {
        await sendDepositConfirmedEmail(
          userProfile.email,
          userProfile.first_name,
          deposit.amount,
          deposit.coin,
          deposit.account_type
        );
      } catch (error) {
        console.error("Failed to send confirmation email:", error);
      }
    }
  } else {
    // Reject deposit
    const { error: updateError } = await adminClient
      .from("deposits")
      .update({
        status: "rejected",
        rejection_reason: notes || "Deposit rejected by admin",
        reviewed_by: user.id,
        admin_notes: notes,
      })
      .eq("id", depositId);

    if (updateError) return { error: updateError.message };

    // Send rejection email
    if (userProfile) {
      try {
        await sendDepositRejectedEmail(
          userProfile.email,
          userProfile.first_name,
          deposit.amount,
          deposit.coin,
          notes
        );
      } catch (error) {
        console.error("Failed to send rejection email:", error);
      }
    }
  }

  revalidatePath("/cpanel/deposits");
  revalidatePath("/dashboard/deposit");
  return { success: true };
}
