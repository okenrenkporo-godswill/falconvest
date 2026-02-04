import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPendingKycSubmissions } from "@/actions/admin";
import { KycReviewTable } from "@/components/admin/kyc-review-table";

export default async function KycPendingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const submissions = await getPendingKycSubmissions();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">KYC Verification Queue</h1>
      <KycReviewTable submissions={submissions} />
    </div>
  );
}
