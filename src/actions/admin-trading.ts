"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Get all trades with pagination
export async function getAllTrades(page: number = 1, limit: number = 25) {
  const adminClient = createAdminClient();
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, count } = await adminClient
    .from("trades")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  return { 
    data: data || [], 
    totalPages: Math.ceil((count || 0) / limit) 
  };
}

// Get all open positions
export async function getAllPositions() {
  const adminClient = createAdminClient();
  
  const { data } = await adminClient
    .from("positions")
    .select("*")
    .eq("status", "open")
    .order("opened_at", { ascending: false });

  return data || [];
}

// Admin force close position
export async function adminClosePosition(positionId: string, closePrice: number) {
  const adminClient = createAdminClient();
  
  // Get position
  const { data: position } = await adminClient
    .from("positions")
    .select("*")
    .eq("id", positionId)
    .single();

  if (!position) return { error: "Position not found" };

  // Calculate PnL
  const priceDiff = position.side === "long"
    ? closePrice - position.entry_price
    : position.entry_price - closePrice;
  const pnl = (priceDiff / position.entry_price) * position.amount * closePrice * position.leverage;
  const margin = (position.amount * position.entry_price) / position.leverage;

  // Update position
  await adminClient.from("positions").update({
    status: "closed",
    closed_at: new Date().toISOString(),
    closed_price: closePrice,
    realized_pnl: pnl,
  }).eq("id", positionId);

  // Return margin + PnL
  await adminClient.rpc("credit_balance", {
    p_user_id: position.user_id,
    p_asset: "USDT",
    p_amount: margin + pnl,
    p_account_type: "trading",
  });

  revalidatePath("/cpanel/trades");
  return { success: true, pnl };
}

// Get trading stats
export async function getTradingStats() {
  const adminClient = createAdminClient();
  
  const { data: trades } = await adminClient.from("trades").select("total, fee");
  const { data: positions } = await adminClient.from("positions").select("realized_pnl, unrealized_pnl");

  const totalVolume = trades?.reduce((sum, t) => sum + Number(t.total), 0) || 0;
  const totalFees = trades?.reduce((sum, t) => sum + Number(t.fee), 0) || 0;
  const totalPnL = positions?.reduce((sum, p) => sum + Number(p.realized_pnl || 0) + Number(p.unrealized_pnl || 0), 0) || 0;

  return {
    totalTrades: trades?.length || 0,
    totalVolume,
    totalFees,
    openPositions: positions?.filter(p => p.realized_pnl === null).length || 0,
    totalPnL,
  };
}
