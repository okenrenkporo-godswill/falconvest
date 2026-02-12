"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserHoldings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Unauthorized" };

  const { data: balances } = await supabase
    .from("balances")
    .select("asset, amount, account_type")
    .eq("user_id", user.id)
    .gt("amount", 0)
    .order("amount", { ascending: false });

  if (!balances) return { holdings: [] };

  // Group by asset
  const grouped = balances.reduce((acc: any, bal) => {
    if (!acc[bal.asset]) {
      acc[bal.asset] = {
        asset: bal.asset,
        total: 0,
        trading: 0,
        staking: 0,
      };
    }
    acc[bal.asset].total += Number(bal.amount);
    if (bal.account_type === "trading") {
      acc[bal.asset].trading = Number(bal.amount);
    } else if (bal.account_type === "staking") {
      acc[bal.asset].staking = Number(bal.amount);
    }
    return acc;
  }, {});

  return { holdings: Object.values(grouped) };
}

export async function transferBetweenAccounts(data: {
  asset: string;
  amount: number;
  fromAccount: "trading" | "staking";
  toAccount: "trading" | "staking";
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Unauthorized" };

  if (data.fromAccount === data.toAccount) {
    return { error: "Cannot transfer to the same account" };
  }

  // Debit from source
  const { error: debitError } = await supabase.rpc("debit_balance", {
    p_user_id: user.id,
    p_asset: data.asset,
    p_amount: data.amount,
    p_account_type: data.fromAccount,
  });

  if (debitError) return { error: debitError.message };

  // Credit to destination
  const { error: creditError } = await supabase.rpc("credit_balance", {
    p_user_id: user.id,
    p_asset: data.asset,
    p_amount: data.amount,
    p_account_type: data.toAccount,
  });

  if (creditError) return { error: creditError.message };

  return { success: true };
}
