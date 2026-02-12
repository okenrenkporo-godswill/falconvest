"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function transferBetweenAccounts(data: {
  asset: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check source balance
  const { data: sourceBalance } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("asset", data.asset)
    .eq("account_type", data.fromAccount)
    .single();

  if (!sourceBalance || sourceBalance.amount < data.amount) {
    return { error: "Insufficient balance in source account" };
  }

  // Deduct from source
  const { error: deductError } = await supabase
    .from("balances")
    .update({ 
      amount: sourceBalance.amount - data.amount,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id)
    .eq("asset", data.asset)
    .eq("account_type", data.fromAccount);

  if (deductError) return { error: "Failed to deduct from source account" };

  // Add to destination
  const { data: destBalance } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("asset", data.asset)
    .eq("account_type", data.toAccount)
    .single();

  if (destBalance) {
    // Update existing
    const { error: addError } = await supabase
      .from("balances")
      .update({ 
        amount: destBalance.amount + data.amount,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)
      .eq("asset", data.asset)
      .eq("account_type", data.toAccount);

    if (addError) {
      // Rollback
      await supabase
        .from("balances")
        .update({ amount: sourceBalance.amount })
        .eq("user_id", user.id)
        .eq("asset", data.asset)
        .eq("account_type", data.fromAccount);
      return { error: "Failed to add to destination account" };
    }
  } else {
    // Create new
    const { error: createError } = await supabase
      .from("balances")
      .insert({
        user_id: user.id,
        asset: data.asset,
        amount: data.amount,
        account_type: data.toAccount,
      });

    if (createError) {
      // Rollback
      await supabase
        .from("balances")
        .update({ amount: sourceBalance.amount })
        .eq("user_id", user.id)
        .eq("asset", data.asset)
        .eq("account_type", data.fromAccount);
      return { error: "Failed to create destination balance" };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account");
  return { success: true };
}
