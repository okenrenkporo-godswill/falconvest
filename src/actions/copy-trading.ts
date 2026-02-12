"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Get all active traders
export async function getActiveTraders() {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("traders")
    .select("*")
    .eq("status", "active")
    .order("total_followers", { ascending: false });

  return data || [];
}

// Get trader by ID with details
export async function getTraderById(traderId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("traders")
    .select("*")
    .eq("id", traderId)
    .single();

  return data;
}

// Start copying a trader
export async function startCopyTrading(data: {
  traderId: string;
  copyAmount: number;
  copyPercentage?: number;
}) {
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  
  if (!user) return { error: "Unauthorized" };

  // Check if already copying this trader
  const { data: existing } = await supabase
    .from("copy_trades")
    .select("id")
    .eq("user_id", user.id)
    .eq("trader_id", data.traderId)
    .eq("status", "active")
    .single();


  if (existing) {
    return { error: "Already copying this trader" };
  }

  // Check balance (trading account)
  const { data: balance } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("asset", "USDT") // Assuming USDT for copy trading
    .eq("account_type", "trading")
    .single();


  if (!balance || balance.amount < data.copyAmount) {
    return { error: "Insufficient balance in trading account" };
  }

  // Create copy trade
  const { error } = await supabase.from("copy_trades").insert({
    user_id: user.id,
    trader_id: data.traderId,
    copy_amount: data.copyAmount,
    copy_percentage: data.copyPercentage,
    status: "active",
  });


  if (error) return { error: error.message };

  // Update trader followers count
  const adminClient = createAdminClient();
  await adminClient.rpc("increment_trader_followers", { trader_id: data.traderId });

  // Get trader and user info for notification
  const { data: trader } = await supabase
    .from("traders")
    .select("display_name")
    .eq("id", data.traderId)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  // Notify admin
  if (profile?.email && trader?.display_name) {
    try {
      const { notifyAdminCopyTrade } = await import("@/lib/email");
      await notifyAdminCopyTrade(profile.email, trader.display_name, data.copyAmount);
    } catch (error) {
      console.error("Failed to notify admin:", error);
    }
  }

  revalidatePath("/dashboard/copy-trading");
  return { success: true };
}

// Stop copying a trader
export async function stopCopyTrading(copyTradeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("copy_trades")
    .update({
      status: "stopped",
      stopped_at: new Date().toISOString(),
      stopped_by: "user",
    })
    .eq("id", copyTradeId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/copy-trading");
  return { success: true };
}

// Get user's active copy trades
export async function getUserCopyTrades() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const adminClient = createAdminClient();
  
  // Fetch copy trades
  const { data: copyTrades } = await adminClient
    .from("copy_trades")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!copyTrades || copyTrades.length === 0) return [];

  // Get trader IDs
  const traderIds = [...new Set(copyTrades.map((ct) => ct.trader_id))];

  // Fetch traders
  const { data: traders } = await adminClient
    .from("traders")
    .select("*")
    .in("id", traderIds);

  // Map traders to copy trades
  const result = copyTrades.map((ct) => ({
    ...ct,
    trader: traders?.find((t) => t.id === ct.trader_id),
  }));

  return result;
}
