"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Get all active staking pools
export async function getStakingPools() {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("staking_pools")
    .select("*")
    .eq("status", "active")
    .order("apy", { ascending: false });

  return data || [];
}

// Stake assets
export async function stakeAssets(data: {
  poolId: string;
  amount: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get pool details
  const { data: pool } = await supabase
    .from("staking_pools")
    .select("*")
    .eq("id", data.poolId)
    .single();

  if (!pool) return { error: "Pool not found" };

  // Check balance
  const { data: balance } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("asset", pool.asset)
    .eq("account_type", "staking")
    .maybeSingle();

  if (!balance || balance.amount < data.amount) {
    return { error: "Insufficient balance in staking account" };
  }

  // Debit balance
  await supabase.rpc("debit_balance", {
    p_user_id: user.id,
    p_asset: pool.asset,
    p_amount: data.amount,
    p_account_type: "staking",
  });

  // Calculate unlock date
  const unlockAt = new Date();
  unlockAt.setDate(unlockAt.getDate() + pool.lock_period_days);

  // Create stake
  const { error } = await supabase.from("user_stakes").insert({
    user_id: user.id,
    pool_id: data.poolId,
    amount: data.amount,
    apy: pool.apy,
    unlock_at: unlockAt.toISOString(),
  });

  if (error) return { error: error.message };

  // Update pool totals
  await supabase
    .from("staking_pools")
    .update({
      total_staked: pool.total_staked + data.amount,
      total_stakers: pool.total_stakers + 1,
    })
    .eq("id", data.poolId);

  // Get user email for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  // Notify admin
  if (profile?.email) {
    try {
      const { notifyAdminStake } = await import("@/lib/email");
      await notifyAdminStake(profile.email, data.amount, pool.asset, pool.name);
    } catch (error) {
      console.error("Failed to notify admin:", error);
    }
  }

  revalidatePath("/dashboard/staking");
  return { success: true };
}

// Unstake assets
export async function unstakeAssets(stakeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get stake details
  const { data: stake } = await supabase
    .from("user_stakes")
    .select("*, staking_pools(*)")
    .eq("id", stakeId)
    .eq("user_id", user.id)
    .single();

  if (!stake) return { error: "Stake not found" };

  // Check if unlocked
  if (new Date(stake.unlock_at) > new Date()) {
    return { error: "Stake is still locked" };
  }

  // Calculate rewards
  const daysStaked = Math.floor((new Date().getTime() - new Date(stake.staked_at).getTime()) / (1000 * 60 * 60 * 24));
  const rewards = (stake.amount * stake.apy / 100 / 365) * daysStaked;

  // Update stake status
  await supabase
    .from("user_stakes")
    .update({
      status: "unstaked",
      rewards_earned: rewards,
      unstaked_at: new Date().toISOString(),
    })
    .eq("id", stakeId);

  // Return principal + rewards
  await supabase.rpc("credit_balance", {
    p_user_id: user.id,
    p_asset: stake.staking_pools.asset,
    p_amount: stake.amount + rewards,
    p_account_type: "staking",
  });

  // Record reward
  await supabase.from("staking_rewards").insert({
    stake_id: stakeId,
    user_id: user.id,
    amount: rewards,
  });

  // Update pool totals
  await supabase
    .from("staking_pools")
    .update({
      total_staked: stake.staking_pools.total_staked - stake.amount,
      total_stakers: stake.staking_pools.total_stakers - 1,
    })
    .eq("id", stake.pool_id);

  revalidatePath("/dashboard/staking");
  return { success: true, rewards };
}

// Get user stakes
export async function getUserStakes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_stakes")
    .select("*, staking_pools(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}
