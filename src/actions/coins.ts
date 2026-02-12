"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAvailableCoins() {
  const adminClient = createAdminClient();
  
  const { data } = await adminClient
    .from("platform_wallets")
    .select("symbol, fullname, logo_url")
    .eq("status", "active")
    .order("symbol");

  if (!data) return [];

  // Get unique coins
  const uniqueCoins = Array.from(
    new Map(data.map(item => [item.symbol, item])).values()
  );

  return uniqueCoins.map(coin => ({
    label: `${coin.fullname} (${coin.symbol})`,
    value: coin.symbol,
    icon: coin.symbol === "BTC" ? "₿" : 
          coin.symbol === "ETH" ? "Ξ" : 
          coin.symbol === "USDT" ? "₮" :
          coin.symbol === "USDC" ? "$" :
          coin.symbol === "SOL" ? "◎" : coin.symbol.charAt(0),
    logo: coin.logo_url
  }));
}
