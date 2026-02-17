"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Get all traders (pending, active, suspended) with pagination
export async function getAllTraders(page: number = 1, limit: number = 15) {
  const adminClient = createAdminClient();
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, count } = await adminClient
    .from("traders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    data: data || [],
    totalPages: Math.ceil((count || 0) / limit)
  };
}

// Approve trader
export async function approveTrader(traderId: string, adminUserId: string) {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from("traders")
    .update({
      status: "active",
      approved_at: new Date().toISOString(),
      approved_by: adminUserId,
    })
    .eq("id", traderId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/traders");
  return { success: true };
}

// Reject/suspend trader
export async function updateTraderStatus(traderId: string, status: "suspended" | "inactive") {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from("traders")
    .update({ status })
    .eq("id", traderId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/traders");
  return { success: true };
}

// Get all copy trades grouped by user (optionally filter by user_id)
export async function getAllCopyTrades(page: number = 1, limit: number = 20, userId?: string) {
  const adminClient = createAdminClient();
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  let query = adminClient
    .from("copy_trades")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: copyTrades, count } = await query.range(from, to);

  if (!copyTrades) return { data: [], totalPages: 0, groupedData: [] };

  // Get unique user and trader IDs
  const userIds = [...new Set(copyTrades.map((ct) => ct.user_id))];
  const traderIds = [...new Set(copyTrades.map((ct) => ct.trader_id))];

  // Fetch users and traders
  const [{ data: users }, { data: traders }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, full_name, first_name, last_name, email")
      .in("id", userIds),
    adminClient
      .from("traders")
      .select("*")
      .in("id", traderIds),
  ]);

  // Map data with user and trader info
  const data = copyTrades.map((ct) => {
    const user = users?.find((u) => u.id === ct.user_id);
    return {
      ...ct,
      user_name: user?.full_name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Unknown",
      user_email: user?.email || "",
      trader: traders?.find((t) => t.id === ct.trader_id),
    };
  });

  // Group by user
  const groupedData = userIds.map((userId) => {
    const userCopyTrades = data.filter((ct) => ct.user_id === userId);
    const user = users?.find((u) => u.id === userId);
    return {
      user_id: userId,
      user_name: user?.full_name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Unknown",
      user_email: user?.email || "",
      copy_trades: userCopyTrades,
      total_copy_trades: userCopyTrades.length,
      active_copy_trades: userCopyTrades.filter((ct) => ct.status === "active").length,
      total_profit: userCopyTrades.reduce((sum, ct) => sum + Number(ct.total_profit || 0), 0),
    };
  });
  
  return {
    data,
    groupedData,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

// Admin force stop copy trade
export async function adminStopCopyTrade(copyTradeId: string) {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from("copy_trades")
    .update({
      status: "stopped",
      stopped_at: new Date().toISOString(),
      stopped_by: "admin",
    })
    .eq("id", copyTradeId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/copy-trades");
  return { success: true };
}

// Get copy trade positions/results
export async function getCopyTradeResults(copyTradeId: string) {
  const adminClient = createAdminClient();
  
  const { data, error } = await adminClient
    .from("copy_trade_positions")
    .select("*")
    .eq("copy_trade_id", copyTradeId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] };
  
  return { data: data || [] };
}
