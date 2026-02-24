"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Admin creates a copy trade position and immediately closes it with P&L
export async function adminCreateCopyPosition(data: {
  copyTradeId: string;
  pair: string;
  side: "buy" | "sell";
  amount: number;
  entryPrice: number;
  exitPrice: number;
  profitLoss: number;
}) {
  console.log("🎯 Admin creating copy position:", data);

  const adminClient = createAdminClient();

  // Get copy trade details (simple query without FK joins to avoid constraint name issues)
  const { data: copyTrade, error: copyTradeError } = await adminClient
    .from("copy_trades")
    .select("id, user_id, trader_id, copy_amount, total_profit, total_trades")
    .eq("id", data.copyTradeId)
    .single();

  console.log("📋 Copy trade details:", copyTrade);
  if (copyTradeError) console.log("❌ Copy trade query error:", copyTradeError);

  if (!copyTrade) return { error: "Copy trade not found" };

  // Fetch user profile and trader info separately
  const [{ data: userProfile }, { data: traderInfo }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", copyTrade.user_id)
      .single(),
    adminClient
      .from("traders")
      .select("display_name")
      .eq("id", copyTrade.trader_id)
      .single(),
  ]);

  // Attach profile and trader to copyTrade for later use
  const copyTradeWithRelations = {
    ...copyTrade,
    profiles: userProfile,
    traders: traderInfo,
  };

  // Create position (already closed)
  console.log("📝 Creating position...");
  const { data: position, error } = await adminClient
    .from("copy_trade_positions")
    .insert({
      copy_trade_id: data.copyTradeId,
      user_id: copyTrade.user_id,
      trader_id: copyTrade.trader_id,
      pair: data.pair,
      side: data.side,
      entry_price: data.entryPrice,
      exit_price: data.exitPrice,
      amount: data.amount,
      profit_loss: data.profitLoss,
      status: "closed",
      closed_by: "admin",
      closed_at: new Date().toISOString(),
    })
    .select()
    .single();

  console.log("✅ Position created:", position);
  console.log("❌ Position error:", error);

  if (error) return { error: error.message };

  // Update copy trade totals
  const newProfit = copyTrade.total_profit + data.profitLoss;
  const newTrades = copyTrade.total_trades + 1;

  console.log("📊 Updating copy trade totals:", {
    oldProfit: copyTrade.total_profit,
    newProfit,
    oldTrades: copyTrade.total_trades,
    newTrades
  });

  await adminClient
    .from("copy_trades")
    .update({
      total_profit: newProfit,
      total_trades: newTrades,
    })
    .eq("id", data.copyTradeId);

  // Update user balance with P&L
  if (data.profitLoss !== 0) {
    if (data.profitLoss > 0) {
      console.log("💰 Crediting user balance:", data.profitLoss);
      await adminClient.rpc("credit_balance", {
        p_user_id: copyTrade.user_id,
        p_asset: "USDT",
        p_amount: data.profitLoss,
        p_account_type: "trading",
      });
    } else {
      console.log("💸 Debiting user balance:", Math.abs(data.profitLoss));
      await adminClient.rpc("debit_balance", {
        p_user_id: copyTrade.user_id,
        p_asset: "USDT",
        p_amount: Math.abs(data.profitLoss),
        p_account_type: "trading",
      });
    }
  }

  console.log("✅ Trade simulation complete");

  // Send email notification to user
  try {
    const { sendCopyTradeResultEmail } = await import("@/lib/email");
    const userProfileData = copyTradeWithRelations.profiles as any;
    const trader = copyTradeWithRelations.traders as any;
    const userName = `${userProfileData?.first_name || ""} ${userProfileData?.last_name || ""}`.trim() || "Trader";
    const outcome = data.profitLoss >= 0 ? "profit" : "loss";

    await sendCopyTradeResultEmail(
      userProfileData?.email,
      userName,
      trader.display_name,
      data.pair,
      outcome
    );
  } catch (emailError) {
    console.error("Failed to send copy trade result email:", emailError);
  }

  revalidatePath("/cpanel/copy-trades");
  return { success: true, position };
}
