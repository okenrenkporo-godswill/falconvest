import { Card, CardBody, CardHeader } from "@heroui/react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
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

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  const { count: pendingKyc } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("kyc_status", "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-default-600">Total Users</h3>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">{totalUsers || 0}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-default-600">Pending KYC</h3>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold text-warning">{pendingKyc || 0}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-default-600">Total Deposits</h3>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">$0.00</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
