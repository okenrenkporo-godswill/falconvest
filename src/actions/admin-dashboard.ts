"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminStats() {
  const adminClient = createAdminClient();

  // User stats
  const { data: allUsers } = await adminClient
    .from("profiles")
    .select("role, kyc_status")
    .eq("role", "user");

  const totalUsers = allUsers?.length || 0;
  const verifiedUsers = allUsers?.filter(u => 
    u.kyc_status === "auto_verified" || u.kyc_status === "manually_verified"
  ).length || 0;

  // Count KYC statuses from PROFILES
  // We simplify this to include EVERY profile with the right status
  const { data: kycsRaw } = await adminClient
    .from("profiles")
    .select("kyc_status")
    .eq("role", "user")
    .in("kyc_status", ["pending", "unverified"]);
  
  const pendingKyc = kycsRaw?.filter(p => p.kyc_status === "pending").length || 0;
  const unverifiedUsers = kycsRaw?.filter(p => p.kyc_status === "unverified").length || 0;

  // Financial stats - fetch all deposits
  const { data: allDeposits } = await adminClient
    .from("deposits")
    .select("status, usd_value");

  const pendingDeposits = allDeposits?.filter(d => d.status === "pending").length || 0;
  const confirmedDeposits = allDeposits?.filter(d => d.status === "confirmed").length || 0;
  const rejectedDeposits = allDeposits?.filter(d => d.status === "rejected").length || 0;
  const totalDeposits = allDeposits?.length || 0;
  const totalDepositValue = allDeposits
    ?.filter(d => d.status === "confirmed")
    .reduce((sum, d) => sum + Number(d.usd_value || 0), 0) || 0;

  // Fetch all withdrawals
  const { data: allWithdrawals } = await adminClient
    .from("withdrawals")
    .select("status, usd_value");

  const pendingWithdrawals = allWithdrawals?.filter(w => w.status === "pending" || w.status === "processing").length || 0;
  const confirmedWithdrawals = allWithdrawals?.filter(w => w.status === "approved" || w.status === "completed").length || 0;
  const rejectedWithdrawals = allWithdrawals?.filter(w => w.status === "rejected" || w.status === "failed").length || 0;
  const totalWithdrawals = allWithdrawals?.length || 0;
  const totalWithdrawalValue = allWithdrawals
    ?.filter(w => w.status === "approved" || w.status === "completed")
    .reduce((sum, w) => sum + Number(w.usd_value || 0), 0) || 0;

  // Trading stats
  const { data: allTrades } = await adminClient
    .from("trades")
    .select("status");

  const totalTrades = allTrades?.length || 0;

  const { data: allCopyTrades } = await adminClient
    .from("copy_trades")
    .select("status");

  const totalCopyTrades = allCopyTrades?.length || 0;
  const activeCopyTrades = allCopyTrades?.filter(ct => ct.status === "active").length || 0;

  const { data: allPositions } = await adminClient
    .from("positions")
    .select("status");

  const activePositions = allPositions?.filter(p => p.status === "open").length || 0;

  // Staking stats
  const { data: allStakes } = await adminClient
    .from("user_stakes")
    .select("status");

  const activeStakes = allStakes?.filter(s => s.status === "active").length || 0;

  return {
    totalUsers,
    verifiedUsers,
    pendingKyc,
    unverifiedUsers,
    pendingDeposits,
    confirmedDeposits,
    rejectedDeposits,
    totalDeposits,
    totalDepositValue,
    pendingWithdrawals,
    confirmedWithdrawals,
    rejectedWithdrawals,
    totalWithdrawals,
    totalWithdrawalValue,
    totalTrades,
    totalCopyTrades,
    activeCopyTrades,
    activePositions,
    activeStakes,
  };
}

export async function getLatestActivities() {
  const adminClient = createAdminClient();

  // Get latest account creations
  const { data: accounts } = await adminClient
    .from("profiles")
    .select("id, full_name, first_name, last_name, email, created_at")
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get latest deposits with user info
  const { data: deposits } = await adminClient
    .from("deposits")
    .select("id, user_id, coin, amount, usd_value, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get user info for deposits
  const depositsWithUsers = await Promise.all(
    (deposits || []).map(async (deposit) => {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("full_name, first_name, last_name, email")
        .eq("id", deposit.user_id)
        .single();
      return {
        ...deposit,
        user_name: profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown",
        user_email: profile?.email || "",
      };
    })
  );

  // Get latest withdrawals with user info
  const { data: withdrawals, error: withdrawalsError } = await adminClient
    .from("withdrawals")
    .select("id, user_id, coin, amount, usd_value, status, requested_at")
    .order("requested_at", { ascending: false })
    .limit(5);

  if (withdrawalsError) console.error("Withdrawals fetch error:", withdrawalsError);

  const withdrawalsWithUsers = await Promise.all(
    (withdrawals || []).map(async (withdrawal) => {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("full_name, first_name, last_name, email")
        .eq("id", withdrawal.user_id)
        .single();
      return {
        ...withdrawal,
        user_name: profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown",
        user_email: profile?.email || "",
      };
    })
  );

  // Get latest trades with user info
  const { data: trades } = await adminClient
    .from("trades")
    .select("id, user_id, pair, side, amount, price, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const tradesWithUsers = await Promise.all(
    (trades || []).map(async (trade) => {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("full_name, first_name, last_name, email")
        .eq("id", trade.user_id)
        .single();
      return {
        ...trade,
        user_name: profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown",
        user_email: profile?.email || "",
      };
    })
  );

  // Get latest copy trades with user and trader info
  const { data: copyTrades } = await adminClient
    .from("copy_trades")
    .select("id, user_id, trader_id, copy_amount, status, started_at")
    .order("started_at", { ascending: false })
    .limit(5);

  const copyTradesWithInfo = await Promise.all(
    (copyTrades || []).map(async (copyTrade) => {
      const [{ data: profile }, { data: trader }] = await Promise.all([
        adminClient
          .from("profiles")
          .select("full_name, first_name, last_name, email")
          .eq("id", copyTrade.user_id)
          .single(),
        adminClient
          .from("traders")
          .select("display_name")
          .eq("id", copyTrade.trader_id)
          .single(),
      ]);
      return {
        ...copyTrade,
        user_name: profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown",
        user_email: profile?.email || "",
        trader_name: trader?.display_name || "Unknown Trader",
      };
    })
  );

  return {
    accounts: (accounts || []).map((acc) => ({
      ...acc,
      display_name: acc.full_name || `${acc.first_name || ""} ${acc.last_name || ""}`.trim() || "No name",
    })),
    deposits: depositsWithUsers,
    withdrawals: withdrawalsWithUsers,
    trades: tradesWithUsers,
    copyTrades: copyTradesWithInfo,
  };
}
