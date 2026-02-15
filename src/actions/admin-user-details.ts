"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getUserDetails(userId: string) {

  const adminClient = createAdminClient();

  // Get user profile
  console.log("Fetching profile...");
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  console.log("Profile:", profile);
  console.log("Profile error:", profileError);

  // Get balances
  console.log("Fetching balances...");
  const { data: balances } = await adminClient
    .from("balances")
    .select("*")
    .eq("user_id", userId);

  console.log("Balances count:", balances?.length);

  // Get KYC submission
  console.log("Fetching KYC submission...");
  const { data: kycSubmission } = await adminClient
    .from("kyc_submissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  console.log("KYC submission:", kycSubmission ? "Found" : "Not found");

  // Get wallets
  const { data: wallets } = await adminClient
    .from("user_wallets")
    .select("*")
    .eq("user_id", userId);

  // Get trades
  const { data: trades } = await adminClient
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get deposits
  const { data: deposits } = await adminClient
    .from("deposits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get withdrawals
  const { data: withdrawals } = await adminClient
    .from("withdrawals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get stakes
  const { data: stakes } = await adminClient
    .from("user_stakes")
    .select("*, staking_pools(*)")
    .eq("user_id", userId);

  // Get copy trades (subscriptions)
  const { data: copyTrades } = await adminClient
    .from("copy_trades")
    .select(`
      *,
      traders (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Get copy trade positions (history)
  const { data: copyTradePositions } = await adminClient
    .from("copy_trade_positions")
    .select(`
      *,
      traders (
        name
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    profile,
    balances: balances || [],
    kycSubmission,
    wallets: wallets || [],
    trades: trades || [],
    deposits: deposits || [],
    withdrawals: withdrawals || [],
    stakes: stakes || [],
    copyTrades: copyTrades || [],
    copyTradePositions: copyTradePositions || [],
  };
}
