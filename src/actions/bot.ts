"use server";

import { createClient } from "@/lib/supabase/server";
import { getCryptoPrices } from "@/lib/crypto-prices";
import { revalidatePath } from "next/cache";

export async function activateBotPlan(planType: "silver" | "gold" | "diamond", paymentAsset: "USDT" | "BTC") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Load custom bot plan details for this user
  const { data: plan, error: planError } = await supabase
    .from("user_bot_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("plan_type", planType)
    .single();

  if (planError || !plan) {
    return { error: "Bot plan not found for your account" };
  }

  if (plan.status === "active") {
    return { error: "This bot plan is already active" };
  }

  const price = Number(plan.price);
  if (price <= 0) {
    // If price is 0, activate immediately
    const { error: updateError } = await supabase
      .from("user_bot_plans")
      .update({ status: "active", is_active: true, updated_at: new Date().toISOString() })
      .eq("id", plan.id);

    if (updateError) return { error: updateError.message };
    revalidatePath("/dashboard/trading-bot");
    return { success: true };
  }

  // Fetch trading balance
  const { data: balance, error: balanceError } = await supabase
    .from("balances")
    .select("id, amount")
    .eq("user_id", user.id)
    .eq("asset", paymentAsset)
    .eq("account_type", "trading")
    .single();

  if (balanceError || !balance) {
    return { error: `Insufficient ${paymentAsset} balance in trading account.` };
  }

  let priceInAsset = price;
  if (paymentAsset === "BTC") {
    const prices = await getCryptoPrices(["BTC"]);
    const btcPrice = prices.BTC || 0;
    if (btcPrice <= 0) {
      return { error: "Failed to fetch live BTC price for conversion" };
    }
    priceInAsset = price / btcPrice;
  }

  const currentAmount = Number(balance.amount);
  if (currentAmount < priceInAsset) {
    return { error: `Insufficient ${paymentAsset} balance. Required: ${paymentAsset === "BTC" ? "₿" : "$"}${priceInAsset.toFixed(paymentAsset === "BTC" ? 8 : 2)}` };
  }

  // Deduct balance
  const { error: debitError } = await supabase
    .from("balances")
    .update({ amount: currentAmount - priceInAsset })
    .eq("id", balance.id);

  if (debitError) {
    return { error: "Failed to debit balance" };
  }

  // Set plan to active
  const { error: updateError } = await supabase
    .from("user_bot_plans")
    .update({ status: "active", is_active: true, updated_at: new Date().toISOString() })
    .eq("id", plan.id);

  if (updateError) {
    return { error: "Failed to update bot plan status" };
  }

  revalidatePath("/dashboard/trading-bot");
  return { success: true };
}
