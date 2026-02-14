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

// Get all copy trades with pagination
export async function getAllCopyTrades(page: number = 1, limit: number = 20) {
  const adminClient = createAdminClient();
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data: copyTrades, count } = await adminClient
    .from("copy_trades")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!copyTrades) return { data: [], totalPages: 0 };

  // Get trader IDs only
  const traderIds = [...new Set(copyTrades.map((ct) => ct.trader_id))];

  // Fetch traders
  const { data: traders } = await adminClient
    .from("traders")
    .select("*")
    .in("id", traderIds);

  // Map data
  const data = copyTrades.map((ct) => ({
    ...ct,
    trader: traders?.find((t) => t.id === ct.trader_id),
  }));
  
  return {
    data,
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
