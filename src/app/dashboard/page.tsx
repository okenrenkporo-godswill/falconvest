import { Card, CardBody, CardHeader } from "@heroui/react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Get balances
  const { data: balances } = await supabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id);

  const totalBalance = balances?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}</h1>
        <p className="text-default-600">Here's your portfolio overview</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-default-600">Total Balance</h3>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-default-600">24h PNL</h3>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold text-success">+$0.00</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-default-600">Total PNL</h3>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">$0.00</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Recent Activity</h3>
        </CardHeader>
        <CardBody>
          <p className="text-default-600">No recent activity</p>
        </CardBody>
      </Card>
    </div>
  );
}
