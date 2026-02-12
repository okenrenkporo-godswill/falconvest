"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAdminStats() {
  const supabase = await createClient();

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  const { count: pendingKyc } = await supabase
    .from("kyc_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: pendingDeposits } = await supabase
    .from("deposits")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: pendingWithdrawals } = await supabase
    .from("withdrawals")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at, kyc_status")
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalUsers: totalUsers || 0,
    pendingKyc: pendingKyc || 0,
    pendingDeposits: pendingDeposits || 0,
    pendingWithdrawals: pendingWithdrawals || 0,
    recentUsers: recentUsers || [],
  };
}
