"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createTrade(data: {
  pair: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  amount: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  accountType?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("trades").insert({
    user_id: user.id,
    pair: data.pair,
    side: data.side,
    type: data.type,
    amount: data.amount,
    entry_price: data.price,
    price: data.price,
    stop_loss: data.stopLoss,
    take_profit: data.takeProfit,
    account_type: data.accountType || "trading",
    status: "open",
    opened_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/trading");
  return { success: true };
}

export async function closeTrade(tradeId: string, exitPrice: number, pnl: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("trades")
    .update({
      status: "closed",
      exit_price: exitPrice,
      pnl: pnl,
      closed_at: new Date().toISOString(),
    })
    .eq("id", tradeId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/trading");
  return { success: true };
}

export async function getUserTrades() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("opened_at", { ascending: false });

  return data || [];
}

export async function getAllTrades() {
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
    .from("trades")
    .select(`
      *,
      profiles!trades_user_id_fkey (
        email,
        first_name,
        last_name
      )
    `)
    .order("opened_at", { ascending: false });

  return data || [];
}

export async function adminSetTradeOutcome(
  tradeId: string,
  exitPrice: number,
  pnl: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Unauthorized" };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("trades")
    .update({
      status: "closed",
      exit_price: exitPrice,
      pnl: pnl,
      closed_at: new Date().toISOString(),
    })
    .eq("id", tradeId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/trades");
  return { success: true };
}
