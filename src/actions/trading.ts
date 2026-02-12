"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Execute market order
export async function executeMarketOrder(data: {
  pair: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
}) {
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  
  if (!user) {
    return { error: "Unauthorized" };
  }

  const total = data.amount * data.price;
  const fee = total * 0.001; // 0.1% fee
  const asset = data.side === "buy" ? "USDT" : data.pair.replace("/USDT", "");


  // Check balance
  const { data: balance } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("asset", asset)
    .eq("account_type", "trading")
    .single();


  const required = data.side === "buy" ? total + fee : data.amount;
  
  if (!balance || balance.amount < required) {
    return { error: "Insufficient balance" };
  }

  // Deduct balance
  const { error: debitError } = await supabase.rpc("debit_balance", {
    p_user_id: user.id,
    p_asset: asset,
    p_amount: required,
    p_account_type: "trading",
  });

  if (debitError) {
    return { error: debitError.message };
  }

  // Credit opposite asset
  const creditAsset = data.side === "buy" ? data.pair.replace("/USDT", "") : "USDT";
  const creditAmount = data.side === "buy" ? data.amount : total - fee;
  
  const { error: creditError } = await supabase.rpc("credit_balance", {
    p_user_id: user.id,
    p_asset: creditAsset,
    p_amount: creditAmount,
    p_account_type: "trading",
  });

  if (creditError) {
    return { error: creditError.message };
  }

  // Record trade
  const { error: tradeError } = await supabase.from("trades").insert({
    user_id: user.id,
    pair: data.pair,
    side: data.side,
    type: "market",
    amount: data.amount,
    price: data.price,
    total,
    fee,
    status: "completed",
  });

  if (tradeError) {
    return { error: tradeError.message };
  }

  // Get user email for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  // Notify admin
  if (profile?.email) {
    try {
      const { notifyAdminTrade } = await import("@/lib/email");
      await notifyAdminTrade(profile.email, data.pair, data.side, data.amount, total);
    } catch (error) {
    }
  }
  
  revalidatePath("/dashboard/trading");
  return { success: true };
}

// Open position (for futures/margin)
export async function openPosition(data: {
  pair: string;
  side: "long" | "short";
  amount: number;
  price: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const margin = (data.amount * data.price) / data.leverage;
  const fee = margin * 0.001;

  // Check balance
  const { data: balance } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("asset", "USDT")
    .eq("account_type", "trading")
    .single();

  if (!balance || balance.amount < margin + fee) {
    return { error: "Insufficient margin" };
  }

  // Lock margin
  await supabase.rpc("debit_balance", {
    p_user_id: user.id,
    p_asset: "USDT",
    p_amount: margin + fee,
    p_account_type: "trading",
  });

  // Create position
  const liquidationPrice = data.side === "long"
    ? data.price * (1 - 0.9 / data.leverage)
    : data.price * (1 + 0.9 / data.leverage);

  const { data: position, error } = await supabase.from("positions").insert({
    user_id: user.id,
    pair: data.pair,
    side: data.side,
    entry_price: data.price,
    amount: data.amount,
    leverage: data.leverage,
    liquidation_price: liquidationPrice,
    stop_loss: data.stopLoss,
    take_profit: data.takeProfit,
    status: "open",
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/trading");
  return { success: true, position };
}

// Close position
export async function closePosition(positionId: string, closePrice: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get position
  const { data: position } = await supabase
    .from("positions")
    .select("*")
    .eq("id", positionId)
    .eq("user_id", user.id)
    .single();

  if (!position) return { error: "Position not found" };

  // Calculate PnL
  const priceDiff = position.side === "long"
    ? closePrice - position.entry_price
    : position.entry_price - closePrice;
  const pnl = (priceDiff / position.entry_price) * position.amount * closePrice * position.leverage;
  const margin = (position.amount * position.entry_price) / position.leverage;

  // Update position
  await supabase.from("positions").update({
    status: "closed",
    closed_at: new Date().toISOString(),
    closed_price: closePrice,
    realized_pnl: pnl,
  }).eq("id", positionId);

  // Return margin + PnL
  await supabase.rpc("credit_balance", {
    p_user_id: user.id,
    p_asset: "USDT",
    p_amount: margin + pnl,
    p_account_type: "trading",
  });

  revalidatePath("/dashboard/trading");
  return { success: true, pnl };
}

// Get user positions
export async function getUserPositions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { positions: [] };

  const { data } = await supabase
    .from("positions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "open")
    .order("opened_at", { ascending: false });

  return { positions: data || [] };
}

// Get user trade history
export async function getUserTrades(page: number = 1, limit: number = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { trades: [], totalPages: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count } = await supabase
    .from("trades")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  return { 
    trades: data || [], 
    totalPages: Math.ceil((count || 0) / limit) 
  };
}

// Get trading balance
export async function getTradingBalance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { balance: 0 };

  const { data: balances } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("asset", "USDT")
    .eq("account_type", "trading")
    .maybeSingle();

  return { balance: balances?.amount || 0 };
}
