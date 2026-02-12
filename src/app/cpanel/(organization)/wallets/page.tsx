import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WalletsTable } from "@/components/admin/wallets-table";
import { getAllPlatformWallets } from "@/actions/wallets";
import { Card, CardBody } from "@heroui/react";

export const dynamic = "force-dynamic";

export default async function WalletsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/cpanel");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const wallets = await getAllPlatformWallets();

  const stats = {
    total: wallets?.length || 0,
    active: wallets?.filter((w) => w.status === "active").length || 0,
    inactive: wallets?.filter((w) => w.status === "inactive").length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Wallets</h1>
        <p className="text-sm text-default-500 mt-1">
          Company wallet addresses shown to users for deposits
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Wallets</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-success-50 dark:bg-success-900/20">
          <CardBody className="p-4">
            <p className="text-sm text-success-700 dark:text-success-300">Active</p>
            <p className="text-3xl font-bold text-success-900 dark:text-success-100 mt-1">
              {stats.active}
            </p>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-default-100 dark:bg-default-200/20">
          <CardBody className="p-4">
            <p className="text-sm text-default-600 dark:text-default-400">Inactive</p>
            <p className="text-3xl font-bold text-default-900 dark:text-default-100 mt-1">
              {stats.inactive}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-0">
          <WalletsTable wallets={wallets} />
        </CardBody>
      </Card>
    </div>
  );
}
