"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function startCopyTrade(data: {
  traderId: string;
  amountPerTrade: number;
  stopLoss?: number;
  takeProfit?: number;
  maxOpenTrades?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Use adminClient to bypass RLS policies that might be hiding existing records
  const adminClient = createAdminClient();

  // Check for existing copy trade
  const { data: existingCopy } = await adminClient
    .from("copy_trades")
    .select("*")
    .eq("user_id", user.id)
    .eq("trader_id", data.traderId)
    .maybeSingle();

  if (existingCopy) {
    if (existingCopy.status === "active") {
      return { error: "You are already copying this trader." };
    }

    // Reactivate existing copy trade
    const { error: updateError } = await adminClient
      .from("copy_trades")
      .update({
        amount_per_trade: data.amountPerTrade,
        stop_loss_percentage: data.stopLoss,
        take_profit_percentage: data.takeProfit,
        max_open_trades: data.maxOpenTrades || 5,
        status: "active",
        stopped_at: null, // Reset stopped_at
      })
      .eq("id", existingCopy.id);

    if (updateError) return { error: updateError.message };
  } else {
    // Create new copy trade
    const { error: insertError } = await adminClient.from("copy_trades").insert({
      user_id: user.id,
      trader_id: data.traderId,
      amount_per_trade: data.amountPerTrade,
      stop_loss_percentage: data.stopLoss,
      take_profit_percentage: data.takeProfit,
      max_open_trades: data.maxOpenTrades || 5,
      status: "active",
    });

    if (insertError) {
      // Double check if it was a race condition that caused unique violation
      if (insertError.code === '23505' || insertError.message.includes('unique constraint')) {
        return { error: "You are already copying this trader (or a request is pending). Please refresh." };
      }
      return { error: insertError.message };
    }
  }

  // Update trader copiers count
  await adminClient.rpc("update_trader_stats", {
    p_trader_id: data.traderId,
    p_copiers: null, // Will increment in a real implementation
  });

  revalidatePath("/dashboard/copy-trading");
  return { success: true };
}

export async function stopCopyTrade(copyTradeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("copy_trades")
    .update({
      status: "stopped",
      stopped_at: new Date().toISOString(),
    })
    .eq("id", copyTradeId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/copy-trading");
  return { success: true };
}

export async function getUserCopyTrades() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("copy_trades")
    .select(`
      *,
      traders (*)
    `)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  return data || [];
}

export async function getAllCopyTrades() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return [];

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("copy_trades")
    .select(`
      *,
      profiles!copy_trades_user_id_fkey (
        email,
        first_name,
        last_name
      ),
      traders (
        name,
        avatar
      )
    `)
    .order("started_at", { ascending: false });

  return data || [];
}
