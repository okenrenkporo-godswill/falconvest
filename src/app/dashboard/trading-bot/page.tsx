import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BotPlansClient } from "./bot-plans-client";

export const revalidate = 10;

export default async function TradingBotPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get bot restriction and VPS status from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("bot_enabled, bot_restriction_active, vps_status")
    .eq("id", user.id)
    .single();

  // If bot is disabled/hidden, redirect to dashboard
  if (!profile?.bot_enabled) {
    redirect("/dashboard");
  }

  // Fetch bot plans
  const { data: botPlans } = await supabase
    .from("user_bot_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("price", { ascending: true });

  return (
    <BotPlansClient 
      botPlans={botPlans || []} 
      botRestrictionActive={profile?.bot_restriction_active || false}
      vpsStatus={profile?.vps_status || "none"}
    />
  );
}
