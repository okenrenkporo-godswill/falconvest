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
    .select("id, copy_amount")
    .eq("user_id", user.id)
    .eq("trader_id", data.traderId)
    .eq("status", "active")
    .single();


  if (existing) {
    return { 
      error: "You are already copying this trader", 
      suggestion: "You can increase your copy amount from 'My Copy Trades'",
      existingAmount: existing.copy_amount
    };
  }

  // 1. Call atomic RPC to handle balance and registration
  const { data: result, error: rpcError } = await supabase.rpc("start_copy_trade_atomic", {
    p_user_id: user.id,
    p_trader_id: data.traderId,
    p_copy_amount: data.copyAmount,
    p_copy_percentage: data.copyPercentage || null
  });

  if (rpcError) return { error: rpcError.message };
  if (!result.success) return { error: result.error };

  // 2. Update trader followers count
  const adminClient = createAdminClient();
  await adminClient.rpc("increment_trader_followers", { trader_id: data.traderId });

  // 3. Get trader and user info for notification
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

  // 4. Notify admin
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

// Increase copy amount for existing copy trade
export async function increaseCopyAmount(copyTradeId: string, additionalAmount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get current copy trade
  const { data: copyTrade } = await supabase
    .from("copy_trades")
    .select("copy_amount, trader_id")
    .eq("id", copyTradeId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!copyTrade) return { error: "Copy trade not found or inactive" };

  // Call atomic RPC
  const { data: result, error: rpcError } = await supabase.rpc("increase_copy_amount_atomic", {
    p_user_id: user.id,
    p_copy_trade_id: copyTradeId,
    p_additional_amount: additionalAmount
  });

  if (rpcError) return { error: rpcError.message };
  if (!result.success) return { error: result.error };

  // Fetch the new amount to return to the UI (optional but good for UX)
  const { data: updatedTrade } = await supabase
    .from("copy_trades")
    .select("copy_amount")
    .eq("id", copyTradeId)
    .single();

  revalidatePath("/dashboard/my-copy-trades");
  return { success: true, newAmount: updatedTrade?.copy_amount };
}

// Stop copying a trader
export async function stopCopyTrading(copyTradeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Call atomic RPC to stop and refund
  const { data: result, error: rpcError } = await supabase.rpc("stop_copy_trade_atomic", {
    p_user_id: user.id,
    p_copy_trade_id: copyTradeId
  });

  if (rpcError) return { error: rpcError.message };
  if (!result.success) return { error: result.error };

  revalidatePath("/dashboard/copy-trading");
  revalidatePath("/dashboard/my-copy-trades");
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

  // Fetch actual trade counts from copy_trade_positions
  const copyTradeIds = copyTrades.map(ct => ct.id);
  const { data: positions } = await adminClient
    .from("copy_trade_positions")
    .select("copy_trade_id")
    .in("copy_trade_id", copyTradeIds);

  // Count positions per copy trade
  const tradeCounts: Record<string, number> = {};
  positions?.forEach(pos => {
    tradeCounts[pos.copy_trade_id] = (tradeCounts[pos.copy_trade_id] || 0) + 1;
  });

  // Map traders to copy trades with actual trade count
  const result = copyTrades.map((ct) => ({
    ...ct,
    total_trades: tradeCounts[ct.id] || 0,
    trader: traders?.find((t) => t.id === ct.trader_id),
  }));

  return result;
}

// Get copy trade results for a specific copy trade
export async function getCopyTradeResults(copyTradeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log("[getCopyTradeResults] User:", user?.id);
  console.log("[getCopyTradeResults] Copy Trade ID:", copyTradeId);
  
  if (!user) return { data: [] };

  // Verify the copy trade belongs to the user
  const { data: copyTrade, error: copyTradeError } = await supabase
    .from("copy_trades")
    .select("id")
    .eq("id", copyTradeId)
    .eq("user_id", user.id)
    .single();

  console.log("[getCopyTradeResults] Copy Trade:", copyTrade);
  console.log("[getCopyTradeResults] Copy Trade Error:", copyTradeError);

  if (!copyTrade) return { data: [] };

  // Fetch copy trade results
  const { data: results, error: resultsError } = await supabase
    .from("copy_trade_positions")
    .select("*")
    .eq("copy_trade_id", copyTradeId)
    .order("created_at", { ascending: false });

  console.log("[getCopyTradeResults] Results count:", results?.length);
  console.log("[getCopyTradeResults] Results error:", resultsError);

  return { data: results || [] };
}
