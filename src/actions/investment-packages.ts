"use server";

import { createClient } from "@/lib/supabase/server";

export type InvestmentPackage = {
  id: string;
  name: string;
  amount: number;
  features: string[];
  color: string;
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
};

export async function getActivePackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) return [];
  return data as InvestmentPackage[];
}

export async function getAllPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_packages")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) return [];
  return data as InvestmentPackage[];
}

export async function createPackage(packageData: {
  name: string;
  amount: number;
  features: string[];
  color: string;
  is_popular: boolean;
  display_order: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("investment_packages")
    .insert([packageData]);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePackage(
  id: string,
  packageData: Partial<InvestmentPackage>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("investment_packages")
    .update({ ...packageData, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deletePackage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("investment_packages")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function togglePackageStatus(id: string, isActive: boolean) {
  return updatePackage(id, { is_active: isActive });
}
