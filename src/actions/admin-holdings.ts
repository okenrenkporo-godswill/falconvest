"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAllHoldings() {
  const adminClient = createAdminClient();
  
  const { data: balances } = await adminClient
    .from("balances")
    .select("user_id, asset, amount, account_type")
    .gt("amount", 0)
    .order("amount", { ascending: false });

  if (!balances) return [];

  // Group by user and asset
  const grouped = balances.reduce((acc: any, bal) => {
    const key = `${bal.user_id}-${bal.asset}`;
    if (!acc[key]) {
      acc[key] = {
        user_id: bal.user_id,
        asset: bal.asset,
        total: 0,
        trading: 0,
        staking: 0,
      };
    }
    acc[key].total += Number(bal.amount);
    if (bal.account_type === "trading") {
      acc[key].trading = Number(bal.amount);
    } else if (bal.account_type === "staking") {
      acc[key].staking = Number(bal.amount);
    }
    return acc;
  }, {});

  return Object.values(grouped);
}

export async function getHoldingsStats() {
  const adminClient = createAdminClient();
  
  const { data: balances } = await adminClient
    .from("balances")
    .select("asset, amount")
    .gt("amount", 0);

  if (!balances) return { totalAssets: 0, totalUsers: 0, totalValue: 0 };

  const uniqueAssets = new Set(balances.map(b => b.asset)).size;
  const uniqueUsers = new Set(balances.map((b: any) => b.user_id)).size;
  const totalValue = balances.reduce((sum, b) => sum + Number(b.amount), 0);

  return {
    totalAssets: uniqueAssets,
    totalUsers: uniqueUsers,
    totalValue,
  };
}
