import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DepositsContent } from "@/components/admin/deposits-content";

export const dynamic = "force-dynamic";

export default async function DepositsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cpanel");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <DepositsContent />;
}
