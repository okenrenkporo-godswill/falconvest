"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Get all pools
export async function getAllPools() {
  const adminClient = createAdminClient();
  
  const { data } = await adminClient
    .from("staking_pools")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

// Create pool
export async function createPool(data: {
  asset: string;
  name: string;
  apy: number;
  lockPeriodDays: number;
  minStakeAmount: number;
  maxStakeAmount?: number;
}) {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient.from("staking_pools").insert({
    asset: data.asset,
    name: data.name,
    apy: data.apy,
    lock_period_days: data.lockPeriodDays,
    min_stake_amount: data.minStakeAmount,
    max_stake_amount: data.maxStakeAmount,
    status: "active",
  });

  if (error) return { error: error.message };

  revalidatePath("/cpanel/staking");
  return { success: true };
}

// Update pool
export async function updatePool(poolId: string, data: {
  apy?: number;
  min_stake_amount?: number;
  status?: string;
}) {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from("staking_pools")
    .update(data)
    .eq("id", poolId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/staking");
  return { success: true };
}

// Get all stakes
export async function getAllStakes() {
  const adminClient = createAdminClient();
  
  const { data } = await adminClient
    .from("user_stakes")
    .select(`
      *,
      staking_pools(*)
    `)
    .order("created_at", { ascending: false });

  if (!data) return [];

  // Fetch user names for each stake
  const stakesWithUsers = await Promise.all(
    data.map(async (stake: any) => {
      const { data: profile } = await adminClient
        .from("user_profiles")
        .select("first_name, last_name")
        .eq("user_id", stake.user_id)
        .single();
      
      const userName = profile ? `${profile.first_name} ${profile.last_name}` : "Unknown User";
      
      return {
        ...stake,
        user_name: userName,
      };
    })
  );

  return stakesWithUsers;
}

// Get staking stats
export async function getStakingStats() {
  const adminClient = createAdminClient();
  
  const { data: pools } = await adminClient.from("staking_pools").select("total_staked, total_stakers");
  const { data: stakes } = await adminClient.from("user_stakes").select("amount, rewards_earned").eq("status", "active");

  const totalStaked = pools?.reduce((sum, p) => sum + Number(p.total_staked), 0) || 0;
  const totalStakers = pools?.reduce((sum, p) => sum + p.total_stakers, 0) || 0;
  const totalRewards = stakes?.reduce((sum, s) => sum + Number(s.rewards_earned), 0) || 0;

  return {
    totalPools: pools?.length || 0,
    totalStaked,
    totalStakers,
    activeStakes: stakes?.length || 0,
    totalRewards,
  };
}
