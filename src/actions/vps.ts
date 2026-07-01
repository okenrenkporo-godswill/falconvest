"use server";

import { createClient } from "@/lib/supabase/server";
import { getCryptoPrices } from "@/lib/crypto-prices";
import { revalidatePath } from "next/cache";

export async function payVpsRenewal(asset: "USDT" | "BTC") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get user profile for VPS price
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("vps_renewal_price, vps_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Failed to load user profile details" };
  }

  if (profile.vps_status !== "expired") {
    return { error: "VPS subscription is not expired" };
  }

  const renewalPrice = Number(profile.vps_renewal_price);
  if (renewalPrice <= 0) {
    // If renewal price is 0, just activate it directly
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ vps_status: "active" })
      .eq("id", user.id);

    if (updateError) return { error: updateError.message };
    revalidatePath("/", "layout");
    return { success: true };
  }

  // Get current asset balance (Trading account)
  const { data: balance, error: balanceError } = await supabase
    .from("balances")
    .select("id, amount")
    .eq("user_id", user.id)
    .eq("asset", asset)
    .eq("account_type", "trading")
    .single();

  if (balanceError || !balance) {
    return { error: `Insufficient ${asset} balance in trading account.` };
  }

  let priceInAsset = renewalPrice;
  if (asset === "BTC") {
    const prices = await getCryptoPrices(["BTC"]);
    const btcPrice = prices.BTC || 0;
    if (btcPrice <= 0) {
      return { error: "Failed to fetch live BTC price for conversion" };
    }
    priceInAsset = renewalPrice / btcPrice;
  }

  const currentAmount = Number(balance.amount);
  if (currentAmount < priceInAsset) {
    return { error: `Insufficient ${asset} balance. Required: ${asset === "BTC" ? "₿" : "$"}${priceInAsset.toFixed(asset === "BTC" ? 8 : 2)}` };
  }

  // Perform debit of asset balance and set vps_status = active
  const { error: debitError } = await supabase
    .from("balances")
    .update({ amount: currentAmount - priceInAsset })
    .eq("id", balance.id);

  if (debitError) {
    return { error: "Failed to debit balance" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ vps_status: "active" })
    .eq("id", user.id);

  if (updateError) {
    return { error: "Failed to update VPS status" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
