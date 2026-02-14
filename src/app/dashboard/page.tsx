import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountTabs } from "@/components/dashboard/account-tabs";

import { ArrowDownCircle, ArrowUpCircle, Users2, Pickaxe } from "lucide-react";
import { MobileBannerBoxes } from "@/components/dashboard/market-ticker";

export const revalidate = 30; // Cache for 30 seconds

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

  // Get wallet logos from platform_wallets using admin client (bypass RLS)
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminClient = createAdminClient();
  const { data: wallets } = await adminClient
    .from("platform_wallets")
    .select("symbol, logo_url");

  // Map logos to balances
  const balancesWithLogos = balances?.map((balance) => ({
    ...balance,
    logo_url: wallets?.find((w) => w.symbol === balance.asset)?.logo_url,
  }));

  const totalBalance =
    balances?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  // Calculate balances by account type
  const tradingBalance =
    balances
      ?.filter((b) => b.account_type === "trading")
      .reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const holdingsBalance =
    balances
      ?.filter((b) => b.account_type === "holdings")
      .reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const stakingBalance =
    balances
      ?.filter((b) => b.account_type === "staking")
      .reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  // Get recent deposits and withdrawals
  const { data: recentDeposits } = await supabase
    .from("deposits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentWithdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Combine and sort by date
  const recentActivity = [
    ...(recentDeposits || []).map(d => ({ ...d, type: 'deposit' as const })),
    ...(recentWithdrawals || []).map(w => ({ ...w, type: 'withdrawal' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-3 sm:p-4">
      {/* Assets Overview Header */}
      <div className="flex flex-col gap-4">
        {/* Balance and buttons container - desktop horizontal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm text-default-500 mb-1">
              Total Assets
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                ${totalBalance.toFixed(2)}
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-default-500">Trading:</span>
                <span className="font-semibold">
                  ${tradingBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-default-500">Holdings:</span>
                <span className="font-semibold">
                  ${holdingsBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-default-500">Staking:</span>
                <span className="font-semibold">
                  ${stakingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Action Buttons - horizontal row on right */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/dashboard/deposit" passHref>
              <Button
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600 font-medium"
                startContent={<ArrowDownCircle className="w-4 h-4" />}
              >
                Deposit
              </Button>
            </Link>
            <Link href="/dashboard/withdrawal" passHref>
              <Button
                size="sm"
                variant="bordered"
                className="border-default-300"
                startContent={<ArrowUpCircle className="w-4 h-4" />}
              >
                Withdraw
              </Button>
            </Link>
            <Link href="/dashboard/copy-trading" passHref>
              <Button
                size="sm"
                variant="bordered"
                className="border-default-300"
                startContent={<Users2 className="w-4 h-4" />}
              >
                Copy Trading
              </Button>
            </Link>

            <Link href="/dashboard/staking" passHref>
              <Button
                size="sm"
                variant="bordered"
                className="border-default-300"
                startContent={<Pickaxe className="w-4 h-4" />}
              >
                Staking
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Action Buttons - circular icons with labels below */}
        <div className="grid grid-cols-4 gap-2 sm:hidden">
          {/* Deposit - Red background, white icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/dashboard/deposit"
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">
              Deposit
            </span>
          </div>

          {/* Withdraw - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/dashboard/withdrawal"
              className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center"
            >
              <ArrowUpCircle className="w-5 h-5 text-default-700" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">
              Withdraw
            </span>
          </div>

          {/* My Trader - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/dashboard/copy-trading"
              className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center"
            >
              <Users2 className="w-5 h-5 text-default-700" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">
              Copy Trading
            </span>
          </div>

          {/* Staking - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/dashboard/staking"
              className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center"
            >
              {/* Using Lock icon to match sidebar */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-default-700"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </Link>
            <span className="text-[10px] font-medium text-default-700">
              Staking
            </span>
          </div>
        </div>
      </div>

      {/* Market Ticker - Sliding cards with charts (Mobile only background) */}
      {/* <MarketTicker /> */}
      <MobileBannerBoxes />

      {/* Account/Asset Tabs */}
      <AccountTabs
        totalBalance={totalBalance}
        balances={balancesWithLogos || []}
      />

      {/* Recent Activity */}
      <Card className="bg-transparent shadow-none border-none" shadow="none">
        <CardHeader className="pb-3 px-0">
          <h3 className="text-xs sm:text-sm font-semibold">
            Recent Deposit & Withdrawal History
          </h3>
        </CardHeader>
        <CardBody>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-default-400">
              <p className="text-xs sm:text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5 border border-default-100 dark:border-default-50/10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "deposit"
                          ? "bg-success/10"
                          : "bg-warning/10"
                      }`}
                    >
                      {activity.type === "deposit" ? (
                        <ArrowDownCircle className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        {activity.type}
                      </p>
                      <p className="text-xs text-default-500">
                        {new Date(activity.created_at).toLocaleDateString()} •{" "}
                        {activity.asset}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {activity.type === "deposit" ? "+" : "-"}
                      {activity.amount} {activity.asset}
                    </p>
                    <p className="text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === "completed"
                            ? "bg-success/10 text-success"
                            : activity.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
