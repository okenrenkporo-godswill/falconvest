"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function adminStopCopyTrade(copyTradeId: string) {
    const adminClient = createAdminClient();

    // Stop the copy trade
    const { error } = await adminClient
        .from("copy_trades")
        .update({
            status: "stopped",
            stopped_at: new Date().toISOString(),
            stopped_by: "admin",
        })
        .eq("id", copyTradeId);

    if (error) return { error: error.message };

    revalidatePath("/cpanel/users");
    return { success: true };
}

export async function adminUpdateBalance(data: {
    userId: string;
    asset: string;
    amount: number;
    type: "credit" | "debit";
    accountType: "spot" | "funding" | "trading";
}) {
    const adminClient = createAdminClient();

    // Check current balance
    const { data: currentBalance } = await adminClient
        .from("balances")
        .select("*")
        .eq("user_id", data.userId)
        .eq("asset", data.asset)
        .eq("account_type", data.accountType)
        .maybeSingle();

    let newAmount = 0;

    if (currentBalance) {
        // Convert both to numbers to be safe
        const currentAmount = Number(currentBalance.amount);
        const changeAmount = Number(data.amount);

        if (data.type === "credit") {
            newAmount = currentAmount + changeAmount;
        } else {
            newAmount = Math.max(0, currentAmount - changeAmount);
        }

        const { error } = await adminClient
            .from("balances")
            .update({ amount: newAmount })
            .eq("id", currentBalance.id);

        if (error) return { error: error.message };
    } else {
        // Create new balance entry if crediting
        if (data.type === "debit") {
            return { error: "Cannot debit from non-existent balance" };
        }

        newAmount = Number(data.amount);

        const { error } = await adminClient
            .from("balances")
            .insert({
                user_id: data.userId,
                asset: data.asset,
                amount: newAmount,
                account_type: data.accountType,
            });

        if (error) return { error: error.message };
    }

    // Record a transaction for audit? (Optional but good practice)
    // For now, just update balance and revalidate.

    revalidatePath("/cpanel/users");
    return { success: true };
}
