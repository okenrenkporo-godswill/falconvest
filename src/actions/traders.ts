"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getAllTraders() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("traders")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getActiveTraders(page: number = 1, limit: number = 12, search?: string) {
  const supabase = await createClient();
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  let query = supabase
    .from("traders")
    .select("*", { count: "exact" })
    .eq("status", "active");
  
  if (search) {
    query = query.ilike("display_name", `%${search}%`);
  }
  
  const { data, count } = await query
    .order("total_profit", { ascending: false })
    .range(from, to);
    
  return { 
    data: data || [], 
    totalPages: Math.ceil((count || 0) / limit) 
  };
}

export async function getTraderById(traderId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("traders")
    .select("*")
    .eq("id", traderId)
    .eq("status", "active")
    .single();
    
  return data;
}

export async function createTrader(data: {
  name: string;
  avatar: string;
  description: string;
  tags: string[];
  risk_score: number;
}) {
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
  const { error } = await adminClient.from("traders").insert(data);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/traders");
  return { success: true };
}

export async function updateTrader(traderId: string, data: any) {
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
    .from("traders")
    .update(data)
    .eq("id", traderId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/traders");
  revalidatePath("/dashboard/copy-trading");
  return { success: true };
}

export async function toggleTraderStatus(traderId: string) {
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
  
  const { data: trader } = await adminClient
    .from("traders")
    .select("status")
    .eq("id", traderId)
    .single();

  const newStatus = trader?.status === "active" ? "inactive" : "active";

  const { error } = await adminClient
    .from("traders")
    .update({ status: newStatus })
    .eq("id", traderId);

  if (error) return { error: error.message };

  revalidatePath("/cpanel/traders");
  revalidatePath("/dashboard/copy-trading");
  return { success: true };
}
