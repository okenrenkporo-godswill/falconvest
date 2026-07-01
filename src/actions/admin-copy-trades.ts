"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function adminStopCopyTrade(copyTradeId: string) {
    const adminClient = createAdminClient();

    // Fetch user_id for the copy trade
    const { data: copyTrade, error: fetchError } = await adminClient
        .from("copy_trades")
        .select("user_id")
        .eq("id", copyTradeId)
        .single();

    if (fetchError || !copyTrade) return { error: "Copy trade not found" };

    // Use the atomic RPC to properly refund the user
    const { data: result, error } = await adminClient.rpc("stop_copy_trade_atomic", {
        p_user_id: copyTrade.user_id,
        p_copy_trade_id: copyTradeId
    });

    if (error) return { error: error.message };
    if (!result?.success) return { error: result?.error || "Failed to stop copy trade" };

    revalidatePath("/cpanel/users");
    return { success: true };
}

import { getCryptoPrices } from "@/lib/crypto-prices";

export async function adminUpdateBalance(data: {
    userId: string;
    asset: string;
    amount: number;
    type: "credit" | "debit" | "ucredit";
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
        const currentAmount = Number(currentBalance.amount);
        const changeAmount = Number(data.amount);

        if (data.type === "credit" || data.type === "ucredit") {
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

    // Process specialized credit types
    if (data.type === "ucredit") {
        // Calculate USD value for deposit history log
        const prices = await getCryptoPrices([data.asset]);
        const price = prices[data.asset] || (["USDT", "USDC"].includes(data.asset) ? 1 : 0);
        const usdValue = Number(data.amount) * price;

        const { error: insertError } = await adminClient
            .from("deposits")
            .insert({
                user_id: data.userId,
                coin: data.asset,
                amount: data.amount,
                usd_value: usdValue,
                wallet_address: "manual_credit",
                account_type: data.accountType || "trading",
                proof_path: "manual_credit",
                status: "confirmed",
            });

        if (insertError) {
            console.error("❌ Failed to log manual deposit credit:", insertError);
            return { error: `Balance updated, but failed to log deposit history: ${insertError.message}` };
        }
    } else if (data.type === "credit") {
        // Calculate USD value for profit tracking
        const prices = await getCryptoPrices([data.asset]);
        const price = prices[data.asset] || (["USDT", "USDC"].includes(data.asset) ? 1 : 0);
        const usdValue = Number(data.amount) * price;

        const { data: profile } = await adminClient
            .from("profiles")
            .select("profit_amount")
            .eq("id", data.userId)
            .single();

        const currentProfit = Number(profile?.profit_amount) || 0;
        await adminClient
            .from("profiles")
            .update({ profit_amount: currentProfit + usdValue })
            .eq("id", data.userId);
    }

    revalidatePath("/cpanel/users");
    return { success: true };
}
